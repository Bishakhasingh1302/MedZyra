const API_BASE_URL = "http://localhost:5000/api";
const fileInput = document.getElementById("fileInput");
const browseButton = document.getElementById("browseButton");
const dropZone = document.getElementById("dropZone");
const fileList = document.getElementById("fileList");
const uploadStatus = document.getElementById("uploadStatus");
const statusMessage = document.getElementById("statusMessage");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const summaryEmpty = document.getElementById("summaryEmpty");
const processing = document.getElementById("processing");
const summaryResult = document.getElementById("summaryResult");
const bottomSummary = document.getElementById("bottomSummary");
let uploadedFiles = [];

function token() {
    return localStorage.getItem("medikiosk_token") || localStorage.getItem("token");
}

function setProgress(percent, message) {
    uploadStatus.style.display = "block";
    progressFill.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    statusMessage.textContent = message;
}

function saveTimelineEvent(type, file) {
    const events = JSON.parse(localStorage.getItem("medzyraTimeline") || "[]");
    events.push({
        source: "real",
        type,
        title: type === "document" ? "Medical document uploaded" : "AI document analysis completed",
        description: `${file.name} was ${type === "document" ? "added to your medical records" : "analyzed"}.`,
        icon: type === "document" ? "📄" : "✨",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toLocaleDateString(),
        file: file.name
    });
    localStorage.setItem("medzyraTimeline", JSON.stringify(events));
}

async function persistUploadedDocument(file) {
    const formData = new FormData();
    formData.append("file", file);
    const uploadResponse = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData
    });
    const uploadPayload = await uploadResponse.json().catch(() => ({}));
    if (!uploadResponse.ok || !uploadPayload.success || !uploadPayload.document?.id) {
        throw new Error(uploadPayload.message || "Unable to save the document.");
    }

    const processResponse = await fetch(`${API_BASE_URL}/documents/${uploadPayload.document.id}/process`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` }
    });
    const processPayload = await processResponse.json().catch(() => ({}));
    if (!processResponse.ok || !processPayload.success) {
        throw new Error(processPayload.message || "Document was uploaded but analysis failed.");
    }
    return uploadPayload.document;
}

function displayFile(file) {
    fileList.querySelector(".empty-files")?.remove();
    const item = document.createElement("div");
    item.className = "file-item";
    item.innerHTML = `<div class="file-info"><div class="file-icon">🖼️</div><div><div class="file-name"></div><span class="file-size"></span></div></div>`;
    item.querySelector(".file-name").textContent = file.name;
    item.querySelector(".file-size").textContent = `${formatFileSize(file.size)} • Processing`;
    fileList.prepend(item);
}

async function processDocument(file) {
    if (!token()) {
        setProgress(0, "Please sign in before uploading a document.");
        return;
    }

    setProgress(15, "Uploading document...");
    const formData = new FormData();
    formData.append("file", file);

    try {
        setProgress(45, "Reading document...");
        const response = await fetch(`${API_BASE_URL}/documents/ocr`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token()}` },
            body: formData
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.success) {
            throw new Error(payload.message || "Unable to analyze the document.");
        }

        const documentData = normalizeDocumentData(payload);
        await persistUploadedDocument(file);
        setProgress(100, "Document analyzed successfully");
        showSummary(file, documentData);
        saveTimelineEvent("ai", file);
    } catch (error) {
        setProgress(0, error.message);
        summaryEmpty.style.display = "none";
        processing.style.display = "none";
        summaryResult.style.display = "block";
        document.getElementById("summaryText").textContent = error.message;
        document.getElementById("extractedText").textContent = "";
    }
}

function handleFiles(files) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    files.forEach(file => {
        if (!allowedTypes.includes(file.type)) {
            alert(`${file.name} is not supported. Please upload JPG, PNG or WEBP.`);
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert(`${file.name} is larger than 10MB.`);
            return;
        }
        uploadedFiles.push(file);
        displayFile(file);
        processDocument(file);
    });
}

function normalizeDocumentData(payload) {
    const data = payload.data && typeof payload.data === "object" ? payload.data : payload;
    const extractedText = String(firstValue(data.extractedText, data.extracted_text, data.text, ""));
    const medicines = normalizeList(data.medicines || data.medications || data.medicine);
    if (!medicines.length && firstValue(data.medicineName, data.medicine_name, data.medicationName)) {
        medicines.push({
            name: firstValue(data.medicineName, data.medicine_name, data.medicationName),
            dose: firstValue(data.dosage, data.dose, data.strength),
            time: firstValue(data.time, data.timing, data.frequency)
        });
    }
    const tests = normalizeList(data.tests || data.investigations || data.labTests);

    return {
        summary: firstValue(data.summary, data.overview, data.aiSummary, ""),
        extractedText,
        documentType: firstValue(data.documentType, data.document_type, data.type, "Medical Document"),
        date: firstValue(data.date, data.documentDate, data.document_date, extractDate(extractedText)),
        medicines: medicines.length ? medicines : extractMedicines(extractedText),
        diagnosis: firstValue(data.diagnosis, data.condition, extractDiagnosis(extractedText)),
        tests: tests.length ? tests : extractTests(extractedText)
    };
}

