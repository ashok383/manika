

//=============================================== PAY & DOWNLOAD FUNCTION ==============================================\\
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
        name: "MANIK_A_RNIKA",
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

/* ==========================================================================
   RESUME PDF GENERATORS - 10 distinct templates (jsPDF + jsPDF-AutoTable)

   Needs only jsPDF + jsPDF-AutoTable on the page. The generators read your form
   directly (#photo #fullName #fatherName #motherName #dob #email #phone #address
   #objective #summary .academicRow inputs #education #experience #skill #projects
   #habits #Languages #declaration #place #date #signature), so no helpers are
   required. If your page defines val() / getPhotoDataUrl() / getAcademicData()
   they are used only as fallbacks. Emoji are drawn as small images taken from the
   browser's emoji font (PDF fonts cannot draw them as text), so headings, contact
   lines and any emoji typed in your values all appear. Every template prints every field.

   Template      | Layout                               | Palette            | Font
   --------------|--------------------------------------|--------------------|----------
   1 ATS         | single column, plain text, no photo  | black / grey       | Helvetica
   2 Reverse     | experience timeline with rail + dots | charcoal + red     | Helvetica
   3 Hybrid      | gradient banner, skill chips, cards  | teal + amber       | Helvetica
   4 One Page    | left sidebar, auto-shrinks to 1 page | slate + orange     | Helvetica
   5 Targeted    | objective callout, gold accent bars  | violet + gold      | Helvetica
   6 Functional  | skills first, RIGHT sidebar          | forest green + mint| Helvetica
   7 Executive   | navy band, centred rule headings     | navy + gold        | Times
   8 Academic    | CV style, numbered publications      | maroon + grey      | Times
   9 Creative    | dark sidebar, numbered sections      | magenta + cyan     | Helvetica
   10 Europass   | label column | content column        | EU blue            | Helvetica
   ========================================================================== */

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

