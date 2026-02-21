import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function KPICard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex-1 min-w-[160px]">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-xs text-gray-600 w-28 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 w-10 text-right">{value}</span>
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    if (!user?.businessKey) return;
    const bk = user.businessKey;
    const unsubs = [
      onSnapshot(query(collection(db, "trips"), where("businessKey", "==", bk)),
        (s) => setTrips(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, "vehicles"), where("businessKey", "==", bk)),
        (s) => setVehicles(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, "maintenance"), where("businessKey", "==", bk)),
        (s) => setMaintenance(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, "expenses"), where("businessKey", "==", bk)),
        (s) => setExpenses(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
    ];
    return () => unsubs.forEach((u) => u());
  }, [user]);

  const totalFleet = vehicles.length;
  const totalTrips = trips.length;
  const totalSpend = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const maintCosts = maintenance.reduce((s, m) => s + (Number(m.actualCost) || Number(m.estimatedCost) || 0), 0);

  const onTrip = trips.filter((t) => t.status === "on trip").length;
  const completed = trips.filter((t) => t.status === "completed").length;
  const aborted = trips.filter((t) => t.status === "aborted").length;
  const maxStatus = Math.max(onTrip, completed, aborted, 1);

  const monthlyExpenses = {};
  expenses.forEach((e) => {
    if (!e.date) return;
    const month = e.date.slice(0, 7);
    monthlyExpenses[month] = (monthlyExpenses[month] || 0) + (Number(e.amount) || 0);
  });
  const months = Object.keys(monthlyExpenses).sort();
  const maxMonthly = Math.max(...Object.values(monthlyExpenses), 1);

  const vehicleTrips = {};
  trips.forEach((t) => { if (t.vehicle) vehicleTrips[t.vehicle] = (vehicleTrips[t.vehicle] || 0) + 1; });
  const maxVehicleTrips = Math.max(...Object.values(vehicleTrips), 1);

  const maintByType = {};
  maintenance.forEach((m) => { const t = m.maintenanceType || "Other"; maintByType[t] = (maintByType[t] || 0) + 1; });
  const maxMaint = Math.max(...Object.values(maintByType), 1);

  const efficiency = totalTrips > 0 ? ((completed / totalTrips) * 100).toFixed(1) : "0.0";
  const avgMaintCost = totalFleet > 0 ? (maintCosts / totalFleet).toFixed(0) : "0";
  const mostActiveVehicle = Object.entries(vehicleTrips).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const driverCompletions = {};
  trips.filter((t) => t.status === "completed").forEach((t) => {
    if (t.driver) driverCompletions[t.driver] = (driverCompletions[t.driver] || 0) + 1;
  });
  const topDriver = Object.entries(driverCompletions).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Analytics</h1>

        <div className="flex gap-4 mb-8 flex-wrap">
          <KPICard label="Total Fleet Size" value={totalFleet} />
          <KPICard label="Total Trips" value={totalTrips} />
          <KPICard label="Total Spend (₹)" value={`₹${totalSpend.toLocaleString()}`} />
          <KPICard label="Maintenance Costs (₹)" value={`₹${maintCosts.toLocaleString()}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Trip Status Distribution</h3>
            <Bar label="On Trip" value={onTrip} max={maxStatus} color="bg-blue-400" />
            <Bar label="Completed" value={completed} max={maxStatus} color="bg-green-400" />
            <Bar label="Aborted" value={aborted} max={maxStatus} color="bg-red-400" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Expense Breakdown</h3>
            {months.length === 0 ? (
              <p className="text-xs text-gray-400">No expense data yet.</p>
            ) : months.map((m) => (
              <Bar key={m} label={m} value={monthlyExpenses[m]} max={maxMonthly} color="bg-green-400" />
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Vehicle Utilization</h3>
            {Object.keys(vehicleTrips).length === 0 ? (
              <p className="text-xs text-gray-400">No trip data yet.</p>
            ) : Object.entries(vehicleTrips).map(([v, c]) => (
              <Bar key={v} label={v} value={c} max={maxVehicleTrips} color="bg-blue-400" />
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Maintenance by Type</h3>
            {Object.keys(maintByType).length === 0 ? (
              <p className="text-xs text-gray-400">No maintenance data yet.</p>
            ) : Object.entries(maintByType).map(([t, c]) => (
              <Bar key={t} label={t} value={c} max={maxMaint} color="bg-yellow-400" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Insights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <p className="text-gray-600">Fleet Efficiency Rate: <span className="font-bold text-green-600">{efficiency}%</span></p>
            <p className="text-gray-600">Avg Maintenance Cost per Vehicle: <span className="font-bold text-gray-800">₹{Number(avgMaintCost).toLocaleString()}</span></p>
            <p className="text-gray-600">Most Active Vehicle: <span className="font-bold text-gray-800">{mostActiveVehicle}</span></p>
            <p className="text-gray-600">Top Driver: <span className="font-bold text-gray-800">{topDriver}</span></p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
