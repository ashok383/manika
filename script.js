// Helper to safely get value from input elements or fallback to default
function val(id, fallback = "") {
    const el = document.getElementById(id);
    return el && el.value !== undefined ? el.value.trim() : fallback;
}

// Helper to convert uploaded photo file into base64 DataURL
async function getPhotoDataUrl() {
    const photoInput = document.getElementById("photo");
    if (!photoInput || !photoInput.files || !photoInput.files[0]) return null;

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(photoInput.files[0]);
    });
}

// Helper to split long text into rows cleanly for auto-table
function getAcademicData() {
    return [...document.querySelectorAll(".academicRow")].map(row => {
        const inputs = row.querySelectorAll("input");
        return [
            inputs[0] ? inputs[0].value : "",
            inputs[1] ? inputs[1].value : "",
            inputs[2] ? inputs[2].value : "",
            inputs[3] ? inputs[3].value : ""
        ];
    });
}

//=============================================== PAY & DOWNLOAD FUNCTION ==============================================
async function payAndDownload() {
    const selected = document.querySelector('input[name="resumeModel"]:checked');
    if (!selected) {
        alert("Please select a resume template before proceeding!");
        return;
    }

    console.log("Selected Model:", selected.value);

    // Direct frontend options (Auto-capture is handled automatically by your Razorpay Dashboard settings)
    const options = {
        key: "rzp_live_Twk0HEUJf6Y43e",
        amount: 100, // 100 paise = 1 INR
        currency: "INR",
        name: "MANIKARNIKA",
        description: selected.value.toUpperCase() + " Resume Download",
        handler: async function (response) {
            // Payment was successful and auto-captured (no auto-refund)
            alert("Payment Successful ✅\nPayment ID: " + response.razorpay_payment_id);

            switch (selected.value.toLowerCase()) {
                case "ats": await generateATSResume(); break;
                case "reverse": await generateReverseChronResume(); break;
                case "hybrid": await generateHybridResume(); break;
                case "onepage": await generateOnePageResume(); break;
                case "targeted": await generateTargetedResume(); break;
                case "functional": await generateFunctionalResume(); break;
                case "executive": await generateExecutiveResume(); break;
                case "academic": await generateAcademicResume(); break;
                case "creative": await generateCreativeResume(); break;
                case "europass": await generateEuropassResume(); break;
                default: alert("Invalid selection!");
            }
        },
        prefill: {
            name: val("fullName"),
            email: val("email"),
            contact: val("phone")
        },
        theme: { color: "#2196f3" }
    };

    if (typeof Razorpay !== "undefined") {
        const rzp = new Razorpay(options);
        rzp.open();
    } else {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
    }
}
window.payAndDownload = payAndDownload;

