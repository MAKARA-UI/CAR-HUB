import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBMRqfvCEDXWUFUJj22HVNstLM_rw8TNkE',
  authDomain: 'car-hub-2cf7e.firebaseapp.com',
  projectId: 'car-hub-2cf7e',
  storageBucket: 'car-hub-2cf7e.firebasestorage.app',
  messagingSenderId: '620706684647',
  appId: '1:620706684647:web:539a7b38088684869a0c42',
  measurementId: 'G-TKCXT8G7PW',
};

// One Firebase app shared by every service. getApps() prevents duplicate
// initialization during Expo Fast Refresh and module reloads.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export const getDocuments = async (collectionName, conditions = []) => {
  let q = collection(db, collectionName);

  conditions.forEach((condition) => {
    q = query(q, where(condition.field, condition.operator, condition.value));
  });

  const snapshot = await getDocs(q);
  const documents = [];
  snapshot.forEach((docSnapshot) => documents.push({ id: docSnapshot.id, ...docSnapshot.data() }));
  return documents;
};

export const getDocument = async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const addDocument = async (collectionName, data, customId = null) => {
  let docRef;
  const payload = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (customId) {
    docRef = doc(db, collectionName, customId);
    await setDoc(docRef, payload);
  } else {
    docRef = await addDoc(collection(db, collectionName), payload);
  }

  return { id: docRef.id, ...data };
};

export const updateDocument = async (collectionName, docId, data) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  return true;
};

export const deleteDocument = async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
  return true;
};

export const listenToCollection = (collectionName, callback, conditions = [], orderByField = null) => {
  let q = collection(db, collectionName);

  conditions.forEach((condition) => {
    q = query(q, where(condition.field, condition.operator, condition.value));
  });

  if (orderByField) {
    q = query(q, orderBy(orderByField, 'desc'));
  }

  return onSnapshot(q, (snapshot) => {
    const documents = [];
    snapshot.forEach((docSnapshot) => documents.push({ id: docSnapshot.id, ...docSnapshot.data() }));
    callback(documents);
  }, (error) => {
    console.error('Firestore listener error:', error);
  });
};

export const listenToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (docSnapshot) => {
    callback(docSnapshot.exists() ? { id: docSnapshot.id, ...docSnapshot.data() } : null);
  }, (error) => {
    console.error('Firestore document listener error:', error);
  });
};

export { app, db, storage };
