import { generateUUID } from "~/lib/utils";

const STORAGE_PREFIX = "analysis:";

export interface AnalysisRecord {
    id: string;
    companyName?: string;
    jobTitle?: string;
    jobDescription?: string;
    resumeName: string;
    feedback: Feedback;
    createdAt: string;
}

export function createAnalysisRecord(input: {
    companyName?: string;
    jobTitle?: string;
    jobDescription?: string;
    resumeName: string;
    feedback: Feedback;
}): AnalysisRecord {
    return {
        id: generateUUID(),
        companyName: input.companyName,
        jobTitle: input.jobTitle,
        jobDescription: input.jobDescription,
        resumeName: input.resumeName,
        feedback: input.feedback,
        createdAt: new Date().toISOString(),
    };
}

export function saveAnalysisRecord(record: AnalysisRecord): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(`${STORAGE_PREFIX}${record.id}`, JSON.stringify(record));
}

export function getAnalysisRecord(id: string): AnalysisRecord | null {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as AnalysisRecord;
    } catch {
        return null;
    }
}