//=============================================== 1. ATS RESUME ===============================================
async function generateATSResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 75;

    const COLORS = {
        black: [0, 0, 0], text: [45, 45, 45], gray: [110, 110, 110],
        red: [200, 30, 30], skyblue: [0, 168, 255], darkGreen: [21, 128, 61],
        yellow: [245, 166, 35], orange: [217, 119, 6], purple: [88, 28, 135], blue: [37, 117, 252]
    };

    function drawBorder() {
        doc.setDrawColor(...COLORS.black);
        doc.setLineWidth(3);
        doc.rect(22, 22, pageWidth - 44, pageHeight - 44);
    }

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 75;
    }

    drawBorder();

    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(26);
    doc.setTextColor(...COLORS.purple);
    doc.text(val("fullName", "Your Name"), margin, 60);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.gray);
    doc.text(`Father: ${val("fatherName")} | Mother: ${val("motherName")}`, margin, 78);

    y = 105;

    const photoData = await getPhotoDataUrl();
    if (photoData) {
        doc.addImage(photoData, "JPEG", pageWidth - 125, 40, 85, 85, undefined, "FAST");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.text(`DOB: ${val("dob")}`, margin, y); y += 16;
    doc.text(`Email: ${val("email")} | Phone: ${val("phone")}`, margin, y); y += 16;
    doc.text(`Address: ${val("address")}`, margin, y); y += 28;

    function section(title, color) {
        if (y > pageHeight - 120) addNewPage();
        doc.setFont("helvetica", "bolditalic");
        doc.setFontSize(14);
        doc.setTextColor(...color);
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        doc.setLineWidth(1.8);
        doc.line(margin, y, pageWidth - margin, y);
        y += 16;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.text);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 8;
    }

    section("Career Objective", COLORS.red);
    paragraph(val("objective"));

    section("Professional Summary", COLORS.skyblue);
    paragraph(val("summary"));

    section("Academic Qualifications", COLORS.yellow);
    doc.autoTable({
        startY: y,
        head: [["COURSE / DEGREE", "INSTITUTE", "YEAR", "CGPA / %"]],
        body: getAcademicData(),
        theme: "grid",
        styles: { fontSize: 10, textColor: COLORS.text, lineColor: COLORS.black, lineWidth: 1 },
        headStyles: { textColor: COLORS.black, fontStyle: "bold" },
        margin: { left: margin, right: margin },
        didDrawPage: drawBorder
    });
    y = doc.lastAutoTable.finalY + 20;

    section("Professional Experience", COLORS.darkGreen);
    paragraph(val("experience"));

    section("Technical Skills", COLORS.blue);
    val("skills").split(",").forEach(skill => {
        if (!skill.trim()) return;
        if (y > pageHeight - margin) addNewPage();
        doc.text("– " + skill.trim(), margin, y);
        y += 14;
    });
    y += 8;

    section("Key Projects", COLORS.purple);
    paragraph(val("projects"));

    section("Habits & Strengths", COLORS.orange);
    paragraph(val("habits"));

    section("Languages Known", COLORS.skyblue);
    paragraph(val("Languages"));

    section("Declaration", COLORS.red);
    paragraph(val("declaration"));

    if (y > pageHeight - 90) addNewPage();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.text(val("place"), margin, y);
    doc.text(val("date"), pageWidth / 2, y, { align: "center" });
    doc.text(val("signature"), pageWidth - margin, y, { align: "right" });

    doc.save(`${val("fullName", "Resume")}_ATS_Modern_Resume.pdf`);
}

//=============================================== 2. REVERSE CHRONOLOGICAL ===============================================
async function generateReverseChronResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 75;

    const COLORS = {
        black: [0, 0, 0], text: [45, 45, 45], gray: [110, 110, 110],
        red: [200, 30, 30], skyblue: [0, 168, 255], darkGreen: [21, 128, 61],
        yellow: [245, 166, 35], orange: [217, 119, 6], purple: [88, 28, 135], blue: [37, 117, 252]
    };

    function drawBorder() {
        doc.setDrawColor(...COLORS.black);
        doc.setLineWidth(3);
        doc.rect(22, 22, pageWidth - 44, pageHeight - 44);
    }

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 75;
    }

    drawBorder();

    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(26);
    doc.setTextColor(...COLORS.purple);
    doc.text(val("fullName", "Your Name"), margin, 60);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.gray);
    doc.text(`Father: ${val("fatherName")} | Mother: ${val("motherName")}`, margin, 78);

    y = 110;

    const photoData = await getPhotoDataUrl();
    if (photoData) {
        doc.addImage(photoData, "JPEG", pageWidth - 125, 40, 85, 85, undefined, "FAST");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.text(`DOB: ${val("dob")}`, margin, y); y += 16;
    doc.text(`Email: ${val("email")} | Phone: ${val("phone")}`, margin, y); y += 16;
    doc.text(`Address: ${val("address")}`, margin, y); y += 28;

    function section(title, color) {
        if (y > pageHeight - 120) addNewPage();
        doc.setFont("helvetica", "bolditalic");
        doc.setFontSize(14);
        doc.setTextColor(...color);
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        doc.setLineWidth(1.8);
        doc.line(margin, y, pageWidth - margin, y);
        y += 16;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.text);
    }

    function paragraph(text) {
        if (!text) return;
        doc.splitTextToSize(text, pageWidth - margin * 2).forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 8;
    }

    section("Career Objective", COLORS.red);
    paragraph(val("objective"));

    section("Professional Summary", COLORS.skyblue);
    paragraph(val("summary"));

    section("Professional Experience (Latest First)", COLORS.darkGreen);
    val("experience").split("\n\n").forEach(role => {
        if (!role.trim()) return;
        const lines = role.split("\n");
        doc.setFont("helvetica", "bold");
        doc.text(lines[0], margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        lines.slice(1).forEach(point => {
            if (y > pageHeight - margin) addNewPage();
            doc.text("– " + point.replace(/^•/, "").trim(), margin + 10, y);
            y += 13;
        });
        y += 8;
    });

    section("Key Projects", COLORS.purple);
    paragraph(val("projects"));

    section("Technical Skills", COLORS.blue);
    val("skills").split(",").forEach(s => {
        if (!s.trim()) return;
        if (y > pageHeight - margin) addNewPage();
        doc.text("– " + s.trim(), margin, y);
        y += 14;
    });
    y += 8;

    section("Academic Qualifications", COLORS.yellow);
    doc.autoTable({
        startY: y,
        head: [["DEGREE", "INSTITUTE", "YEAR", "CGPA / %"]],
        body: getAcademicData(),
        theme: "grid",
        styles: { fontSize: 10, textColor: COLORS.text, lineColor: COLORS.black, lineWidth: 1 },
        headStyles: { fontStyle: "bold" },
        margin: { left: margin, right: margin },
        didDrawPage: drawBorder
    });
    y = doc.lastAutoTable.finalY + 20;

    section("Languages Known", COLORS.skyblue);
    paragraph(val("Languages"));

    section("Strengths / Habits", COLORS.orange);
    paragraph(val("habits"));

    section("Declaration", COLORS.red);
    paragraph(val("declaration"));

    if (y > pageHeight - 90) addNewPage();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.text(val("place"), margin, y);
    doc.text(val("date"), pageWidth / 2, y, { align: "center" });
    doc.text(val("signature"), pageWidth - margin, y, { align: "right" });

    doc.save(`${val("fullName", "Resume")}_Reverse_Chronological_Resume.pdf`);
}