//=============================================== SHARED TOOLKIT ===============================================
const RS = (() => {
    const hex = h => { const n = parseInt(h.replace("#", ""), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    // ---- emoji: PDF core fonts cannot draw them, so each one is rendered to a small PNG with the
    //      browser's own emoji font and placed inline (headings, labels, and emoji typed in values).
    const IC = { degree: "\uD83C\uDF93", institute: "\uD83C\uDFDB\uFE0F", year: "\uD83D\uDCC8", grade: "\uD83D\uDCAF", place: "\uD83C\uDFE0", date: "\uD83D\uDCC5", signature: "\u270D\uD83C\uDFFB", dob: "\uD83C\uDF82", father: "\uD83D\uDC68\u200D\uD83D\uDCBC", mother: "\uD83D\uDC69\u200D\uD83C\uDFEB", email: "\uD83D\uDCE9", phone: "\uD83D\uDCDE", address: "\uD83D\uDCCD", objective: "\uD83C\uDFAF", summary: "\uD83D\uDCBC", academic: "\uD83D\uDCC8", education: "\uD83D\uDCD6", experience: "\u2B50", skills: "\uD83D\uDEE0\uFE0F", projects: "\uD83D\uDE80", habits: "\uD83D\uDCAA", languages: "\uD83D\uDDE3\uFE0F", declaration: "\uD83D\uDCDD", person: "\uD83D\uDC69\u200D\uD83C\uDF93" };
    const RULES = [
        [/objective/, IC.objective], [/summary|profile|about me|vision|why i/, IC.summary],
        [/language/, IC.languages], [/skill|competenc|expertise|toolset|specializ/, IC.skills],
        [/project|portfolio|publication|achievement/, IC.projects], [/experience|employment/, IC.experience],
        [/strength|habit/, IC.habits], [/academic|qualif|credential|educat|training/, IC.academic],
        [/declaration/, IC.declaration], [/e-?mail/, IC.email], [/phone|mobile/, IC.phone], [/address|location/, IC.address],
        [/birth|dob|born/, IC.dob], [/father/, IC.father], [/mother/, IC.mother], [/place/, IC.place], [/date/, IC.date],
        [/signature/, IC.signature], [/personal|particulars/, IC.person], [/contact/, IC.phone]
    ];
    const EMRE = /\p{Regional_Indicator}{2}|(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}(?=[️\u{1F3FB}-\u{1F3FF}]))[️\u{1F3FB}-\u{1F3FF}]?(?:‍(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})[️\u{1F3FB}-\u{1F3FF}]?)*/gu;
    const SYM = "0123456789abdeghnopqucksvxyzJL";   // token symbols with near-identical glyph widths
    const reg = [];
    // emoji -> 2-char token ("¤" + symbol) so jsPDF can still measure and wrap the line
    const tok = s => String(s ?? "").replace(EMRE, m => {
        let i = reg.indexOf(m);
        if (i < 0) { if (reg.length >= SYM.length) reg.length = 0; i = reg.push(m) - 1; }
        return "¤" + SYM[i];
    });
    function ic(title) {   // prefix a heading / label with the icon from your form
        title = String(title ?? "");
        if (tok(title) !== title) return title;
        const k = title.toLowerCase(), r = RULES.find(x => x[0].test(k));
        return r ? r[1] + " " + title + " " + r[1] : title;
    }
    const emojiCache = new Map();
    function emojiPng(ch) {
        if (emojiCache.has(ch)) return emojiCache.get(ch);
        let out = null;
        try {
            if (typeof document !== "undefined") {
                const S = 96, cv = document.createElement("canvas"); cv.width = cv.height = S;
                const cx = cv.getContext("2d");
                cx.clearRect(0, 0, S, S);
                cx.font = Math.round(S * 0.78) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';
                cx.textAlign = "center"; cx.textBaseline = "middle";
                cx.fillText(ch, S / 2, S / 2 + S * 0.05);
                out = cv.toDataURL("image/png");
            }
        } catch (e) { out = null; }
        emojiCache.set(ch, out);
        return out;
    }
    // Wraps doc.text / doc.getTextWidth so any string containing emoji is drawn as text + inline images
    function patchEmoji(d) {
        const rawText = d.text.bind(d), rawW = d.getTextWidth.bind(d);
        const fsz = () => d.getFontSize(), slot = () => fsz() * 1.2;
        const has = x => /¤./.test(tok(x));
        const segs = x => {
            x = tok(x); const out = []; let last = 0, m; const re = /¤(.)/g;
            while ((m = re.exec(x))) {
                if (m.index > last) out.push({ t: x.slice(last, m.index) });
                out.push({ e: reg[SYM.indexOf(m[1])] || "" });
                last = re.lastIndex;
            }
            if (last < x.length) out.push({ t: x.slice(last) });
            return out;
        };
        const width = sg => sg.reduce((a, g) => a + (g.e !== undefined ? slot() : rawW(g.t)), 0);
        d.getTextWidth = x => { x = String(x); return has(x) ? width(segs(x)) : rawW(x); };
        d.text = (t, x, y, o) => {
            const lines = Array.isArray(t) ? t : [t];
            if (!lines.some(l => has(String(l)))) return rawText(t, x, y, o);
            const f = fsz(), lh = f * (d.getLineHeightFactor ? d.getLineHeightFactor() : 1.15);
            const opt = Object.assign({}, o), al = opt.align, base = opt.baseline;
            delete opt.align; delete opt.maxWidth;
            lines.forEach((ln, li) => {
                const sg = segs(String(ln)), w = width(sg), cy = y + li * lh;
                let cx = al === "center" ? x - w / 2 : al === "right" ? x - w : x;
                sg.forEach(g => {
                    if (g.e === undefined) { if (g.t) rawText(g.t, cx, cy, opt); cx += rawW(g.t); return; }
                    const img = g.e && emojiPng(g.e);
                    if (img) {
                        const sz = f * 1.1, top = base === "top" ? cy : base === "middle" ? cy - sz / 2 : cy - sz * 0.82;
                        d.addImage(img, "PNG", cx + f * 0.05, top, sz, sz, undefined, "FAST");
                    }
                    cx += slot();
                });
            });
            return d;
        };
    }
    const clean = s => tok(String(s ?? "").replace(/\u00A4/g, ""))
        .replace(/[^\n\r\t -~ -ÿ–—‘’“”•…€™]/g, "")
        .replace(/[ \t]{2,}/g, " ").replace(/ *\n */g, "\n").trim();
    const ALIAS = { skills: ["skill", "skills"] };
    const dmy = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); return m ? `${m[3]}-${m[2]}-${m[1]}` : s; };
    const raw = (id, def) => {
        for (const k of (ALIAS[id] || [id])) {
            if (typeof document !== "undefined") { const el = document.getElementById(k); if (el) return el.value; }
            try { if (typeof val === "function") { const v = val(k, undefined); if (v !== undefined && v !== null && String(v).trim() !== "") return v; } } catch (e) {}
        }
        return def;
    };
    const g = (id, def = "") => {
        let r = clean(raw(id, def));
        if (id === "dob" || id === "date") r = dmy(r);
        if (id === "date" && !r) { const t = new Date(); r = [t.getDate(), t.getMonth() + 1, t.getFullYear()].map((n, i) => i < 2 ? String(n).padStart(2, "0") : n).join("-"); }
        return r || def;
    };
    const list = t => clean(t).split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    const BUL = /^[\u2022\u25AA\u25CF\-\u2013*]+\s*/;
    const isB = s => BUL.test(s);
    const stripB = s => clean(s).replace(BUL, "");

    // Academic rows -> [[degree, institute, year, cgpa], ...]; optionally newest first
    function eduRows(latestFirst) {
        let rows = [];
        if (typeof document !== "undefined") {
            rows = [...document.querySelectorAll("#academicsContainer .academicRow")].map(r => [...r.querySelectorAll("input")].map(i => i.value));
        }
        if (!rows.length) { try { rows = (typeof getAcademicData === "function" && getAcademicData()) || []; } catch (e) { rows = []; } }
        const tidy = s => clean(s).replace(/\(\s*\)/g, "–");
        rows = rows.map(r => { const a = Array.isArray(r) ? r : Object.values(r || {}); return [0, 1, 2, 3].map(i => tidy(a[i])); })
                   .filter(r => r.some(Boolean));
        const yrs = s => (String(s).match(/(?:19|20)\d{2}/g) || []).map(Number);
        if (latestFirst && rows.length > 1 && rows.every(r => yrs(r[2]).length)) {
            rows.sort((a, b) => Math.max(...yrs(b[2])) - Math.max(...yrs(a[2])));
        }
        return rows;
    }

    function newCtx(o = {}) {
        const doc = new window.jspdf.jsPDF("p", "pt", "a4");
        patchEmoji(doc);
        const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
        const x = o.x ?? 45;
        return {
            doc, W, H, x, w: o.w ?? (W - x - (o.right ?? x)),
            top: o.top ?? 50, bottom: o.bottom ?? 50, y: o.top ?? 50,
            decorate: o.decorate || (() => {}), noBreak: false, overflow: false
        };
    }

    // y is always the TOP of the next block. Returns true when a new page was started.
    function need(c, h) {
        if (c.y + h <= c.H - c.bottom) return false;
        if (c.noBreak) { c.overflow = true; return false; }
        c.doc.addPage(); c.decorate(c); c.y = c.top; return true;
    }

    const setF = (d, fam, st, size, col) => {
        d.setFont(fam, st); d.setFontSize(size);
        if (col) d.setTextColor(col[0], col[1], col[2]);
    };

    function wrap(d, text, w) {
        const out = [];
        String(text).split(/\r?\n/).forEach(p => { p = tok(p.trim()); out.push(...(p ? d.splitTextToSize(p, w) : [""])); });
        return out;
    }

    function fitSize(d, text, maxW, size, min = 14) {
        while (size > min) { d.setFontSize(size); if (d.getTextWidth(text) <= maxW) break; size -= 1; }
        d.setFontSize(size); return size;
    }

    function para(c, text, o = {}) {
        text = clean(text); if (!text) return;
        const d = c.doc, size = o.size ?? 10.5, lh = o.lh ?? size * 1.4, x = o.x ?? c.x, w = o.w ?? c.w;
        const fam = o.fam || "helvetica", st = o.style || "normal", col = o.color || [40, 40, 40];
        setF(d, fam, st, size, col);
        wrap(d, text, w).forEach(ln => {
            if (!ln) { c.y += lh * 0.5; return; }
            if (need(c, lh)) setF(d, fam, st, size, col);
            const ax = o.align === "center" ? x + w / 2 : o.align === "right" ? x + w : x;
            d.text(ln, ax, c.y + size * 0.8, o.align ? { align: o.align } : undefined);
            c.y += lh;
        });
        c.y += o.gap ?? 6;
    }

    function bullets(c, items, o = {}) {
        const d = c.doc, size = o.size ?? 10.5, lh = o.lh ?? size * 1.4, ind = o.indent ?? 12;
        const x = o.x ?? c.x, w = o.w ?? c.w, fam = o.fam || "helvetica", col = o.color || [40, 40, 40];
        const mk = o.marker || col;
        items.forEach(it => {
            it = stripB(it); if (!it) return;
            setF(d, fam, "normal", size, col);
            d.splitTextToSize(it, w - ind).forEach((ln, i) => {
                if (need(c, lh)) setF(d, fam, "normal", size, col);
                if (i === 0) {
                    d.setFillColor(mk[0], mk[1], mk[2]);
                    if (o.square) d.rect(x + 1, c.y + size * 0.8 - 5, 4, 4, "F");
                    else d.circle(x + 2.5, c.y + size * 0.8 - 3.2, 1.6, "F");
                }
                d.text(ln, x + ind, c.y + size * 0.8);
                c.y += lh;
            });
        });
        c.y += o.gap ?? 4;
    }

    // Splits free text into roles: [{title, points[]}] or [{text}]
    function parseRoles(text) {
        const bl = clean(text).split(/\n\s*\n/).map(b => b.split("\n").map(s => s.trim()).filter(Boolean)).filter(b => b.length);
        const multi = bl.length > 1, out = [];
        bl.forEach(b => {
            if (isB(b[0])) out.push({ title: "", points: b.map(stripB) });
            else if (b.length === 1) out.push({ title: "", points: [], text: b[0] });
            else if (b.slice(1).some(isB) || multi) out.push({ title: b[0], points: b.slice(1).map(stripB) });
            else out.push({ title: "", points: b.map(stripB) });
        });
        return out;
    }

    function rich(c, text, o = {}) {
        parseRoles(text).forEach(r => {
            if (r.text) { para(c, r.text, Object.assign({}, o, { gap: 5 })); return; }
            if (r.title) para(c, r.title, Object.assign({}, o, { style: "bold", color: o.titleColor || o.color, size: (o.size ?? 10.5) + 0.5, gap: 2 }));
            bullets(c, r.points, Object.assign({}, o, { gap: o.gap ?? 6 }));
        });
    }

    function numbered(c, items, o = {}) {
        const d = c.doc, size = o.size ?? 10.5, lh = o.lh ?? size * 1.4, ind = o.indent ?? 26;
        const fam = o.fam || "helvetica", col = o.color || [40, 40, 40];
        items.map(stripB).filter(Boolean).forEach((it, i) => {
            setF(d, fam, "normal", size, col);
            d.splitTextToSize(it, c.w - ind).forEach((ln, k) => {
                if (need(c, lh)) setF(d, fam, "normal", size, col);
                if (k === 0) {
                    setF(d, fam, "bold", size, o.labelColor || col);
                    d.text(`[${i + 1}]`, c.x, c.y + size * 0.8);
                    setF(d, fam, "normal", size, col);
                }
                d.text(ln, c.x + ind, c.y + size * 0.8);
                c.y += lh;
            });
            c.y += 2;
        });
        c.y += o.gap ?? 4;
    }

    // Multi-column list with square markers
    function grid(c, items, cols, o = {}) {
        if (!items.length) return;
        const d = c.doc, size = o.size ?? 10, lh = o.lh ?? size * 1.45, gx = o.gapx ?? 12, ind = o.indent ?? 11;
        const fam = o.fam || "helvetica", st = o.style || "normal", col = o.color || [40, 40, 40];
        const x0 = o.x ?? c.x, cw = ((o.w ?? c.w) - gx * (cols - 1)) / cols;
        for (let i = 0; i < items.length; i += cols) {
            const row = items.slice(i, i + cols);
            setF(d, fam, st, size, col);
            const ls = row.map(t => d.splitTextToSize(t, cw - ind));
            const rh = Math.max(...ls.map(l => l.length)) * lh;
            if (need(c, rh)) setF(d, fam, st, size, col);
            row.forEach((t, j) => {
                const x = x0 + j * (cw + gx);
                if (o.marker) { d.setFillColor(o.marker[0], o.marker[1], o.marker[2]); d.rect(x, c.y + size * 0.8 - 5, 4.5, 4.5, "F"); }
                ls[j].forEach((ln, k) => d.text(ln, x + ind, c.y + k * lh + size * 0.8));
            });
            c.y += rh + (o.rowGap ?? 2);
        }
        c.y += o.after ?? 6;
    }

    // Pill / tag chips that wrap
    function chips(c, items, o = {}) {
        if (!items.length) return;
        const d = c.doc, size = o.size ?? 9.5, px = o.padX ?? 8, py = o.padY ?? 4.5, gap = o.gap ?? 5;
        const x0 = o.x ?? c.x, w = o.w ?? c.w, fam = o.fam || "helvetica", st = o.style || "normal", col = o.color || [30, 30, 30];
        const h = size + py * 2, rad = o.radius ?? h / 2;
        setF(d, fam, st, size, col);
        let cx = x0, first = true;
        items.forEach(t => {
            const tw = Math.min(d.getTextWidth(t) + px * 2, w);
            if (!first && cx + tw > x0 + w) { cx = x0; c.y += h + gap; }
            if (need(c, h)) { cx = x0; setF(d, fam, st, size, col); }
            first = false;
            let style = "S";
            if (o.fill) { d.setFillColor(o.fill[0], o.fill[1], o.fill[2]); style = "F"; }
            if (o.stroke) { d.setDrawColor(o.stroke[0], o.stroke[1], o.stroke[2]); d.setLineWidth(0.8); style = o.fill ? "FD" : "S"; }
            d.roundedRect(cx, c.y, tw, h, rad, rad, style);
            d.text(t, cx + tw / 2, c.y + py + size * 0.78, { align: "center" });
            cx += tw + gap;
        });
        c.y += h + (o.after ?? 10);
    }

    // Filled text card (optional left bar + small label)
    function card(c, text, o = {}) {
        text = clean(text); if (!text) return;
        const d = c.doc, size = o.size ?? 10.5, lh = o.lh ?? size * 1.45, pad = o.pad ?? 10;
        const x = o.x ?? c.x, w = o.w ?? c.w, bar = o.bar ? 4 : 0;
        const fam = o.fam || "helvetica", st = o.style || "normal", col = o.color || [40, 40, 40];
        setF(d, fam, st, size, col);
        const lines = wrap(d, text, w - pad * 2 - bar);
        const lab = o.label ? 15 : 0;
        const h = lines.length * lh + pad * 2 + lab - (lh - size) * 0.5;
        if (h > c.H - c.top - c.bottom) { para(c, text, Object.assign({}, o, { x, w })); return; }
        need(c, h);
        const f = o.fill || [245, 245, 245];
        d.setFillColor(f[0], f[1], f[2]);
        if (o.grad) gradient(d, x, c.y, w, h, o.grad[0], o.grad[1], 50); else d.roundedRect(x, c.y, w, h, o.radius ?? 3, o.radius ?? 3, "F");
        if (o.bar) { d.setFillColor(o.bar[0], o.bar[1], o.bar[2]); d.rect(x, c.y, 4, h, "F"); }
        if (o.label) { setF(d, "helvetica", "bold", 8, o.labelColor || col); d.text(ic(o.label).toUpperCase(), x + pad + bar, c.y + pad + 7); }
        setF(d, fam, st, size, col);
        lines.forEach((ln, i) => { if (ln) d.text(ln, x + pad + bar, c.y + pad + lab + size * 0.8 + i * lh); });
        c.y += h + (o.gap ?? 10);
    }

    // Label above value (sidebars)
    function kv(c, label, value, o = {}) {
        value = clean(value); if (!value) return;
        const d = c.doc, ls = o.lsize ?? 7.5;
        need(c, 22);
        setF(d, o.fam || "helvetica", "bold", ls, o.lcolor || [120, 120, 120]);
        d.text(ic(label).toUpperCase(), o.x ?? c.x, c.y + ls * 0.8);
        c.y += ls * 1.5;
        para(c, value, { size: o.size ?? 9.5, color: o.color, fam: o.fam, x: o.x, w: o.w, gap: o.gap ?? 5 });
    }

    // Label and value on the same line
    function kvRow(c, label, value, o = {}) {
        value = clean(value); if (!value) return;
        const d = c.doc, size = o.size ?? 10.5, lh = o.lh ?? size * 1.4, lw = (o.lw ?? 90) + 26;
        const fam = o.fam || "helvetica", col = o.color || [40, 40, 40];
        setF(d, fam, "normal", size, col);
        d.splitTextToSize(value, c.w - lw).forEach((ln, i) => {
            if (need(c, lh)) setF(d, fam, "normal", size, col);
            if (i === 0) {
                setF(d, fam, "bold", size, o.lcolor || col);
                d.text(ic(label), c.x, c.y + size * 0.8);
                setF(d, fam, "normal", size, col);
            }
            d.text(ln, c.x + lw, c.y + size * 0.8);
            c.y += lh;
        });
        c.y += o.gap ?? 1;
    }

    // One education entry as text (degree bold, institute below, year | grade on the right)
    function eduEntry(c, r, o = {}) {
        const d = c.doc, size = o.size ?? 10.5, lh = size * 1.4, ind = o.dot ? 14 : 0;
        const x = c.x + ind, w = c.w - ind, fam = o.fam || "helvetica";
        const col = o.color || [30, 30, 30], sub = o.sub || [90, 90, 90];
        const meta = [r[2], r[3] ? (o.cgpa || "CGPA/%") + ": " + r[3] : ""].filter(Boolean).join("   |   ");
        setF(d, fam, "normal", size, sub);
        const mw = (!o.stack && meta) ? d.getTextWidth(meta) : 0;
        setF(d, fam, "bold", size, col);
        const tl = d.splitTextToSize(r[0] || "-", Math.max(80, w - mw - 14));
        setF(d, fam, "normal", size - 0.5, sub);
        const il = r[1] ? d.splitTextToSize(r[1], w) : [];
        const extra = (o.stack && meta) ? 1 : 0;
        need(c, (tl.length + il.length + extra) * lh + 4);
        if (o.dot) { d.setFillColor(o.dot[0], o.dot[1], o.dot[2]); d.circle(c.x + 4, c.y + size * 0.8 - 3, 3, "F"); }
        setF(d, fam, "bold", size, col);
        tl.forEach((ln, i) => d.text(ln, x, c.y + size * 0.8 + i * lh));
        if (meta && !o.stack) { setF(d, fam, "normal", size, sub); d.text(meta, x + w, c.y + size * 0.8, { align: "right" }); }
        c.y += tl.length * lh;
        setF(d, fam, "normal", size - 0.5, sub);
        il.forEach(ln => { d.text(ln, x, c.y + size * 0.8); c.y += lh; });
        if (extra) { d.text(meta, x, c.y + size * 0.8); c.y += lh; }
        c.y += o.gap ?? 6;
    }

    // AutoTable wrapper that keeps page decoration on overflow pages
    function eduTable(c, rows, o = {}) {
        if (!rows.length) return;
        const d = c.doc; need(c, 70);
        const start = d.internal.getCurrentPageInfo().pageNumber;
        d.autoTable({
            startY: c.y,
            head: [o.head || ["Degree", "Institute", "Year", "CGPA / %"]],
            body: rows,
            theme: o.theme || "grid",
            styles: Object.assign({ font: o.font || "helvetica", fontSize: 10, cellPadding: 5, textColor: [40, 40, 40], lineColor: [210, 210, 210], lineWidth: 0.5, overflow: "linebreak" }, o.styles || {}),
            headStyles: Object.assign({ fillColor: [60, 60, 60], textColor: [255, 255, 255], fontStyle: "bold" }, o.headStyles || {}),
            alternateRowStyles: o.alt || {},
            columnStyles: o.columnStyles || {},
            margin: { left: c.x, right: c.W - c.x - c.w, top: c.top, bottom: c.bottom },
            didDrawPage: () => { if (d.internal.getCurrentPageInfo().pageNumber > start) c.decorate(c); }
        });
        c.y = d.lastAutoTable.finalY + (o.after ?? 14);
    }

    // Coloured education table: gradient header row, tinted zebra rows, soft grid lines.
    // Column titles carry the form's icons (graduate, institute, year, grade) on both sides when they fit.
    function eduGrid(c, rows, o = {}) {
        if (!rows.length) return;
        const d = c.doc, fam = o.fam || "helvetica", size = o.size ?? 10, pad = o.pad ?? 6, lh = size * 1.35;
        const c1 = o.c1 || [40, 60, 120], c2 = o.c2 || c1;
        const tint = o.tint || [244, 246, 250], tint2 = o.tint2 || [255, 255, 255];
        const line = o.line || [210, 215, 225], ink = o.ink || [35, 35, 35], hc = o.headColor || [255, 255, 255];
        const names = o.head || ["Degree / Course", "Institute", "Year", "CGPA / %"];
        const fr = o.cols || [0.34, 0.29, 0.17, 0.20];
        const icons = [IC.degree, IC.institute, IC.year, IC.grade];
        const cw = fr.map(f => f * c.w), xs = [];
        cw.reduce((a, w, i) => { xs[i] = a; return a + w; }, c.x);
        const hh = size + pad * 2 + 2;
        const title = i => {
            setF(d, fam, "bold", size, hc);
            const t = names[i];
            for (const v of [icons[i] + " " + t + " " + icons[i], icons[i] + " " + t, t]) if (d.getTextWidth(v) <= cw[i] - pad * 1.4) return v;
            return t;
        };
        const header = () => {
            gradient(d, c.x, c.y, c.w, hh, c1, c2, 50);
            names.forEach((_, i) => {
                const v = title(i), ty = c.y + pad + size * 0.8 + 1;
                if (i < 2) d.text(v, xs[i] + pad, ty); else d.text(v, xs[i] + cw[i] / 2, ty, { align: "center" });
            });
            c.y += hh;
        };
        need(c, hh + size * 3 + pad * 2);
        header();
        rows.forEach((r, ri) => {
            const ls = r.map((t, i) => { setF(d, fam, i === 0 ? "bold" : "normal", size, ink); return d.splitTextToSize(t || "-", cw[i] - pad * 2); });
            const rh = Math.max(...ls.map(l => l.length)) * lh + pad * 2;
            if (need(c, rh)) header();
            const bg = ri % 2 === 0 ? tint : tint2;
            d.setFillColor(bg[0], bg[1], bg[2]); d.rect(c.x, c.y, c.w, rh, "F");
            ls.forEach((lines, i) => {
                setF(d, fam, i === 0 ? "bold" : "normal", size, ink);
                lines.forEach((ln, k) => {
                    const ty = c.y + pad + size * 0.8 + k * lh;
                    if (i < 2) d.text(ln, xs[i] + pad, ty); else d.text(ln, xs[i] + cw[i] / 2, ty, { align: "center" });
                });
            });
            d.setDrawColor(line[0], line[1], line[2]); d.setLineWidth(0.5);
            d.line(c.x, c.y + rh, c.x + c.w, c.y + rh);
            xs.concat([c.x + c.w]).forEach(x => d.line(x, c.y, x, c.y + rh));
            c.y += rh;
        });
        c.y += o.after ?? 12;
    }

    // Place / Date on the left, signature line on the right
    function signOff(c, o = {}) {
        const place = g("place"), date = g("date"), sig = g("signature");
        if (!place && !date && !sig) return;
        const d = c.doc, fam = o.fam || "helvetica", size = o.size ?? 10, col = o.color || [60, 60, 60];
        need(c, size * 4.5); c.y += o.pre ?? 10;
        setF(d, fam, "normal", size, col);
        let ly = c.y;
        if (place) { d.text(`${IC.place} Place: ${place} ${IC.place}`, c.x, ly + size); ly += size * 1.5; }
        if (date) d.text(`${IC.date} Date: ${date} ${IC.date}`, c.x, ly + size);
        if (sig) {
            const sx = c.x + c.w, lc = o.line || col;
            d.setDrawColor(lc[0], lc[1], lc[2]); d.setLineWidth(0.7);
            d.line(sx - 150, c.y + size * 1.2, sx, c.y + size * 1.2);
            setF(d, fam, "italic", size, col);
            d.text(IC.signature + " " + sig + " " + IC.signature, sx, c.y + size * 2.6, { align: "right" });
        }
        c.y += size * 3.4;
    }

    function photo(d, data, x, y, s, frame, lw = 2) {
        if (!data) return false;
        try { d.addImage(data, /^data:image\/png/i.test(data) ? "PNG" : "JPEG", x, y, s, s, undefined, "FAST"); }
        catch (e) { return false; }
        if (frame) { d.setDrawColor(frame[0], frame[1], frame[2]); d.setLineWidth(lw); d.rect(x, y, s, s); }
        return true;
    }

    function gradient(d, x, y, w, h, c1, c2, steps = 48, vertical = false) {
        if (!(w > 0) || !(h > 0)) return;
        const n = Math.max(2, steps), len = (vertical ? h : w) / n;
        for (let i = 0; i < n; i++) {
            const k = mix(c1, c2, i / (n - 1));
            d.setFillColor(k[0], k[1], k[2]);
            if (vertical) d.rect(x, y + i * len, w, len + 0.6, "F");
            else d.rect(x + i * len, y, len + 0.6, h, "F");
        }
    }

    // Reads #photo, centre-crops to a square so it fills the frames without stretching
    async function photoData() {
        try {
            const f = typeof document !== "undefined" && document.getElementById("photo")?.files?.[0];
            if (f) {
                const url = await new Promise((ok, no) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = no; fr.readAsDataURL(f); });
                const img = await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = url; });
                const s = Math.min(img.width, img.height), S = Math.min(520, s);
                const cv = document.createElement("canvas"); cv.width = cv.height = S;
                const cx = cv.getContext("2d");
                cx.fillStyle = "#fff"; cx.fillRect(0, 0, S, S);
                cx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, S, S);
                return cv.toDataURL("image/jpeg", 0.92);
            }
        } catch (e) {}
        try { if (typeof getPhotoDataUrl === "function") return (await getPhotoDataUrl()) || null; } catch (e) {}
        return null;
    }

    // The free-text #education field, printed above/inside the academic table
    function eduNote(c, o = {}) { const t = g("education"); if (t) para(c, IC.education + " " + t + " " + IC.education, Object.assign({ gap: 5 }, o)); }
    const ob = () => g("objective") ? IC.objective + " " + g("objective") + " " + IC.objective : "";
    const nm = () => IC.person + " " + g("fullName", "Your Name") + " " + IC.person;
    const cp = () => [g("email") && IC.email + " " + g("email") + " " + IC.email, g("phone") && IC.phone + " " + g("phone") + " " + IC.phone];
    const ad = () => g("address") ? IC.address + " " + g("address") + " " + IC.address : "";

    function finish(c, file, o = {}) {
        const d = c.doc, n = d.getNumberOfPages();
        if (n > 1 && o.footer !== false) {
            for (let i = 1; i <= n; i++) {
                d.setPage(i); setF(d, o.fam || "helvetica", "normal", 8.5, o.color || [130, 130, 130]);
                d.text(`Page ${i} of ${n}`, o.cx ?? c.x + c.w / 2, c.H - (o.fy ?? 22), { align: "center" });
            }
        }
        d.save(`${g("fullName", "Resume")}_${file}.pdf`);
    }

    return { hex, mix, clean, g, list, eduRows, photoData, eduNote, IC, ic, tok, cp, ad, ob, newCtx, need, setF, wrap, fitSize, para, bullets, parseRoles, rich, numbered,
             grid, chips, card, kv, kvRow, eduEntry, eduTable, eduGrid, nm, signOff, photo, gradient, finish };
})();