function firstValue(...values) {
    return values.find(value => value !== undefined && value !== null && String(value).trim()) || "";
}

function normalizeList(value) {
    if (!value) return [];
    const values = Array.isArray(value) ? value : [value];
    return values.map(item => {
        if (typeof item === "string") return { name: item.trim() };
        if (!item || typeof item !== "object") return null;
        return {
            name: firstValue(item.name, item.medicineName, item.medicine_name, item.medicationName, item.medication, item.test, ""),
            dose: firstValue(item.dose, item.dosage, item.strength, ""),
            time: firstValue(item.time, item.timing, item.frequency, "")
        };
    }).filter(item => item?.name);
}

function extractMedicines(text) {
    return text.split(/\r?\n/).map(line => line.trim()).filter(line => {
        return line && /(tablet|capsule|syrup|injection|mg\b|mcg\b|medicine|medication)/i.test(line);
    }).map(line => ({ name: line.replace(/^[-*•\d.)\s]+/, "") }));
}

function extractTests(text) {
    return text.split(/\r?\n/).map(line => line.trim()).filter(line => {
        return line && /(test|investigation|blood|urine|scan|x-ray|ecg|mri|ct\b)/i.test(line);
    }).map(line => ({ name: line.replace(/^[-*•\d.)\s]+/, "") }));
}

function extractDate(text) {
    const match = text.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/);
    return match ? match[0] : "";
}

function extractDiagnosis(text) {
    const line = text.split(/\r?\n/).find(value => /diagnosis|condition/i.test(value));
    return line ? line.replace(/^.*?diagnosis\s*[:=-]?\s*/i, "").trim() : "";
}

function importantText(text, medicines, diagnosis, tests, date) {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const importantLines = lines.filter(line => {
        return /(medicine|medication|tablet|capsule|syrup|injection|dose|dosage|mg\b|mcg\b|take|time|morning|afternoon|evening|night|diagnosis|condition|test|investigation|blood|urine|scan|x-ray|ecg|mri|ct\b|date|follow.?up|allerg)/i.test(line);
    });
    const values = [...new Set(importantLines)]
        .slice(0, 8)
        .map(line => line.length > 180 ? `${line.slice(0, 177).trim()}...` : line);
    if (values.length) return values.join("\n");

    const detected = [
        date && `Date: ${date}`,
        diagnosis && `Diagnosis: ${diagnosis}`,
        medicines.length && `Medicines: ${formatList(medicines)}`,
        tests.length && `Tests: ${formatList(tests)}`
    ].filter(Boolean);
    return detected.join("\n") || "No important medical details were detected.";
}

function shortSummary(summary, medicines, diagnosis, tests, date) {
    const suppliedSummary = String(summary || "").replace(/\s+/g, " ").trim();
    if (suppliedSummary) {
        const sentences = suppliedSummary.match(/[^.!?]+[.!?]+/g) || [suppliedSummary];
        return sentences.slice(0, 2).join(" ").slice(0, 280).trim();
    }

    const parts = [];
    if (medicines.length) parts.push(`Medicine: ${formatList(medicines)}.`);
    if (diagnosis) parts.push(`Diagnosis: ${diagnosis}.`);
    if (tests.length) parts.push(`Tests: ${formatList(tests)}.`);
    if (date) parts.push(`Date: ${date}.`);
    return parts.join(" ") || "No important medical details were detected in this document.";
}

function formatList(items) {
    return items.map(item => [item.name, item.dose, item.time].filter(Boolean).join(" - ")).join("; ");
}

function showSummary(file, documentData) {
    summaryEmpty.style.display = "none";
    processing.style.display = "none";
    summaryResult.style.display = "block";
    bottomSummary.style.display = "block";
    document.getElementById("documentName").textContent = file.name;
    const medicineText = formatList(documentData.medicines);
    const testText = formatList(documentData.tests);
    const overview = shortSummary(
        documentData.summary,
        documentData.medicines,
        documentData.diagnosis,
        documentData.tests,
        documentData.date
    );
    const importantDetails = importantText(
        documentData.extractedText,
        documentData.medicines,
        documentData.diagnosis,
        documentData.tests,
        documentData.date
    );
    document.getElementById("summaryText").textContent = overview;
    document.getElementById("extractedText").textContent = importantDetails;
    document.getElementById("bottomSummaryText").textContent = overview;
    document.getElementById("documentType").textContent = documentData.documentType;
    document.getElementById("documentDate").textContent = documentData.date || "Not detected";
    document.getElementById("medicineInfo").textContent = medicineText || "Not detected";
    document.getElementById("testInfo").textContent = testText || "Not detected";
    document.getElementById("diagnosis").textContent = documentData.diagnosis || "Not detected";
    document.getElementById("medication").textContent = medicineText || "Not detected";
    document.getElementById("tests").textContent = testText || "Not detected";
}

function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

browseButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", event => handleFiles(Array.from(event.target.files)));
dropZone.addEventListener("dragover", event => { event.preventDefault(); dropZone.classList.add("dragover"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", event => {
    event.preventDefault();
    dropZone.classList.remove("dragover");
    handleFiles(Array.from(event.dataTransfer.files));
});

function goBack() { window.history.back(); }
function continuePage() { window.location.href = "../Timeline/timeline.html"; }
