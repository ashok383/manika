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
    const margin = 45;
    let y = 75;

    /* ========= COLOR PALETTE ========= */
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

    /* ========= BORDER ========= */
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

    /* ========= PHOTO ========= */
    const photo = document.getElementById("photo");
    if (photo.files[0]) {
        const reader = new FileReader();
        await new Promise(resolve => {
            reader.onload = e => {
                doc.addImage(e.target.result, "JPEG",
                    pageWidth - 135, 30, 85, 85, undefined, "FAST");
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
    doc.text(
        `Father: ${fatherName.value} | Mother: ${motherName.value}`,
        margin, 75
    );

    y = 140;
    doc.setTextColor(...COLORS.text);

    /* ========= INFO PANEL ========= */
    doc.setFillColor(...COLORS.panelBg);
    doc.roundedRect(margin - 10, y - 25,
        pageWidth - margin * 2 + 20, 80, 10, 10, "F");

    doc.text(`DOB: ${dob.value}`, margin, y);
    y += 16;
    doc.text(`Email: ${email.value} | Phone: ${phone.value}`, margin, y);
    y += 16;
    doc.text(`Address: ${address.value}`, margin, y);
    y += 40;

    /* ========= HELPERS ========= */
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
        doc.splitTextToSize(text, pageWidth - margin * 2).forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 10;
    }

    /* ========= REVERSE-CHRONO CONTENT ========= */

    section("Professional Summary", COLORS.blue);
    paragraph(summary.value);

    section("Experience (Latest First)", COLORS.green);
    paragraph(experience.value);

    section("Projects", COLORS.blue);
    paragraph(projects.value);

    section("Technical Skills", COLORS.orange);
    skills.value.split(",").forEach(skill => {
        if (y > pageHeight - margin) addNewPage();
        doc.text("• " + skill.trim(), margin, y);
        y += 14;
    });
    y += 12;

    section("Academic Qualifications (Latest First)", COLORS.green);
    const academicRows = [...document.querySelectorAll(".academicRow")].reverse();

    doc.autoTable({
        startY: y,
        head: [["COURSE / DEGREE", "INSTITUTE", "YEAR", "CGPA / %"]],
        body: academicRows.map(row => {
            const i = row.querySelectorAll("input");
            return [i[0].value, i[1].value, i[2].value, i[3].value];
        }),
        theme: "grid",
        styles: { fontSize: 12, cellPadding: 6 },
        headStyles: {
            fillColor: COLORS.green,
            textColor: [255, 255, 255],
            fontStyle: "bold"
        },
        bodyStyles: { fillColor: COLORS.mint },
        alternateRowStyles: { fillColor: COLORS.lightGreen },
        margin: { left: margin, right: margin },
        didDrawPage: drawBorder
    });

    y = doc.lastAutoTable.finalY + 28;

    section("Habits / Strengths", COLORS.pink);
    paragraph(habits.value);

    section("Languages Known", COLORS.green);
    paragraph(Languages.value);

    section("Declaration", COLORS.purple);
    paragraph(declaration.value);

    /* ========= FOOTER ========= */
    if (y > pageHeight - 90) addNewPage();
    doc.setFont("helvetica", "bold");
    doc.text(`Place: ${place.value}`, margin, y);
    y += 16;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 16;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_World_Class_Reverse_Chronological_Resume.pdf`);
}

//============================== HYBRID_RESUME_3 ==============================
async function generateHybridResume() {
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

    /* ========= BORDER ========= */
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

    /* ========= PHOTO ========= */
    const photo = document.getElementById("photo");
    if (photo.files[0]) {
        const reader = new FileReader();
        await new Promise(resolve => {
            reader.onload = e => {
                doc.addImage(e.target.result, "JPEG",
                    pageWidth - 135, 30, 85, 85, undefined, "FAST");
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
    doc.text(
        `Father: ${fatherName.value} | Mother: ${motherName.value}`,
        margin, 75
    );

    y = 140;
    doc.setTextColor(...COLORS.text);

    /* ========= INFO PANEL ========= */
    doc.setFillColor(...COLORS.panelBg);
    doc.roundedRect(margin - 10, y - 25,
        pageWidth - margin * 2 + 20, 80, 10, 10, "F");

    doc.text(`DOB: ${dob.value}`, margin, y);
    y += 16;
    doc.text(`Email: ${email.value} | Phone: ${phone.value}`, margin, y);
    y += 16;
    doc.text(`Address: ${address.value}`, margin, y);
    y += 40;

    /* ========= HELPERS ========= */
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
        doc.splitTextToSize(text, pageWidth - margin * 2).forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 10;
    }

    /* ========= HYBRID CONTENT ========= */

    section("Professional Summary", COLORS.blue);
    paragraph(summary.value);

    section("Core Skills & Technologies", COLORS.orange);
    skills.value.split(",").forEach(skill => {
        if (y > pageHeight - margin) addNewPage();
        doc.text("• " + skill.trim(), margin, y);
        y += 14;
    });
    y += 12;

    section("Career Objective", COLORS.pink);
    paragraph(objective.value);

    section("Professional Experience", COLORS.green);
    paragraph(experience.value);

    section("Projects & Practical Work", COLORS.blue);
    paragraph(projects.value);

    section("Academic Qualifications", COLORS.green);
    const academicRows = [...document.querySelectorAll(".academicRow")].reverse();

    doc.autoTable({
        startY: y,
        head: [["COURSE / DEGREE", "INSTITUTE", "YEAR", "CGPA / %"]],
        body: academicRows.map(row => {
            const i = row.querySelectorAll("input");
            return [i[0].value, i[1].value, i[2].value, i[3].value];
        }),
        theme: "grid",
        styles: { fontSize: 12, cellPadding: 6 },
        headStyles: {
            fillColor: COLORS.green,
            textColor: [255, 255, 255],
            fontStyle: "bold"
        },
        bodyStyles: { fillColor: COLORS.mint },
        alternateRowStyles: { fillColor: COLORS.lightGreen },
        margin: { left: margin, right: margin },
        didDrawPage: drawBorder
    });

    y = doc.lastAutoTable.finalY + 28;

    section("Habits & Strengths", COLORS.pink);
    paragraph(habits.value);

    section("Languages Known", COLORS.green);
    paragraph(Languages.value);

    section("Declaration", COLORS.purple);
    paragraph(declaration.value);

    /* ========= FOOTER ========= */
    if (y > pageHeight - 90) addNewPage();
    doc.setFont("helvetica", "bold");
    doc.text(`Place: ${place.value}`, margin, y);
    y += 16;
    doc.text(`Date: ${date.value}`, margin, y);
    y += 16;
    doc.text(`Signature: ${signature.value}`, margin, y);

    doc.save(`${fullName.value}_Hybrid_Combination_Resume.pdf`);
}
//============================== ONE_PAGE_GLOBAL_RESUME_4 ==============================
async function generateOnePageResume() {
 const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 42;
    let y = 55;

    /* ========= ELEGANT GLOBAL COLOR THEME ========= */
    const COLORS = {
        text: [33, 33, 33],
        gray: [100, 100, 100],
        blue: [33, 150, 243],
        teal: [0, 150, 136],
        purple: [94, 53, 177],
        softBg: [245, 247, 250]
    };

    /* ========= TOP HEADER STRIP ========= */
    doc.setFillColor(...COLORS.blue);
    doc.rect(0, 0, pageWidth, 55, "F");

    /* ========= NAME ========= */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 38);

    /* ========= CONTACT LINE ========= */
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "normal");
    doc.text(
        `${email.value}  |  ${phone.value}  |  ${address.value}`,
        pageWidth - margin,
        38,
        { align: "right" }
    );

    y = 75;
    doc.setTextColor(...COLORS.text);

    /* ========= SECTION ========= */
    function section(title, color) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13.5);
        doc.setTextColor(...color);
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        doc.setLineWidth(1.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.gray);
    }

    function paragraph(text, spacing = 13) {
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            doc.text(line, margin, y);
            y += spacing;
        });
        y += 6;
    }

    /* ========= PROFESSIONAL SUMMARY ========= */
    section("Professional Summary", COLORS.purple);
    paragraph(summary.value);

    /* ========= CORE SKILLS (2 COLUMN) ========= */
    section("Core Skills", COLORS.blue);
    const skillArr = skills.value.split(",").map(s => s.trim());
    const mid = Math.ceil(skillArr.length / 2);
    const col1 = skillArr.slice(0, mid);
    const col2 = skillArr.slice(mid);

    let yStart = y;
    col1.forEach(s => { doc.text("• " + s, margin, y); y += 12; });
    y = yStart;
    col2.forEach(s => {
        doc.text("• " + s, pageWidth / 2 + 10, y);
        y += 12;
    });
    y += 20;

    /* ========= EXPERIENCE ========= */
    section("Experience", COLORS.teal);
    paragraph(experience.value);

    /* ========= PROJECTS ========= */
    section("Projects", COLORS.blue);
    paragraph(projects.value);

    /* ========= EDUCATION ========= */
    section("Education", COLORS.teal);
    doc.autoTable({
        startY: y,
        head: [["Degree", "Institute", "Year", "CGPA"]],
        body: [...document.querySelectorAll(".academicRow")].map(row => {
            const i = row.querySelectorAll("input");
            return [i[0].value, i[1].value, i[2].value, i[3].value];
        }),
        theme: "plain",
        styles: {
            fontSize: 10.5,
            textColor: COLORS.text,
            cellPadding: 4
        },
        headStyles: {
            textColor: COLORS.blue,
            fontStyle: "bold"
        },
        margin: { left: margin, right: margin }
    });

    y = doc.lastAutoTable.finalY + 14;

    /* ========= LANGUAGES ========= */
    section("Languages", COLORS.purple);
    paragraph(Languages.value);

    /* ========= FOOTER ========= */
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.gray);
    doc.text(
        `Declaration: ${declaration.value}`,
        margin,
        pageHeight - 55,
        { maxWidth: pageWidth - margin * 2 }
    );

    doc.setFont("helvetica", "bold");
    doc.text(
        `${place.value}  |  ${date.value}  |  ${signature.value}`,
        pageWidth / 2,
        pageHeight - 28,
        { align: "center" }
    );

    /* ========= SAVE ========= */
    doc.save(`${fullName.value}_One_Page_Global_Resume.pdf`);
}
//============================== TARGETED_RESUME_5 ==============================
async function generateTargetedResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = 40;

    /* ========= COLOR PALETTE ========= */
    const COLORS = {
        primary: [33, 150, 243],       // Elegant Blue
        accent: [94, 53, 177],         // Deep Purple
        highlight: [255, 152, 0],      // Gold Accent
        text: [33, 33, 33],
        gray: [90, 90, 90],
        lightGray: [245, 247, 250],
        panelBg: [248, 250, 255]
    };

    /* ========= HEADER GRADIENT ========= */
    const headerHeight = 80;
    for (let i = 0; i < headerHeight; i++) {
        const r = COLORS.accent[0] + (COLORS.primary[0] - COLORS.accent[0]) * (i / headerHeight);
        const g = COLORS.accent[1] + (COLORS.primary[1] - COLORS.accent[1]) * (i / headerHeight);
        const b = COLORS.accent[2] + (COLORS.primary[2] - COLORS.accent[2]) * (i / headerHeight);
        doc.setDrawColor(r, g, b);
        doc.line(0, i, pageWidth, i);
    }

    /* ========= PHOTO ========= */
    const photo = document.getElementById("photo");
    if (photo.files[0]) {
        const reader = new FileReader();
        await new Promise(resolve => {
            reader.onload = e => {
                doc.addImage(e.target.result, "JPEG", pageWidth - 110, 15, 85, 85, undefined, "FAST");
                resolve();
            };
            reader.readAsDataURL(photo.files[0]);
        });
    }

    /* ========= NAME & CONTACT ========= */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Email: ${email.value} | Phone: ${phone.value} | Address: ${address.value}`, margin, 65);

    y = 100;
    doc.setTextColor(...COLORS.text);

    /* ========= PANEL FOR BASIC INFO ========= */
    doc.setFillColor(...COLORS.panelBg);
    doc.roundedRect(margin - 5, y - 20, pageWidth - margin * 2 + 10, 70, 8, 8, "F");
    doc.setFontSize(10);
    doc.text(`DOB: ${dob.value}`, margin, y);
    doc.text(`Father: ${fatherName.value} | Mother: ${motherName.value}`, margin, y + 15);
    y += 80;

    /* ========= SECTION FUNCTION ========= */
    function section(title, color = COLORS.accent) {
        if (y > pageHeight - 120) addNewPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...color);
        doc.text(title.toUpperCase(), margin, y);
        y += 5;
        doc.setLineWidth(1.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 15;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.gray);
    }

    function paragraph(text, spacing = 13) {
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - 120) addNewPage();
            doc.text(line, margin, y);
            y += spacing;
        });
        y += 6;
    }

    function addNewPage() {
        doc.addPage();
        y = 40;
    }

    /* ========= CONTENT ========= */
    section("Career Objective", COLORS.highlight);
    paragraph(objective.value);

    section("Professional Summary", COLORS.primary);
    paragraph(summary.value);

    section("Core Skills", COLORS.accent);
    const skillList = skills.value.split(",").map(s => s.trim());
    const mid = Math.ceil(skillList.length / 2);
    let yLeft = y;
    skillList.slice(0, mid).forEach(s => { doc.text("• " + s, margin, yLeft); yLeft += 13; });
    let yRight = y;
    skillList.slice(mid).forEach(s => { doc.text("• " + s, pageWidth / 2 + 10, yRight); yRight += 13; });
    y = Math.max(yLeft, yRight) + 12;

    section("Experience", COLORS.primary);
    paragraph(experience.value);

    section("Projects", COLORS.highlight);
    paragraph(projects.value);

    section("Education", COLORS.accent);
    doc.autoTable({
        startY: y,
        body: [...document.querySelectorAll(".academicRow")].map(row => {
            const i = row.querySelectorAll("input");
            return [`${i[0].value} - ${i[1].value}`, `${i[2].value} | ${i[3].value}`];
        }),
        theme: "plain",
        styles: { fontSize: 10.5, textColor: COLORS.text, cellPadding: 3 },
        columnStyles: { 1: { halign: "right" } },
        margin: { left: margin, right: margin }
    });
    y = doc.lastAutoTable.finalY + 10;

    section("Languages Known", COLORS.primary);
    paragraph(Languages.value);

    section("Declaration", COLORS.accent);
    paragraph(declaration.value);

    /* ========= FOOTER ========= */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.gray);
    doc.text(`${place.value} | ${date.value} | ${signature.value}`, pageWidth / 2, pageHeight - 30, { align: "center" });

    /* ========= SAVE PDF ========= */
    doc.save(`${fullName.value}_Targeted_Resume.pdf`);
}
//============================== FUNCTIONAL_RESUME_6 ==============================
async function generateFunctionalResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 50;

    /* ========= COLOR PALETTE ========= */
    const COLORS = {
        gradientStart: [98, 0, 234],  // Deep purple
        gradientEnd: [33, 150, 243],  // Blue
        section: [255, 152, 0],       // Orange for headings
        panelBg: [245, 247, 255],     // Light panel background
        border: [50, 50, 50],
        text: [33, 33, 33],
        textGray: [80, 80, 80],
    };

    /* ========= DRAW BORDER ========= */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 50;
    }

    /* ========= HEADER GRADIENT ========= */
    const headerHeight = 70;
    const steps = 30;
    for (let i = 0; i < steps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / steps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / steps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / steps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (headerHeight / steps), pageWidth, headerHeight / steps, "F");
    }

    /* ========= HEADER TEXT ========= */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 68);

    /* ========= PHOTO ========= */
    const photo = document.getElementById("photo");
    if (photo.files[0]) {
        const reader = new FileReader();
        await new Promise(resolve => {
            reader.onload = e => {
                doc.addImage(e.target.result, "JPEG", pageWidth - 110, 15, 85, 85, undefined, "FAST");
                resolve();
            };
            reader.readAsDataURL(photo.files[0]);
        });
    }

    y = 100;

    /* ========= SECTION UTILITIES ========= */
    function section(title) {
        if (y > pageHeight - 100) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.section);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(1);
        doc.setDrawColor(...COLORS.section);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text, spacing = 14) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - 90) addNewPage();
            doc.text(line, margin, y);
            y += spacing;
        });
        y += 6;
    }

    function bulletList(text, columnSplit = false) {
        if (!text) return;
        const items = text.split(",").map(s => s.trim());
        if (!columnSplit) {
            items.forEach(item => {
                if (y > pageHeight - 90) addNewPage();
                doc.text(`• ${item}`, margin, y);
                y += 13;
            });
            y += 6;
        } else {
            // Two-column bullet list for skills
            const mid = Math.ceil(items.length / 2);
            let yLeft = y;
            let yRight = y;
            items.slice(0, mid).forEach(i => { doc.text(`• ${i}`, margin, yLeft); yLeft += 13; });
            items.slice(mid).forEach(i => { doc.text(`• ${i}`, pageWidth / 2 + 10, yRight); yRight += 13; });
            y = Math.max(yLeft, yRight) + 6;
        }
    }

    /* ========= CONTENT ========= */
    section("Professional Summary");
    paragraph(summary.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Academic Qualifications");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value} | ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - 90) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Professional Experience");
    paragraph(experience.value);

    section("Technical Skills");
    bulletList(skills.value, true);  // two-column skills

    section("Projects");
    paragraph(projects.value);

    section("Strengths / Habits");
    paragraph(habits.value);

    section("Languages Known");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ========= FOOTER ========= */
    y = pageHeight - 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text(`Place: ${place.value} | Date: ${date.value} | Signature: ${signature.value}`, pageWidth / 2, y, { align: "center" });

    /* ========= SAVE PDF ========= */
    doc.save(`${fullName.value}_Functional_Resume.pdf`);
}

