/**
 * backend/seed.js
 *
 * Firestore seed script — populates the database with realistic demo data
 * for business key BK-DEMO-999.
 *
 * Usage:
 *   cd backend
 *   npm run seed
 */

const { db } = require("./firebase-admin");
const bcrypt = require("bcrypt");

const BUSINESS_KEY = "BK-DEMO-999";

// ── helpers ────────────────────────────────────────────────────────────────

async function clearCollection(collectionName) {
  const snap = await db
    .collection(collectionName)
    .where("businessKey", "==", BUSINESS_KEY)
    .get();
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(
    `  🗑  Cleared ${snap.size} existing ${collectionName} record(s) for ${BUSINESS_KEY}`
  );
}

// ── users ──────────────────────────────────────────────────────────────────

async function seedUsers() {
  console.log("\n👤 Seeding users…");

  const password = "demo1234";
  const passwordHash = await bcrypt.hash(password, 10);

  const users = [
    {
      username: "Alice Manager",
      userId: "alice-mgr",
      role: "Fleet Manager",
      businessKey: BUSINESS_KEY,
      passwordHash,
      createdAt: new Date().toISOString(),
    },
    {
      username: "Bob Dispatcher",
      userId: "bob-dispatch",
      role: "Dispatcher",
      businessKey: BUSINESS_KEY,
      passwordHash,
      licenseId: "DL-2024-BOB-7890",
      licenseExpiry: "2026-08-15",
      createdAt: new Date().toISOString(),
    },
    {
      username: "Carol Safety",
      userId: "carol-safety",
      role: "Safety Officer",
      businessKey: BUSINESS_KEY,
      passwordHash,
      createdAt: new Date().toISOString(),
    },
    {
      username: "Dave Finance",
      userId: "dave-finance",
      role: "Finance Analyst",
      businessKey: BUSINESS_KEY,
      passwordHash,
      createdAt: new Date().toISOString(),
    },
  ];

  // Clear existing users for BK-DEMO-999
  const existingSnap = await db
    .collection("users")
    .where("businessKey", "==", BUSINESS_KEY)
    .get();
  const batch = db.batch();
  existingSnap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(
    `  🗑  Cleared ${existingSnap.size} existing users record(s) for ${BUSINESS_KEY}`
  );

  for (const user of users) {
    await db.collection("users").add(user);
    console.log(`  ✅  User: ${user.username} (${user.userId}) — ${user.role}`);
  }
}

// ── vehicles ───────────────────────────────────────────────────────────────

