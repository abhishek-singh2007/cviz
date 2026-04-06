import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfig = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
] as const;

const missingFirebaseConfig = requiredConfig.filter(
    (key) => !firebaseConfig[key]
);

export const firebaseConfigError =
    missingFirebaseConfig.length > 0
        ? `Missing Firebase config: ${missingFirebaseConfig.join(", ")}. Set VITE_FIREBASE_* env vars.`
        : null;

export const isFirebaseConfigured = !firebaseConfigError;

const app = isFirebaseConfigured
    ? getApps().length
        ? getApp()
        : initializeApp(firebaseConfig)
    : null;

export const firebaseAuth: Auth | null = app ? getAuth(app) : null;
export const googleAuthProvider = new GoogleAuthProvider();
