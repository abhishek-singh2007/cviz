import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const cleanEnv = (value: unknown) => {
    if (typeof value !== "string") return "";
    return value.replace(/^['\"]|['\"]$/g, "").trim();
};

const firebaseConfig = {
    apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
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
let app = null;
let auth: Auth | null = null;
let runtimeError: string | null = null;

if (isFirebaseConfigured) {
    try {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
    } catch (error) {
        runtimeError =
            error instanceof Error
                ? error.message
                : "Failed to initialize Firebase. Check your Firebase API key and project settings.";
    }
}

export const firebaseRuntimeError = runtimeError;
export const firebaseAuth: Auth | null = auth;
export const googleAuthProvider = new GoogleAuthProvider();