//=============================================== 3. HYBRID RESUME ===============================================
async function generateHybridResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 75;

    const COLORS = {
        text: [40, 40, 40], gray: [90, 90, 90], purple: [106, 17, 203],
        blue: [37, 117, 252], pink: [233, 30, 99], green: [0, 150, 136],
        orange: [255, 152, 0], panelBg: [248, 250, 255], lightGreen: [224, 242, 241], mint: [240, 255, 250]
    };

    function drawBorder() {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(4);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 75;
    }

    drawBorder();

    const headerHeight = 85;
    for (let i = 0; i < headerHeight; i++) {
        const r = COLORS.purple[0] + (COLORS.blue[0] - COLORS.purple[0]) * (i / headerHeight);
        const g = COLORS.purple[1] + (COLORS.blue[1] - COLORS.purple[1]) * (i / headerHeight);
        const b = COLORS.purple[2] + (COLORS.blue[2] - COLORS.purple[2]) * (i / headerHeight);
        doc.setDrawColor(r, g, b);
        doc.line(20, 20 + i, pageWidth - 20, 20 + i);
    }

    const photoData = await getPhotoDataUrl();
    if (photoData) {
        doc.addImage(photoData, "JPEG", pageWidth - 130, 28, 75, 75, undefined, "FAST");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(val("fullName", "Your Name"), margin, 55);

    doc.setFontSize(10.5);
    doc.text(`Father: ${val("fatherName")} | Mother: ${val("motherName")}`, margin, 72);

    y = 130;
    doc.setTextColor(...COLORS.text);

    doc.setFillColor(...COLORS.panelBg);
    doc.roundedRect(margin - 10, y - 20, pageWidth - margin * 2 + 20, 70, 8, 8, "F");

    doc.setFontSize(10.5);
    doc.text(`DOB: ${val("dob")}`, margin, y); y += 15;
    doc.text(`Email: ${val("email")} | Phone: ${val("phone")}`, margin, y); y += 15;
    doc.text(`Address: ${val("address")}`, margin, y); y += 35;

    function section(title, color) {
        if (y > pageHeight - 120) addNewPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...color);
        doc.text(title, margin, y);
        y += 5;
        doc.setLineWidth(2);
        doc.line(margin, y, pageWidth - margin, y);
        y += 16;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.text);
    }

    function paragraph(text) {
        if (!text) return;
        doc.splitTextToSize(text, pageWidth - margin * 2).forEach(line => {
            if (y > pageHeight - margin) addNewPage();
            doc.text(line, margin, y);
            y += 14;
        });
        y += 8;
    }

    section("Professional Summary", COLORS.blue);
    paragraph(val("summary"));

    section("Core Skills & Competencies", COLORS.orange);
    val("skills").split(",").forEach(s => {
        if (!s.trim()) return;
        if (y > pageHeight - margin) addNewPage();
        doc.text("• " + s.trim(), margin, y);
        y += 14;
    });
    y += 8;

    section("Career Objective", COLORS.pink);
    paragraph(val("objective"));

    section("Professional Experience", COLORS.green);
    paragraph(val("experience"));

    section("Projects & Practical Work", COLORS.blue);
    paragraph(val("projects"));

    section("Academic Qualifications", COLORS.green);
    doc.autoTable({
        startY: y,
        head: [["COURSE / DEGREE", "INSTITUTE", "YEAR", "CGPA / %"]],
        body: getAcademicData(),
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: COLORS.green, textColor: [255, 255, 255], fontStyle: "bold" },
        bodyStyles: { fillColor: COLORS.mint },
        alternateRowStyles: { fillColor: COLORS.lightGreen },
        margin: { left: margin, right: margin },
        didDrawPage: drawBorder
    });
    y = doc.lastAutoTable.finalY + 20;

    section("Habits & Strengths", COLORS.pink);
    paragraph(val("habits"));

    section("Languages Known", COLORS.green);
    paragraph(val("Languages"));

    section("Declaration", COLORS.purple);
    paragraph(val("declaration"));

    if (y > pageHeight - 80) addNewPage();
    doc.setFont("helvetica", "bold");
    doc.text(`Place: ${val("place")}`, margin, y); y += 15;
    doc.text(`Date: ${val("date")}`, margin, y); y += 15;
    doc.text(`Signature: ${val("signature")}`, margin, y);

    doc.save(`${val("fullName", "Resume")}_Hybrid_Resume.pdf`);
}

