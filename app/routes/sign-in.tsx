import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useFirebaseAuthStore } from "~/lib/firebase-auth";

export const meta = () => [
    { title: "Resumind | Sign In" },
    { name: "description", content: "Sign in to your account" },
];

const SignIn = () => {
    const { user, isLoading, initialized, error, signIn, signInWithGoogle, clearError } =
        useFirebaseAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
        await signIn(email.trim(), password);
    };

    const handleGoogleSignIn = async () => {
        await signInWithGoogle();
    };

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center px-4 py-8">
            <div className="gradient-border shadow-lg w-full max-w-[460px]">
                <section className="flex flex-col gap-6 bg-white rounded-2xl p-5 sm:p-8 w-full">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1>Welcome Back</h1>
                        <h2>Sign in to continue your resume journey</h2>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        <button className="auth-button" type="submit" disabled={isLoading}>
                            <p>{isLoading ? "Signing in..." : "Sign In"}</p>
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
                        New here?{" "}
                        <Link to={`/sign-up?next=${encodeURIComponent(nextPath)}`} className="text-blue-600 font-semibold">
                            Create an account
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
};

export default SignIn;
