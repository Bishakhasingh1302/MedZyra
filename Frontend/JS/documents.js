/* ==========================================
   MEDZYRA DOCUMENT UPLOAD SYSTEM
========================================== */


/* Elements */

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

const DOCUMENT_API_URL =
    "http://localhost:5000/api/documents/ocr";


function saveTimelineEvent(event) {

    const events =
        JSON.parse(
            localStorage.getItem("medzyraTimeline")
        ) || [];


    events.push(event);

    localStorage.setItem(
        "medzyraTimeline",
        JSON.stringify(events)
    );

}


function saveDocumentRecord(file) {

    const documents =
        JSON.parse(
            localStorage.getItem("medzyraDocuments")
        ) || [];


    documents.push({
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
    });


    localStorage.setItem(
        "medzyraDocuments",
        JSON.stringify(documents)
    );

}


function createTimelineEvent(type, file) {

    const now = new Date();


    return {
        source: "real",
        type,
        title: type === "document"
            ? "Medical document uploaded"
            : "AI document analysis completed",
        description: type === "document"
            ? file.name + " was added to your medical records."
            : "Important information was extracted from " + file.name + ".",
        icon: type === "document" ? "📄" : "✨",
        time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        }),
        date: now.toLocaleDateString(),
        file: file.name
    };

}


/* ==========================================
   BROWSE BUTTON
========================================== */

browseButton.addEventListener("click", function () {

    fileInput.click();

});


/* ==========================================
   FILE INPUT
========================================== */

fileInput.addEventListener("change", function () {

    const files = Array.from(fileInput.files);

    handleFiles(files);

});


/* ==========================================
   DRAG AND DROP
========================================== */

dropZone.addEventListener("dragover", function (event) {

    event.preventDefault();

    dropZone.classList.add("dragover");

});


dropZone.addEventListener("dragleave", function () {

    dropZone.classList.remove("dragover");

});


dropZone.addEventListener("drop", function (event) {

    event.preventDefault();

    dropZone.classList.remove("dragover");

    const files = Array.from(event.dataTransfer.files);

    handleFiles(files);

});


/* ==========================================
   HANDLE FILES
========================================== */

function handleFiles(files) {

    if (files.length === 0) {
        return;
    }


    files.forEach(file => {

        /* Check file type */

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (!allowedTypes.includes(file.type)) {

            alert(
                file.name +
                " is not supported.\n\nPlease upload JPG, PNG or WEBP."
            );

            return;
        }


        /* Check size */

        const maxSize = 10 * 1024 * 1024;


        if (file.size > maxSize) {

            alert(
                file.name +
                " is larger than 10MB."
            );

            return;
        }


        /* Add file */

        uploadedFiles.push(file);

        saveDocumentRecord(file);

        saveTimelineEvent(
            createTimelineEvent("document", file)
        );

        displayFile(file);


        /* Start processing */

        processDocument(file);

    });


    updateEmptyState();

}


/* ==========================================
   DISPLAY FILE
========================================== */

function displayFile(file) {

    const emptyMessage =
        fileList.querySelector(".empty-files");


    if (emptyMessage) {
        emptyMessage.remove();
    }


    const fileItem =
        document.createElement("div");


    fileItem.className = "file-item";


    const fileInfo =
        document.createElement("div");


    fileInfo.className = "file-info";


    const fileIcon =
        document.createElement("div");


    fileIcon.className = "file-icon";


    fileIcon.textContent = "🖼️";


    const textContainer =
        document.createElement("div");


    const fileName =
        document.createElement("div");


    fileName.className = "file-name";

    fileName.textContent = file.name;


    const fileSize =
        document.createElement("span");


    fileSize.className = "file-size";

    fileSize.textContent =
        formatFileSize(file.size) +
        " • Uploaded just now";


    textContainer.appendChild(fileName);

    textContainer.appendChild(fileSize);


    fileInfo.appendChild(fileIcon);

    fileInfo.appendChild(textContainer);


    /* Remove */

    const removeButton =
        document.createElement("button");


    removeButton.className = "remove-file";

    removeButton.innerHTML = "×";


    removeButton.addEventListener(
        "click",
        function () {

            fileItem.remove();

            uploadedFiles =
                uploadedFiles.filter(
                    uploadedFile =>
                        uploadedFile !== file
                );

            updateEmptyState();

        }
    );


    fileItem.appendChild(fileInfo);

    fileItem.appendChild(removeButton);


    fileList.prepend(fileItem);

}