//=============================================== 4. ONE PAGE RESUME ===============================================
async function generateOnePageResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = 70;

    const COLORS = {
        text: [33, 33, 33], gray: [100, 100, 100], blue: [33, 150, 243],
        teal: [0, 150, 136], purple: [94, 53, 177]
    };

    doc.setFillColor(...COLORS.blue);
    doc.rect(0, 0, pageWidth, 50, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(val("fullName", "Your Name"), margin, 34);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.text(`${val("email")}  |  ${val("phone")}  |  ${val("address")}`, pageWidth - margin, 34, { align: "right" });

    y = 70;
    doc.setTextColor(...COLORS.text);

    function section(title, color) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...color);
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        doc.setLineWidth(1.2);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.text);
    }

    function paragraph(text) {
        if (!text) return;
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach(line => {
            doc.text(line, margin, y);
            y += 12;
        });
        y += 4;
    }

    section("Professional Summary", COLORS.purple);
    paragraph(val("summary"));

    section("Core Skills", COLORS.blue);
    const skillArr = val("skills").split(",").map(s => s.trim()).filter(Boolean);
    const mid = Math.ceil(skillArr.length / 2);
    const col1 = skillArr.slice(0, mid);
    const col2 = skillArr.slice(mid);

    let yStart = y;
    col1.forEach(s => { doc.text("• " + s, margin, y); y += 11; });
    let col1End = y;
    y = yStart;
    col2.forEach(s => { doc.text("• " + s, pageWidth / 2 + 10, y); y += 11; });
    y = Math.max(col1End, y) + 6;

    section("Experience", COLORS.teal);
    paragraph(val("experience"));

    section("Projects", COLORS.blue);
    paragraph(val("projects"));

    section("Education", COLORS.teal);
    doc.autoTable({
        startY: y,
        head: [["Degree", "Institute", "Year", "CGPA"]],
        body: getAcademicData(),
        theme: "plain",
        styles: { fontSize: 9.5, textColor: COLORS.text, cellPadding: 3 },
        headStyles: { textColor: COLORS.blue, fontStyle: "bold" },
        margin: { left: margin, right: margin }
    });
    y = doc.lastAutoTable.finalY + 10;

    section("Languages", COLORS.purple);
    paragraph(val("Languages"));

    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.gray);
    doc.text(`Declaration: ${val("declaration")}`, margin, pageHeight - 45, { maxWidth: pageWidth - margin * 2 });

    doc.setFont("helvetica", "bold");
    doc.text(`${val("place")}  |  ${val("date")}  |  ${val("signature")}`, pageWidth / 2, pageHeight - 25, { align: "center" });

    doc.save(`${val("fullName", "Resume")}_One_Page_Resume.pdf`);
}

