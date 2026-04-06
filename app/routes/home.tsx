import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import {Link, useNavigate} from "react-router";
import {useEffect} from "react";
import {useFirebaseAuthStore} from "~/lib/firebase-auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { user, initialized, isLoading } = useFirebaseAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !isLoading && !user) {
      navigate('/sign-in?next=/');
    }
  }, [initialized, isLoading, navigate, user]);

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />

    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Get ATS Score in Seconds</h1>
        <h2>Sign in, upload your resume, and get instant free ATS feedback.</h2>
      </div>
      <div className="flex flex-col items-center justify-center mt-10 gap-4">
        <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
          Upload Resume
        </Link>
      </div>
    </section>
  </main>
}
