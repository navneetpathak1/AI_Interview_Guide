const { z } = require("zod");
const puppeteer = require("puppeteer");
const { ChatGroq } = require("@langchain/groq");
const { buildResumeHtml } = require("./resumeTemplate");

// --------------------------------------------------
// Groq Model
// --------------------------------------------------

const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    temperature: 0.3,
});


// --------------------------------------------------
// Interview Report Schema
// --------------------------------------------------

const interviewReportSchema = z.object({
    matchScore: z
        .number()
        .describe(
            "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
        ),

    technicalQuestions: z
        .array(
            z.object({
                question: z
                    .string()
                    .describe("The technical question that can be asked in the interview"),

                intention: z
                    .string()
                    .describe(
                        "The intention of the interviewer behind asking this question"
                    ),

                answer: z
                    .string()
                    .describe(
                        "How to answer this question, what points to cover, and what approach to take"
                    ),
            })
        )
        .describe(
            "Technical questions that can be asked in the interview along with their intention and how to answer them"
        ),

    behavioralQuestions: z
        .array(
            z.object({
                question: z
                    .string()
                    .describe("The behavioral question that can be asked in the interview"),

                intention: z
                    .string()
                    .describe(
                        "The intention of the interviewer behind asking this question"
                    ),

                answer: z
                    .string()
                    .describe(
                        "How to answer this question, what points to cover, and what approach to take"
                    ),
            })
        )
        .describe(
            "Behavioral questions that can be asked in the interview along with their intention and how to answer them"
        ),

    skillGaps: z
        .array(
            z.object({
                skill: z
                    .string()
                    .describe("The skill which the candidate is lacking"),

                severity: z
                    .enum(["low", "medium", "high"])
                    .describe(
                        "The severity of this skill gap based on its importance for the job"
                    ),
            })
        )
        .describe(
            "List of skill gaps in the candidate's profile along with their severity"
        ),

    preparationPlan: z
        .array(
            z.object({
                day: z
                    .number()
                    .describe(
                        "The day number in the preparation plan, starting from 1"
                    ),

                focus: z
                    .string()
                    .describe(
                        "The main focus of this day, e.g. data structures, system design, mock interviews"
                    ),

                tasks: z
                    .array(z.string())
                    .describe(
                        "List of tasks to be completed on this day"
                    ),
            })
        )
        .describe(
            "A day-wise preparation plan for the candidate to prepare for the interview"
        ),

    title: z
        .string()
        .describe(
            "The title of the job for which the interview report is generated"
        ),
});


// --------------------------------------------------
// Generate Interview Report
// --------------------------------------------------

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {
    const prompt = `
Generate an interview report for a candidate with the following details:

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Analyze the candidate's resume and self-description against the job description.

Generate:
- Match score
- Technical interview questions
- Behavioral interview questions
- Skill gaps
- Day-wise preparation plan
- Job title

Return the result according to the provided structured schema.
`;

    const structuredLLM = llm.withStructuredOutput(
        interviewReportSchema
    );

    const response = await structuredLLM.invoke(prompt);

    if (response && typeof response.matchScore === "number") {
        if (response.matchScore > 0 && response.matchScore <= 1) {
            response.matchScore = Math.round(response.matchScore * 100);
        } else {
            response.matchScore = Math.round(response.matchScore);
        }
    }

    return response;
}


// --------------------------------------------------
// Generate PDF from HTML
// --------------------------------------------------

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    });

    try {
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            margin: {
                top: "12mm",
                bottom: "12mm",
                left: "14mm",
                right: "14mm",
            },
            printBackground: true,
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}


// --------------------------------------------------
// Structured Resume Schema
// --------------------------------------------------