/* ==========================================
   EMPTY STATE
========================================== */

function updateEmptyState() {

    if (uploadedFiles.length === 0) {

        fileList.innerHTML = `
            <div class="empty-files">
                No documents uploaded yet.
            </div>
        `;

    }

}


/* ==========================================
   PROCESS DOCUMENT
========================================== */

async function processDocument(file) {

    uploadStatus.style.display = "block";
    progressFill.style.width = "15%";
    progressPercent.textContent = "15%";
    statusMessage.textContent = "Uploading document...";

    const formData = new FormData();
    formData.append("file", file);

    try {
        const token =
            localStorage.getItem("medikiosk_token") ||
            localStorage.getItem("token");

        if (!token) {
            throw new Error("Please sign in before uploading a document.");
        }

        statusMessage.textContent = "Reading document...";
        progressFill.style.width = "45%";
        progressPercent.textContent = "45%";

        const response = await fetch(DOCUMENT_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload.success) {
            throw new Error(
                payload.message || "Unable to analyze the document."
            );
        }

        const extractedText =
            payload.extractedText ||
            payload.data?.extractedText ||
            "No readable text was found in this document.";

        progressFill.style.width = "100%";
        progressPercent.textContent = "100%";
        statusMessage.textContent = "Document analyzed successfully";
        showAISummary(file, extractedText);
    } catch (error) {
        progressFill.style.width = "0%";
        progressPercent.textContent = "0%";
        statusMessage.textContent = error.message;
        summaryEmpty.style.display = "none";
        processing.style.display = "none";
        summaryResult.style.display = "block";
        document.getElementById("summaryText").textContent =
            error.message;
    }
}


/* ==========================================
   AI SUMMARY
========================================== */

function showAISummary(file, extractedText) {

    /* Hide empty state */

    summaryEmpty.style.display = "none";


    /* Show processing */

    processing.style.display = "flex";


    summaryResult.style.display = "none";


    processing.style.display = "none";
    summaryResult.style.display = "block";
    bottomSummary.style.display = "block";

    generateDemoSummary(file, extractedText);

    saveTimelineEvent(
        createTimelineEvent("ai", file)
    );

}


/* ==========================================
   DEMO SUMMARY
========================================== */

function generateDemoSummary(file, extractedText) {

    document.getElementById(
        "documentName"
    ).textContent = file.name;


    document.getElementById(
        "summaryText"
    ).textContent =
        extractedText;


    document.getElementById(
        "documentType"
    ).textContent =
        "Medical Image";


    document.getElementById(
        "bottomSummaryText"
    ).textContent =
        extractedText;


    document.getElementById(
        "diagnosis"
    ).textContent =
        extractedText || "Not detected";


    document.getElementById(
        "medication"
    ).textContent =
        extractedText || "Not detected";


    document.getElementById(
        "tests"
    ).textContent =
        extractedText || "Not detected";

}


/* ==========================================
   FILE SIZE
========================================== */

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }


    if (bytes < 1024 * 1024) {

        return (
            (bytes / 1024).toFixed(1) +
            " KB"
        );

    }


    return (
        (bytes / (1024 * 1024)).toFixed(1) +
        " MB"
    );

}


/* ==========================================
   NAVIGATION
========================================== */

function goBack() {

    window.history.back();

}


function continuePage() {

    if (uploadedFiles.length === 0) {

        alert(
            "Please upload at least one medical document before continuing."
        );

        return;
    }


    window.location.href = "../Timeline/timeline.html";

}

/* ==========================================
   RIPPLE EFFECT
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    
    // Add ripple effect to everything in the web page
    const allElements = document.querySelectorAll("body *");
    
    allElements.forEach(element => {
        element.addEventListener("click", function (e) {
            
            e.stopPropagation();

            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.position === 'static') {
                element.style.position = 'relative';
            }
            
            // Only apply overflow hidden if it's not the body or html to avoid breaking scroll
            if (element.tagName !== 'BODY' && element.tagName !== 'HTML') {
                element.style.overflow = 'hidden';
            }

            const ripple = document.createElement("span");
            ripple.classList.add("ripple");

            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            const left = e.clientX - rect.left - size / 2;
            const top = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${left}px`;
            ripple.style.top = `${top}px`;

            element.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
            
        });
    });
});