import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useFirebaseAuthStore } from "~/lib/firebase-auth";

export const meta = () => [
    { title: "Resumind | Sign Up" },
    { name: "description", content: "Create your account" },
];

const SignUp = () => {
    const { user, isLoading, initialized, error, signUp, signInWithGoogle, clearError } =
        useFirebaseAuthStore();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [localError, setLocalError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const nextPath = useMemo(
        () => new URLSearchParams(location.search).get("next") || "/",
        [location.search]
    );

    useEffect(() => {
        if (initialized && user) {
            navigate(nextPath);
        }
    }, [initialized, navigate, nextPath, user]);

    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLocalError("");

        if (password.length < 6) {
            setLocalError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setLocalError("Passwords do not match.");
            return;
        }

        await signUp(email.trim(), password, name.trim());
    };

    const handleGoogleSignIn = async () => {
        await signInWithGoogle();
    };

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center px-4 py-8">
            <div className="gradient-border shadow-lg w-full max-w-[460px]">
                <section className="flex flex-col gap-6 bg-white rounded-2xl p-5 sm:p-8 w-full">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1>Create Account</h1>
                        <h2>Start tracking and improving your resumes</h2>
                    </div>

                    {(localError || error) && (
                        <p className="text-red-600 text-sm">{localError || error}</p>
                    )}

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div className="form-div">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Your name"
                            />
                        </div>

                        <div className="form-div">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="form-div">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="At least 6 characters"
                                required
                            />
                        </div>

                        <div className="form-div">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        <button className="auth-button" type="submit" disabled={isLoading}>
                            <p>{isLoading ? "Creating account..." : "Sign Up"}</p>
                        </button>
                    </form>

                    <button
                        className="auth-button !bg-white !text-black border border-gray-200 text-center"
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <p>{isLoading ? "Please wait..." : "Continue with Google"}</p>
                    </button>

                    <p className="text-sm text-center text-gray-600">
                        Already have an account?{" "}
                        <Link to={`/sign-in?next=${encodeURIComponent(nextPath)}`} className="text-blue-600 font-semibold">
                            Sign in
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
};

export default SignUp;
