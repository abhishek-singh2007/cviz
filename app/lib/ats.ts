import { extractPdfText } from "~/lib/pdf-text";
import { scoreResumeHeuristically } from "~/lib/ats-heuristic";

export async function analyzeResumeFree(input: {
    file: File;
    jobTitle: string;
    jobDescription: string;
}): Promise<Feedback> {
    const resumeText = await extractPdfText(input.file);

    return scoreResumeHeuristically({
        resumeText,
        jobTitle: input.jobTitle,
        jobDescription: input.jobDescription,
    });
}
