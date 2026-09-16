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
let uploadedDocuments = [];

async function apiRequest(path, options = {}) {
    const token = localStorage.getItem("medikiosk_token");
    const isFormData = options.body instanceof FormData;
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `Request failed with status ${response.status}`);
    return data;
}

function setUploadProgress(percent, message) {
    uploadStatus.style.display = "block";
    progressFill.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    statusMessage.textContent = message;
}

function formatFileSize(bytes) {
    if (!bytes) return "Size unavailable";
    return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
    return value ? new Date(value).toLocaleDateString() : "Uploaded recently";
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[character]));
}

function renderDocuments() {
    if (!uploadedDocuments.length) {
        fileList.innerHTML = '<div class="empty-files">No documents uploaded yet.</div>';
        return;
    }
    fileList.innerHTML = uploadedDocuments.map(documentRecord => `
        <div class="file-item" data-document-id="${documentRecord.id}">
            <div class="file-info">
                <div class="file-icon">${documentRecord.file_type === "application/pdf" ? "📕" : "🖼️"}</div>
                <div><div class="file-name">${escapeHtml(documentRecord.file_name)}</div>
                <span class="file-size">${formatFileSize(documentRecord.file_size)} • ${escapeHtml(documentRecord.status || "uploaded")} • ${formatDate(documentRecord.uploaded_at)}</span></div>
            </div>
            <div><button class="remove-file view-document" type="button" title="View summary">↗</button>
            <button class="remove-file delete-document" type="button" title="Delete document">×</button></div>
        </div>`).join("");
    fileList.querySelectorAll(".view-document").forEach(button => button.addEventListener("click", () => showDocument(button.closest(".file-item").dataset.documentId)));
    fileList.querySelectorAll(".delete-document").forEach(button => button.addEventListener("click", () => deleteDocument(button.closest(".file-item").dataset.documentId)));
}

async function loadDocuments() {
    try {
        const result = await apiRequest("/documents/recent");
        uploadedDocuments = result.documents || [];
        renderDocuments();
    } catch (error) {
        alert(error.message || "Unable to load your documents.");
    }
}

async function handleFiles(files) {
    for (const file of files) {
        if (!["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
            alert(`${file.name} is not supported. Please upload PDF, JPG or PNG.`);
            continue;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert(`${file.name} is larger than 10MB.`);
            continue;
        }
        try {
            setUploadProgress(20, "Uploading document...");
            const formData = new FormData();
            formData.append("document", file);
            const result = await apiRequest("/documents/upload", { method: "POST", body: formData });
            uploadedDocuments = [result.document, ...uploadedDocuments];
            renderDocuments();
            if (file.type.startsWith("image/")) {
                processing.style.display = "flex";
                summaryEmpty.style.display = "none";
                summaryResult.style.display = "none";
                setUploadProgress(70, "AI is analyzing your document...");
                await apiRequest(`/documents/${result.document.id}/process`, { method: "POST" });
                await showDocument(result.document.id);
                setUploadProgress(100, "Analysis complete");
            } else {
                setUploadProgress(100, "PDF uploaded. Image processing is required for OCR.");
            }
        } catch (error) {
            setUploadProgress(0, error.message || "Upload failed");
            alert(error.message || "Document upload failed.");
        }
    }
    fileInput.value = "";
}

async function showDocument(documentId) {
    try {
        processing.style.display = "flex";
        summaryEmpty.style.display = "none";
        summaryResult.style.display = "none";
        const result = await apiRequest(`/documents/${documentId}`);
        const documentRecord = result.document;
        const analysis = documentRecord.analysis;
        if (!analysis) {
            processing.style.display = "none";
            summaryEmpty.style.display = "block";
            alert("This document has not been analyzed yet.");
            return;
        }
        document.getElementById("documentName").textContent = documentRecord.file_name;
        document.getElementById("summaryText").textContent = analysis.overview || analysis.summary || "Not mentioned";
        document.getElementById("extractedText").textContent = analysis.extracted_text || "No readable text was found in this document.";
        document.getElementById("documentType").textContent = analysis.document_type || "Not mentioned";
        document.getElementById("documentDate").textContent = analysis.document_date || "Not mentioned";
        document.getElementById("medicineInfo").textContent = analysis.medicines || analysis.extracted_text || "Not mentioned";
        document.getElementById("testInfo").textContent = analysis.investigations || analysis.tests || "Not mentioned";
        document.getElementById("bottomSummaryText").textContent = analysis.summary || analysis.overview || "Not mentioned";
        document.getElementById("diagnosis").textContent = analysis.diagnosis || "Not mentioned";
        document.getElementById("medication").textContent = analysis.medicines || analysis.extracted_text || "Not mentioned";
        document.getElementById("tests").textContent = analysis.tests || analysis.investigations || "Not mentioned";
        processing.style.display = "none";
        summaryResult.style.display = "block";
        bottomSummary.style.display = "block";
    } catch (error) {
        processing.style.display = "none";
        alert(error.message || "Unable to load document details.");
    }
}

async function deleteDocument(documentId) {
    try {
        await apiRequest(`/documents/${documentId}`, { method: "DELETE" });
        uploadedDocuments = uploadedDocuments.filter(documentRecord => documentRecord.id !== documentId);
        renderDocuments();
        alert("Document deleted successfully.");
    } catch (error) {
        alert(error.message || "Unable to delete document.");
    }
}

browseButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", event => handleFiles(Array.from(event.target.files)));
dropZone.addEventListener("dragover", event => { event.preventDefault(); dropZone.classList.add("dragover"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", event => { event.preventDefault(); dropZone.classList.remove("dragover"); handleFiles(Array.from(event.dataTransfer.files)); });

function goBack() { window.history.back(); }
function continuePage() { window.location.href = "../Timeline/timeline.html"; }
loadDocuments();