//=============================================== 1. ATS RESUME ===============================================
// Parser-safe: one column, no photo/tables/colour, standard headings, comma-separated skills.
async function generateATSResume() {
    const { newCtx, setF, need, para, rich, eduRows, eduEntry, kvRow, signOff, finish, fitSize, g, list } = RS;
    const F = "helvetica", INK = [0, 0, 0], BODY = [35, 35, 35];
    const AC = { navy: RS.hex("#1E3A8A"), mid: RS.hex("#3B82F6"), sky: RS.hex("#60A5FA"), tint: RS.hex("#EFF6FF"), line: RS.hex("#BFDBFE") };
    const c = newCtx({ x: 52, top: 52, bottom: 52, decorate: k => RS.gradient(k.doc, 0, 0, k.W, 6, AC.navy, AC.sky, 60) });
    c.decorate(c);
    const d = c.doc;

    const photoData = await RS.photoData();
    const pw = photoData ? 66 : 0, off = pw ? pw + 12 : 0, nw = c.w - off * 2, cx = c.x + off, y0 = c.y;
    setF(d, F, "bold", 22, AC.navy);
    const name = RS.nm().toUpperCase();
    fitSize(d, name, nw, 22, 12);
    d.text(name, c.x + c.w / 2, c.y + 18, { align: "center" });
    c.y += 30;
    para(c, RS.cp().filter(Boolean).join("  |  "), { size: 10, color: BODY, align: "center", x: cx, w: nw, gap: 0 });
    para(c, RS.ad(), { size: 10, color: BODY, align: "center", x: cx, w: nw, gap: 2 });
    if (photoData) { RS.photo(d, photoData, c.x + c.w - pw, y0, pw, [0, 0, 0], 0.8); c.y = Math.max(c.y, y0 + pw + 4); }

    const head = t => {
        need(c, 44); c.y += 10;
        setF(d, F, "bold", 11, AC.navy);
        d.text(t.toUpperCase(), c.x, c.y + 9);
        c.y += 14;
        RS.gradient(d, c.x, c.y, c.w, 1.6, AC.navy, AC.sky, 60);
        c.y += 8;
    };
    const block = (t, s) => { if (!s) return; head(t); para(c, s, { color: BODY }); };

    block(RS.ic("Career Objective"), g("objective"));
    block(RS.ic("Professional Summary"), g("summary"));
    if (g("skills")) { head(RS.ic("Technical Skills")); para(c, list(g("skills")).join(", "), { color: BODY }); }
    if (g("experience")) { head(RS.ic("Work Experience")); rich(c, g("experience"), { color: BODY, titleColor: INK, marker: INK }); }
    if (g("projects")) { head(RS.ic("Projects")); rich(c, g("projects"), { color: BODY, titleColor: INK, marker: INK }); }
    const edu = eduRows(true);
    if (edu.length || g("education")) { head(RS.ic("Education")); RS.eduNote(c, { color: INK, style: "bold" }); RS.eduGrid(c, edu, { c1: AC.navy, c2: AC.mid, tint: AC.tint, line: AC.line, ink: INK }); }
    block(RS.ic("Languages Known"), g("Languages"));
    block(RS.ic("Strengths"), g("habits"));
    const pd = [["Date of Birth", g("dob")], ["Father's Name", g("fatherName")], ["Mother's Name", g("motherName")]].filter(r => r[1]);
    if (pd.length) { head(RS.ic("Personal Details")); pd.forEach(r => kvRow(c, r[0], r[1], { lw: 110, color: BODY, lcolor: AC.navy })); }
    block(RS.ic("Declaration"), g("declaration"));
    signOff(c, { color: BODY });
    finish(c, "ATS_Modern_Resume");
}

