/* ==========================================
   MEDZYRA TOTAL AI SUMMARY
========================================== */


/* ==========================================
   GET SAVED DATA
========================================== */


/*
   User information
*/

const user =
    JSON.parse(
        localStorage.getItem("medzyraCurrentUser")
    ) ||
    JSON.parse(
        localStorage.getItem("medzyraUser")
    ) ||
    {};



/*
   Selected language
*/

const language =
    localStorage.getItem(
        "medzyraLanguage"
    ) || "en";



/*
   Selected role
*/

const role =
    localStorage.getItem(
        "medzyraRole"
    ) || "patient";



/*
   Timeline
*/

const timelineEvents =
    JSON.parse(
        localStorage.getItem(
            "medzyraTimeline"
        )
    ) || [];


const demoEventTitles = [
    "Patient information submitted",
    "Medical history uploaded",
    "Prescription uploaded",
    "Laboratory report uploaded",
    "AI document analysis completed"
];


const realTimelineEvents =
    timelineEvents.filter(
        event => event.source === "real" || !demoEventTitles.includes(event.title)
    );



/*
   Uploaded documents
*/

const documents =
    JSON.parse(
        localStorage.getItem(
            "medzyraDocuments"
        )
    ) || [];



/* ==========================================
   PATIENT INFORMATION
========================================== */

document.getElementById(
    "patientName"
).textContent =
    user.name ||
    user.fullName ||
    "Not provided";


document.getElementById(
    "patientAge"
).textContent =
    user.age ||
    "Not provided";


document.getElementById(
    "patientRole"
).textContent =
    role === "doctor"
        ? "Doctor"
        : "Patient";


/* Language */

const languageNames = {

    en: "English",

    bn: "বাংলা",

    hi: "हिंदी"

};


document.getElementById(
    "patientLanguage"
).textContent =
    languageNames[language] ||
    "English";



/* ==========================================
   COUNT EVENTS
========================================== */

const documentEvents =
    realTimelineEvents.filter(
        event =>
            event.type === "document"
    );


const aiEvents =
    realTimelineEvents.filter(
        event =>
            event.type === "ai"
    );


const actionEvents =
    realTimelineEvents.filter(
        event =>
            event.type === "action"
    );



/* ==========================================
   SUMMARY COUNTERS
========================================== */

document.getElementById(
    "summaryDocuments"
).textContent =
    documentEvents.length +
    (
        documentEvents.length === 1
            ? " document uploaded"
            : " documents uploaded"
    );


document.getElementById(
    "summaryAI"
).textContent =
    aiEvents.length +
    " completed";



/* ==========================================
   DETECT DOCUMENT TYPES
========================================== */

let laboratoryCount = 0;

let prescriptionCount = 0;


documentEvents.forEach(event => {

    const title =
        (
            event.title ||
            ""
        ).toLowerCase();


    const file =
        (
            event.file ||
            event.description ||
            ""
        ).toLowerCase();

    const combined =
        title + " " + file;


    if (

        combined.includes("lab") ||

        combined.includes("blood") ||

        combined.includes("test") ||

        combined.includes("laboratory") ||

        combined.includes("report")

    ) {

        laboratoryCount++;

    }


    if (

        combined.includes("prescription") ||

        combined.includes("medicine") ||

        combined.includes("medication")

    ) {

        prescriptionCount++;

    }

});



document.getElementById(
    "summaryLabs"
).textContent =
    laboratoryCount > 0
        ? laboratoryCount + " report(s) uploaded"
        : "Not documented";


document.getElementById(
    "summaryPrescriptions"
).textContent =
    prescriptionCount > 0
        ? prescriptionCount + " uploaded"
        : "Not documented";



/* ==========================================
   CREATE OVERALL AI SUMMARY
========================================== */

