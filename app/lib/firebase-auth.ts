import { create } from "zustand";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    type User,
} from "firebase/auth";
import {
    firebaseAuth,
    firebaseConfigError,
    googleAuthProvider,
    isFirebaseConfigured,
} from "~/lib/firebase";

interface FirebaseAuthStore {
    user: User | null;
    isLoading: boolean;
    initialized: boolean;
    error: string | null;
    initAuth: () => void;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOutUser: () => Promise<void>;
    clearError: () => void;
}

let authUnsubscribe: (() => void) | null = null;

const configOrAuthError = (fallback: string) =>
    firebaseConfigError || fallback;

const mapFirebaseError = (error: unknown, fallback: string) => {
    if (error instanceof Error) {
        if ("code" in error && typeof (error as { code?: string }).code === "string") {
            const code = (error as { code: string }).code;
            if (code === "auth/invalid-credential") return "Invalid email or password.";
            if (code === "auth/email-already-in-use") return "This email is already in use.";
            if (code === "auth/weak-password") return "Password should be at least 6 characters.";
            if (code === "auth/popup-closed-by-user") return "Google sign-in popup was closed.";
            if (code === "auth/network-request-failed") return "Network issue. Check internet and try again.";
        }
        return error.message;
    }
    return fallback;
};

export const useFirebaseAuthStore = create<FirebaseAuthStore>((set, get) => ({
    user: null,
    isLoading: true,
    initialized: false,
    error: firebaseConfigError,

    initAuth: () => {
        if (get().initialized) return;

        if (!isFirebaseConfigured) {
            set({
                isLoading: false,
                initialized: true,
                user: null,
                error: firebaseConfigError,
            });
            return;
        }

        if (authUnsubscribe) return;
        if (!firebaseAuth) {
            set({
                isLoading: false,
                initialized: true,
                user: null,
                error: configOrAuthError("Firebase auth is unavailable."),
            });
            return;
        }

        authUnsubscribe = onAuthStateChanged(
            firebaseAuth,
            (user) => {
                set({
                    user,
                    isLoading: false,
                    initialized: true,
                    error: null,
                });
            },
            (error) => {
                set({
                    user: null,
                    isLoading: false,
                    initialized: true,
                    error: mapFirebaseError(error, "Failed to initialize auth."),
                });
            }
        );
    },

    signIn: async (email: string, password: string) => {
        if (!isFirebaseConfigured) {
            set({ error: configOrAuthError("Firebase is not configured."), isLoading: false });
            return;
        }
        if (!firebaseAuth) {
            set({ error: configOrAuthError("Firebase auth is unavailable."), isLoading: false });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await signInWithEmailAndPassword(firebaseAuth, email, password);
            set({ error: null });
        } catch (error) {
            set({
                error: mapFirebaseError(error, "Failed to sign in."),
                isLoading: false,
            });
        }
    },

    signUp: async (email: string, password: string, displayName?: string) => {
        if (!isFirebaseConfigured) {
            set({ error: configOrAuthError("Firebase is not configured."), isLoading: false });
            return;
        }
        if (!firebaseAuth) {
            set({ error: configOrAuthError("Firebase auth is unavailable."), isLoading: false });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const credentials = await createUserWithEmailAndPassword(
                firebaseAuth,
                email,
                password
            );

            if (displayName?.trim()) {
                await updateProfile(credentials.user, {
                    displayName: displayName.trim(),
                });
            }

            set({ error: null });
        } catch (error) {
            set({
                error: mapFirebaseError(error, "Failed to create account."),
                isLoading: false,
            });
        }
    },

    signInWithGoogle: async () => {
        if (!isFirebaseConfigured) {
            set({ error: configOrAuthError("Firebase is not configured."), isLoading: false });
            return;
        }
        if (!firebaseAuth) {
            set({ error: configOrAuthError("Firebase auth is unavailable."), isLoading: false });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await signInWithPopup(firebaseAuth, googleAuthProvider);
            set({ error: null });
        } catch (error) {
            set({
                error: mapFirebaseError(error, "Google sign in failed."),
                isLoading: false,
            });
        }
    },

    signOutUser: async () => {
        if (!isFirebaseConfigured) {
            set({ error: configOrAuthError("Firebase is not configured."), user: null, isLoading: false });
            return;
        }
        if (!firebaseAuth) {
            set({ error: configOrAuthError("Firebase auth is unavailable."), user: null, isLoading: false });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await signOut(firebaseAuth);
            set({ user: null, error: null, isLoading: false });
        } catch (error) {
            set({
                error: mapFirebaseError(error, "Failed to sign out."),
                isLoading: false,
            });
        }
    },

    clearError: () => set({ error: null }),
}));
