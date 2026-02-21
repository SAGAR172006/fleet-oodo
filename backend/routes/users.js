const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

// GET /api/users/check-id?userId=xxx
router.get("/check-id", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.json({ available: false });

  try {
    const snapshot = await db.collection("users").where("userId", "==", userId).get();
    res.json({ available: snapshot.empty });
  } catch (err) {
    res.status(500).json({ error: "Check failed" });
  }
});

module.exports = router;
