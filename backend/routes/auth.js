const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { db } = require("../firebase");

const keysFile = path.join(__dirname, "../business-keys.json");
const { validKeys } = JSON.parse(fs.readFileSync(keysFile, "utf-8"));

// POST /api/auth/validate-key
router.post("/validate-key", (req, res) => {
  const { businessKey } = req.body;
  if (!businessKey) return res.json({ valid: false });

  res.json({ valid: validKeys.includes(businessKey) });
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, userId, role, businessKey, password, licenseId, licenseExpiry } = req.body;

    // Check userId uniqueness
    const existing = await db.collection("users").where("userId", "==", userId).get();
    if (!existing.empty) {
      return res.status(400).json({ error: "user-id already acquired, choose a different id" });
    }

    // Validate business key
    if (!validKeys.includes(businessKey)) {
      return res.status(400).json({ error: "invalid business key" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Build user document
    const userData = {
      username,
      userId,
      role,
      businessKey,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    if (role === "Dispatcher") {
      userData.licenseId = licenseId || "";
      userData.licenseExpiry = licenseExpiry || "";
    }

    await db.collection("users").add(userData);

    res.json({
      success: true,
      user: { userId, username, role, businessKey },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { userId, password, role } = req.body;

    const snapshot = await db.collection("users").where("userId", "==", userId).get();
    if (snapshot.empty) {
      return res.status(401).json({ error: "Invalid user ID or password" });
    }

    const userDoc = snapshot.docs[0].data();

    if (userDoc.role !== role) {
      return res.status(401).json({ error: "Role does not match this user ID" });
    }

    const match = await bcrypt.compare(password, userDoc.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid user ID or password" });
    }

    res.json({
      success: true,
      user: {
        userId: userDoc.userId,
        username: userDoc.username,
        role: userDoc.role,
        businessKey: userDoc.businessKey,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
