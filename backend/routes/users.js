const express = require("express");
const router = express.Router();
const { getDb } = require("../mongo");

// GET /api/users/check-userid?userId=xxx
router.get("/check-userid", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.json({ available: false });

  try {
    const db = getDb();
    const existing = await db.collection("users").findOne({ userId });
    res.json({ available: !existing });
  } catch (err) {
    res.status(500).json({ error: "Check failed" });
  }
});

module.exports = router;
