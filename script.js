async function payAndDownload() {
    // 1️⃣ Check which resume model is selected
    const selected = document.querySelector('input[name="resumeModel"]:checked');

    if (!selected) {
        alert("No option selected!");
        return;
    }

    console.log("Selected value:", selected.value);

    // 2️⃣ Configure Razorpay payment
    const options = {
        key: "rzp_live_S5ex0BvHGJcmo6",
        payment_link: "https://rzp.io/rzp/SatLieJ",
        handler: async function (response) {
            // 3️⃣ Payment successful
            alert("Payment Successful ✅\nPayment ID: " + response.razorpay_payment_id);

            // 4️⃣ Generate PDF according to selected resume model
            switch (selected.value) {
                case "ats":
                    await generateATSResume();
                    break;
                case "reverse":
                    await generateReverseChronResume();
                    break;
                case "hybrid":
                    await generateHybridResume();
                    break;
                case "onepage":
                    await generateOnePageResume();
                    break;
                case "targeted":
                    await generateTargetedResume();
                    break;
                case "functional":
                    await generateFunctionalResume();
                    break;
                case "executive":
                    await generateExecutiveResume();
                    break;
                case "academic":
                    await generateAcademicResume();
                    break;
                case "creative":
                    await generateCreativeResume();
                    break;
                case "europass":
                    await generateEuropassResume();
                    break;
                default:
                    alert("Invalid selection!");
            }
        },
        prefill: { name: fullName.value, email: email.value, contact: phone.value },
        theme: { color: "#2196f3" }
    };

    // 5️⃣ Open Razorpay modal
    const rzp = new Razorpay(options);
    rzp.open();
}
async function generateATSResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = 60;

    /* ---------- COLORS ---------- */
    const COLORS = {
        gradientStart: [98, 0, 234],      // purple
        gradientEnd: [33, 150, 243],      // blue
        border: [50, 50, 50],
        sectionLine: [120, 120, 120],
        textDark: [33, 33, 33],
        textGray: [80, 80, 80],
        lightBg: [245, 247, 255]
    };

    /* ---------- BORDER ---------- */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    /* ---------- GRADIENT HEADER ---------- */
    const gradHeight = 70;
    const gradSteps = 30;
    for (let i = 0; i < gradSteps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / gradSteps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / gradSteps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / gradSteps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (gradHeight / gradSteps), pageWidth, gradHeight / gradSteps, "F");
    }

    /* ---------- HEADER TEXT ---------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 70);

    /* ---------- SECTION UTILITIES ---------- */
    function section(title) {
        if (y > pageHeight - 80) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.gradientEnd);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(0.7);
        doc.setDrawColor(...COLORS.sectionLine);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 14;
        });
        y += 6;
    }

    /* ---------- CONTENT ---------- */
    section("Professional Summary");
    paragraph(summary.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Academic Qualifications");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value}, ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - margin) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Professional Experience");
    paragraph(experience.value);

    section("Technical Skills");
    bulletList(skills.value);

    section("Projects");
    paragraph(projects.value);

    section("Strengths");
    paragraph(habits.value);

    section("Languages");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ---------- FOOTER ---------- */
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textDark);
    doc.text(`Place: ${place.value}`, margin, y);
    y += 14;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 14;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_ATS_Resume.pdf`);
}

//================================CREATIVE_RESUME====================================================
async function generateReverseChronResume() {
   const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = 60;

    /* ---------- COLORS ---------- */
    const COLORS = {
        gradientStart: [98, 0, 234],      // purple
        gradientEnd: [33, 150, 243],      // blue
        border: [50, 50, 50],
        sectionLine: [120, 120, 120],
        textDark: [33, 33, 33],
        textGray: [80, 80, 80],
        lightBg: [245, 247, 255]
    };

    /* ---------- BORDER ---------- */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    /* ---------- GRADIENT HEADER ---------- */
    const gradHeight = 70;
    const gradSteps = 30;
    for (let i = 0; i < gradSteps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / gradSteps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / gradSteps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / gradSteps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (gradHeight / gradSteps), pageWidth, gradHeight / gradSteps, "F");
    }

    /* ---------- HEADER TEXT ---------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 70);

    /* ---------- SECTION UTILITIES ---------- */
    function section(title) {
        if (y > pageHeight - 80) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.gradientEnd);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(0.7);
        doc.setDrawColor(...COLORS.sectionLine);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 14;
        });
        y += 6;
    }

    /* ---------- CONTENT ---------- */
    section("Professional Summary");
    paragraph(summary.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Academic Qualifications");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value}, ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - margin) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Professional Experience");
    paragraph(experience.value);

    section("Technical Skills");
    bulletList(skills.value);

    section("Projects");
    paragraph(projects.value);

    section("Strengths");
    paragraph(habits.value);

    section("Languages");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ---------- FOOTER ---------- */
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textDark);
    doc.text(`Place: ${place.value}`, margin, y);
    y += 14;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 14;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_ATS_Resume.pdf`);
}
//================================CREATIVE_RESUME====================================================
async function generateReverseChronResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = 60;

    /* ---------- COLORS ---------- */
    const COLORS = {
        gradientStart: [98, 0, 234],      // purple
        gradientEnd: [33, 150, 243],      // blue
        border: [50, 50, 50],
        sectionLine: [120, 120, 120],
        textDark: [33, 33, 33],
        textGray: [80, 80, 80],
        lightBg: [245, 247, 255]
    };

    /* ---------- BORDER ---------- */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    /* ---------- GRADIENT HEADER ---------- */
    const gradHeight = 70;
    const gradSteps = 30;
    for (let i = 0; i < gradSteps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / gradSteps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / gradSteps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / gradSteps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (gradHeight / gradSteps), pageWidth, gradHeight / gradSteps, "F");
    }

    /* ---------- HEADER TEXT ---------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 70);

    /* ---------- SECTION UTILITIES ---------- */
    function section(title) {
        if (y > pageHeight - 80) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.gradientEnd);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(0.7);
        doc.setDrawColor(...COLORS.sectionLine);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 14;
        });
        y += 6;
    }

    /* ---------- CONTENT ---------- */
    section("Professional Summary");
    paragraph(summary.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Academic Qualifications");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value}, ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - margin) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Professional Experience");
    paragraph(experience.value);

    section("Technical Skills");
    bulletList(skills.value);

    section("Projects");
    paragraph(projects.value);

    section("Strengths");
    paragraph(habits.value);

    section("Languages");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ---------- FOOTER ---------- */
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textDark);
    doc.text(`Place: ${place.value}`, margin, y);
    y += 14;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 14;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_ATS_Resume.pdf`);
}
//============================== HYBRID / COMBINATION RESUME ==============================
async function generateHybridResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = 60;

    /* ---------- COLORS ---------- */
    const COLORS = {
        gradientStart: [98, 0, 234],      // purple
        gradientEnd: [33, 150, 243],      // blue
        border: [50, 50, 50],
        sectionLine: [120, 120, 120],
        textDark: [33, 33, 33],
        textGray: [80, 80, 80],
        lightBg: [245, 247, 255]
    };

    /* ---------- BORDER ---------- */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    /* ---------- GRADIENT HEADER ---------- */
    const gradHeight = 70;
    const gradSteps = 30;
    for (let i = 0; i < gradSteps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / gradSteps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / gradSteps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / gradSteps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (gradHeight / gradSteps), pageWidth, gradHeight / gradSteps, "F");
    }

    /* ---------- HEADER TEXT ---------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 70);

    /* ---------- SECTION UTILITIES ---------- */
    function section(title) {
        if (y > pageHeight - 80) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.gradientEnd);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(0.7);
        doc.setDrawColor(...COLORS.sectionLine);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 14;
        });
        y += 6;
    }

    /* ---------- CONTENT ---------- */
    section("Professional Summary");
    paragraph(summary.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Academic Qualifications");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value}, ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - margin) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Professional Experience");
    paragraph(experience.value);

    section("Technical Skills");
    bulletList(skills.value);

    section("Projects");
    paragraph(projects.value);

    section("Strengths");
    paragraph(habits.value);

    section("Languages");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ---------- FOOTER ---------- */
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textDark);
    doc.text(`Place: ${place.value}`, margin, y);
    y += 14;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 14;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_ATS_Resume.pdf`);
}
//============================== ONE-PAGE GLOBAL STANDARD RESUME ==============================
async function generateOnePageResume() {
   const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = 60;

    /* ---------- COLORS ---------- */
    const COLORS = {
        gradientStart: [98, 0, 234],      // purple
        gradientEnd: [33, 150, 243],      // blue
        border: [50, 50, 50],
        sectionLine: [120, 120, 120],
        textDark: [33, 33, 33],
        textGray: [80, 80, 80],
        lightBg: [245, 247, 255]
    };

    /* ---------- BORDER ---------- */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    /* ---------- GRADIENT HEADER ---------- */
    const gradHeight = 70;
    const gradSteps = 30;
    for (let i = 0; i < gradSteps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / gradSteps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / gradSteps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / gradSteps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (gradHeight / gradSteps), pageWidth, gradHeight / gradSteps, "F");
    }

    /* ---------- HEADER TEXT ---------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 70);

    /* ---------- SECTION UTILITIES ---------- */
    function section(title) {
        if (y > pageHeight - 80) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.gradientEnd);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(0.7);
        doc.setDrawColor(...COLORS.sectionLine);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 14;
        });
        y += 6;
    }

    /* ---------- CONTENT ---------- */
    section("Professional Summary");
    paragraph(summary.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Academic Qualifications");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value}, ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - margin) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Professional Experience");
    paragraph(experience.value);

    section("Technical Skills");
    bulletList(skills.value);

    section("Projects");
    paragraph(projects.value);

    section("Strengths");
    paragraph(habits.value);

    section("Languages");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ---------- FOOTER ---------- */
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textDark);
    doc.text(`Place: ${place.value}`, margin, y);
    y += 14;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 14;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_ATS_Resume.pdf`);
}
//============================== TARGETED / FAANG RESUME ==============================
async function generateTargetedResume() {
   const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = 60;

    /* ---------- COLORS ---------- */
    const COLORS = {
        gradientStart: [98, 0, 234],      // purple
        gradientEnd: [33, 150, 243],      // blue
        border: [50, 50, 50],
        sectionLine: [120, 120, 120],
        textDark: [33, 33, 33],
        textGray: [80, 80, 80],
        lightBg: [245, 247, 255]
    };

    /* ---------- BORDER ---------- */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    /* ---------- GRADIENT HEADER ---------- */
    const gradHeight = 70;
    const gradSteps = 30;
    for (let i = 0; i < gradSteps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / gradSteps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / gradSteps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / gradSteps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (gradHeight / gradSteps), pageWidth, gradHeight / gradSteps, "F");
    }

    /* ---------- HEADER TEXT ---------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 70);

    /* ---------- SECTION UTILITIES ---------- */
    function section(title) {
        if (y > pageHeight - 80) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.gradientEnd);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(0.7);
        doc.setDrawColor(...COLORS.sectionLine);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 14;
        });
        y += 6;
    }

    /* ---------- CONTENT ---------- */
    section("Professional Summary");
    paragraph(summary.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Academic Qualifications");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value}, ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - margin) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Professional Experience");
    paragraph(experience.value);

    section("Technical Skills");
    bulletList(skills.value);

    section("Projects");
    paragraph(projects.value);

    section("Strengths");
    paragraph(habits.value);

    section("Languages");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ---------- FOOTER ---------- */
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textDark);
    doc.text(`Place: ${place.value}`, margin, y);
    y += 14;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 14;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_ATS_Resume.pdf`);
}
//============================== FUNCTIONAL / SKILLS-BASED RESUME ==============================
async function generateFunctionalResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = 60;

    /* ---------- COLORS ---------- */
    const COLORS = {
        gradientStart: [98, 0, 234],      // purple
        gradientEnd: [33, 150, 243],      // blue
        border: [50, 50, 50],
        sectionLine: [120, 120, 120],
        textDark: [33, 33, 33],
        textGray: [80, 80, 80],
        lightBg: [245, 247, 255]
    };

    /* ---------- BORDER ---------- */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    /* ---------- GRADIENT HEADER ---------- */
    const gradHeight = 70;
    const gradSteps = 30;
    for (let i = 0; i < gradSteps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / gradSteps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / gradSteps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / gradSteps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (gradHeight / gradSteps), pageWidth, gradHeight / gradSteps, "F");
    }

    /* ---------- HEADER TEXT ---------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 70);

    /* ---------- SECTION UTILITIES ---------- */
    function section(title) {
        if (y > pageHeight - 80) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.gradientEnd);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(0.7);
        doc.setDrawColor(...COLORS.sectionLine);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 14;
        });
        y += 6;
    }

    /* ---------- CONTENT ---------- */
    section("Professional Summary");
    paragraph(summary.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Academic Qualifications");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value}, ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - margin) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Professional Experience");
    paragraph(experience.value);

    section("Technical Skills");
    bulletList(skills.value);

    section("Projects");
    paragraph(projects.value);

    section("Strengths");
    paragraph(habits.value);

    section("Languages");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ---------- FOOTER ---------- */
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textDark);
    doc.text(`Place: ${place.value}`, margin, y);
    y += 14;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 14;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_ATS_Resume.pdf`);
}
//============================== EXECUTIVE / LEADERSHIP RESUME ==============================
async function generateExecutiveResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = 60;

    /* ---------- COLORS ---------- */
    const COLORS = {
        gradientStart: [98, 0, 234],      // purple
        gradientEnd: [33, 150, 243],      // blue
        border: [50, 50, 50],
        sectionLine: [120, 120, 120],
        textDark: [33, 33, 33],
        textGray: [80, 80, 80],
        lightBg: [245, 247, 255]
    };

    /* ---------- BORDER ---------- */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    /* ---------- GRADIENT HEADER ---------- */
    const gradHeight = 70;
    const gradSteps = 30;
    for (let i = 0; i < gradSteps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / gradSteps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / gradSteps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / gradSteps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (gradHeight / gradSteps), pageWidth, gradHeight / gradSteps, "F");
    }

    /* ---------- HEADER TEXT ---------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 70);

    /* ---------- SECTION UTILITIES ---------- */
    function section(title) {
        if (y > pageHeight - 80) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.gradientEnd);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(0.7);
        doc.setDrawColor(...COLORS.sectionLine);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 14;
        });
        y += 6;
    }

    /* ---------- CONTENT ---------- */
    section("Professional Summary");
    paragraph(summary.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Academic Qualifications");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value}, ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - margin) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Professional Experience");
    paragraph(experience.value);

    section("Technical Skills");
    bulletList(skills.value);

    section("Projects");
    paragraph(projects.value);

    section("Strengths");
    paragraph(habits.value);

    section("Languages");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ---------- FOOTER ---------- */
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textDark);
    doc.text(`Place: ${place.value}`, margin, y);
    y += 14;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 14;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_ATS_Resume.pdf`);
}
//============================== ACADEMIC CV / INTERNATIONAL ==============================
async function generateAcademicResume() {
 const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = 60;

    /* ---------- COLORS ---------- */
    const COLORS = {
        gradientStart: [98, 0, 234],      // purple
        gradientEnd: [33, 150, 243],      // blue
        border: [50, 50, 50],
        sectionLine: [120, 120, 120],
        textDark: [33, 33, 33],
        textGray: [80, 80, 80],
        lightBg: [245, 247, 255]
    };

    /* ---------- BORDER ---------- */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    /* ---------- GRADIENT HEADER ---------- */
    const gradHeight = 70;
    const gradSteps = 30;
    for (let i = 0; i < gradSteps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / gradSteps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / gradSteps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / gradSteps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (gradHeight / gradSteps), pageWidth, gradHeight / gradSteps, "F");
    }

    /* ---------- HEADER TEXT ---------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 70);

    /* ---------- SECTION UTILITIES ---------- */
    function section(title) {
        if (y > pageHeight - 80) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.gradientEnd);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(0.7);
        doc.setDrawColor(...COLORS.sectionLine);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 14;
        });
        y += 6;
    }

    /* ---------- CONTENT ---------- */
    section("Professional Summary");
    paragraph(summary.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Academic Qualifications");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value}, ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - margin) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Professional Experience");
    paragraph(experience.value);

    section("Technical Skills");
    bulletList(skills.value);

    section("Projects");
    paragraph(projects.value);

    section("Strengths");
    paragraph(habits.value);

    section("Languages");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ---------- FOOTER ---------- */
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textDark);
    doc.text(`Place: ${place.value}`, margin, y);
    y += 14;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 14;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_ATS_Resume.pdf`);
}
//============================== CREATIVE / VISUAL RESUME ==============================
async function generateCreativeResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = 60;

    /* ---------- COLORS ---------- */
    const COLORS = {
        gradientStart: [98, 0, 234],      // purple
        gradientEnd: [33, 150, 243],      // blue
        border: [50, 50, 50],
        sectionLine: [120, 120, 120],
        textDark: [33, 33, 33],
        textGray: [80, 80, 80],
        lightBg: [245, 247, 255]
    };

    /* ---------- BORDER ---------- */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    /* ---------- GRADIENT HEADER ---------- */
    const gradHeight = 70;
    const gradSteps = 30;
    for (let i = 0; i < gradSteps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / gradSteps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / gradSteps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / gradSteps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (gradHeight / gradSteps), pageWidth, gradHeight / gradSteps, "F");
    }

    /* ---------- HEADER TEXT ---------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 70);

    /* ---------- SECTION UTILITIES ---------- */
    function section(title) {
        if (y > pageHeight - 80) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.gradientEnd);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(0.7);
        doc.setDrawColor(...COLORS.sectionLine);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 14;
        });
        y += 6;
    }

    /* ---------- CONTENT ---------- */
    section("Professional Summary");
    paragraph(summary.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Academic Qualifications");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value}, ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - margin) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Professional Experience");
    paragraph(experience.value);

    section("Technical Skills");
    bulletList(skills.value);

    section("Projects");
    paragraph(projects.value);

    section("Strengths");
    paragraph(habits.value);

    section("Languages");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ---------- FOOTER ---------- */
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textDark);
    doc.text(`Place: ${place.value}`, margin, y);
    y += 14;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 14;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_ATS_Resume.pdf`);
}
//============================== generateEuropassResume ==============================
async function generateEuropassResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = 60;

    /* ---------- COLORS ---------- */
    const COLORS = {
        gradientStart: [98, 0, 234],      // purple
        gradientEnd: [33, 150, 243],      // blue
        border: [50, 50, 50],
        sectionLine: [120, 120, 120],
        textDark: [33, 33, 33],
        textGray: [80, 80, 80],
        lightBg: [245, 247, 255]
    };

    /* ---------- BORDER ---------- */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    /* ---------- GRADIENT HEADER ---------- */
    const gradHeight = 70;
    const gradSteps = 30;
    for (let i = 0; i < gradSteps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / gradSteps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / gradSteps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / gradSteps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (gradHeight / gradSteps), pageWidth, gradHeight / gradSteps, "F");
    }

    /* ---------- HEADER TEXT ---------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 70);

    /* ---------- SECTION UTILITIES ---------- */
    function section(title) {
        if (y > pageHeight - 80) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.gradientEnd);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(0.7);
        doc.setDrawColor(...COLORS.sectionLine);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 14;
        });
        y += 6;
    }

    /* ---------- CONTENT ---------- */
    section("Professional Summary");
    paragraph(summary.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Academic Qualifications");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value}, ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - margin) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Professional Experience");
    paragraph(experience.value);

    section("Technical Skills");
    bulletList(skills.value);

    section("Projects");
    paragraph(projects.value);

    section("Strengths");
    paragraph(habits.value);

    section("Languages");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ---------- FOOTER ---------- */
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textDark);
    doc.text(`Place: ${place.value}`, margin, y);
    y += 14;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 14;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_ATS_Resume.pdf`);
}

//=============================
// ========== PAYMENT & PDF ==========

