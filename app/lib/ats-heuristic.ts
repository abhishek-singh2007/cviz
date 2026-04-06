const normalize = (text: string) =>
    text
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

const tokenize = (text: string) =>
    normalize(text)
        .replace(/[^a-z0-9\s]/g, " ")
        .split(" ")
        .filter((token) => token.length > 2);

const unique = <T>(items: T[]) => [...new Set(items)];

const clamp = (value: number, min = 0, max = 100) =>
    Math.max(min, Math.min(max, Math.round(value)));

const keywordPool = [
    "javascript",
    "typescript",
    "react",
    "node",
    "express",
    "next",
    "firebase",
    "python",
    "java",
    "sql",
    "aws",
    "docker",
    "kubernetes",
    "rest",
    "api",
    "testing",
    "jest",
    "cypress",
    "tailwind",
    "html",
    "css",
    "git",
    "agile",
    "leadership",
    "communication",
    "problem",
    "analysis",
    "project",
];

const sectionPatterns = [
    /summary|profile|objective/i,
    /experience|work history|employment/i,
    /education|academic/i,
    /skills|technical skills/i,
    /projects|project experience/i,
    /certifications|achievements/i,
];

const actionVerbs = [
    "built",
    "developed",
    "led",
    "designed",
    "implemented",
    "optimized",
    "improved",
    "launched",
    "managed",
    "delivered",
    "created",
    "reduced",
    "increased",
    "automated",
    "collaborated",
];

const toTip = (
    type: "good" | "improve",
    tip: string,
    explanation: string
): { type: "good" | "improve"; tip: string; explanation: string } => ({
    type,
    tip,
    explanation,
});

const toATSTip = (
    type: "good" | "improve",
    tip: string
): { type: "good" | "improve"; tip: string } => ({
    type,
    tip,
});