//=============================================== 2. REVERSE CHRONOLOGICAL ===============================================
// Timeline rail with dots, latest first (education auto-sorted by year), charcoal + red.
async function generateReverseChronResume() {
    const { newCtx, setF, need, para, parseRoles, grid, eduRows, eduTable, kvRow, signOff, finish, fitSize, photo, hex, g, list } = RS;
    const F = "helvetica";
    const C = { ink: hex("#1F2937"), body: hex("#374151"), mute: hex("#6B7280"), red: hex("#C0392B"), rail: hex("#D1D5DB"), band: hex("#F3F4F6") };
    const photoData = await RS.photoData();
    const c = newCtx({ x: 48, top: 46, bottom: 50, decorate: k => RS.gradient(k.doc, 0, 0, k.W, 7, C.ink, C.red, 60) });
    c.decorate(c);
    const d = c.doc, y0 = c.y;

    const pw = photoData ? 76 : 0, tw = c.w - (pw ? pw + 14 : 0);
    const name = RS.nm();
    setF(d, F, "bold", 26, C.ink); fitSize(d, name, tw, 26, 14);
    d.text(name, c.x, c.y + 22);
    c.y += 32;
    para(c, RS.cp().filter(Boolean).join("   \u2022   "), { size: 10, color: C.red, style: "bold", w: tw, gap: 1 });
    para(c, RS.ad(), { size: 10, color: C.mute, w: tw, gap: 1 });
    const pd = [g("dob") && `${RS.IC.dob} DOB: ${g("dob")} ${RS.IC.dob}`, g("fatherName") && `${RS.IC.father} Father: ${g("fatherName")} ${RS.IC.father}`, g("motherName") && `${RS.IC.mother} Mother: ${g("motherName")} ${RS.IC.mother}`].filter(Boolean).join("   |   ");
    para(c, pd, { size: 9.5, color: C.mute, w: tw, gap: 0 });
    if (photoData) photo(d, photoData, c.x + c.w - pw, y0, pw, C.red, 2);
    c.y = Math.max(c.y, y0 + pw) + 10;
    RS.gradient(d, c.x, c.y, c.w, 2.2, C.ink, C.red, 60); c.y += 8;

    const h = t => {
        need(c, 44); c.y += 8;
        d.setFillColor(...C.red); d.rect(c.x, c.y + 1, 8, 8, "F");
        setF(d, F, "bold", 12, C.ink); d.text(t.toUpperCase(), c.x + 15, c.y + 9);
        c.y += 17;
        RS.gradient(d, c.x, c.y, c.w, 1.6, C.red, C.rail, 60);
        c.y += 8;
    };

    if (g("objective")) { h(RS.ic("Career Objective")); para(c, g("objective"), { color: C.body }); }
    if (g("summary")) { h(RS.ic("Professional Summary")); para(c, g("summary"), { color: C.body }); }

    const roles = parseRoles(g("experience"));
    if (roles.length) {
        h(RS.ic("Professional Experience (Latest First)"));
        const rx = c.x + 5, ind = 24, lh = 13.5;
        const put = (txt, x, size, style, col, step, kind) => {
            need(c, step);
            d.setDrawColor(...C.rail); d.setLineWidth(1.6); d.line(rx, c.y, rx, c.y + step);
            if (kind === "dot") {
                d.setFillColor(255, 255, 255); d.circle(rx, c.y + 8, 6, "F");
                d.setFillColor(...C.red); d.circle(rx, c.y + 8, 3.8, "F");
            } else if (kind === "bul") {
                d.setFillColor(...C.mute); d.circle(c.x + ind + 2.5, c.y + size * 0.8 - 3.2, 1.5, "F");
            }
            setF(d, F, style, size, col);
            d.text(txt, x, c.y + size * 0.8);
            c.y += step;
        };
        roles.forEach(r => {
            if (r.text) { para(c, r.text, { x: c.x + ind, w: c.w - ind, color: C.body, gap: 6 }); return; }
            let first = true;
            if (r.title) {
                setF(d, F, "bold", 11.5, C.ink);
                d.splitTextToSize(r.title, c.w - ind).forEach(t => { put(t, c.x + ind, 11.5, "bold", C.ink, 15, first ? "dot" : null); first = false; });
            }
            r.points.forEach(p => {
                setF(d, F, "normal", 10.5, C.body);
                d.splitTextToSize(p, c.w - ind - 12).forEach((t, i) => {
                    put(t, c.x + ind + 12, 10.5, "normal", C.body, lh, i === 0 ? (first ? "dot" : "bul") : null);
                    if (i === 0) first = false;
                });
            });
            d.setDrawColor(...C.rail); d.setLineWidth(1.6); d.line(rx, c.y, rx, c.y + 8);
            c.y += 8;
        });
        c.y += 4;
    }

    if (g("projects")) {
        h(RS.ic("Key Projects"));
        RS.rich(c, g("projects"), { color: C.body, titleColor: C.ink, marker: C.red });
    }
    const edu = eduRows(true);
    if (edu.length || g("education")) {
        h(RS.ic("Education")); RS.eduNote(c, { color: C.body, style: "bold" });
        RS.eduGrid(c, edu, { head: ["Degree / Course", "Institute", "Year", "CGPA / %"], c1: C.ink, c2: C.red, tint: C.band, line: C.rail, ink: C.body });
    }
    if (g("skills")) { h(RS.ic("Technical Skills")); grid(c, list(g("skills")), 3, { color: C.body, marker: C.red }); }
    if (g("Languages")) { h(RS.ic("Languages Known")); para(c, g("Languages"), { color: C.body }); }
    if (g("habits")) { h(RS.ic("Strengths / Habits")); para(c, g("habits"), { color: C.body }); }
    if (g("declaration")) { h(RS.ic("Declaration")); para(c, g("declaration"), { color: C.body, style: "italic" }); }
    signOff(c, { color: C.mute, line: C.red });
    finish(c, "Reverse_Chronological_Resume", { color: C.mute });
}

