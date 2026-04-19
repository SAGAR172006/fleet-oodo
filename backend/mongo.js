const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "fleetflow";

let client;
let db;

async function connectToMongo() {
  if (db) return db;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    await db.collection("users").createIndex({ userId: 1 }, { unique: true });
    return db;
  } catch (err) {
    throw new Error(
      `MongoDB initialization failed for DB "${MONGODB_DB_NAME}". Check MONGODB_URI/MONGODB_DB_NAME: ${err.message}`
    );
  }
}

function getDb() {
  if (!db) {
    throw new Error("MongoDB is not connected yet.");
  }
  return db;
}

module.exports = { connectToMongo, getDb };
