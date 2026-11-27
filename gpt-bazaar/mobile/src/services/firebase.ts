import { getApps, initializeApp } from 'firebase/app';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

export const FIRESTORE_DATABASE_ID =
  process.env.EXPO_PUBLIC_FIRESTORE_DATABASE_ID || '(default)';

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.startsWith('YOUR_') &&
    !firebaseConfig.projectId.startsWith('YOUR_')
);

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app, FIRESTORE_DATABASE_ID);
export const storage = getStorage(app);

export async function testFirestoreConnection(): Promise<{ ok: boolean; message?: string }> {
  if (!isFirebaseConfigured) {
    return {
      ok: false,
      message: 'Missing Firebase .env values. Copy .env.example to .env and add your Firebase config.',
    };
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return {
        ok: false,
        message: 'Firestore client is offline. Verify EXPO_PUBLIC_FIREBASE_* and EXPO_PUBLIC_FIRESTORE_DATABASE_ID.',
      };
    }
    return { ok: true };
  }
}