//============================== EXECUTIVE_RESUME_7 ==============================
async function generateExecutiveResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 50;

    /* ========= COLORS ========= */
    const COLORS = {
        gradientStart: [72, 61, 139],   // Dark purple
        gradientEnd: [0, 123, 255],     // Bright blue
        section: [255, 87, 34],         // Orange for headings
        panelBg: [245, 247, 255],       // Light panel background
        border: [50, 50, 50],
        text: [33, 33, 33],
        textGray: [80, 80, 80]
    };

    /* ========= BORDER ========= */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 50;
    }

    /* ========= HEADER GRADIENT ========= */
    const headerHeight = 75;
    const steps = 30;
    for (let i = 0; i < steps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / steps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / steps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / steps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (headerHeight / steps), pageWidth, headerHeight / steps, "F");
    }

    /* ========= HEADER TEXT ========= */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 68);

    /* ========= PHOTO ========= */
    const photo = document.getElementById("photo");
    if (photo.files[0]) {
        const reader = new FileReader();
        await new Promise(resolve => {
            reader.onload = e => {
                doc.addImage(e.target.result, "JPEG", pageWidth - 110, 15, 85, 85, undefined, "FAST");
                resolve();
            };
            reader.readAsDataURL(photo.files[0]);
        });
    }

    y = 100;

    /* ========= SECTION UTILITIES ========= */
    function section(title) {
        if (y > pageHeight - 100) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.section);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(1);
        doc.setDrawColor(...COLORS.section);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text, spacing = 14) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - 90) addNewPage();
            doc.text(line, margin, y);
            y += spacing;
        });
        y += 6;
    }

    function bulletList(text, columnSplit = false) {
        if (!text) return;
        const items = text.split(",").map(s => s.trim());
        if (!columnSplit) {
            items.forEach(item => {
                if (y > pageHeight - 90) addNewPage();
                doc.text(`• ${item}`, margin, y);
                y += 13;
            });
            y += 6;
        } else {
            const mid = Math.ceil(items.length / 2);
            let yLeft = y;
            let yRight = y;
            items.slice(0, mid).forEach(i => { doc.text(`• ${i}`, margin, yLeft); yLeft += 13; });
            items.slice(mid).forEach(i => { doc.text(`• ${i}`, pageWidth / 2 + 10, yRight); yRight += 13; });
            y = Math.max(yLeft, yRight) + 6;
        }
    }

    /* ========= EXECUTIVE HIGHLIGHTS ========= */
    section("Executive Summary");
    paragraph(summary.value);

    section("Core Competencies");
    bulletList(skills.value, true); // two-column bullet

    section("Professional Experience");
    paragraph(experience.value);

    section("Career Objective");
    paragraph(objective.value);

    section("Education");
    paragraph(education.value);

    section("Key Projects & Achievements");
    paragraph(projects.value);

    section("Strengths & Leadership Traits");
    paragraph(habits.value);

    section("Languages");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ========= FOOTER ========= */
    y = pageHeight - 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text(`Place: ${place.value} | Date: ${date.value} | Signature: ${signature.value}`, pageWidth / 2, y, { align: "center" });

    /* ========= SAVE PDF ========= */
    doc.save(`${fullName.value}_Executive_Resume.pdf`);
}
//============================== ACADEMIC_RESUME_8 ==============================
async function generateAcademicResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 50;

    /* ========= COLORS ========= */
    const COLORS = {
        gradientStart: [0, 102, 204], // Deep Blue
        gradientEnd: [102, 178, 255], // Light Blue
        section: [0, 153, 102],       // Green for headings
        panelBg: [245, 247, 255],     // Light panel background
        border: [50, 50, 50],
        text: [33, 33, 33],
        textGray: [90, 90, 90]
    };

    /* ========= BORDER ========= */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 50;
    }

    /* ========= HEADER GRADIENT ========= */
    const headerHeight = 75;
    const steps = 30;
    for (let i = 0; i < steps; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / steps);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / steps);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / steps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (headerHeight / steps), pageWidth, headerHeight / steps, "F");
    }

    /* ========= HEADER TEXT ========= */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 68);

    /* ========= PHOTO ========= */
    const photo = document.getElementById("photo");
    if (photo.files[0]) {
        const reader = new FileReader();
        await new Promise(resolve => {
            reader.onload = e => {
                doc.addImage(e.target.result, "JPEG", pageWidth - 110, 15, 85, 85, undefined, "FAST");
                resolve();
            };
            reader.readAsDataURL(photo.files[0]);
        });
    }

    y = 100;

    /* ========= SECTION FUNCTIONS ========= */
    function section(title) {
        if (y > pageHeight - 100) addNewPage();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.section);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        doc.setLineWidth(1);
        doc.setDrawColor(...COLORS.section);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text, spacing = 14) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - 90) addNewPage();
            doc.text(line, margin, y);
            y += spacing;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - 90) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 13;
        });
        y += 6;
    }

    /* ========= ACADEMIC RESUME CONTENT ========= */
    section("Academic Profile");
    paragraph(summary.value);

    section("Educational Background");
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value}, ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - 90) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Research & Publications");
    bulletList(publications.value); // CSV input of publications

    section("Academic Achievements");
    bulletList(achievements.value);

    section("Technical Skills");
    bulletList(skills.value);

    section("Work / Internship Experience");
    paragraph(experience.value);

    section("Conferences & Workshops");
    bulletList(conferences.value);

    section("Languages Known");
    paragraph(Languages.value);

    section("Declaration");
    paragraph(declaration.value);

    /* ========= FOOTER ========= */
    y = pageHeight - 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text(`Place: ${place.value} | Date: ${date.value} | Signature: ${signature.value}`, pageWidth / 2, y, { align: "center" });

    /* ========= SAVE PDF ========= */
    doc.save(`${fullName.value}_Academic_Resume.pdf`);
}

