// Backward-compatible entrypoint.
// Prefer using `firebaseAdmin.js` (env-only credentials) directly.

const { admin, db, auth, storage } = require('./firebaseAdmin');

module.exports = {
  admin,
  db,
  auth,
  storage,
};

