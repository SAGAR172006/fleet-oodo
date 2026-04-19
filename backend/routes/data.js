const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../mongo");
const { normalizeSafeKey, sanitizeObject } = require("../utils/validation");

const router = express.Router();

const ALLOWED_COLLECTIONS = new Set([
  "vehicles",
  "trips",
  "maintenance",
  "expenses",
  "drivers",
  "cargo",
]);

const FIELD_WHITELIST = {
  vehicles: ["vehicleId", "make", "model", "year", "status", "lastServiceDate", "assignedDriver", "notes", "businessKey", "createdAt", "updatedAt"],
  trips: ["tripNumber", "vehicle", "driver", "origin", "destination", "departureDatetime", "cargoDescription", "cargoWeight", "estimatedArrival", "status", "dispatcherId", "businessKey", "createdAt", "updatedAt"],
  maintenance: ["vehicle", "maintenanceType", "description", "scheduledDate", "estimatedCost", "actualCost", "technician", "status", "resolvedDate", "businessKey", "createdAt", "updatedAt"],
  expenses: ["tripId", "tripNumber", "category", "amount", "date", "description", "receiptRef", "loggedBy", "businessKey", "createdAt", "updatedAt"],
  drivers: ["name", "licenseId", "licenseExpiry", "phone", "notes", "businessKey", "createdAt", "updatedAt"],
  cargo: ["tripId", "name", "weight", "status", "businessKey", "createdAt", "updatedAt"],
};

function getCollection(name) {
  if (!ALLOWED_COLLECTIONS.has(name)) return null;
  return getDb().collection(name);
}

function toClientItem(item) {
  if (!item) return null;
  const { _id, ...rest } = item;
  return { id: _id.toString(), ...rest };
}

function pickAllowedFields(collectionName, payload) {
  const allowed = new Set(FIELD_WHITELIST[collectionName] || []);
  const out = {};
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (allowed.has(key)) out[key] = value;
  });
  return out;
}

router.get("/:collection", async (req, res) => {
  try {
    const collection = getCollection(req.params.collection);
    if (!collection) return res.status(404).json({ error: "Collection not found" });

    const businessKey = req.query?.businessKey == null ? null : normalizeSafeKey(req.query.businessKey);
    if (req.query?.businessKey != null && !businessKey) {
      return res.status(400).json({ error: "Invalid business key" });
    }
    const filter = businessKey ? { businessKey } : {};

    const items = await collection.find(filter).toArray();
    return res.json({ items: items.map(toClientItem) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch records" });
  }
});

router.post("/:collection", async (req, res) => {
  try {
    const collectionName = req.params.collection;
    const collection = getCollection(collectionName);
    if (!collection) return res.status(404).json({ error: "Collection not found" });

    const payload = pickAllowedFields(collectionName, {
      ...sanitizeObject(req.body),
      createdAt: new Date(),
    });
    const safeBusinessKey = normalizeSafeKey(payload?.businessKey);
    if (!safeBusinessKey) {
      return res.status(400).json({ error: "Invalid business key" });
    }
    payload.businessKey = safeBusinessKey;

    if (collectionName === "trips" && !payload.tripNumber) {
      const db = getDb();
      const counter = await db.collection("counters").findOneAndUpdate(
        { _id: `trips:${safeBusinessKey}` },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" }
      );
      payload.tripNumber = Number(counter?.seq) || 1;
    }

    const result = await collection.insertOne(payload);
    const created = await collection.findOne({ _id: result.insertedId });
    return res.status(201).json({ item: toClientItem(created) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create record" });
  }
});

router.put("/:collection/:id", async (req, res) => {
  try {
    const collection = getCollection(req.params.collection);
    if (!collection) return res.status(404).json({ error: "Collection not found" });

    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid record id" });
    const updates = pickAllowedFields(req.params.collection, {
      ...sanitizeObject(req.body),
      updatedAt: new Date(),
    });
    delete updates.id;
    delete updates._id;
    if (updates.businessKey && !normalizeSafeKey(updates.businessKey)) {
      return res.status(400).json({ error: "Invalid business key" });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    if (!result.matchedCount) return res.status(404).json({ error: "Record not found" });
    const updated = await collection.findOne({ _id: new ObjectId(id) });
    return res.json({ item: toClientItem(updated) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update record" });
  }
});

router.delete("/:collection/:id", async (req, res) => {
  try {
    const collection = getCollection(req.params.collection);
    if (!collection) return res.status(404).json({ error: "Collection not found" });

    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid record id" });
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) return res.status(404).json({ error: "Record not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete record" });
  }
});

module.exports = router;
