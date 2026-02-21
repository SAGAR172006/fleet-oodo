const express = require("express");
const router = express.Router();
const { db } = require("../firebase-admin");

// GET /api/users/check-userid?userId=xxx
router.get("/check-userid", async (req, res) => {
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