//============================== CREATIVE_RESUME_9 ==============================
async function generateCreativeResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 50;

    /* ========= COLORS ========= */
    const COLORS = {
        headerStart: [255, 102, 178], // Pink
        headerEnd: [102, 178, 255],   // Light Blue
        section: [255, 153, 51],      // Orange
        border: [50, 50, 50],
        panelBg: [245, 247, 255],
        textDark: [33, 33, 33],
        textGray: [90, 90, 90],
        highlight: [102, 255, 178]   // Green accent
    };

    /* ========= BORDER ========= */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 50;
    }

    /* ========= HEADER GRADIENT ========= */
    const headerHeight = 70;
    const steps = 30;
    for (let i = 0; i < steps; i++) {
        const r = Math.round(COLORS.headerStart[0] + ((COLORS.headerEnd[0] - COLORS.headerStart[0]) * i) / steps);
        const g = Math.round(COLORS.headerStart[1] + ((COLORS.headerEnd[1] - COLORS.headerStart[1]) * i) / steps);
        const b = Math.round(COLORS.headerStart[2] + ((COLORS.headerEnd[2] - COLORS.headerStart[2]) * i) / steps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (headerHeight / steps), pageWidth, headerHeight / steps, "F");
    }

    /* ========= HEADER TEXT ========= */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 65);

    /* ========= PHOTO ========= */
    const photo = document.getElementById("photo");
    if (photo.files[0]) {
        const reader = new FileReader();
        await new Promise(resolve => {
            reader.onload = e => {
                doc.addImage(e.target.result, "JPEG", pageWidth - 110, 15, 85, 85, undefined, "FAST");
                resolve();
            };
            reader.readAsDataURL(photo.files[0]);
        });
    }

    y = 90;

    /* ========= SECTION FUNCTIONS ========= */
    function section(title, color = COLORS.section) {
        if (y > pageHeight - 100) addNewPage();

        // Heading
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...color);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        // Underline
        doc.setLineWidth(1);
        doc.setDrawColor(...color);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;

        // Body style
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text, spacing = 14) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - 90) addNewPage();
            doc.text(line, margin, y);
            y += spacing;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - 90) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 13;
        });
        y += 6;
    }

    /* ========= CREATIVE RESUME CONTENT ========= */
    section("Creative Summary", COLORS.highlight);
    paragraph(summary.value);

    section("Career Objective", COLORS.section);
    paragraph(objective.value);

    section("Education", COLORS.highlight);
    paragraph(education.value);

    section("Professional Experience", COLORS.section);
    paragraph(experience.value);

    section("Projects & Portfolios", COLORS.highlight);
    paragraph(projects.value);

    section("Skills & Expertise", COLORS.section);
    bulletList(skills.value);

    section("Achievements & Awards", COLORS.highlight);
    bulletList(achievements.value);

    section("Languages Known", COLORS.section);
    paragraph(Languages.value);

    section("Declaration", COLORS.highlight);
    paragraph(declaration.value);

    /* ========= FOOTER ========= */
    y = pageHeight - 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textDark);
    doc.text(
        `Place: ${place.value} | Date: ${date.value} | Signature: ${signature.value}`,
        pageWidth / 2,
        y,
        { align: "center" }
    );

    /* ========= SAVE PDF ========= */
    doc.save(`${fullName.value}_Creative_Resume.pdf`);
}

