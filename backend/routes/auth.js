const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { getDb } = require("../mongo");
const { normalizeRole, normalizeSafeKey } = require("../utils/validation");

const keysFile = path.join(__dirname, "../business-keys.json");
const validKeys = JSON.parse(fs.readFileSync(keysFile, "utf-8"));

// POST /api/auth/validate-key
router.post("/validate-key", (req, res) => {
  const businessKey = normalizeSafeKey(req.body?.businessKey);
  if (!businessKey) return res.json({ valid: false });

  res.json({ valid: validKeys.includes(businessKey) });
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const db = getDb();
    const { username, password, licenseId, licenseExpiry } = req.body;
    const userId = normalizeSafeKey(req.body?.userId);
    const businessKey = normalizeSafeKey(req.body?.businessKey);
    const role = normalizeRole(req.body?.role);
    if (!userId || !businessKey || !role || typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid registration payload" });
    }

    // Check userId uniqueness
    const existing = await db.collection("users").findOne({ userId });
    if (existing) {
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

    await db.collection("users").insertOne(userData);

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
    const db = getDb();
    const userId = normalizeSafeKey(req.body?.userId);
    const role = normalizeRole(req.body?.role);
    const { password } = req.body;
    if (!userId || !role || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid login payload" });
    }

    const userDoc = await db.collection("users").findOne({ userId });
    if (!userDoc) {
      return res.status(401).json({ error: "Invalid user ID or password" });
    }

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