const resumeDataSchema = z.object({
    fullName: z
        .string()
        .describe("Candidate's full name extracted from the resume or self description"),

    targetTitle: z
        .string()
        .describe("Target professional headline or job role aligned with the target job"),

    contact: z.object({
        email: z.string().nullable().optional().describe("Email address"),
        phone: z.string().nullable().optional().describe("Phone number"),
        location: z.string().nullable().optional().describe("City, State or Country"),
        linkedin: z.string().nullable().optional().describe("LinkedIn profile URL or handle"),
        portfolio: z.string().nullable().optional().describe("Portfolio, GitHub or website URL"),
    }),

    summary: z
        .string()
        .describe("A compelling 2-4 sentence executive summary highlighting key strengths, domain experience, and value proposition tailored to the job description"),

    skills: z.object({
        coreSkills: z
            .array(z.string())
            .describe("Core technical and functional skills required by the job that candidate possesses"),
        toolsAndTechnologies: z
            .array(z.string())
            .nullable()
            .optional()
            .describe("Software, tools, programming languages, libraries, and frameworks"),
        methodologiesOrSoftSkills: z
            .array(z.string())
            .nullable()
            .optional()
            .describe("Methodologies (Agile, Scrum, CI/CD), leadership, or communication strengths"),
    }),

    experience: z.array(
        z.object({
            role: z.string().describe("Job title or role held"),
            company: z.string().describe("Company or organization name"),
            location: z.string().nullable().optional().describe("City, State or Remote"),
            period: z.string().nullable().optional().describe("Dates of employment (e.g. 'Jan 2022 - Present' or '2020 - 2022')"),
            highlights: z
                .array(z.string())
                .describe("3-5 high-impact achievement bullet points starting with strong action verbs (e.g., 'Engineered', 'Spearheaded', 'Optimized'). Do NOT include raw newline characters, bullet symbols, or escape sequences."),
        })
    ).nullable().optional(),

    projects: z
        .array(
            z.object({
                name: z.string().describe("Project name"),
                technologies: z.string().nullable().optional().describe("Key technologies or tools used"),
                description: z.string().describe("Concise overview of the project, candidate's contribution, and impact"),
            })
        )
        .nullable()
        .optional(),

    education: z.array(
        z.object({
            degree: z.string().describe("Degree and field of study"),
            institution: z.string().describe("University or College name"),
            location: z.string().nullable().optional().describe("Location of institution"),
            year: z.string().nullable().optional().describe("Graduation year or date range"),
        })
    ).nullable().optional(),

    certifications: z
        .array(z.string())
        .nullable()
        .optional()
        .describe("Relevant certifications, credentials, or licenses"),
});


// --------------------------------------------------
// Generate Resume PDF
// --------------------------------------------------

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription,
}) {
    const prompt = `
You are an expert executive resume writer and career coach.
Extract and synthesize the candidate's experience, skills, and background from their Resume and Self Description, and tailor it strategically for the Target Job Description.

Candidate Resume:
${resume}

Candidate Self Description:
${selfDescription}

Target Job Description:
${jobDescription}

Instructions:
1. Tailor the professional summary and skill highlights to emphasize the requirements of the job description.
2. For each work experience entry:
   - Provide 3-5 concise, achievement-oriented bullet points.
   - Start each bullet with an active, powerful action verb (e.g., 'Designed', 'Orchestrated', 'Implemented', 'Boosted', 'Streamlined').
   - Include quantifiable results and metrics where available in the source data.
   - Do NOT include literal newline characters (\\n), bullet symbols (•, -, *), or markdown syntax within the bullet strings.
3. Keep the content truthful to the candidate's actual background while framing it optimally for the target role.
4. Return ONLY the structured response adhering to the schema.
`;

    const structuredLLM = llm.withStructuredOutput(
        resumeDataSchema
    );

    const structuredResume = await structuredLLM.invoke(prompt);

    const html = buildResumeHtml(structuredResume);

    const pdfBuffer = await generatePdfFromHtml(html);

    return pdfBuffer;
}


// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
    generateInterviewReport,
    generateResumePdf,
};