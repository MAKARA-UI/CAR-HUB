const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

const loadServiceAccount = () => {
  if (fs.existsSync(serviceAccountPath)) {
    const rawJson = fs.readFileSync(serviceAccountPath, 'utf8').replace(/^\uFEFF/, '').trim();
    if (rawJson) {
      return JSON.parse(rawJson);
    }
  }

  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || '';
  const trimmedKey = rawPrivateKey.trim();
  const privateKey = trimmedKey.startsWith('"') && trimmedKey.endsWith('"')
    ? trimmedKey.slice(1, -1)
    : trimmedKey;
  const normalizedKey = privateKey.replace(/\\n/g, '\n');

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: normalizedKey,
  };
};

const loadedServiceAccount = loadServiceAccount();
const serviceAccount = {
  ...loadedServiceAccount,
  projectId: loadedServiceAccount.projectId || loadedServiceAccount.project_id,
  clientEmail: loadedServiceAccount.clientEmail || loadedServiceAccount.client_email,
  privateKey: loadedServiceAccount.privateKey || loadedServiceAccount.private_key,
};

if (
  !serviceAccount.projectId ||
  !serviceAccount.clientEmail ||
  !serviceAccount.privateKey ||
  serviceAccount.privateKey.includes('YOUR_PRIVATE_KEY_HERE')
) {
  throw new Error(
    'Firebase Admin SDK credentials are missing or still contain placeholder values. Add the real service account JSON to backend/serviceAccountKey.json, or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in backend/.env.'
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.projectId,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.projectId}.firebasestorage.app`,
  });
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

const getStorageBucketCandidates = () => {
  const names = [
    process.env.FIREBASE_STORAGE_BUCKET,
    `${serviceAccount.projectId}.firebasestorage.app`,
    `${serviceAccount.projectId}.appspot.com`,
  ].filter(Boolean);

  return [...new Set(names)].map((name) => storage.bucket(name));
};

module.exports = { admin, db, auth, storage, getStorageBucketCandidates };
