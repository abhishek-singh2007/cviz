import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { useFirebaseAuthStore } from "~/lib/firebase-auth";
import { getAnalysisRecord, type AnalysisRecord } from "~/lib/analysis-session";

export const meta = () => [
    { title: "Resumind | Review" },
    { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
    const { user, initialized, isLoading: authLoading } = useFirebaseAuthStore();
    const { id } = useParams();
    const navigate = useNavigate();

    const [record, setRecord] = useState<AnalysisRecord | null>(null);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        if (!id) return;
        if (initialized && !authLoading && !user) {
            navigate(`/sign-in?next=/resume/${id}`);
        }
    }, [authLoading, id, initialized, navigate, user]);

    useEffect(() => {
        if (!id || !user) return;

        const analysisRecord = getAnalysisRecord(id);
        if (!analysisRecord) {
            setLoadError("No analysis data found. Please analyze your resume again.");
            return;
        }

        setRecord(analysisRecord);
    }, [id, user]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    <div className="gradient-border w-full max-w-[520px]">
                        <div className="bg-white/90 rounded-2xl p-6 flex flex-col gap-4">
                            <h3 className="text-2xl font-semibold text-black">Analysis Summary</h3>
                            <p className="text-gray-700">
                                {record?.resumeName || "Resume"}
                            </p>
                            <p className="text-gray-500 text-sm">
                                {record?.jobTitle ? `Target Role: ${record.jobTitle}` : "General ATS check"}
                            </p>
                            {record?.companyName && (
                                <p className="text-gray-500 text-sm">Company: {record.companyName}</p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {!!loadError && <p className="text-red-600 text-base mt-3">{loadError}</p>}

                    {record?.feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={record.feedback} />
                            <ATS
                                score={record.feedback.ATS.score || 0}
                                suggestions={record.feedback.ATS.tips || []}
                            />
                            <Details feedback={record.feedback} />
                        </div>
                    ) : !loadError ? (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    ) : null}
                </section>
            </div>
        </main>
    );
};

export default Resume;
