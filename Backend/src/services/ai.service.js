const { z } = require("zod");
const puppeteer = require("puppeteer");
const { ChatGroq } = require("@langchain/groq");

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
    });

    try {
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm",
            },
            printBackground: true,
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}


// --------------------------------------------------
// Resume Schema
// --------------------------------------------------

const resumePdfSchema = z.object({
    html: z
        .string()
        .describe(
            "The complete HTML content of the resume which can be converted to PDF using Puppeteer"
        ),
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
Generate a professional ATS-friendly resume for a candidate using the
following information.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Requirements:

1. Tailor the resume to the given job description.
2. Highlight relevant skills, projects, education and experience.
3. Do not invent experience, skills, projects, education, certifications,
   achievements or other information that is not present in the candidate data.
4. The resume should sound naturally written by a human.
5. Keep the resume concise and ideally 1-2 pages.
6. Make it ATS-friendly.
7. Use clean and professional HTML.
8. Use simple CSS.
9. Use standard readable fonts.
10. Avoid unnecessary graphics, icons, tables and complicated layouts.
11. Make sure the HTML is complete and can be directly rendered by Puppeteer.
12. Return only the structured response according to the provided schema.

Generate the HTML resume now.
`;

    const structuredLLM = llm.withStructuredOutput(
        resumePdfSchema
    );

    const response = await structuredLLM.invoke(prompt);

    const pdfBuffer = await generatePdfFromHtml(
        response.html
    );

    return pdfBuffer;
}


// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
    generateInterviewReport,
    generateResumePdf,
};