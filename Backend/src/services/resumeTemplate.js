function sanitize(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function buildResumeHtml(data) {
    const name = sanitize(data.fullName || "Candidate");
    const title = sanitize(data.targetTitle || "");

    const contactItems = [];
    if (data.contact?.email) contactItems.push(`<span>${sanitize(data.contact.email)}</span>`);
    if (data.contact?.phone) contactItems.push(`<span>${sanitize(data.contact.phone)}</span>`);
    if (data.contact?.location) contactItems.push(`<span>${sanitize(data.contact.location)}</span>`);
    if (data.contact?.linkedin) contactItems.push(`<span>${sanitize(data.contact.linkedin)}</span>`);
    if (data.contact?.portfolio) contactItems.push(`<span>${sanitize(data.contact.portfolio)}</span>`);

    const contactLine = contactItems.join(`<span class="sep">&bull;</span>`);

    let summarySection = "";
    if (data.summary) {
        summarySection = `
        <section class="section">
            <h2 class="section-title">Professional Summary</h2>
            <p class="summary-text">${sanitize(data.summary)}</p>
        </section>`;
    }

    let skillsSection = "";
    if (data.skills) {
        const categories = [];
        if (data.skills.coreSkills?.length) {
            categories.push(`
                <div class="skill-row">
                    <span class="skill-label">Core Competencies:</span>
                    <span class="skill-tags">${data.skills.coreSkills.map(s => `<span class="tag">${sanitize(s)}</span>`).join("")}</span>
                </div>`);
        }
        if (data.skills.toolsAndTechnologies?.length) {
            categories.push(`
                <div class="skill-row">
                    <span class="skill-label">Tools & Frameworks:</span>
                    <span class="skill-tags">${data.skills.toolsAndTechnologies.map(s => `<span class="tag">${sanitize(s)}</span>`).join("")}</span>
                </div>`);
        }
        if (data.skills.methodologiesOrSoftSkills?.length) {
            categories.push(`
                <div class="skill-row">
                    <span class="skill-label">Methodologies & Leadership:</span>
                    <span class="skill-tags">${data.skills.methodologiesOrSoftSkills.map(s => `<span class="tag">${sanitize(s)}</span>`).join("")}</span>
                </div>`);
        }
        if (categories.length) {
            skillsSection = `
            <section class="section">
                <h2 class="section-title">Key Skills & Technical Expertise</h2>
                <div class="skills-container">${categories.join("")}</div>
            </section>`;
        }
    }

    let experienceSection = "";
    if (data.experience?.length) {
        const expItems = data.experience.map(exp => {
            const cleanHighlights = (exp.highlights || [])
                .map(h => {
                    const cleaned = h.replace(/^[\s•\-\*\d\.\)\/n\\]+/, "").trim();
                    return cleaned ? `<li>${sanitize(cleaned)}</li>` : "";
                })
                .filter(Boolean)
                .join("");

            return `
            <div class="entry">
                <div class="entry-header">
                    <div class="entry-title-block">
                        <span class="entry-role">${sanitize(exp.role)}</span>
                        <span class="entry-divider">at</span>
                        <span class="entry-company">${sanitize(exp.company)}</span>
                    </div>
                    <span class="entry-period">${sanitize(exp.period || "")}</span>
                </div>
                ${exp.location ? `<div class="entry-location">${sanitize(exp.location)}</div>` : ""}
                ${cleanHighlights ? `<ul class="entry-bullets">${cleanHighlights}</ul>` : ""}
            </div>`;
        }).join("");

        experienceSection = `
        <section class="section">
            <h2 class="section-title">Professional Experience</h2>
            ${expItems}
        </section>`;
    }

    let projectsSection = "";
    if (data.projects?.length) {
        const projItems = data.projects.map(proj => `
            <div class="entry">
                <div class="entry-header">
                    <span class="entry-role">${sanitize(proj.name)}</span>
                    ${proj.technologies ? `<span class="entry-period">${sanitize(proj.technologies)}</span>` : ""}
                </div>
                <p class="entry-desc">${sanitize(proj.description)}</p>
            </div>
        `).join("");

        projectsSection = `
        <section class="section">
            <h2 class="section-title">Key Projects & Achievements</h2>
            ${projItems}
        </section>`;
    }

    let educationSection = "";
    if (data.education?.length) {
        const eduItems = data.education.map(edu => `
            <div class="entry">
                <div class="entry-header">
                    <span class="entry-role">${sanitize(edu.degree)}</span>
                    <span class="entry-period">${sanitize(edu.year || "")}</span>
                </div>
                <div class="entry-subheader">
                    <span class="entry-company">${sanitize(edu.institution)}</span>
                    ${edu.location ? `<span class="entry-location">${sanitize(edu.location)}</span>` : ""}
                </div>
            </div>
        `).join("");

        educationSection = `
        <section class="section">
            <h2 class="section-title">Education</h2>
            ${eduItems}
        </section>`;
    }

    let certSection = "";
    if (data.certifications?.length) {
        const certItems = data.certifications.map(c => `<li>${sanitize(c)}</li>`).join("");
        certSection = `
        <section class="section">
            <h2 class="section-title">Certifications & Licenses</h2>
            <ul class="entry-bullets">${certItems}</ul>
        </section>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${name} - Resume</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1f2937;
            background: #ffffff;
            font-size: 11px;
            line-height: 1.5;
            padding: 24px 30px;
            -webkit-font-smoothing: antialiased;
        }

        /* ── Header ────────────────────────────────────────── */
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 14px;
        }

        .name {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.02em;
            margin-bottom: 3px;
            text-transform: uppercase;
        }

        .target-title {
            font-size: 13px;
            font-weight: 600;
            color: #2563eb;
            margin-bottom: 6px;
            letter-spacing: 0.02em;
        }

        .contact-row {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;
            font-size: 10px;
            color: #4b5563;
        }

        .contact-row .sep {
            color: #9ca3af;
            font-size: 8px;
        }

        /* ── Section ───────────────────────────────────────── */
        .section {
            margin-bottom: 12px;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .section-title {
            font-size: 11px;
            font-weight: 700;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border-bottom: 1.5px solid #dbeafe;
            padding-bottom: 3px;
            margin-bottom: 7px;
        }

        .summary-text {
            font-size: 10.5px;
            color: #374151;
            line-height: 1.55;
            text-align: justify;
        }

        /* ── Skills ────────────────────────────────────────── */
        .skills-container {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .skill-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
            font-size: 10.5px;
            line-height: 1.4;
        }

        .skill-label {
            font-weight: 700;
            color: #1e293b;
            flex-shrink: 0;
            min-width: 140px;
        }

        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }

        .tag {
            background-color: #f1f5f9;
            color: #334155;
            border: 1px solid #e2e8f0;
            border-radius: 3px;
            padding: 1px 6px;
            font-size: 9.5px;
            font-weight: 500;
        }

        /* ── Entry / Experience ────────────────────────────── */
        .entry {
            margin-bottom: 9px;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 1px;
        }

        .entry-title-block {
            display: flex;
            align-items: baseline;
            gap: 5px;
        }

        .entry-role {
            font-size: 11.5px;
            font-weight: 700;
            color: #0f172a;
        }

        .entry-divider {
            color: #94a3b8;
            font-size: 10px;
        }

        .entry-company {
            font-size: 11px;
            font-weight: 600;
            color: #2563eb;
        }

        .entry-period {
            font-size: 10px;
            font-weight: 600;
            color: #64748b;
            white-space: nowrap;
        }

        .entry-location {
            font-size: 9.5px;
            color: #64748b;
            margin-bottom: 3px;
        }

        .entry-subheader {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 10.5px;
        }

        .entry-desc {
            font-size: 10.5px;
            color: #374151;
            margin-top: 2px;
            line-height: 1.45;
        }

        .entry-bullets {
            margin-top: 3px;
            padding-left: 16px;
            color: #334151;
        }

        .entry-bullets li {
            font-size: 10.5px;
            line-height: 1.45;
            margin-bottom: 2.5px;
        }

        @media print {
            body {
                padding: 0;
            }
            @page {
                size: A4;
                margin: 12mm 15mm;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <h1 class="name">${name}</h1>
        ${title ? `<div class="target-title">${title}</div>` : ""}
        ${contactLine ? `<div class="contact-row">${contactLine}</div>` : ""}
    </header>

    ${summarySection}
    ${skillsSection}
    ${experienceSection}
    ${projectsSection}
    ${educationSection}
    ${certSection}
</body>
</html>`;
}

module.exports = { buildResumeHtml };
