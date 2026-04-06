import {Link} from "react-router";
import {useFirebaseAuthStore} from "~/lib/firebase-auth";

const Navbar = () => {
    const { user, signOutUser, isLoading } = useFirebaseAuthStore();

    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMIND</p>
            </Link>
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
                {user ? (
                    <>
                        <Link to="/upload" className="primary-button w-full sm:w-fit text-center">
                            Upload Resume
                        </Link>
                        <button
                            type="button"
                            className="primary-button w-full sm:w-fit !bg-white !text-black border border-gray-300"
                            onClick={signOutUser}
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing out..." : "Sign Out"}
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/sign-in" className="primary-button w-full sm:w-fit !bg-white !text-black border border-gray-300 text-center">
                            Sign In
                        </Link>
                        <Link to="/sign-up" className="primary-button w-full sm:w-fit text-center">
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}
export default Navbar