//=============================================== 3. HYBRID RESUME ===============================================
// Teal gradient banner, summary card, skill chips up top, two-up info cards.
async function generateHybridResume() {
    const { newCtx, setF, need, para, rich, card, chips, gradient, eduRows, eduTable, kvRow, signOff, finish, fitSize, photo, hex, g, list } = RS;
    const F = "helvetica";
    const C = { dk: hex("#115E59"), teal: hex("#0D9488"), light: hex("#CCFBF1"), mint: hex("#F0FDFA"), amber: hex("#F59E0B"), ink: hex("#134E4A"), body: hex("#2D3B3A") };
    const photoData = await RS.photoData();
    const c = newCtx({ x: 46, top: 46, bottom: 50, decorate: k => RS.gradient(k.doc, 0, 0, k.W, 8, C.dk, C.amber, 60) });
    const d = c.doc;

    gradient(d, 0, 0, c.W, 132, C.dk, C.teal);
    d.setFillColor(...C.amber); d.rect(c.x, 66, 42, 3.5, "F");
    const pw = photoData ? 84 : 0, tw = c.w - (pw ? pw + 16 : 0);
    const name = RS.nm();
    setF(d, F, "bold", 27, [255, 255, 255]); fitSize(d, name, tw, 27, 14);
    d.text(name, c.x, 56);
    setF(d, F, "normal", 10.5, [255, 255, 255]);
    d.text(RS.cp().filter(Boolean).join("   \u2022   "), c.x, 88, { maxWidth: tw });
    if (g("address")) d.text(RS.ad(), c.x, 102, { maxWidth: tw });
    const pd = [g("dob") && `${RS.IC.dob} DOB: ${g("dob")} ${RS.IC.dob}`, g("fatherName") && `${RS.IC.father} Father: ${g("fatherName")} ${RS.IC.father}`, g("motherName") && `${RS.IC.mother} Mother: ${g("motherName")} ${RS.IC.mother}`].filter(Boolean).join("   |   ");
    setF(d, F, "normal", 9, C.light);
    if (pd) d.text(pd, c.x, 120, { maxWidth: tw });
    if (photoData) photo(d, photoData, c.x + c.w - pw, 24, pw, [255, 255, 255], 3);
    c.y = 152;

    const h = t => {
        need(c, 46); c.y += 8;
        setF(d, F, "bold", 12.5, C.dk); d.text(t.toUpperCase(), c.x, c.y + 10);
        c.y += 16;
        RS.gradient(d, c.x, c.y, c.w, 1.6, C.teal, C.light, 60);
        d.setFillColor(...C.amber); d.rect(c.x, c.y - 1, 34, 3, "F");
        c.y += 10;
    };

    if (g("summary")) { h(RS.ic("Professional Summary")); card(c, g("summary"), { fill: C.mint, bar: C.teal, color: C.body, pad: 11, gap: 6 }); }
    if (g("skills")) { h(RS.ic("Core Skills & Competencies")); chips(c, list(g("skills")), { fill: C.mint, stroke: C.teal, color: C.dk, style: "bold", size: 9.5 }); }
    if (g("objective")) { h(RS.ic("Career Objective")); para(c, g("objective"), { color: C.body, style: "italic" }); }
    if (g("experience")) { h(RS.ic("Professional Experience")); rich(c, g("experience"), { color: C.body, titleColor: C.dk, marker: C.teal }); }
    if (g("projects")) { h(RS.ic("Projects & Practical Work")); rich(c, g("projects"), { color: C.body, titleColor: C.dk, marker: C.amber }); }
    const edu = eduRows();
    if (edu.length || g("education")) {
        h(RS.ic("Academic Qualifications")); RS.eduNote(c, { color: C.dk, style: "bold" });
        RS.eduGrid(c, edu, { head: ["Course / Degree", "Institute", "Year", "CGPA / %"], c1: C.dk, c2: hex("#14B8A6"), tint: C.mint, line: C.light, ink: C.body });
    }
    const duo = [["Languages", g("Languages")], ["Strengths", g("habits")]].filter(r => r[1]);
    if (duo.length) {
        h(RS.ic("Additional Information"));
        need(c, 110);
        const hw = duo.length === 2 ? (c.w - 12) / 2 : c.w, y0 = c.y;
        let yEnd = y0;
        duo.forEach((r, i) => {
            c.y = y0;
            card(c, r[1], { x: c.x + i * (hw + 12), w: hw, fill: C.mint, color: C.body, label: r[0], labelColor: C.teal, pad: 10, gap: 8 });
            yEnd = Math.max(yEnd, c.y);
        });
        c.y = yEnd;
    }
    if (g("declaration")) { h(RS.ic("Declaration")); para(c, g("declaration"), { color: C.body, style: "italic" }); }
    signOff(c, { color: C.ink, line: C.teal });
    finish(c, "Hybrid_Resume", { color: C.teal });
}

//=============================================== 4. ONE PAGE RESUME ===============================================
// Left sidebar layout. Re-renders at smaller sizes until everything fits on a single page.
async function generateOnePageResume() {
    const { newCtx, setF, need, para, bullets, rich, eduRows, eduEntry, kv, signOff, finish, fitSize, photo, hex, g, list } = RS;
    const F = "helvetica", SB = 186;
    const C = { side: hex("#F1F5F9"), ink: hex("#0F172A"), body: hex("#334155"), mute: hex("#64748B"), org: hex("#EA580C"), line: hex("#E2E8F0") };
    const photoData = await RS.photoData();

    const build = s => {
        const decorate = k => {
            k.doc.setFillColor(...C.side); k.doc.rect(0, 0, SB, k.H, "F");
            k.doc.setFillColor(...C.org); k.doc.rect(SB, 0, 3, k.H, "F");
            RS.gradient(k.doc, 0, 0, SB, 8, C.ink, C.org, 40);
        };
        const c = newCtx({ x: SB + 24, right: 30, top: 34, bottom: 30, decorate });
        c.decorate(c);
        const d = c.doc;
        const sb = Object.assign({}, c, { x: 18, w: SB - 34, y: 30, noBreak: true });

        // --- sidebar ---
        if (photoData) { photo(d, photoData, (SB - 92) / 2, sb.y, 92, C.org, 2); sb.y += 92 + 16; }
        const sh = t => {
            need(sb, 30); sb.y += 3 * s;
            setF(d, F, "bold", 9 * s, C.org); d.text(t.toUpperCase(), sb.x, sb.y + 8 * s);
            sb.y += 12 * s;
            RS.gradient(d, sb.x, sb.y, sb.w, 1.4, C.org, C.side, 40);
            sb.y += 6 * s;
        };
        const kvo = { size: 8.6 * s, lsize: 6.8 * s, color: C.body, lcolor: C.mute, gap: 4 * s };
        sh(RS.ic("Contact"));
        kv(sb, "Email", g("email"), kvo); kv(sb, "Phone", g("phone"), kvo); kv(sb, "Address", g("address"), kvo);
        if (g("dob") || g("fatherName") || g("motherName")) {
            sh(RS.ic("Personal"));
            kv(sb, "Date of birth", g("dob"), kvo); kv(sb, "Father", g("fatherName"), kvo); kv(sb, "Mother", g("motherName"), kvo);
        }
        if (g("skills")) { sh(RS.ic("Skills")); bullets(sb, list(g("skills")), { size: 8.8 * s, color: C.body, marker: C.org, indent: 10, gap: 4 * s, lh: 8.8 * s * 1.35 }); }
        if (g("Languages")) { sh(RS.ic("Languages")); para(sb, g("Languages"), { size: 8.8 * s, color: C.body, gap: 4 * s }); }
        const edu = eduRows(true);


        // --- main column ---
        const name = RS.nm();
        setF(d, F, "bold", 25 * s, C.ink); fitSize(d, name, c.w, 25 * s, 12);
        d.text(name, c.x, c.y + 22 * s);
        c.y += 30 * s;
        RS.gradient(d, c.x, c.y, 64, 3, C.org, hex("#FBBF24"), 30); c.y += 10 * s;
        para(c, RS.ob(), { size: 9.6 * s, color: C.mute, style: "italic", gap: 6 * s });
        const mh = t => {
            need(c, 30); c.y += 4 * s;
            setF(d, F, "bold", 10.5 * s, C.ink); d.text(t.toUpperCase(), c.x, c.y + 9 * s);
            c.y += 13 * s;
            RS.gradient(d, c.x, c.y, c.w, 1.4, C.org, C.line, 50);
            c.y += 6 * s;
        };
        const ro = { size: 9.4 * s, color: C.body, titleColor: C.ink, marker: C.org, indent: 10, gap: 4 * s };
        if (g("summary")) { mh(RS.ic("Profile")); para(c, g("summary"), { size: 9.4 * s, color: C.body, gap: 4 * s }); }
        if (g("experience")) { mh(RS.ic("Experience")); rich(c, g("experience"), ro); }
        if (g("projects")) { mh(RS.ic("Projects")); rich(c, g("projects"), ro); }
        if (edu.length || g("education")) {
            mh(RS.ic("Education")); RS.eduNote(c, { size: 9 * s, color: C.ink, style: "bold", gap: 4 * s });
            RS.eduGrid(c, edu, { size: 8.6 * s, pad: 4.5 * s, c1: C.ink, c2: C.org, tint: C.side, line: C.line, ink: C.body, after: 6 * s });
        }
        if (g("habits")) { mh(RS.ic("Strengths")); para(c, g("habits"), { size: 9.4 * s, color: C.body, gap: 4 * s }); }
        if (g("declaration")) para(c, RS.IC.declaration + " " + g("declaration") + " " + RS.IC.declaration, { size: 8 * s, color: C.mute, style: "italic", gap: 2 * s });
        signOff(c, { size: 8.5 * s, color: C.mute, line: C.org, pre: 4 });
        return { c, over: sb.overflow };
    };

    let res;
    for (const s of [1, 0.94, 0.88, 0.82, 0.76, 0.7]) {
        res = build(s);
        if (res.c.doc.getNumberOfPages() === 1 && !res.over) break;
    }
    finish(res.c, "One_Page_Resume", { footer: false });
}

