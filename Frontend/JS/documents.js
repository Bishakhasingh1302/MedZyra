/* ==========================================
   MEDZYRA DOCUMENT UPLOAD SYSTEM
========================================== */
// Backend configuration
const API_BASE_URL = "http://localhost:5000/api";

// JWT token received after login
const AUTH_TOKEN = localStorage.getItem("token");

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
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];


        if (!allowedTypes.includes(file.type)) {

            alert(
                file.name +
                " is not supported.\n\nPlease upload PDF, JPG or PNG."
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


    if (file.type === "application/pdf") {

        fileIcon.textContent = "📕";

    } else {

        fileIcon.textContent = "🖼️";

    }


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

function processDocument(file) {

    /* Show progress */

    uploadStatus.style.display = "block";

    let progress = 0;


    const interval =
        setInterval(() => {

            progress += 5;


            progressFill.style.width =
                progress + "%";


            progressPercent.textContent =
                progress + "%";


            if (progress < 40) {

                statusMessage.textContent =
                    "Uploading document...";

            }

            else if (progress < 75) {

                statusMessage.textContent =
                    "Reading document...";

            }

            else {

                statusMessage.textContent =
                    "Preparing AI analysis...";

            }


            if (progress >= 100) {

                clearInterval(interval);

                statusMessage.textContent =
                    "Upload complete";


                setTimeout(() => {

                    showAISummary(file);

                }, 500);

            }

        }, 60);

}


/* ==========================================
   AI SUMMARY
========================================== */

function showAISummary(file) {

    /* Hide empty state */

    summaryEmpty.style.display = "none";


    /* Show processing */

    processing.style.display = "flex";


    summaryResult.style.display = "none";


    /* Simulate AI processing */

    setTimeout(() => {

        processing.style.display = "none";


        summaryResult.style.display = "block";


        bottomSummary.style.display = "block";


        generateDemoSummary(file);

        saveTimelineEvent(
            createTimelineEvent("ai", file)
        );


    }, 1800);

}


/* ==========================================
   DEMO SUMMARY
========================================== */

function generateDemoSummary(file) {

    document.getElementById(
        "documentName"
    ).textContent = file.name;


    document.getElementById(
        "summaryText"
    ).textContent =
        "The uploaded document has been analyzed and the important information has been organized. The system identified medical details, possible medications and investigation-related information from the document.";


    document.getElementById(
        "documentType"
    ).textContent =
        file.type === "application/pdf"
            ? "PDF Medical Document"
            : "Medical Image";


    document.getElementById(
        "bottomSummaryText"
    ).textContent =
        "This document contains patient-related medical information. MedZyra has organized the available information into a simple summary so that the patient and doctor can review it more easily. In the production version, this section will be generated directly from OCR and AI analysis of the uploaded document.";


    document.getElementById(
        "diagnosis"
    ).textContent =
        "Detected from document";


    document.getElementById(
        "medication"
    ).textContent =
        "Detected from document";


    document.getElementById(
        "tests"
    ).textContent =
        "Detected from document";

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