export function scoreResumeHeuristically(input: {
    resumeText: string;
    jobTitle: string;
    jobDescription: string;
}): Feedback {
    const rawText = input.resumeText || "";
    const text = normalize(rawText);

    if (!text) {
        return {
            overallScore: 20,
            ATS: {
                score: 20,
                tips: [
                    toATSTip("improve", "Resume text could not be extracted. Try a clearer PDF export."),
                ],
            },
            toneAndStyle: {
                score: 25,
                tips: [
                    toTip(
                        "improve",
                        "Use selectable text PDF",
                        "Your file likely contains scanned content. Export a text-based PDF so ATS can read it."
                    ),
                ],
            },
            content: {
                score: 20,
                tips: [
                    toTip(
                        "improve",
                        "Add role-specific details",
                        "Include measurable impact points, tools used, and job-relevant skills."
                    ),
                ],
            },
            structure: {
                score: 30,
                tips: [
                    toTip(
                        "improve",
                        "Add clear sections",
                        "Use headings like Summary, Experience, Skills, and Education to help parsing."
                    ),
                ],
            },
            skills: {
                score: 25,
                tips: [
                    toTip(
                        "improve",
                        "List technical stack",
                        "Include concrete tools and technologies aligned with the target role."
                    ),
                ],
            },
        };
    }

    const tokens = tokenize(rawText);
    const tokenSet = new Set(tokens);
    const resumeWords = tokens.length;

    const contactHits = [
        /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(rawText),
        /\+?\d[\d\s().-]{7,}\d/.test(rawText),
        /linkedin\.com\//i.test(rawText),
    ].filter(Boolean).length;

    const sectionsFound = sectionPatterns.filter((pattern) => pattern.test(rawText)).length;

    const jdTokens = unique(tokenize(`${input.jobTitle} ${input.jobDescription}`))
        .filter((token) => keywordPool.includes(token))
        .slice(0, 20);

    const fallbackKeywords = keywordPool.filter((token) => tokenSet.has(token));
    const effectiveKeywords = jdTokens.length > 0 ? jdTokens : unique(fallbackKeywords).slice(0, 20);

    const matchedKeywords = effectiveKeywords.filter((token) => tokenSet.has(token));
    const keywordCoverage = effectiveKeywords.length
        ? matchedKeywords.length / effectiveKeywords.length
        : 0;

    const actionVerbMatches = actionVerbs.filter((verb) =>
        new RegExp(`\\b${verb}\\b`, "i").test(rawText)
    ).length;

    const quantifiedImpactCount = (rawText.match(/\b\d+%|\$\d+|\b\d+\+?/g) || []).length;

    const atsScore = clamp(
        20 +
            contactHits * 12 +
            sectionsFound * 8 +
            keywordCoverage * 35 +
            Math.min(quantifiedImpactCount, 6) * 2
    );

    const toneScore = clamp(35 + actionVerbMatches * 6 + Math.min(quantifiedImpactCount, 8) * 3);
    const contentScore = clamp(
        30 +
            keywordCoverage * 40 +
            Math.min(resumeWords / 12, 25) +
            Math.min(quantifiedImpactCount * 2, 10)
    );
    const structureScore = clamp(25 + sectionsFound * 11 + (resumeWords > 250 ? 10 : 0));
    const skillsScore = clamp(20 + matchedKeywords.length * 6 + (tokenSet.has("skills") ? 8 : 0));

    const overallScore = clamp(
        atsScore * 0.3 +
            toneScore * 0.15 +
            contentScore * 0.25 +
            structureScore * 0.15 +
            skillsScore * 0.15
    );

    const missingKeywords = effectiveKeywords
        .filter((keyword) => !tokenSet.has(keyword))
        .slice(0, 4);

    return {
        overallScore,
        ATS: {
            score: atsScore,
            tips: [
                keywordCoverage > 0.5
                    ? toATSTip("good", "Good keyword alignment with role expectations.")
                    : toATSTip("improve", "Increase role-specific keywords in experience bullets."),
                sectionsFound >= 4
                    ? toATSTip("good", "Resume sections are structured for parser readability.")
                    : toATSTip("improve", "Add clear headings like Summary, Experience, Skills, Education."),
                contactHits >= 2
                    ? toATSTip("good", "Contact information appears complete.")
                    : toATSTip("improve", "Add complete contact details (email, phone, LinkedIn)."),
                missingKeywords.length > 0
                    ? toATSTip("improve", `Try adding these terms if relevant: ${missingKeywords.join(", ")}.`)
                    : toATSTip("good", "Most critical job keywords are already present."),
            ],
        },
        toneAndStyle: {
            score: toneScore,
            tips: [
                actionVerbMatches >= 4
                    ? toTip("good", "Strong action verbs", "Your bullet points use impactful verbs which improves readability.")
                    : toTip("improve", "Use stronger verbs", "Start bullets with verbs like Built, Led, Improved, Optimized."),
                quantifiedImpactCount >= 3
                    ? toTip("good", "Quantified achievements", "Including measurable outcomes makes accomplishments credible.")
                    : toTip("improve", "Add measurable impact", "Use metrics like percentages, revenue, latency, user growth where possible."),
            ],
        },
        content: {
            score: contentScore,
            tips: [
                resumeWords >= 280
                    ? toTip("good", "Sufficient detail", "The resume has enough detail to evaluate responsibilities and impact.")
                    : toTip("improve", "Add more context", "Expand project and experience bullets with scope, tools, and outcomes."),
                keywordCoverage >= 0.5
                    ? toTip("good", "Role relevance", "Content is reasonably aligned with target role expectations.")
                    : toTip("improve", "Improve job fit", "Mirror important words from job title/description in your resume content."),
            ],
        },
        structure: {
            score: structureScore,
            tips: [
                sectionsFound >= 4
                    ? toTip("good", "Clear sectioning", "ATS systems parse resumes better when sections are explicit.")
                    : toTip("improve", "Improve section layout", "Use standard headings and keep format consistent across sections."),
                resumeWords <= 900
                    ? toTip("good", "Length is manageable", "Resume length appears readable for quick recruiter scans.")
                    : toTip("improve", "Trim excessive text", "Reduce long paragraphs and focus on high-impact bullets."),
            ],
        },
        skills: {
            score: skillsScore,
            tips: [
                matchedKeywords.length >= 6
                    ? toTip("good", "Skills visibility", "Your resume mentions many skills relevant to technical screening.")
                    : toTip("improve", "Expand skill coverage", "Add core tools/frameworks and evidence of using them in projects."),
                tokenSet.has("projects")
                    ? toTip("good", "Projects support skills", "Projects help validate technical skill claims.")
                    : toTip("improve", "Add project section", "Include 1-2 projects with stack, role, and outcomes."),
            ],
        },
    };
}
