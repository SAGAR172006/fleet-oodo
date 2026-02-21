import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

function SummaryCard({ label, value, accent }) {
  const colors = { blue: "border-t-blue-400", yellow: "border-t-yellow-400", red: "border-t-red-400", green: "border-t-green-400" };
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 ${colors[accent] || ""} p-5 flex-1 min-w-[160px]`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function ComplianceBadge({ expiry }) {
  if (!expiry) return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Unknown</span>;
  const now = new Date();
  const exp = new Date(expiry);
  const diff = (exp - now) / (1000 * 60 * 60 * 24);
  if (diff < 0) return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Expired</span>;
  if (diff <= 30) return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Expiring Soon</span>;
  return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Compliant</span>;
}

function SafetyScore({ score }) {
  let cls = "bg-green-100 text-green-700";
  if (score < 50) cls = "bg-red-100 text-red-700";
  else if (score < 75) cls = "bg-yellow-100 text-yellow-700";
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>{score}%</span>;
}

const EMPTY_FORM = { name: "", licenseId: "", licenseExpiry: "", phone: "", notes: "" };

export default function Performance() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.businessKey) return;
    const bk = user.businessKey;
    const unsubTrips = onSnapshot(
      query(collection(db, "trips"), where("businessKey", "==", bk)),
      (snap) => setTrips(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubDrivers = onSnapshot(
      query(collection(db, "drivers"), where("businessKey", "==", bk)),
      (snap) => setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubTrips(); unsubDrivers(); };
  }, [user]);

  const driverMetrics = drivers.map((d) => {
    const driverTrips = trips.filter((t) => t.driver === d.name);
    const completed = driverTrips.filter((t) => t.status === "completed").length;
    const aborted = driverTrips.filter((t) => t.status === "aborted").length;
    const total = driverTrips.length;
    const score = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;
    return { ...d, completed, aborted, total, score };
  });

  const now = new Date();
  const expiredCount = drivers.filter((d) => d.licenseExpiry && new Date(d.licenseExpiry) < now).length;
  const avgScore = driverMetrics.length > 0
    ? (driverMetrics.reduce((s, d) => s + d.score, 0) / driverMetrics.length).toFixed(1)
    : "0.0";
  const nonCompliant = drivers.filter((d) => {
    if (!d.licenseExpiry) return true;
    return new Date(d.licenseExpiry) < now;
  }).length;

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setError(""); setShowModal(true); };
  const openEdit = (d) => {
    setEditId(d.id);
    setForm({
      name: d.name || "", licenseId: d.licenseId || "",
      licenseExpiry: d.licenseExpiry || "", phone: d.phone || "", notes: d.notes || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this driver?")) return;
    try { await deleteDoc(doc(db, "drivers", id)); } catch (e) { setError(e.message); }
  };

  const canSave = form.name && form.licenseId && form.licenseExpiry;

  const handleSave = async () => {
    if (!canSave) return;
    setError("");
    try {
      const data = {
        name: form.name, licenseId: form.licenseId, licenseExpiry: form.licenseExpiry,
        phone: form.phone, notes: form.notes, businessKey: user.businessKey,
      };
      if (editId) {
        await updateDoc(doc(db, "drivers", editId), data);
      } else {
        await addDoc(collection(db, "drivers"), { ...data, createdAt: serverTimestamp() });
      }
      setShowModal(false);
    } catch (e) { setError(e.message); }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Performance</h1>
          <button onClick={openAdd} className="btn-primary text-sm">+ Add Driver</button>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          <SummaryCard label="Total Drivers" value={drivers.length} accent="blue" />
          <SummaryCard label="Expired Licenses" value={expiredCount} accent="red" />
          <SummaryCard label="Avg Safety Score" value={`${avgScore}%`} accent="green" />
          <SummaryCard label="Non-Compliant" value={nonCompliant} accent="yellow" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Driver Name</th>
                  <th className="px-6 py-3 font-semibold">License ID</th>
                  <th className="px-6 py-3 font-semibold">License Expiry</th>
                  <th className="px-6 py-3 font-semibold">Trips Completed</th>
                  <th className="px-6 py-3 font-semibold">Trips Aborted</th>
                  <th className="px-6 py-3 font-semibold">Safety Score</th>
                  <th className="px-6 py-3 font-semibold">Compliance</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {driverMetrics.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">No drivers registered yet.</td></tr>
                ) : driverMetrics.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors duration-100">
                    <td className="px-6 py-4 font-medium text-gray-800">{d.name}</td>
                    <td className="px-6 py-4 text-gray-600">{d.licenseId}</td>
                    <td className="px-6 py-4 text-gray-600">{d.licenseExpiry}</td>
                    <td className="px-6 py-4 text-gray-600">{d.completed}</td>
                    <td className="px-6 py-4 text-gray-600">{d.aborted}</td>
                    <td className="px-6 py-4"><SafetyScore score={d.score} /></td>
                    <td className="px-6 py-4"><ComplianceBadge expiry={d.licenseExpiry} /></td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => openEdit(d)} className="text-xs text-green-600 hover:underline cursor-pointer">Edit</button>
                      <button onClick={() => handleDelete(d.id)} className="text-xs text-red-500 hover:underline cursor-pointer">Delete</button>
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
              <h2 className="text-lg font-bold text-gray-800 mb-4">{editId ? "Edit Driver" : "Add Driver"}</h2>
              {error && <p className="error-msg mb-3">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name *</label>
                  <input className="input-field w-full" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">License ID *</label>
                  <input className="input-field w-full" value={form.licenseId} onChange={(e) => set("licenseId", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">License Expiry *</label>
                  <input type="date" className="input-field w-full" value={form.licenseExpiry} onChange={(e) => set("licenseExpiry", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input className="input-field w-full" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
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
