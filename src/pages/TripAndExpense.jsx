import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const CATEGORIES = ["Fuel", "Maintenance", "Driver Pay", "Toll", "Loading/Unloading", "Miscellaneous"];

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex-1 min-w-[160px]">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

const EMPTY_FORM = {
  tripId: "", category: "Fuel", amount: "", date: "", description: "", receiptRef: "",
};

export default function TripAndExpense() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
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
    const unsubExpenses = onSnapshot(
      query(collection(db, "expenses"), where("businessKey", "==", bk)),
      (snap) => setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubTrips(); unsubExpenses(); };
  }, [user]);

  const totalTrips = trips.length;
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const avgCost = totalTrips > 0 ? (totalExpenses / totalTrips).toFixed(2) : "0.00";
  const pendingCount = expenses.filter((e) => !e.category || e.category === "Miscellaneous").length;
  const completedTrips = trips.filter((t) => t.status === "completed").length;
  const roi = totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(1) : "0.0";

  const tripMap = {};
  trips.forEach((t) => { tripMap[t.id] = t; });

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setError(""); setShowModal(true); };
  const openEdit = (e) => {
    setEditId(e.id);
    setForm({
      tripId: e.tripId || "", category: e.category || "Fuel",
      amount: e.amount ?? "", date: e.date || "",
      description: e.description || "", receiptRef: e.receiptRef || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try { await deleteDoc(doc(db, "expenses", id)); } catch (e) { setError(e.message); }
  };

  const canSave = form.tripId && form.category && form.amount && form.date;

  const handleSave = async () => {
    if (!canSave) return;
    setError("");
    try {
      const linkedTrip = tripMap[form.tripId];
      const data = {
        tripId: form.tripId, tripNumber: linkedTrip?.tripNumber ?? null,
        category: form.category, amount: Number(form.amount), date: form.date,
        description: form.description, receiptRef: form.receiptRef,
        businessKey: user.businessKey,
      };
      if (editId) {
        await updateDoc(doc(db, "expenses", editId), data);
      } else {
        await addDoc(collection(db, "expenses"), { ...data, loggedBy: user.userId, createdAt: serverTimestamp() });
      }
      setShowModal(false);
    } catch (e) { setError(e.message); }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Trip &amp; Expense</h1>
          <button onClick={openAdd} className="btn-primary text-sm">+ Log Expense</button>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          <SummaryCard label="Total Trips" value={totalTrips} />
          <SummaryCard label="Total Expenses (₹)" value={`₹${totalExpenses.toLocaleString()}`} />
          <SummaryCard label="Avg Cost Per Trip (₹)" value={`₹${avgCost}`} />
          <SummaryCard label="Pending Expenses" value={pendingCount} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Trip #</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Amount (₹)</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Description</th>
                  <th className="px-6 py-3 font-semibold">Logged By</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">No expenses logged yet.</td></tr>
                ) : expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors duration-100">
                    <td className="px-6 py-4 font-medium text-gray-800">#{e.tripNumber ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{e.category}</td>
                    <td className="px-6 py-4 text-gray-600">₹{Number(e.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{e.date}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">{e.description || "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{e.loggedBy || "—"}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => openEdit(e)} className="text-xs text-green-600 hover:underline cursor-pointer">Edit</button>
                      <button onClick={() => handleDelete(e.id)} className="text-xs text-red-500 hover:underline cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">Maintenance ROI:</span>{" "}
            <span className="text-green-600 font-bold">{roi}%</span>
            <span className="text-gray-400 ml-2 text-xs">(completed trips / total trips × 100)</span>
          </p>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{editId ? "Edit Expense" : "Log Expense"}</h2>
              {error && <p className="error-msg mb-3">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Trip *</label>
                  <select className="input-field w-full" value={form.tripId} onChange={(e) => set("tripId", e.target.value)}>
                    <option value="">Select trip</option>
                    {trips.map((t) => <option key={t.id} value={t.id}>#{t.tripNumber} — {t.vehicle}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Category *</label>
                  <select className="input-field w-full" value={form.category} onChange={(e) => set("category", e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Amount (₹) *</label>
                  <input type="number" className="input-field w-full" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Date *</label>
                  <input type="date" className="input-field w-full" value={form.date} onChange={(e) => set("date", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Description</label>
                  <textarea className="input-field w-full" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Receipt Reference</label>
                  <input className="input-field w-full" value={form.receiptRef} onChange={(e) => set("receiptRef", e.target.value)} />
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
