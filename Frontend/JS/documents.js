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

        const extractedText = payload.extractedText || payload.data?.extractedText || "No readable text was found.";
        setProgress(100, "Document analyzed successfully");
        showSummary(file, extractedText);
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
        saveTimelineEvent("document", file);
        processDocument(file);
    });
}

function showSummary(file, extractedText) {
    summaryEmpty.style.display = "none";
    processing.style.display = "none";
    summaryResult.style.display = "block";
    bottomSummary.style.display = "block";
    document.getElementById("documentName").textContent = file.name;
    document.getElementById("summaryText").textContent = extractedText;
    document.getElementById("extractedText").textContent = extractedText;
    document.getElementById("bottomSummaryText").textContent = extractedText;
    document.getElementById("documentType").textContent = "Medical Image";
    document.getElementById("diagnosis").textContent = "See extracted text";
    document.getElementById("medication").textContent = "See extracted text";
    document.getElementById("tests").textContent = "See extracted text";
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
