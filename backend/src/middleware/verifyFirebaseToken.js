// backend/src/middleware/verifyFirebaseToken.js
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

if (!admin.apps.length) {
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (svc) {
    try {
      const parsed = typeof svc === "string" ? JSON.parse(svc) : svc;
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch (err) {
      console.error("Failed to initialize Firebase Admin:", err.message);
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT_JSON not provided; verifyFirebaseToken will fail.");
  }
}

export default async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) return res.status(401).json({ error: "No token" });
  const idToken = match[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = { uid: decoded.uid, email: decoded.email, firebase: decoded };
    return next();
  } catch (err) {
    console.error("verifyIdToken failed", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}