//============================== EUROPAS_RESUME_10 ==============================
async function generateEuropassResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = 50;

    /* ========= COLORS ========= */
    const COLORS = {
        headerStart: [0, 123, 255], // Blue
        headerEnd: [0, 200, 255],   // Light Blue
        section: [255, 102, 102],  // Red
        panelBg: [245, 247, 255],  // Light panel background
        border: [50, 50, 50],
        textDark: [33, 33, 33],
        textGray: [80, 80, 80],
        highlight: [0, 200, 150]   // Green accent
    };

    /* ========= BORDER ========= */
    function drawBorder() {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 50;
    }

    /* ========= HEADER GRADIENT ========= */
    const headerHeight = 60;
    const steps = 30;
    for (let i = 0; i < steps; i++) {
        const r = Math.round(COLORS.headerStart[0] + ((COLORS.headerEnd[0] - COLORS.headerStart[0]) * i) / steps);
        const g = Math.round(COLORS.headerStart[1] + ((COLORS.headerEnd[1] - COLORS.headerStart[1]) * i) / steps);
        const b = Math.round(COLORS.headerStart[2] + ((COLORS.headerEnd[2] - COLORS.headerStart[2]) * i) / steps);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (headerHeight / steps), pageWidth, headerHeight / steps, "F");
    }

    /* ========= HEADER TEXT ========= */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fullName.value, margin, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${email.value} | ${phone.value} | ${address.value}`, margin, 65);

    /* ========= PHOTO ========= */
    const photo = document.getElementById("photo");
    if (photo.files[0]) {
        const reader = new FileReader();
        await new Promise(resolve => {
            reader.onload = e => {
                doc.addImage(e.target.result, "JPEG", pageWidth - 110, 15, 85, 85, undefined, "FAST");
                resolve();
            };
            reader.readAsDataURL(photo.files[0]);
        });
    }

    y = 90;

    /* ========= SECTION FUNCTIONS ========= */
    function section(title, color = COLORS.section) {
        if (y > pageHeight - 100) addNewPage();

        // Section heading
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...color);
        doc.text(title.toUpperCase(), margin, y);
        y += 6;

        // Underline
        doc.setLineWidth(1);
        doc.setDrawColor(...color);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;

        // Body
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textGray);
    }

    function paragraph(text, spacing = 14) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - 90) addNewPage();
            doc.text(line, margin, y);
            y += spacing;
        });
        y += 6;
    }

    function bulletList(text) {
        if (!text) return;
        text.split(",").forEach(item => {
            if (y > pageHeight - 90) addNewPage();
            doc.text(`• ${item.trim()}`, margin, y);
            y += 13;
        });
        y += 6;
    }

    /* ========= EUROPASS RESUME CONTENT ========= */
    section("Personal Information", COLORS.highlight);
    paragraph(`Name: ${fullName.value}`);
    paragraph(`Date of Birth: ${dob.value}`);
    paragraph(`Address: ${address.value}`);
    paragraph(`Email: ${email.value} | Phone: ${phone.value}`);

    section("Work Experience", COLORS.section);
    paragraph(experience.value);

    section("Education & Training", COLORS.highlight);
    paragraph(education.value);

    section("Academic Qualifications", COLORS.section);
    document.querySelectorAll(".academicRow").forEach(row => {
        const i = row.querySelectorAll("input");
        const line = `${i[0].value} - ${i[1].value} (${i[2].value}) — GPA: ${i[3].value}`;
        if (y > pageHeight - 90) addNewPage();
        doc.text(line, margin, y);
        y += 14;
    });
    y += 6;

    section("Skills & Competences", COLORS.highlight);
    bulletList(skills.value);

    section("Languages", COLORS.section);
    paragraph(Languages.value);

    section("Additional Information", COLORS.highlight);
    paragraph(additionalInfo.value);

    section("Declaration", COLORS.section);
    paragraph(declaration.value);

    /* ========= FOOTER ========= */
    y = pageHeight - 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textDark);
    doc.text(
        `Place: ${place.value} | Date: ${date.value} | Signature: ${signature.value}`,
        pageWidth / 2,
        y,
        { align: "center" }
    );

    /* ========= SAVE PDF ========= */
    doc.save(`${fullName.value}_Europass_Resume.pdf`);
}


//=============================
// ========== PAYMENT & PDF ==========
