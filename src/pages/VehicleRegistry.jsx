import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import { useSearchParams } from "react-router-dom";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const STATUS_OPTIONS = ["Active", "In Maintenance", "Retired"];

function StatusBadge({ status }) {
  const map = {
    Active: "bg-green-100 text-green-700",
    "In Maintenance": "bg-yellow-100 text-yellow-700",
    Retired: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

const EMPTY_FORM = {
  vehicleId: "", make: "", model: "", year: "", status: "Active",
  lastServiceDate: "", assignedDriver: "", notes: "",
};

export default function VehicleRegistry() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditId(null); setForm(EMPTY_FORM); setError(""); setShowModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user?.businessKey) return;
    const unsub = onSnapshot(
      query(collection(db, "vehicles"), where("businessKey", "==", user.businessKey)),
      (snap) => setVehicles(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [user]);

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setError(""); setShowModal(true); };
  const openEdit = (v) => {
    setEditId(v.id);
    setForm({
      vehicleId: v.vehicleId || "", make: v.make || "", model: v.model || "",
      year: v.year || "", status: v.status || "Active",
      lastServiceDate: v.lastServiceDate || "", assignedDriver: v.assignedDriver || "",
      notes: v.notes || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;
    try { await deleteDoc(doc(db, "vehicles", id)); } catch (e) { setError(e.message); }
  };

  const canSave = form.vehicleId && form.make && form.model && form.year;

  const handleSave = async () => {
    if (!canSave) return;
    setError("");
    const data = { ...form, businessKey: user.businessKey };
    try {
      if (editId) {
        await updateDoc(doc(db, "vehicles", editId), data);
      } else {
        await addDoc(collection(db, "vehicles"), { ...data, createdAt: serverTimestamp() });
      }
      setShowModal(false);
    } catch (e) { setError(e.message); }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Vehicle Registry</h1>
          <button onClick={openAdd} className="btn-primary text-sm">+ Add Vehicle</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Vehicle ID</th>
                  <th className="px-6 py-3 font-semibold">Make / Model</th>
                  <th className="px-6 py-3 font-semibold">Year</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Last Service Date</th>
                  <th className="px-6 py-3 font-semibold">Assigned Driver</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vehicles.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">No vehicles registered yet.</td></tr>
                ) : vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors duration-100">
                    <td className="px-6 py-4 font-medium text-gray-800">{v.vehicleId}</td>
                    <td className="px-6 py-4 text-gray-600">{v.make} {v.model}</td>
                    <td className="px-6 py-4 text-gray-600">{v.year}</td>
                    <td className="px-6 py-4"><StatusBadge status={v.status} /></td>
                    <td className="px-6 py-4 text-gray-600">{v.lastServiceDate || "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{v.assignedDriver || "—"}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => openEdit(v)} className="text-xs text-green-600 hover:underline cursor-pointer">Edit</button>
                      <button onClick={() => handleDelete(v.id)} className="text-xs text-red-500 hover:underline cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{editId ? "Edit Vehicle" : "Add Vehicle"}</h2>
              {error && <p className="error-msg mb-3">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Vehicle ID *</label>
                  <input className="input-field w-full" value={form.vehicleId} onChange={(e) => set("vehicleId", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Make *</label>
                  <input className="input-field w-full" value={form.make} onChange={(e) => set("make", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Model *</label>
                  <input className="input-field w-full" value={form.model} onChange={(e) => set("model", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Year *</label>
                  <input className="input-field w-full" value={form.year} onChange={(e) => set("year", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select className="input-field w-full" value={form.status} onChange={(e) => set("status", e.target.value)}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Last Service Date</label>
                  <input type="date" className="input-field w-full" value={form.lastServiceDate} onChange={(e) => set("lastServiceDate", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Assigned Driver</label>
                  <input className="input-field w-full" value={form.assignedDriver} onChange={(e) => set("assignedDriver", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Notes</label>
                  <textarea className="input-field w-full" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn-outlined text-sm">Cancel</button>
                <button onClick={handleSave} disabled={!canSave} className={canSave ? "btn-primary text-sm" : "btn-disabled text-sm"}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