//=============================================== 5. TARGETED RESUME ===============================================
async function generateTargetedResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = 40;

    const COLORS = {
        primary: [33, 150, 243], accent: [94, 53, 177], highlight: [255, 152, 0],
        text: [33, 33, 33], gray: [90, 90, 90], panelBg: [248, 250, 255]
    };

    const headerHeight = 75;
    for (let i = 0; i < headerHeight; i++) {
        const r = COLORS.accent[0] + (COLORS.primary[0] - COLORS.accent[0]) * (i / headerHeight);
        const g = COLORS.accent[1] + (COLORS.primary[1] - COLORS.accent[1]) * (i / headerHeight);
        const b = COLORS.accent[2] + (COLORS.primary[2] - COLORS.accent[2]) * (i / headerHeight);
        doc.setDrawColor(r, g, b);
        doc.line(0, i, pageWidth, i);
    }

    const photoData = await getPhotoDataUrl();
    if (photoData) {
        doc.addImage(photoData, "JPEG", pageWidth - 105, 12, 75, 75, undefined, "FAST");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(val("fullName", "Your Name"), margin, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(`Email: ${val("email")} | Phone: ${val("phone")} | Address: ${val("address")}`, margin, 62);

    y = 95;
    doc.setTextColor(...COLORS.text);

    doc.setFillColor(...COLORS.panelBg);
    doc.roundedRect(margin - 5, y - 15, pageWidth - margin * 2 + 10, 45, 6, 6, "F");
    doc.setFontSize(9.5);
    doc.text(`DOB: ${val("dob")} | Father: ${val("fatherName")} | Mother: ${val("motherName")}`, margin, y + 10);
    y += 45;

    function section(title, color = COLORS.accent) {
        if (y > pageHeight - 100) { doc.addPage(); y = 40; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...color);
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        doc.setLineWidth(1.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(...COLORS.text);
    }

    function paragraph(text) {
        if (!text) return;
        doc.splitTextToSize(text, pageWidth - margin * 2).forEach(line => {
            if (y > pageHeight - 50) { doc.addPage(); y = 40; }
            doc.text(line, margin, y);
            y += 13;
        });
        y += 6;
    }

    section("Targeted Objective", COLORS.highlight);
    paragraph(val("objective"));

    section("Professional Summary", COLORS.primary);
    paragraph(val("summary"));

    section("Core Competencies", COLORS.accent);
    const skillList = val("skills").split(",").map(s => s.trim()).filter(Boolean);
    const mid = Math.ceil(skillList.length / 2);
    let yL = y, yR = y;
    skillList.slice(0, mid).forEach(s => { doc.text("• " + s, margin, yL); yL += 12; });
    skillList.slice(mid).forEach(s => { doc.text("• " + s, pageWidth / 2 + 10, yR); yR += 12; });
    y = Math.max(yL, yR) + 8;

    section("Work Experience", COLORS.primary);
    paragraph(val("experience"));

    section("Projects", COLORS.highlight);
    paragraph(val("projects"));

    section("Education", COLORS.accent);
    doc.autoTable({
        startY: y,
        body: getAcademicData().map(i => [`${i[0]} - ${i[1]}`, `${i[2]} | ${i[3]}`]),
        theme: "plain",
        styles: { fontSize: 10, textColor: COLORS.text, cellPadding: 3 },
        columnStyles: { 1: { halign: "right" } },
        margin: { left: margin, right: margin }
    });
    y = doc.lastAutoTable.finalY + 12;

    section("Languages Known", COLORS.primary);
    paragraph(val("Languages"));

    section("Declaration", COLORS.accent);
    paragraph(val("declaration"));

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.gray);
    doc.text(`${val("place")} | ${val("date")} | ${val("signature")}`, pageWidth / 2, pageHeight - 25, { align: "center" });

    doc.save(`${val("fullName", "Resume")}_Targeted_Resume.pdf`);
}

//=============================================== 6. FUNCTIONAL RESUME ===============================================
async function generateFunctionalResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 50;

    const COLORS = {
        gradientStart: [98, 0, 234], gradientEnd: [33, 150, 243],
        section: [255, 152, 0], panelBg: [245, 247, 255],
        border: [50, 50, 50], text: [33, 33, 33], textGray: [80, 80, 80]
    };

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

    const headerHeight = 65;
    for (let i = 0; i < 30; i++) {
        const r = Math.round(COLORS.gradientStart[0] + ((COLORS.gradientEnd[0] - COLORS.gradientStart[0]) * i) / 30);
        const g = Math.round(COLORS.gradientStart[1] + ((COLORS.gradientEnd[1] - COLORS.gradientStart[1]) * i) / 30);
        const b = Math.round(COLORS.gradientStart[2] + ((COLORS.gradientEnd[2] - COLORS.gradientStart[2]) * i) / 30);
        doc.setFillColor(r, g, b);
        doc.rect(0, i * (headerHeight / 30), pageWidth, headerHeight / 30, "F");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(val("fullName", "Your Name"), margin, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${val("email")} | ${val("phone")} | ${val("address")}`, margin, 58);

    const photoData = await getPhotoDataUrl();
    if (photoData) {
        doc.addImage(photoData, "JPEG", pageWidth - 110, 12, 75, 75, undefined, "FAST");
    }

    y = 90;

    function section(title) {
        if (y > pageHeight - 100) addNewPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...COLORS.section);
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        doc.setLineWidth(1.2);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(...COLORS.text);
    }

    function paragraph(text) {
        if (!text) return;
        doc.splitTextToSize(text, pageWidth - margin * 2).forEach(line => {
            if (y > pageHeight - 50) addNewPage();
            doc.text(line, margin, y);
            y += 13;
        });
        y += 8;
    }

    doc.setFillColor(...COLORS.panelBg);
    doc.roundedRect(margin - 5, y, pageWidth - margin * 2 + 10, 35, 6, 6, "F");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textGray);
    doc.text(`DOB: ${val("dob")} | Father: ${val("fatherName")} | Mother: ${val("motherName")}`, margin + 5, y + 21);
    y += 50;

    section("Career Objective");
    paragraph(val("objective"));

    section("Professional Summary");
    paragraph(val("summary"));

    section("Functional Competencies & Skills");
    val("skills").split(",").forEach(skill => {
        if (!skill.trim()) return;
        if (y > pageHeight - 50) addNewPage();
        doc.text("• " + skill.trim(), margin, y);
        y += 13;
    });
    y += 8;

    section("Professional Experience");
    paragraph(val("experience"));

    section("Featured Projects");
    paragraph(val("projects"));

    section("Academic Qualifications");
    doc.autoTable({
        startY: y,
        head: [["Course / Degree", "Institute", "Year", "CGPA / %"]],
        body: getAcademicData(),
        theme: "grid",
        styles: { fontSize: 10, textColor: COLORS.text, cellPadding: 4 },
        headStyles: { fillColor: COLORS.gradientStart, textColor: [255, 255, 255], fontStyle: "bold" },
        margin: { left: margin, right: margin },
        didDrawPage: drawBorder
    });
    y = doc.lastAutoTable.finalY + 16;

    section("Languages Known");
    paragraph(val("Languages"));

    section("Strengths & Habits");
    paragraph(val("habits"));

    section("Declaration");
    paragraph(val("declaration"));

    if (y > pageHeight - 60) addNewPage();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textGray);
    doc.text(val("place"), margin, pageHeight - 35);
    doc.text(val("date"), pageWidth / 2, pageHeight - 35, { align: "center" });
    doc.text(val("signature"), pageWidth - margin, pageHeight - 35, { align: "right" });

    doc.save(`${val("fullName", "Resume")}_Functional_Resume.pdf`);
}

//=============================================== 7. EXECUTIVE RESUME ===============================================
async function generateExecutiveResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 60;

    const COLORS = {
        primary: [20, 30, 48],
        accent: [212, 175, 55],
        text: [40, 40, 40]
    };

    function drawBorder() {
        doc.setDrawColor(...COLORS.primary);
        doc.setLineWidth(4);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    doc.setFillColor(...COLORS.primary);
    doc.rect(20, 20, pageWidth - 40, 85, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(val("fullName", "Your Name"), margin, 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.accent);
    doc.text(`EXECUTIVE LEADERSHIP PROFILE | ${val("email")} | ${val("phone")}`, margin, 75);

    const photoData = await getPhotoDataUrl();
    if (photoData) {
        doc.addImage(photoData, "JPEG", pageWidth - 115, 27, 70, 70, undefined, "FAST");
    }

    y = 130;
    doc.setTextColor(...COLORS.text);

    function section(title) {
        if (y > pageHeight - 100) addNewPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...COLORS.primary);
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        doc.setDrawColor(...COLORS.accent);
        doc.setLineWidth(1.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(...COLORS.text);
    }

    function paragraph(text) {
        if (!text) return;
        doc.splitTextToSize(text, pageWidth - margin * 2).forEach(line => {
            if (y > pageHeight - 50) addNewPage();
            doc.text(line, margin, y);
            y += 13;
        });
        y += 8;
    }

    section("Executive Summary");
    paragraph(val("summary"));

    section("Core Leadership & Expertise");
    val("skills").split(",").forEach(s => {
        if (!s.trim()) return;
        if (y > pageHeight - 50) addNewPage();
        doc.text("• " + s.trim(), margin, y);
        y += 13;
    });
    y += 8;

    section("Professional Experience");
    paragraph(val("experience"));

    section("Strategic Projects");
    paragraph(val("projects"));

    section("Credentials & Education");
    doc.autoTable({
        startY: y,
        head: [["Degree", "Institute", "Year", "CGPA / %"]],
        body: getAcademicData(),
        theme: "grid",
        styles: { fontSize: 10, textColor: COLORS.text, cellPadding: 4 },
        headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: "bold" },
        margin: { left: margin, right: margin },
        didDrawPage: drawBorder
    });
    y = doc.lastAutoTable.finalY + 16;

    section("Declaration");
    paragraph(val("declaration"));

    if (y > pageHeight - 50) addNewPage();
    doc.setFont("helvetica", "bold");
    doc.text(`Location: ${val("place")}   |   Date: ${val("date")}`, margin, y);
    doc.text(`Signature: ${val("signature")}`, pageWidth - margin, y, { align: "right" });

    doc.save(`${val("fullName", "Resume")}_Executive_Resume.pdf`);
}

//=============================================== 8. ACADEMIC RESUME ===============================================
async function generateAcademicResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 60;

    const COLORS = { primary: [0, 51, 102], accent: [112, 128, 144], text: [40, 40, 40] };

    function drawBorder() {
        doc.setDrawColor(...COLORS.primary);
        doc.setLineWidth(1);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.primary);
    doc.text(val("fullName", "Your Name"), margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.accent);
    doc.text(`Email: ${val("email")} | Phone: ${val("phone")} | Address: ${val("address")}`, margin, y + 16);

    const photoData = await getPhotoDataUrl();
    if (photoData) {
        doc.addImage(photoData, "JPEG", pageWidth - 115, 30, 70, 70, undefined, "FAST");
    }

    y += 45;

    function section(title) {
        if (y > pageHeight - 100) addNewPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12.5);
        doc.setTextColor(...COLORS.primary);
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        doc.setLineWidth(1);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(...COLORS.text);
    }

    function paragraph(text) {
        if (!text) return;
        doc.splitTextToSize(text, pageWidth - margin * 2).forEach(line => {
            if (y > pageHeight - 50) addNewPage();
            doc.text(line, margin, y);
            y += 13;
        });
        y += 6;
    }

    section("Academic Objective");
    paragraph(val("objective"));

    section("Educational Qualifications");
    doc.autoTable({
        startY: y,
        head: [["Qualification", "Institution", "Year", "CGPA / %"]],
        body: getAcademicData(),
        theme: "grid",
        styles: { fontSize: 10, textColor: COLORS.text, cellPadding: 4 },
        headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: "bold" },
        margin: { left: margin, right: margin },
        didDrawPage: drawBorder
    });
    y = doc.lastAutoTable.finalY + 16;

    section("Academic & Research Experience");
    paragraph(val("experience"));

    section("Projects & Publications");
    paragraph(val("projects"));

    section("Specialization & Skills");
    paragraph(val("skills"));

    section("Languages & Competencies");
    paragraph(val("Languages"));

    section("Declaration");
    paragraph(val("declaration"));

    if (y > pageHeight - 50) addNewPage();
    doc.setFont("helvetica", "italic");
    doc.text(`${val("place")}  |  ${val("date")}`, margin, y);
    doc.text(val("signature"), pageWidth - margin, y, { align: "right" });

    doc.save(`${val("fullName", "Resume")}_Academic_Resume.pdf`);
}

//=============================================== 9. CREATIVE RESUME ===============================================
async function generateCreativeResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 65;

    const COLORS = {
        primary: [255, 64, 129], secondary: [0, 230, 118],
        dark: [33, 33, 33], gray: [120, 120, 120]
    };

    function drawBorder() {
        doc.setDrawColor(...COLORS.primary);
        doc.setLineWidth(3);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 65;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(...COLORS.primary);
    doc.text(val("fullName", "Your Name"), margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...COLORS.gray);
    doc.text(`${val("email")}  •  ${val("phone")}  •  ${val("address")}`, margin, y + 16);

    const photoData = await getPhotoDataUrl();
    if (photoData) {
        doc.addImage(photoData, "JPEG", pageWidth - 115, 30, 75, 75, undefined, "FAST");
    }

    y += 45;

    function section(title) {
        if (y > pageHeight - 100) addNewPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...COLORS.primary);
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        doc.setDrawColor(...COLORS.secondary);
        doc.setLineWidth(2);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(...COLORS.dark);
    }

    function paragraph(text) {
        if (!text) return;
        doc.splitTextToSize(text, pageWidth - margin * 2).forEach(line => {
            if (y > pageHeight - 50) addNewPage();
            doc.text(line, margin, y);
            y += 13;
        });
        y += 8;
    }

    section("Profile & Vision");
    paragraph(val("summary"));

    section("Creative Portfolio & Projects");
    paragraph(val("projects"));

    section("Experience");
    paragraph(val("experience"));

    section("Skills & Toolset");
    paragraph(val("skills"));

    section("Education");
    doc.autoTable({
        startY: y,
        head: [["Degree", "Institute", "Year", "Grade"]],
        body: getAcademicData(),
        theme: "plain",
        styles: { fontSize: 10, textColor: COLORS.dark, cellPadding: 4 },
        headStyles: { textColor: COLORS.primary, fontStyle: "bold" },
        margin: { left: margin, right: margin },
        didDrawPage: drawBorder
    });
    y = doc.lastAutoTable.finalY + 16;

    section("Declaration");
    paragraph(val("declaration"));

    if (y > pageHeight - 50) addNewPage();
    doc.setFont("helvetica", "bold");
    doc.text(`${val("place")} | ${val("date")} | ${val("signature")}`, margin, y);

    doc.save(`${val("fullName", "Resume")}_Creative_Resume.pdf`);
}

//=============================================== 10. EUROPASS RESUME ===============================================
async function generateEuropassResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    let y = 60;

    const COLORS = {
        primary: [0, 51, 153], text: [40, 40, 40],
        gray: [100, 100, 100], bg: [240, 244, 248]
    };

    function drawBorder() {
        doc.setDrawColor(...COLORS.primary);
        doc.setLineWidth(2);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    }
    drawBorder();

    function addNewPage() {
        doc.addPage();
        drawBorder();
        y = 60;
    }

    doc.setFillColor(...COLORS.bg);
    doc.rect(20, 20, pageWidth - 40, 80, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.primary);
    doc.text(val("fullName", "Your Name"), margin, 52);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text(`Email: ${val("email")}  |  Phone: ${val("phone")}  |  Address: ${val("address")}`, margin, 74);

    const photoData = await getPhotoDataUrl();
    if (photoData) {
        doc.addImage(photoData, "JPEG", pageWidth - 110, 25, 68, 68, undefined, "FAST");
    }

    y = 120;

    function section(title) {
        if (y > pageHeight - 100) addNewPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12.5);
        doc.setTextColor(...COLORS.primary);
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        doc.setLineWidth(1.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(...COLORS.text);
    }

    function paragraph(text) {
        if (!text) return;
        doc.splitTextToSize(text, pageWidth - margin * 2).forEach(line => {
            if (y > pageHeight - 50) addNewPage();
            doc.text(line, margin, y);
            y += 13;
        });
        y += 8;
    }

    section("Personal Information");
    paragraph(`Date of Birth: ${val("dob")} | Father's Name: ${val("fatherName")} | Mother's Name: ${val("motherName")}`);

    section("Work Experience");
    paragraph(val("experience"));

    section("Education and Training");
    doc.autoTable({
        startY: y,
        head: [["Degree / Diploma", "Institution", "Period", "Grade"]],
        body: getAcademicData(),
        theme: "grid",
        styles: { fontSize: 10, textColor: COLORS.text, cellPadding: 4 },
        headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: "bold" },
        margin: { left: margin, right: margin },
        didDrawPage: drawBorder
    });
    y = doc.lastAutoTable.finalY + 16;

    section("Personal Skills & Competences");
    paragraph(`Languages: ${val("Languages")}\nTechnical Skills: ${val("skills")}\nHabits & Strengths: ${val("habits")}`);

    section("Projects & Additional Info");
    paragraph(val("projects"));

    section("Declaration");
    paragraph(val("declaration"));

    if (y > pageHeight - 50) addNewPage();
    doc.setFont("helvetica", "italic");
    doc.text(`${val("place")}  |  ${val("date")}`, margin, y);
    doc.text(val("signature"), pageWidth - margin, y, { align: "right" });

    doc.save(`${val("fullName", "Resume")}_Europass_Resume.pdf`);
}
