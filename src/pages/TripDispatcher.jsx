import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import { useSearchParams } from "react-router-dom";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp, runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";

const STATUS_OPTIONS = ["on trip", "completed", "aborted"];

function StatusBadge({ status }) {
  const map = {
    "on trip": "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    aborted: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

const EMPTY_FORM = {
  vehicle: "", driver: "", origin: "", destination: "", departureDatetime: "",
  cargoDescription: "", cargoWeight: "", estimatedArrival: "", status: "on trip",
};

export default function TripDispatcher() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [trips, setTrips] = useState([]);
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
    const bk = user.businessKey;
    const unsubTrips = onSnapshot(
      query(collection(db, "trips"), where("businessKey", "==", bk)),
      (snap) => setTrips(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubVehicles = onSnapshot(
      query(collection(db, "vehicles"), where("businessKey", "==", bk)),
      (snap) => setVehicles(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubTrips(); unsubVehicles(); };
  }, [user]);

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setError(""); setShowModal(true); };
  const openEdit = (t) => {
    setEditId(t.id);
    setForm({
      vehicle: t.vehicle || "", driver: t.driver || "", origin: t.origin || "",
      destination: t.destination || "", departureDatetime: t.departureDatetime || "",
      cargoDescription: t.cargoDescription || "", cargoWeight: t.cargoWeight ?? "",
      estimatedArrival: t.estimatedArrival || "", status: t.status || "on trip",
    });
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    try { await deleteDoc(doc(db, "trips", id)); } catch (e) { setError(e.message); }
  };

  const canSave = form.vehicle && form.driver && form.origin && form.destination && form.departureDatetime;

  const handleSave = async () => {
    if (!canSave) return;
    setError("");
    try {
      const data = {
        vehicle: form.vehicle, driver: form.driver, origin: form.origin,
        destination: form.destination, departureDatetime: form.departureDatetime,
        cargoDescription: form.cargoDescription, estimatedArrival: form.estimatedArrival,
        status: form.status, businessKey: user.businessKey,
        cargoWeight: form.cargoWeight ? Number(form.cargoWeight) : null,
      };
      if (editId) {
        await updateDoc(doc(db, "trips", editId), data);
      } else {
        await runTransaction(db, async (transaction) => {
          const snap = await getDocs(query(collection(db, "trips"), where("businessKey", "==", user.businessKey)));
          data.tripNumber = snap.size + 1;
          data.dispatcherId = user.userId;
          data.createdAt = serverTimestamp();
          const newRef = doc(collection(db, "trips"));
          transaction.set(newRef, data);
        });
      }
      setShowModal(false);
    } catch (e) { setError(e.message); }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Trip Dispatcher</h1>
          <button onClick={openAdd} className="btn-primary text-sm">+ New Trip</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Trip #</th>
                  <th className="px-6 py-3 font-semibold">Vehicle</th>
                  <th className="px-6 py-3 font-semibold">Driver</th>
                  <th className="px-6 py-3 font-semibold">Route</th>
                  <th className="px-6 py-3 font-semibold">Departure</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trips.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">No trips dispatched yet.</td></tr>
                ) : trips.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-100">
                    <td className="px-6 py-4 font-medium text-gray-800">#{t.tripNumber || t.id?.slice(0, 6)}</td>
                    <td className="px-6 py-4 text-gray-600">{t.vehicle}</td>
                    <td className="px-6 py-4 text-gray-600">{t.driver}</td>
                    <td className="px-6 py-4 text-gray-600">{t.origin} → {t.destination}</td>
                    <td className="px-6 py-4 text-gray-600">{t.departureDatetime || "—"}</td>
                    <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => openEdit(t)} className="text-xs text-green-600 hover:underline cursor-pointer">Edit</button>
                      <button onClick={() => handleDelete(t.id)} className="text-xs text-red-500 hover:underline cursor-pointer">Delete</button>
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
              <h2 className="text-lg font-bold text-gray-800 mb-4">{editId ? "Edit Trip" : "New Trip"}</h2>
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
                  <label className="form-label">Driver *</label>
                  <input className="input-field w-full" value={form.driver} onChange={(e) => set("driver", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Origin *</label>
                  <input className="input-field w-full" value={form.origin} onChange={(e) => set("origin", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Destination *</label>
                  <input className="input-field w-full" value={form.destination} onChange={(e) => set("destination", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Departure *</label>
                  <input type="datetime-local" className="input-field w-full" value={form.departureDatetime} onChange={(e) => set("departureDatetime", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Estimated Arrival</label>
                  <input type="datetime-local" className="input-field w-full" value={form.estimatedArrival} onChange={(e) => set("estimatedArrival", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Cargo Description</label>
                  <input className="input-field w-full" value={form.cargoDescription} onChange={(e) => set("cargoDescription", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Cargo Weight (kg)</label>
                  <input type="number" className="input-field w-full" value={form.cargoWeight} onChange={(e) => set("cargoWeight", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select className="input-field w-full" value={form.status} onChange={(e) => set("status", e.target.value)}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {user?.licenseId && (
                  <div>
                    <label className="form-label">Dispatcher License</label>
                    <input className="input-field w-full bg-gray-50" value={user.licenseId} readOnly />
                  </div>
                )}
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