//=============================================== 5. TARGETED RESUME ===============================================
// Objective is the hero: dark callout, "why I fit" card, competency grid. Violet + gold.
async function generateTargetedResume() {
    const { newCtx, setF, need, para, rich, card, grid, eduRows, eduEntry, kvRow, signOff, finish, fitSize, photo, hex, g, list } = RS;
    const F = "helvetica";
    const C = { dk: hex("#4C1D95"), vi: hex("#7C3AED"), lav: hex("#F3EEFF"), gold: hex("#F59E0B"), ink: hex("#1E1B2E"), body: hex("#3F3B52"), mute: hex("#7A7690") };
    const photoData = await RS.photoData();
    const c = newCtx({ x: 44, top: 46, bottom: 48, decorate: k => {
        RS.gradient(k.doc, 0, 0, k.W, 10, C.dk, C.vi, 60);
        RS.gradient(k.doc, 0, 10, k.W, 3, C.vi, C.gold, 60);
    } });
    c.decorate(c);
    const d = c.doc, y0 = c.y;

    const pw = photoData ? 76 : 0, tw = c.w - (pw ? pw + 14 : 0);
    const name = RS.nm();
    setF(d, F, "bold", 27, C.dk); fitSize(d, name, tw, 27, 14);
    d.text(name, c.x, c.y + 24);
    c.y += 34;
    para(c, RS.cp().filter(Boolean).join("   |   "), { size: 10, color: C.vi, style: "bold", w: tw, gap: 1 });
    para(c, RS.ad(), { size: 10, color: C.mute, w: tw, gap: 0 });
    if (photoData) photo(d, photoData, c.x + c.w - pw, y0, pw, C.vi, 2.5);
    c.y = Math.max(c.y, y0 + pw) + 12;

    card(c, g("objective"), { label: "Target role & career objective", grad: [C.dk, C.vi], fill: C.dk, color: [255, 255, 255], labelColor: C.gold, size: 11.5, style: "italic", pad: 14, radius: 6, gap: 14 });

    const h = t => {
        need(c, 46); c.y += 4;
        d.setFillColor(...C.gold); d.rect(c.x, c.y + 1, 4, 14, "F");
        setF(d, F, "bold", 12.5, C.dk); d.text(t.toUpperCase(), c.x + 11, c.y + 12);
        RS.gradient(d, c.x + 11, c.y + 17, c.w - 11, 1.4, C.vi, C.lav, 60);
        c.y += 24;
    };

    if (g("summary")) { h(RS.ic("Why I'm the right fit")); card(c, g("summary"), { fill: C.lav, bar: C.gold, color: C.body, pad: 11, gap: 8 }); }
    if (g("skills")) { h(RS.ic("Core competencies")); grid(c, list(g("skills")), 3, { color: C.ink, style: "bold", marker: C.gold, size: 10, rowGap: 4, after: 8 }); }
    if (g("experience")) { h(RS.ic("Relevant experience")); rich(c, g("experience"), { color: C.body, titleColor: C.dk, marker: C.gold }); }
    if (g("projects")) { h(RS.ic("Key projects & achievements")); rich(c, g("projects"), { color: C.body, titleColor: C.dk, marker: C.vi }); }
    const edu = eduRows(true);
    if (edu.length || g("education")) { h(RS.ic("Education")); RS.eduNote(c, { color: C.ink, style: "bold" }); RS.eduGrid(c, edu, { c1: C.dk, c2: C.vi, tint: C.lav, line: hex("#DDD0F7"), ink: C.body }); }
    if (g("Languages")) { h(RS.ic("Languages")); para(c, g("Languages"), { color: C.body }); }
    if (g("habits")) { h(RS.ic("Strengths")); para(c, g("habits"), { color: C.body }); }
    const pd = [["Date of Birth", g("dob")], ["Father", g("fatherName")], ["Mother", g("motherName")]].filter(r => r[1]);
    if (pd.length) { h(RS.ic("Personal details")); pd.forEach(r => kvRow(c, r[0], r[1], { lw: 90, color: C.body, lcolor: C.dk })); }
    if (g("declaration")) { h(RS.ic("Declaration")); para(c, g("declaration"), { color: C.body, style: "italic" }); }
    signOff(c, { color: C.mute, line: C.vi });
    finish(c, "Targeted_Resume", { color: C.vi });
}

//=============================================== 6. FUNCTIONAL RESUME ===============================================
// Skills before history, RIGHT sidebar with photo + contact. Forest green on mint.
async function generateFunctionalResume() {
    const { newCtx, setF, need, para, rich, grid, kv, eduRows, eduTable, signOff, finish, fitSize, photo, hex, g, list } = RS;
    const F = "helvetica", SB = 178;
    const C = { dk: hex("#14532D"), gr: hex("#166534"), mint: hex("#ECFDF5"), mint2: hex("#D1FAE5"), ink: hex("#14281D"), body: hex("#2F4538"), mute: hex("#5F7A6A") };
    const photoData = await RS.photoData();
    const decorate = k => {
        const x0 = k.W - SB;
        RS.gradient(k.doc, x0, 0, SB, k.H, C.mint, C.mint2, 40, true);
        k.doc.setFillColor(...C.gr); k.doc.rect(x0, 0, 3, k.H, "F");
        RS.gradient(k.doc, x0, 0, SB, 8, C.dk, hex("#22C55E"), 40);
    };
    const c = newCtx({ x: 40, right: SB + 26, top: 44, bottom: 46, decorate });
    c.decorate(c);
    const d = c.doc, x0 = c.W - SB;

    // sidebar (page 1)
    const sb = Object.assign({}, c, { x: x0 + 18, w: SB - 34, y: 40, noBreak: true });
    if (photoData) { const ps = 104; photo(d, photoData, x0 + (SB - ps) / 2, sb.y, ps, C.gr, 2.5); sb.y += ps + 20; }
    const sh = t => {
        need(sb, 30); setF(d, F, "bold", 9.5, C.gr); d.text(t.toUpperCase(), sb.x, sb.y + 8);
        sb.y += 13; RS.gradient(d, sb.x, sb.y, sb.w, 1.4, C.gr, C.mint2, 40); sb.y += 8;
    };
    const kvo = { size: 9.3, lsize: 7, color: C.body, lcolor: C.mute, gap: 5 };
    sh(RS.ic("Contact"));
    kv(sb, "Email", g("email"), kvo); kv(sb, "Phone", g("phone"), kvo); kv(sb, "Address", g("address"), kvo);
    if (g("dob") || g("fatherName") || g("motherName")) {
        sb.y += 4; sh(RS.ic("Personal"));
        kv(sb, "Date of birth", g("dob"), kvo); kv(sb, "Father", g("fatherName"), kvo); kv(sb, "Mother", g("motherName"), kvo);
    }
    if (g("Languages")) { sb.y += 4; sh(RS.ic("Languages")); para(sb, g("Languages"), { size: 9.3, color: C.body }); }

    // main column
    const name = RS.nm();
    setF(d, F, "bold", 26, C.dk); fitSize(d, name, c.w, 26, 14);
    d.text(name, c.x, c.y + 24);
    c.y += 34;
    RS.gradient(d, c.x, c.y, 70, 3, C.gr, hex("#86EFAC"), 30); c.y += 12;
    para(c, RS.ob(), { color: C.mute, style: "italic", gap: 6 });

    const h = t => {
        need(c, 48); c.y += 6;
        RS.gradient(d, c.x, c.y, c.w, 20, C.mint2, [255, 255, 255], 50);
        d.setFillColor(...C.gr); d.rect(c.x, c.y, 4, 20, "F");
        setF(d, F, "bold", 11.5, C.dk); d.text(t.toUpperCase(), c.x + 13, c.y + 14);
        c.y += 28;
    };

    if (g("skills")) { h(RS.ic("Functional competencies")); grid(c, list(g("skills")), 2, { color: C.ink, style: "bold", marker: C.gr, size: 10.5, rowGap: 5, after: 8 }); }
    if (g("summary")) { h(RS.ic("Professional profile")); para(c, g("summary"), { color: C.body }); }
    if (g("experience")) { h(RS.ic("Experience highlights")); rich(c, g("experience"), { color: C.body, titleColor: C.dk, marker: C.gr }); }
    if (g("projects")) { h(RS.ic("Featured projects")); rich(c, g("projects"), { color: C.body, titleColor: C.dk, marker: C.gr }); }
    const edu = eduRows();
    if (edu.length || g("education")) {
        h(RS.ic("Education")); RS.eduNote(c, { color: C.dk, style: "bold" });
        RS.eduGrid(c, edu, { size: 9.5, cols: [0.31, 0.26, 0.19, 0.24], c1: C.dk, c2: hex("#22C55E"), tint: C.mint, line: C.mint2, ink: C.body });
    }
    if (g("habits")) { h(RS.ic("Strengths & habits")); para(c, g("habits"), { color: C.body }); }
    if (g("declaration")) { h(RS.ic("Declaration")); para(c, g("declaration"), { color: C.body, style: "italic" }); }
    signOff(c, { color: C.mute, line: C.gr });
    finish(c, "Functional_Resume", { color: C.gr, cx: c.x + c.w / 2 });
}

