import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const TYPE_OPTIONS = ["Scheduled", "Emergency", "Routine"];
const STATUS_OPTIONS = ["Scheduled", "In Progress", "Resolved", "Overdue"];

function StatusBadge({ status }) {
  const map = {
    Scheduled: "bg-blue-100 text-blue-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    Resolved: "bg-green-100 text-green-700",
    Overdue: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

const EMPTY_FORM = {
  vehicle: "", maintenanceType: "Scheduled", description: "", scheduledDate: "",
  estimatedCost: "", actualCost: "", technician: "", status: "Scheduled", resolvedDate: "",
};

export default function Maintenance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.businessKey) return;
    const bk = user.businessKey;
    const unsubMaint = onSnapshot(
      query(collection(db, "maintenance"), where("businessKey", "==", bk)),
      (snap) => setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubVehicles = onSnapshot(
      query(collection(db, "vehicles"), where("businessKey", "==", bk)),
      (snap) => setVehicles(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubMaint(); unsubVehicles(); };
  }, [user]);

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setError(""); setShowModal(true); };
  const openEdit = (m) => {
    setEditId(m.id);
    setForm({
      vehicle: m.vehicle || "", maintenanceType: m.maintenanceType || "Scheduled",
      description: m.description || "", scheduledDate: m.scheduledDate || "",
      estimatedCost: m.estimatedCost ?? "", actualCost: m.actualCost ?? "",
      technician: m.technician || "", status: m.status || "Scheduled",
      resolvedDate: m.resolvedDate || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this maintenance record?")) return;
    try { await deleteDoc(doc(db, "maintenance", id)); } catch (e) { setError(e.message); }
  };

  const canSave = form.vehicle && form.maintenanceType && form.description && form.scheduledDate;

  const handleSave = async () => {
    if (!canSave) return;
    setError("");
    try {
      const data = {
        vehicle: form.vehicle, maintenanceType: form.maintenanceType,
        description: form.description, scheduledDate: form.scheduledDate,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : null,
        actualCost: form.actualCost ? Number(form.actualCost) : null,
        technician: form.technician, status: form.status,
        resolvedDate: form.resolvedDate || null, businessKey: user.businessKey,
      };
      if (editId) {
        await updateDoc(doc(db, "maintenance", editId), data);
      } else {
        await addDoc(collection(db, "maintenance"), { ...data, createdAt: serverTimestamp() });
      }
      setShowModal(false);
    } catch (e) { setError(e.message); }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Maintenance</h1>
          <button onClick={openAdd} className="btn-primary text-sm">+ Log Maintenance</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">#</th>
                  <th className="px-6 py-3 font-semibold">Vehicle</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Description</th>
                  <th className="px-6 py-3 font-semibold">Scheduled Date</th>
                  <th className="px-6 py-3 font-semibold">Cost (₹)</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">No maintenance records yet.</td></tr>
                ) : records.map((m, i) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors duration-100">
                    <td className="px-6 py-4 font-medium text-gray-800">{i + 1}</td>
                    <td className="px-6 py-4 text-gray-600">{m.vehicle}</td>
                    <td className="px-6 py-4 text-gray-600">{m.maintenanceType}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">{m.description}</td>
                    <td className="px-6 py-4 text-gray-600">{m.scheduledDate}</td>
                    <td className="px-6 py-4 text-gray-600">{m.actualCost ?? m.estimatedCost ?? "—"}</td>
                    <td className="px-6 py-4"><StatusBadge status={m.status} /></td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => openEdit(m)} className="text-xs text-green-600 hover:underline cursor-pointer">Edit</button>
                      <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500 hover:underline cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{editId ? "Edit Maintenance" : "Log Maintenance"}</h2>
              {error && <p className="error-msg mb-3">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Vehicle *</label>
                  <select className="input-field w-full" value={form.vehicle} onChange={(e) => set("vehicle", e.target.value)}>
                    <option value="">Select vehicle</option>
                    {vehicles.map((v) => <option key={v.id} value={v.vehicleId}>{v.vehicleId} — {v.make} {v.model}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Type *</label>
                  <select className="input-field w-full" value={form.maintenanceType} onChange={(e) => set("maintenanceType", e.target.value)}>
                    {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="form-label">Description *</label>
                  <textarea className="input-field w-full" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Scheduled Date *</label>
                  <input type="date" className="input-field w-full" value={form.scheduledDate} onChange={(e) => set("scheduledDate", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Estimated Cost (₹)</label>
                  <input type="number" className="input-field w-full" value={form.estimatedCost} onChange={(e) => set("estimatedCost", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Actual Cost (₹)</label>
                  <input type="number" className="input-field w-full" value={form.actualCost} onChange={(e) => set("actualCost", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Technician</label>
                  <input className="input-field w-full" value={form.technician} onChange={(e) => set("technician", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select className="input-field w-full" value={form.status} onChange={(e) => set("status", e.target.value)}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Resolved Date</label>
                  <input type="date" className="input-field w-full" value={form.resolvedDate} onChange={(e) => set("resolvedDate", e.target.value)} />
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
