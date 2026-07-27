import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const requiredFirebaseEnv = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

const missingFirebaseEnv = requiredFirebaseEnv.filter((key) => {
  const value = import.meta.env[key];
  return typeof value !== "string" || value.trim().length === 0;
});

// Firebase configuration (STRICT: no insecure fallbacks)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId:
    (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || undefined,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let firebaseInitError: string | undefined;

try {
  if (missingFirebaseEnv.length > 0) {
    throw new Error(
      `Missing Firebase env vars: ${missingFirebaseEnv.join(
        ", ",
      )}. Add them to .env/.env.production and rebuild. For Capacitor iOS, ensure these VITE_* vars are present when running the web build before 'npx cap sync ios'.`,
    );
  }

  const appAlreadyExists = getApps().length > 0;

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  if (app) {
    auth = getAuth(app);

    // Initialize Firestore settings only on first app init.
    if (!appAlreadyExists) {
      initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
    }

    db = getFirestore(app);
  }
} catch (error) {
  firebaseInitError =
    error instanceof Error ? error.message : "Unknown Firebase initialization error";
  console.error("Firebase initialization failed:", error);
}

export { auth, db, firebaseInitError };
