const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../mongo");

const router = express.Router();

const ALLOWED_COLLECTIONS = new Set([
  "vehicles",
  "trips",
  "maintenance",
  "expenses",
  "drivers",
  "cargo",
]);

function getCollection(name) {
  if (!ALLOWED_COLLECTIONS.has(name)) return null;
  return getDb().collection(name);
}

function toClientItem(item) {
  if (!item) return null;
  const { _id, ...rest } = item;
  return { id: _id.toString(), ...rest };
}

router.get("/:collection", async (req, res) => {
  try {
    const collection = getCollection(req.params.collection);
    if (!collection) return res.status(404).json({ error: "Collection not found" });

    const { businessKey } = req.query;
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

    const payload = { ...req.body, createdAt: new Date().toISOString() };

    if (collectionName === "trips" && !payload.tripNumber && payload.businessKey) {
      const latestTrip = await collection
        .find({ businessKey: payload.businessKey })
        .sort({ tripNumber: -1 })
        .limit(1)
        .toArray();
      payload.tripNumber = (Number(latestTrip[0]?.tripNumber) || 0) + 1;
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
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    delete updates.id;
    delete updates._id;

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
