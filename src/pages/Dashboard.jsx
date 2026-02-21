import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function StatusBadge({ status }) {
  const map = {
    "on trip":   "bg-blue-100 text-blue-700",
    "completed": "bg-green-100 text-green-700",
    "aborted":   "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function SummaryCard({ label, value, accent }) {
  const accents = {
    blue:   "border-t-blue-400",
    yellow: "border-t-yellow-400",
    orange: "border-t-orange-400",
  };
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 ${accents[accent]} p-5 flex-1 min-w-[160px]`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

const STATUS_ORDER_CYCLES = [
  null,
  ["on trip", "completed", "aborted"],
  ["completed", "aborted", "on trip"],
  ["aborted", "on trip", "completed"],
];

function sortTrips(trips, statusCycle, driverAsc) {
  let sorted = [...trips];
  if (driverAsc) {
    sorted.sort((a, b) => (a.driver || "").localeCompare(b.driver || ""));
    return sorted;
  }
  if (statusCycle === 0) {
    sorted.sort((a, b) => (a.tripNumber || 0) - (b.tripNumber || 0));
    return sorted;
  }
  const order = STATUS_ORDER_CYCLES[statusCycle];
  sorted.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  return sorted;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [cargo, setCargo] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [statusCycle, setStatusCycle] = useState(0);
  const [driverAsc, setDriverAsc] = useState(false);

  useEffect(() => {
    if (!user?.businessKey) return;
    const bk = user.businessKey;

    const unsubTrips = onSnapshot(
      query(collection(db, "trips"), where("businessKey", "==", bk)),
      (snap) => setTrips(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubCargo = onSnapshot(
      query(collection(db, "cargo"), where("businessKey", "==", bk)),
      (snap) => setCargo(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubMaint = onSnapshot(
      query(collection(db, "maintenance"), where("businessKey", "==", bk)),
      (snap) => setMaintenance(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => { unsubTrips(); unsubCargo(); unsubMaint(); };
  }, [user]);

  const activeFleet  = trips.filter((t) => t.status === "on trip").length;
  const maintAlert   = maintenance.filter((m) => m.status !== "Resolved").length;
  const pendingCargo = cargo.filter((c) => !c.tripId).length;

  const sortedTrips = sortTrips(trips, statusCycle, driverAsc);

  const handleStatusSort = () => {
    setDriverAsc(false);
    setStatusCycle((prev) => (prev + 1) % 4);
  };

  const handleDriverSort = () => {
    setDriverAsc((prev) => {
      if (!prev) setStatusCycle(0);
      return !prev;
    });
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Welcome back, <span className="text-gray-600 font-medium">{user?.username}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/trip-dispatcher")} className="btn-outlined text-sm">
              + New Trip
            </button>
            <button onClick={() => navigate("/vehicle-registry")} className="btn-outlined text-sm">
              + New Vehicle
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          <SummaryCard label="Active Fleet" value={activeFleet} accent="blue" />
          <SummaryCard label="Maintenance Alert" value={maintAlert} accent="yellow" />
          <SummaryCard label="Pending Cargo" value={pendingCargo} accent="orange" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-700">All Trips</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Trip #</th>
                  <th className="px-6 py-3 font-semibold">Vehicle</th>
                  <th className="px-6 py-3 font-semibold">
                    <button onClick={handleDriverSort} className="flex items-center gap-1 hover:text-green-600 transition-colors duration-150 cursor-pointer font-semibold uppercase tracking-wider">
                      Driver {driverAsc ? "▲" : "↕"}
                    </button>
                  </th>
                  <th className="px-6 py-3 font-semibold">
                    <button onClick={handleStatusSort} className="flex items-center gap-1 hover:text-green-600 transition-colors duration-150 cursor-pointer font-semibold uppercase tracking-wider">
                      Status {statusCycle === 0 ? "↕" : "▼"}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedTrips.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                      No trips yet. Create a new trip to get started.
                    </td>
                  </tr>
                ) : (
                  sortedTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors duration-100">
                      <td className="px-6 py-4 font-medium text-gray-800">#{trip.tripNumber || trip.id?.slice(0, 6) || "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{trip.vehicle || "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{trip.driver || "—"}</td>
                      <td className="px-6 py-4"><StatusBadge status={trip.status ?? "unknown"} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