function createOverallSummary() {

    const name =
        user.name ||
        user.fullName ||
        "The patient";


    let text =
        name +
        " has completed the MedZyra digital health intake process. ";


    if (realTimelineEvents.length > 0) {

        text +=
            "During this journey, " +
            name +
            " completed " +
            realTimelineEvents.length +
            " recorded action(s). ";

    }


    if (documentEvents.length > 0) {

        text +=
            documentEvents.length +
            " medical document(s) were submitted for review. ";

    } else {

        text +=
            "No medical documents have been documented yet. ";

    }


    if (laboratoryCount > 0) {

        text +=
            "Laboratory-related documents were identified among the submitted records. ";

    }


    if (prescriptionCount > 0) {

        text +=
            "Prescription-related documents were also submitted. ";

    }


    if (aiEvents.length > 0) {

        text +=
            "AI analysis was completed on the available uploaded information. ";

    }


    text +=
        "The information has been organized so that the doctor can review the patient's provided history and documents more efficiently.";


    return text;

}


document.getElementById(
    "overallSummary"
).textContent =
    createOverallSummary();



/* ==========================================
   DISPLAY JOURNEY
========================================== */

function displayJourney() {

    const container =
        document.getElementById(
            "journeyList"
        );


    container.innerHTML = "";


    if (
        realTimelineEvents.length === 0
    ) {

        container.innerHTML = `

            <div class="no-documents">

                No activity has been recorded yet.

            </div>

        `;

        return;

    }


    realTimelineEvents.forEach(
        event => {


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "journey-item";


            const dot =
                document.createElement(
                    "div"
                );


            dot.className =
                "journey-dot";


            const left =
                document.createElement(
                    "div"
                );


            left.className =
                "journey-left";


            const icon =
                document.createElement(
                    "div"
                );


            icon.className =
                "journey-icon";


            icon.textContent =
                event.icon ||
                "✓";


            const details =
                document.createElement(
                    "div"
                );


            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "journey-title";


            title.textContent =
                event.title;


            const description =
                document.createElement(
                    "div"
                );


            description.className =
                "journey-description";


            description.textContent =
                event.description;


            details.appendChild(
                title
            );

            details.appendChild(
                description
            );


            left.appendChild(
                icon
            );

            left.appendChild(
                details
            );


            const time =
                document.createElement(
                    "div"
                );


            time.className =
                "journey-time";


            time.textContent =
                event.time ||
                "";


            item.appendChild(
                dot
            );

            item.appendChild(
                left
            );

            item.appendChild(
                time
            );


            container.appendChild(
                item
            );

        }
    );

}


displayJourney();



/* ==========================================
   DISPLAY DOCUMENTS
========================================== */

function displayDocuments() {

    const container =
        document.getElementById(
            "documentSummaryList"
        );


    container.innerHTML = "";


    if (
        documentEvents.length === 0
    ) {

        container.innerHTML = `

            <div class="no-documents">

                No medical documents have been uploaded.

            </div>

        `;

        return;

    }


    documentEvents.forEach(
        event => {


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "document-row";


            const left =
                document.createElement(
                    "div"
                );


            left.className =
                "document-left";


            const icon =
                document.createElement(
                    "div"
                );


            icon.className =
                "document-file-icon";


            icon.textContent =
                event.icon ||
                "📄";


            const details =
                document.createElement(
                    "div"
                );


            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "document-name";


            name.textContent =
                event.file ||
                event.title;


            const type =
                document.createElement(
                    "div"
                );


            type.className =
                "document-type";


            type.textContent =
                event.title;


            details.appendChild(
                name
            );

            details.appendChild(
                type
            );


            left.appendChild(
                icon
            );

            left.appendChild(
                details
            );


            const status =
                document.createElement(
                    "div"
                );


            status.className =
                "document-status";


            status.textContent =
                "✓ Submitted";


            row.appendChild(
                left
            );

            row.appendChild(
                status
            );


            container.appendChild(
                row
            );

        }
    );

}


displayDocuments();



/* ==========================================
   NAVIGATION
========================================== */

function goBack() {

    window.history.back();

}


function continueToDoctor() {

    /*
       Later this will open the
       actual doctor consultation page.
    */

    window.location.href =
        "../Authentication/index.html#dashboardScreen";

}