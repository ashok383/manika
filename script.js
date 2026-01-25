//===============================================PAY&DOWNLOAD_FUNCTION======================================================
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

//===================================ATS_RESUME_1==========================================================================
async function generateATSResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 75;

    /* ========= COLOR THEME ========= */
    const COLORS = {
        black: [0, 0, 0],
        text: [40, 40, 40],
        gray: [90, 90, 90],

        purple: [106, 17, 203],
        blue: [37, 117, 252],
        pink: [233, 30, 99],
        green: [0, 150, 136],
        orange: [255, 152, 0],

        panelBg: [248, 250, 255],
        lightGreen: [224, 242, 241],
        mint: [240, 255, 250]
    };

    /* ========= THICK 4-SIDE BORDER ========= */
    function drawBorder() {
        doc.setDrawColor(...COLORS.black);
        doc.setLineWidth(4);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 75;
    }

    drawBorder();

    /* ========= GRADIENT HEADER ========= */
    const headerHeight = 95;
    for (let i = 0; i < headerHeight; i++) {
        const r = COLORS.purple[0] + (COLORS.blue[0] - COLORS.purple[0]) * (i / headerHeight);
        const g = COLORS.purple[1] + (COLORS.blue[1] - COLORS.purple[1]) * (i / headerHeight);
        const b = COLORS.purple[2] + (COLORS.blue[2] - COLORS.purple[2]) * (i / headerHeight);
        doc.setDrawColor(r, g, b);
        doc.line(20, 20 + i, pageWidth - 20, 20 + i);
    }

    /* ========= PHOTO (HIGH DP) ========= */
    const photo = document.getElementById("photo");
    if (photo.files[0]) {
        const reader = new FileReader();
        await new Promise(resolve => {
            reader.onload = e => {
                doc.addImage(
                    e.target.result,
                    "JPEG",
                    pageWidth - 135,
                    30,
                    85,
                    85,
                    undefined,
                    "FAST"
                );
                resolve();
            };
            reader.readAsDataURL(photo.files[0]);
        });
    }

    /* ========= NAME ========= */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 58);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
        `Father: ${fatherName.value} | Mother: ${motherName.value}`,
        margin, 75
    );

    y = 140;
    doc.setTextColor(...COLORS.text);

    /* ========= BASIC INFO PANEL ========= */
    doc.setFillColor(...COLORS.panelBg);
    doc.roundedRect(
        margin - 10,
        y - 25,
        pageWidth - margin * 2 + 20,
        80,
        10,
        10,
        "F"
    );

    doc.text(`DOB: ${dob.value}`, margin, y);
    y += 16;
    doc.text(`Email: ${email.value} | Phone: ${phone.value}`, margin, y);
    y += 16;
    doc.text(`Address: ${address.value}`, margin, y);
    y += 40;

    /* ========= SECTION FUNCTIONS ========= */
    function section(title, color) {
        if (y > pageHeight - 120) addNewPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(...color);
        doc.text(title, margin, y);
        y += 6;
        doc.setLineWidth(2.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 18;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11.5);
        doc.setTextColor(...COLORS.gray);
    }

    function paragraph(text) {
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 10;
    }

    /* ========= CONTENT ========= */
    section("Career Objective", COLORS.pink);
    paragraph(objective.value);

    section("Professional Summary", COLORS.blue);
    paragraph(summary.value);

    /* ========= ACADEMIC TABLE ========= */
    section("Academic Qualifications", COLORS.green);

    doc.autoTable({
        startY: y,
        head: [[
            "COURSE / DEGREE",
            "INSTITUTE / UNIVERSITY",
            "YEAR",
            "CGPA / %"
        ]],
        body: [...document.querySelectorAll(".academicRow")].map(row => {
            const i = row.querySelectorAll("input");
            return [i[0].value, i[1].value, i[2].value, i[3].value];
        }),
        theme: "grid",
        styles: {
            fontSize: 12,
            textColor: COLORS.black,
            lineColor: COLORS.black,
            lineWidth: 1.6,
            cellPadding: 6
        },
        headStyles: {
            fillColor: COLORS.green,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
            lineWidth: 2
        },
        bodyStyles: {
            fillColor: COLORS.mint
        },
        alternateRowStyles: {
            fillColor: COLORS.lightGreen
        },
        columnStyles: {
            2: { halign: "center" },
            3: { halign: "center" }
        },
        margin: { left: margin, right: margin },
        didDrawPage: () => drawBorder()
    });

    y = doc.lastAutoTable.finalY + 28;

    section("Education", COLORS.orange);
    paragraph(education.value);

    section("Experience", COLORS.green);
    paragraph(experience.value);

    section("Technical Skills", COLORS.orange);
    skills.value.split(",").forEach(skill => {
        if (y > pageHeight - margin) addNewPage();
        doc.text("• " + skill.trim(), margin, y);
        y += 14;
    });
    y += 12;

    section("Projects", COLORS.blue);
    paragraph(projects.value);

    section("Habits / Strengths", COLORS.pink);
    paragraph(habits.value);

    section("Languages Known", COLORS.green);
    paragraph(Languages.value);

    section("Declaration", COLORS.purple);
    paragraph(declaration.value);

    /* ========= FOOTER ========= */
    if (y > pageHeight - 90) addNewPage();
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.text);
    doc.text(`Place: ${place.value}`, margin, y);
    y += 16;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 16;
    doc.text(`Signature: ${signature.value}`, margin, y);

    /* ========= SAVE ========= */
    doc.save(`${fullName.value}_ATS_Modern_Resume.pdf`);
}

//================================REVERSE_RESUME_2====================================================
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
//============================== HYBRID_RESUME_3 ==============================
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
//============================== ONE_PAGE_GLOBAL_RESUME_4 ==============================
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
//============================== TARGETED_RESUME_5 ==============================
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
//============================== FUNCTIONAL_RESUME_6 ==============================
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
//============================== EXECUTIVE_RESUME_7 ==============================
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
//============================== ACADEMIC_RESUME_8 ==============================
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
//============================== CREATIVE_RESUME_9 ==============================
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
//============================== EUROPAS_RESUME_10 ==============================
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