//=============================================== 7. EXECUTIVE RESUME ===============================================
// Navy masthead, serif type, centred headings flanked by gold rules.
async function generateExecutiveResume() {
    const { newCtx, setF, need, para, rich, grid, eduRows, eduTable, kvRow, signOff, finish, fitSize, photo, hex, g, list } = RS;
    const T = "times";
    const C = { navy: hex("#14213D"), gold: hex("#C9A227"), ink: hex("#1B1B1B"), body: hex("#2E2E2E"), mute: hex("#6B6B6B"), cream: hex("#E8E2D0"), ivory: hex("#FAF7EF") };
    const photoData = await RS.photoData();
    const c = newCtx({ x: 50, top: 52, bottom: 50, decorate: k => {
        k.doc.setFillColor(...C.navy); k.doc.rect(0, 0, k.W, 26, "F");
        setF(k.doc, T, "italic", 9.5, C.gold); k.doc.text(RS.nm(), k.x, 17);
    } });
    const d = c.doc;

    RS.gradient(d, 0, 0, c.W, 142, C.navy, hex("#2D4A7C"), 60);
    d.setFillColor(...C.gold); d.rect(0, 142, c.W, 3, "F");
    const pw = photoData ? 88 : 0, tw = c.w - (pw ? pw + 18 : 0);
    const name = RS.nm();
    setF(d, T, "bold", 30, [255, 255, 255]); fitSize(d, name, tw, 30, 16);
    d.text(name, c.x, 62);
    setF(d, T, "bold", 10, C.gold); d.text("EXECUTIVE PROFILE", c.x, 82);
    d.setDrawColor(...C.gold); d.setLineWidth(0.8); d.line(c.x, 92, c.x + tw, 92);
    setF(d, T, "normal", 10.5, C.cream);
    d.text(RS.cp().filter(Boolean).join("   \u2022   "), c.x, 110, { maxWidth: tw });
    if (g("address")) d.text(RS.ad(), c.x, 125, { maxWidth: tw });
    if (photoData) photo(d, photoData, c.x + c.w - pw, 28, pw, C.gold, 2.5);
    c.y = 170;

    const h = t => {
        need(c, 50); c.y += 8;
        const T2 = t.toUpperCase(), mid = c.x + c.w / 2;
        setF(d, T, "bold", 12.5, C.navy);
        const tw2 = d.getTextWidth(T2);
        d.text(T2, mid, c.y + 10, { align: "center" });
        RS.gradient(d, c.x, c.y + 5.3, mid - tw2 / 2 - 12 - c.x, 1.4, C.cream, C.gold, 40);
        RS.gradient(d, mid + tw2 / 2 + 12, c.y + 5.3, c.x + c.w - (mid + tw2 / 2 + 12), 1.4, C.gold, C.cream, 40);
        c.y += 26;
    };

    if (g("summary")) { h(RS.ic("Executive Summary")); para(c, g("summary"), { fam: T, style: "italic", size: 11.5, lh: 16, color: C.ink, gap: 8 }); }
    if (g("objective")) { h(RS.ic("Leadership Objective")); para(c, g("objective"), { fam: T, size: 11, color: C.body }); }
    if (g("skills")) { h(RS.ic("Core Leadership & Expertise")); grid(c, list(g("skills")), 3, { fam: T, size: 11, color: C.body, marker: C.gold, rowGap: 3, after: 8 }); }
    if (g("experience")) { h(RS.ic("Professional Experience")); rich(c, g("experience"), { fam: T, size: 11, color: C.body, titleColor: C.navy, marker: C.gold }); }
    if (g("projects")) { h(RS.ic("Strategic Projects")); rich(c, g("projects"), { fam: T, size: 11, color: C.body, titleColor: C.navy, marker: C.gold }); }
    const edu = eduRows(true);
    if (edu.length || g("education")) {
        h(RS.ic("Credentials & Education")); RS.eduNote(c, { fam: T, size: 11, color: C.navy, style: "bold" });
        RS.eduGrid(c, edu, { fam: "times", size: 10.5, head: ["Degree", "Institute", "Year", "CGPA / %"], c1: C.navy, c2: hex("#3B5B92"), headColor: C.gold, tint: C.ivory, line: C.cream, ink: C.body });
    }
    if (g("Languages")) { h(RS.ic("Languages")); para(c, g("Languages"), { fam: T, size: 11, color: C.body }); }
    if (g("habits")) { h(RS.ic("Strengths & Habits")); para(c, g("habits"), { fam: T, size: 11, color: C.body }); }
    const pd = [["Date of Birth", g("dob")], ["Father's Name", g("fatherName")], ["Mother's Name", g("motherName")]].filter(r => r[1]);
    if (pd.length) { h(RS.ic("Personal Particulars")); pd.forEach(r => kvRow(c, r[0], r[1], { fam: T, size: 11, lw: 110, color: C.body, lcolor: C.navy })); }
    if (g("declaration")) { h(RS.ic("Declaration")); para(c, g("declaration"), { fam: T, size: 11, style: "italic", color: C.body }); }
    signOff(c, { fam: T, size: 11, color: C.body, line: C.gold });
    finish(c, "Executive_Resume", { fam: T, color: C.gold });
}

//=============================================== 8. ACADEMIC RESUME ===============================================
// Scholarly CV: education first, numbered publications, particulars list. Times + maroon.
async function generateAcademicResume() {
    const { newCtx, setF, need, para, rich, numbered, eduRows, eduTable, kvRow, signOff, finish, fitSize, photo, hex, g } = RS;
    const T = "times";
    const C = { mar: hex("#7A1F2B"), ink: hex("#222222"), body: hex("#333333"), mute: hex("#6A6A6A"), rule: hex("#D9CFCF"), cream: hex("#F7F0F0") };
    const photoData = await RS.photoData();
    const c = newCtx({ x: 54, top: 54, bottom: 54, decorate: k => {
        RS.gradient(k.doc, k.x, 39.4, k.w, 1.2, C.mar, C.rule, 50);
    } });
    const d = c.doc, y0 = c.y;

    const pw = photoData ? 68 : 0, tw = c.w - (pw ? pw + 16 : 0);
    const name = RS.nm();
    setF(d, T, "bold", 25, C.mar); fitSize(d, name, tw, 25, 14);
    d.text(name, c.x, c.y + 20);
    c.y += 30;
    para(c, RS.cp().filter(Boolean).join("   |   "), { fam: T, size: 11, color: C.body, w: tw, gap: 1 });
    para(c, RS.ad(), { fam: T, size: 11, color: C.mute, w: tw, gap: 0 });
    if (photoData) photo(d, photoData, c.x + c.w - pw, y0, pw, C.rule, 1);
    c.y = Math.max(c.y, y0 + pw) + 8;
    RS.gradient(d, c.x, c.y, c.w, 2.4, C.mar, hex("#C8788A"), 60);
    d.setDrawColor(...C.mar); d.setLineWidth(0.5); d.line(c.x, c.y + 4.6, c.x + c.w, c.y + 4.6);
    c.y += 10;

    const h = t => {
        need(c, 46); c.y += 8;
        setF(d, T, "bold", 12.5, C.mar); d.text(t.toUpperCase(), c.x, c.y + 10);
        c.y += 15;
        RS.gradient(d, c.x, c.y, c.w, 1.2, C.mar, C.rule, 60);
        c.y += 8;
    };
    const o = { fam: T, size: 11, color: C.body };

    if (g("objective")) { h(RS.ic("Academic Objective")); para(c, g("objective"), o); }
    if (g("summary")) { h(RS.ic("Professional Summary")); para(c, g("summary"), o); }
    const edu = eduRows(true);
    if (edu.length || g("education")) {
        h(RS.ic("Educational Qualifications")); RS.eduNote(c, { fam: T, size: 11, color: C.ink, style: "bold" });
        RS.eduGrid(c, edu, { fam: "times", size: 10.5, head: ["Qualification", "Institution", "Year", "CGPA / %"], c1: C.mar, c2: hex("#B5485A"), tint: C.cream, line: C.rule, ink: C.body });
    }
    if (g("experience")) { h(RS.ic("Academic & Research Experience")); rich(c, g("experience"), Object.assign({ titleColor: C.ink, marker: C.mar, square: true }, o)); }
    if (g("projects")) {
        h(RS.ic("Projects & Publications"));
        numbered(c, g("projects").split(/\n+/), Object.assign({ labelColor: C.mar }, o));
    }
    if (g("skills")) { h(RS.ic("Specialization & Skills")); para(c, g("skills").replace(/\s*[;\n]+\s*/g, ", "), o); }
    if (g("Languages")) { h(RS.ic("Languages & Competencies")); para(c, g("Languages"), o); }
    if (g("habits")) { h(RS.ic("Personal Strengths")); para(c, g("habits"), o); }
    const pd = [["Date of Birth", g("dob")], ["Father's Name", g("fatherName")], ["Mother's Name", g("motherName")]].filter(r => r[1]);
    if (pd.length) { h(RS.ic("Personal Particulars")); pd.forEach(r => kvRow(c, r[0], r[1], Object.assign({ lw: 120, lcolor: C.ink }, o))); }
    if (g("declaration")) { h(RS.ic("Declaration")); para(c, g("declaration"), Object.assign({}, o, { style: "italic" })); }
    signOff(c, { fam: T, size: 11, color: C.body, line: C.mar });
    finish(c, "Academic_Resume", { fam: T, color: C.mute });
}

