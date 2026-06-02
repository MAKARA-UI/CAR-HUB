const admin = require('firebase-admin');

const mustGetEnv = (name) => {
  const value = process.env?.[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

if (!admin.apps.length) {
  const projectId = mustGetEnv('FIREBASE_PROJECT_ID');
  const clientEmail = mustGetEnv('FIREBASE_CLIENT_EMAIL');

  const privateKey = mustGetEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = { admin, db, auth, storage };