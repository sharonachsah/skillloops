 
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

if (!admin.apps.length) {
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!svc) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON env var required");
  const parsed = JSON.parse(svc);
  admin.initializeApp({
    credential: admin.credential.cert(parsed)
  });
}

export default async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) return res.status(401).json({ error: "No token" });
  const idToken = match[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken, true); // checkRevoked true recommended when needed
    req.user = { uid: decoded.uid, email: decoded.email, firebase: decoded };
    return next();
  } catch (err) {
    console.error("verifyIdToken failed", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}