//=============================================== 9. CREATIVE RESUME ===============================================
// Dark sidebar with offset photo, chips, numbered section headings. Magenta + cyan.
async function generateCreativeResume() {
    const { newCtx, setF, need, para, rich, chips, kv, kvRow, eduRows, eduEntry, signOff, finish, fitSize, photo, hex, g, list } = RS;
    const F = "helvetica", SB = 200;
    const C = { dark: hex("#111827"), panel: hex("#1F2937"), pink: hex("#EC4899"), cyan: hex("#22D3EE"), ink: hex("#111827"), body: hex("#374151"), mute: hex("#6B7280"), soft: hex("#9CA3AF"), pale: hex("#E5E7EB") };
    const photoData = await RS.photoData();
    const decorate = k => {
        const dd = k.doc;
        RS.gradient(dd, 0, 0, SB, k.H, C.dark, hex("#312E81"), 60, true);
        RS.gradient(dd, 0, 0, SB, 8, C.pink, C.cyan, 50);
        RS.gradient(dd, 0, k.H - 8, SB, 8, C.cyan, C.pink, 50);
        RS.gradient(dd, SB + 28, 0, 46, 8, C.pink, C.cyan, 30);
    };
    const c = newCtx({ x: SB + 28, right: 34, top: 46, bottom: 46, decorate });
    c.decorate(c);
    const d = c.doc;
    const sb = Object.assign({}, c, { x: 22, w: SB - 44, y: 36, noBreak: true });

    // sidebar
    const name = RS.nm();
    const ps = 118, px = (SB - ps) / 2;
    d.setFillColor(...C.cyan); d.rect(px + 7, sb.y + 7, ps, ps, "F");
    if (!photo(d, photoData, px, sb.y, ps, C.pink, 3)) {
        d.setFillColor(...C.pink); d.rect(px, sb.y, ps, ps, "F");
        const ini = g("fullName", "Your Name").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
        setF(d, F, "bold", 40, [255, 255, 255]); d.text(ini, px + ps / 2, sb.y + ps / 2 + 14, { align: "center" });
    }
    sb.y += ps + 30;
    const sh = t => {
        need(sb, 30); sb.y += 4;
        d.setFillColor(...C.cyan); d.rect(sb.x, sb.y + 1, 7, 7, "F");
        setF(d, F, "bold", 10, C.pink); d.text(t.toUpperCase(), sb.x + 14, sb.y + 8);
        sb.y += 18;
    };
    const kvo = { size: 9.2, lsize: 7, color: C.pale, lcolor: C.soft, gap: 5 };
    sh(RS.ic("Contact"));
    kv(sb, "Email", g("email"), kvo); kv(sb, "Phone", g("phone"), kvo); kv(sb, "Address", g("address"), kvo);
    if (g("skills")) {
        sb.y += 2; sh(RS.ic("Skills & Toolset"));
        chips(sb, list(g("skills")), { size: 8.6, padX: 6, padY: 3.5, gap: 4, fill: C.panel, color: C.cyan, radius: 3, after: 10 });
    }
    if (g("Languages")) {
        sb.y += 2; sh(RS.ic("Languages"));
        chips(sb, list(g("Languages")), { size: 8.6, padX: 6, padY: 3.5, gap: 4, fill: C.pink, color: [255, 255, 255], radius: 3, after: 8 });
    }

    // main column
    setF(d, F, "bold", 30, C.ink); fitSize(d, name, c.w, 30, 16);
    d.text(name, c.x, c.y + 28);
    c.y += 40;
    RS.gradient(d, c.x, c.y, 60, 5, C.pink, C.cyan, 30); c.y += 16;
    para(c, RS.ob(), { size: 11, color: C.mute, style: "italic", gap: 8 });

    let n = 0;
    const h = t => {
        need(c, 50); c.y += 6; n++;
        setF(d, F, "bold", 17, C.pink); d.text(String(n).padStart(2, "0"), c.x, c.y + 14);
        setF(d, F, "bold", 12.5, C.ink); d.text(t.toUpperCase(), c.x + 30, c.y + 13);
        c.y += 20;
        RS.gradient(d, c.x + 30, c.y, 50, 2.5, C.pink, C.cyan, 30);
        c.y += 12;
    };

    if (g("summary")) { h(RS.ic("Profile & Vision")); para(c, g("summary"), { color: C.body }); }
    if (g("experience")) { h(RS.ic("Experience")); rich(c, g("experience"), { color: C.body, titleColor: C.ink, marker: C.pink }); }
    if (g("projects")) { h(RS.ic("Creative Portfolio")); rich(c, g("projects"), { color: C.body, titleColor: C.pink, marker: C.cyan }); }
    const edu = eduRows(true);
    if (edu.length || g("education")) { h(RS.ic("Education")); RS.eduNote(c, { color: C.ink, style: "bold" }); RS.eduGrid(c, edu, { head: ["Degree", "Institute", "Year", "Grade"], c1: C.pink, c2: hex("#06B6D4"), tint: hex("#FDF2F8"), tint2: hex("#F0FDFF"), line: hex("#FBCFE8"), ink: C.body }); }
    if (g("habits")) { h(RS.ic("Strengths")); para(c, g("habits"), { color: C.body }); }
    const pd = [["Born", g("dob")], ["Father", g("fatherName")], ["Mother", g("motherName")]].filter(r => r[1]);
    if (pd.length) { h(RS.ic("Personal")); pd.forEach(r => kvRow(c, r[0], r[1], { lw: 70, color: C.body, lcolor: C.pink })); }
    if (g("declaration")) { h(RS.ic("Declaration")); para(c, g("declaration"), { color: C.body, style: "italic" }); }
    signOff(c, { color: C.mute, line: C.pink });
    finish(c, "Creative_Resume", { color: C.mute });
}

//=============================================== 10. EUROPASS RESUME ===============================================
// Europass-style: blue labels in a left column, content in a right column, rule between sections.
async function generateEuropassResume() {
    const { newCtx, setF, need, para, rich, eduRows, eduEntry, kvRow, signOff, finish, fitSize, photo, hex, g } = RS;
    const F = "helvetica", LW = 138;
    const C = { blue: hex("#0E47CB"), pale: hex("#E8EFFC"), ink: hex("#1F2937"), body: hex("#374151"), mute: hex("#6B7280") };
    const photoData = await RS.photoData();
    const c = newCtx({ x: 46, top: 50, bottom: 52, decorate: k => RS.gradient(k.doc, 0, 0, k.W, 10, C.blue, hex("#7BA4F7"), 60) });
    c.decorate(c);
    const d = c.doc, y0 = c.y;

    const pw = photoData ? 74 : 0, tw = c.w - (pw ? pw + 14 : 0);
    const name = RS.nm();
    setF(d, F, "bold", 24, C.blue); fitSize(d, name, tw, 24, 14);
    d.text(name, c.x, c.y + 20);
    c.y += 30;
    setF(d, F, "normal", 9, C.mute); d.text("CURRICULUM VITAE", c.x, c.y + 8);
    c.y += 14;
    if (photoData) photo(d, photoData, c.x + c.w - pw, y0, pw, C.blue, 1.5);
    c.y = Math.max(c.y, y0 + pw) + 6;

    const row = (label, draw) => {
        need(c, 64); c.y += 4;
        RS.gradient(d, c.x, c.y, c.w, 1.6, C.blue, C.pale, 60);
        c.y += 10;
        setF(d, F, "bold", 10.5, C.blue);
        d.text(d.splitTextToSize(RS.tok(label), LW - 12), c.x, c.y + 9);
        const sx = c.x, sw = c.w;
        c.x = sx + LW; c.w = sw - LW;
        draw();
        c.x = sx; c.w = sw;
        c.y += 4;
    };
    const o = { color: C.body };

    if (g("summary") || g("objective")) row(RS.ic("About me"), () => { para(c, g("summary"), o); para(c, RS.ob(), Object.assign({ style: "italic" }, o)); });
    row(RS.ic("Personal information"), () => {
        [["Date of birth", g("dob")], ["Father's name", g("fatherName")], ["Mother's name", g("motherName")],
         ["Email", g("email")], ["Phone", g("phone")], ["Address", g("address")]]
            .forEach(r => kvRow(c, r[0], r[1], { lw: 84, color: C.body, lcolor: C.ink, size: 10 }));
    });
    if (g("experience")) row(RS.ic("Work experience"), () => rich(c, g("experience"), { color: C.body, titleColor: C.ink, marker: C.blue, square: true }));
    const edu = eduRows(true);
    if (edu.length || g("education")) row(RS.ic("Education and training"), () => { RS.eduNote(c, { color: C.ink, style: "bold" }); RS.eduGrid(c, edu, { size: 9, pad: 5, head: ["Degree / Diploma", "Institution", "Period", "Grade"], c1: C.blue, c2: hex("#6B9BF2"), tint: C.pale, line: hex("#C7D7F7"), ink: C.ink }); });
    if (g("Languages") || g("skills") || g("habits")) {
        row(RS.ic("Personal skills"), () => {
            [["Languages", g("Languages")], ["Technical skills", g("skills")], ["Strengths", g("habits")]]
                .forEach(r => kvRow(c, r[0], r[1], { lw: 92, color: C.body, lcolor: C.blue, size: 10, gap: 4 }));
        });
    }
    if (g("projects")) row(RS.ic("Projects and additional information"), () => rich(c, g("projects"), { color: C.body, titleColor: C.ink, marker: C.blue, square: true }));
    if (g("declaration")) row(RS.ic("Declaration"), () => para(c, g("declaration"), { color: C.body, style: "italic" }));
    signOff(c, { color: C.mute, line: C.blue });
    finish(c, "Europass_Resume", { color: C.blue });
}