async function seedVehicles() {
  console.log("\n🚛 Seeding vehicles…");
  await clearCollection("vehicles");

  const vehicles = [
    {
      vehicleId: "VH-001",
      make: "Tata",
      model: "Prima 4928",
      year: 2022,
      status: "Active",
      lastServiceDate: "2025-12-10",
      assignedDriver: "Ravi Kumar",
      notes: "Long-haul truck, GPS equipped",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      vehicleId: "VH-002",
      make: "Ashok Leyland",
      model: "4220",
      year: 2021,
      status: "Active",
      lastServiceDate: "2025-11-20",
      assignedDriver: "Suresh Patel",
      notes: "Refrigerated cargo unit",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      vehicleId: "VH-003",
      make: "Mahindra",
      model: "Blazo X 46",
      year: 2023,
      status: "In Maintenance",
      lastServiceDate: "2026-01-05",
      assignedDriver: "",
      notes: "Engine overhaul in progress",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      vehicleId: "VH-004",
      make: "BharatBenz",
      model: "1617R",
      year: 2020,
      status: "Active",
      lastServiceDate: "2025-10-15",
      assignedDriver: "Amit Singh",
      notes: "City delivery vehicle",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      vehicleId: "VH-005",
      make: "Eicher",
      model: "Pro 6049",
      year: 2019,
      status: "Retired",
      lastServiceDate: "2025-06-30",
      assignedDriver: "",
      notes: "Decommissioned - high mileage",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const v of vehicles) {
    await db.collection("vehicles").add(v);
    console.log(`  ✅  Vehicle: ${v.vehicleId} — ${v.make} ${v.model} (${v.status})`);
  }
}

// ── trips ──────────────────────────────────────────────────────────────────

async function seedTrips() {
  console.log("\n🗺  Seeding trips…");
  await clearCollection("trips");

  const tripsData = [
    {
      tripNumber: "1",
      vehicle: "VH-001",
      driver: "Ravi Kumar",
      origin: "Mumbai",
      destination: "Delhi",
      departureDatetime: "2026-02-15T06:00",
      cargoDescription: "Electronics",
      cargoWeight: 18000,
      estimatedArrival: "2026-02-17T14:00",
      status: "on trip",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      tripNumber: "2",
      vehicle: "VH-002",
      driver: "Suresh Patel",
      origin: "Chennai",
      destination: "Bangalore",
      departureDatetime: "2026-02-10T08:00",
      cargoDescription: "Frozen Foods",
      cargoWeight: 12000,
      estimatedArrival: "2026-02-10T18:00",
      status: "completed",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      tripNumber: "3",
      vehicle: "VH-004",
      driver: "Amit Singh",
      origin: "Pune",
      destination: "Hyderabad",
      departureDatetime: "2026-02-12T07:00",
      cargoDescription: "Auto Parts",
      cargoWeight: 8500,
      estimatedArrival: "2026-02-13T10:00",
      status: "completed",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      tripNumber: "4",
      vehicle: "VH-001",
      driver: "Ravi Kumar",
      origin: "Delhi",
      destination: "Jaipur",
      departureDatetime: "2026-01-20T05:30",
      cargoDescription: "Textiles",
      cargoWeight: 15000,
      estimatedArrival: "2026-01-20T14:00",
      status: "completed",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      tripNumber: "5",
      vehicle: "VH-002",
      driver: "Suresh Patel",
      origin: "Bangalore",
      destination: "Kochi",
      departureDatetime: "2026-02-18T09:00",
      cargoDescription: "Pharmaceuticals",
      cargoWeight: 5000,
      estimatedArrival: "2026-02-19T08:00",
      status: "on trip",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      tripNumber: "6",
      vehicle: "VH-004",
      driver: "Amit Singh",
      origin: "Hyderabad",
      destination: "Mumbai",
      departureDatetime: "2026-02-05T06:00",
      cargoDescription: "Construction Material",
      cargoWeight: 20000,
      estimatedArrival: "2026-02-07T12:00",
      status: "aborted",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
  ];

  const tripIds = {};
  for (const trip of tripsData) {
    const ref = await db.collection("trips").add(trip);
    tripIds[trip.tripNumber] = ref.id;
    console.log(
      `  ✅  Trip #${trip.tripNumber}: ${trip.origin} → ${trip.destination} (${trip.status}) [id: ${ref.id}]`
    );
  }
  return tripIds;
}

// ── maintenance ────────────────────────────────────────────────────────────

async function seedMaintenance() {
  console.log("\n🔧 Seeding maintenance…");
  await clearCollection("maintenance");

  const records = [
    {
      vehicle: "VH-003",
      maintenanceType: "Emergency",
      description: "Engine overhaul - abnormal vibration",
      scheduledDate: "2026-01-05",
      estimatedCost: 75000,
      actualCost: 82000,
      technician: "Mohan Garage Works",
      status: "In Progress",
      resolvedDate: "",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      vehicle: "VH-001",
      maintenanceType: "Scheduled",
      description: "Regular service - oil change and brake check",
      scheduledDate: "2026-03-01",
      estimatedCost: 12000,
      actualCost: null,
      technician: "FleetCare Service Center",
      status: "Scheduled",
      resolvedDate: "",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      vehicle: "VH-005",
      maintenanceType: "Routine",
      description: "Final inspection before decommission",
      scheduledDate: "2025-06-25",
      estimatedCost: 5000,
      actualCost: 4800,
      technician: "QuickFix Auto",
      status: "Resolved",
      resolvedDate: "2025-06-28",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      vehicle: "VH-002",
      maintenanceType: "Scheduled",
      description: "Refrigeration unit maintenance",
      scheduledDate: "2026-02-28",
      estimatedCost: 25000,
      actualCost: null,
      technician: "CoolTech Services",
      status: "Overdue",
      resolvedDate: "",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const r of records) {
    await db.collection("maintenance").add(r);
    console.log(`  ✅  Maintenance: ${r.vehicle} — ${r.maintenanceType} (${r.status})`);
  }
}

// ── expenses ───────────────────────────────────────────────────────────────

async function seedExpenses(tripIds) {
  console.log("\n💰 Seeding expenses…");
  await clearCollection("expenses");

  const expenses = [
    {
      tripId: tripIds["1"],
      category: "Fuel",
      amount: 15000,
      date: "2026-02-15",
      description: "Diesel fill-up Mumbai depot",
      receiptRef: "REC-001",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      tripId: tripIds["1"],
      category: "Toll",
      amount: 3200,
      date: "2026-02-15",
      description: "Mumbai-Delhi expressway tolls",
      receiptRef: "REC-002",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      tripId: tripIds["2"],
      category: "Fuel",
      amount: 8000,
      date: "2026-02-10",
      description: "Diesel - Chennai depot",
      receiptRef: "REC-003",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      tripId: tripIds["2"],
      category: "Driver Pay",
      amount: 5000,
      date: "2026-02-10",
      description: "Suresh Patel trip payment",
      receiptRef: "REC-004",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      tripId: tripIds["3"],
      category: "Fuel",
      amount: 6500,
      date: "2026-02-12",
      description: "Diesel fill-up Pune",
      receiptRef: "REC-005",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      tripId: tripIds["3"],
      category: "Loading/Unloading",
      amount: 2000,
      date: "2026-02-12",
      description: "Loading charges Pune warehouse",
      receiptRef: "REC-006",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      tripId: tripIds["4"],
      category: "Fuel",
      amount: 9000,
      date: "2026-01-20",
      description: "Diesel - Delhi depot",
      receiptRef: "REC-007",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      tripId: tripIds["6"],
      category: "Miscellaneous",
      amount: 4500,
      date: "2026-02-05",
      description: "Tow truck charges after breakdown",
      receiptRef: "REC-008",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const e of expenses) {
    await db.collection("expenses").add(e);
    console.log(`  ✅  Expense: ${e.category} ₹${e.amount} — ${e.description}`);
  }
}

// ── drivers ────────────────────────────────────────────────────────────────

async function seedDrivers() {
  console.log("\n🧑‍✈️  Seeding drivers…");
  await clearCollection("drivers");

  const drivers = [
    {
      name: "Ravi Kumar",
      licenseId: "DL-2024-RAV-1234",
      licenseExpiry: "2027-03-15",
      phone: "9876543210",
      notes: "Senior driver, 8 years experience",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      name: "Suresh Patel",
      licenseId: "DL-2023-SUR-5678",
      licenseExpiry: "2025-12-01",
      phone: "9876543211",
      notes: "Specialized in refrigerated transport",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      name: "Amit Singh",
      licenseId: "DL-2025-AMI-9012",
      licenseExpiry: "2028-06-20",
      phone: "9876543212",
      notes: "City routes specialist",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
    {
      name: "Priya Sharma",
      licenseId: "DL-2024-PRI-3456",
      licenseExpiry: "2026-01-10",
      phone: "9876543213",
      notes: "New hire, under probation",
      businessKey: BUSINESS_KEY,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const d of drivers) {
    await db.collection("drivers").add(d);
    console.log(`  ✅  Driver: ${d.name} (${d.licenseId})`);
  }
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 FleetFlow Seed Script");
  console.log(`   Business Key: ${BUSINESS_KEY}`);
  console.log("=".repeat(50));

  try {
    await seedUsers();
    await seedVehicles();
    const tripIds = await seedTrips();
    await seedMaintenance();
    await seedExpenses(tripIds);
    await seedDrivers();

    console.log("\n" + "=".repeat(50));
    console.log("✅ Seeding complete!");
    console.log("   4 users · 5 vehicles · 6 trips · 4 maintenance records · 8 expenses · 4 drivers");
    console.log("\n📋 Demo login credentials (all passwords: demo1234):");
    console.log("   alice-mgr      → Fleet Manager");
    console.log("   bob-dispatch   → Dispatcher");
    console.log("   carol-safety   → Safety Officer");
    console.log("   dave-finance   → Finance Analyst");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

main();
