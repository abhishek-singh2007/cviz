import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { useFirebaseAuthStore } from "~/lib/firebase-auth";
import { analyzeResumeFree } from "~/lib/ats";
import { createAnalysisRecord, saveAnalysisRecord } from "~/lib/analysis-session";

const Upload = () => {
    const { user, initialized, isLoading: authLoading } = useFirebaseAuthStore();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (initialized && !authLoading && !user) {
            navigate("/sign-in?next=/upload");
        }
    }, [authLoading, initialized, navigate, user]);

    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
    };

    const handleAnalyze = async (input: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        if (!user) {
            navigate("/sign-in?next=/upload");
            return;
        }

        setIsProcessing(true);
        setStatusText("Extracting resume text...");

        try {
            const feedback = await analyzeResumeFree({
                file: input.file,
                jobTitle: input.jobTitle,
                jobDescription: input.jobDescription,
            });

            setStatusText("Preparing score report...");

            const record = createAnalysisRecord({
                companyName: input.companyName,
                jobTitle: input.jobTitle,
                jobDescription: input.jobDescription,
                resumeName: input.file.name,
                feedback,
            });

            saveAnalysisRecord(record);
            navigate(`/resume/${record.id}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to analyze resume.";
            setStatusText(`Error: ${message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!file) {
            setStatusText("Please upload a PDF resume first.");
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);

        const companyName = String(formData.get("company-name") || "").trim();
        const jobTitle = String(formData.get("job-title") || "").trim();
        const jobDescription = String(formData.get("job-description") || "").trim();

        await handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText || "Analyzing your resume..."}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for a free ATS score and practical improvement tips</h2>
                    )}

                    {!isProcessing && statusText && (
                        <p className="text-red-600 text-base">{statusText}</p>
                    )}

                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit" disabled={authLoading || isProcessing}>
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;
