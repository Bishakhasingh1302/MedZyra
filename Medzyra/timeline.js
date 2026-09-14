/* =====================================
   MEDZYRA TIMELINE
===================================== */


/*
   Get timeline events from browser storage.
*/

let timelineEvents =
    JSON.parse(
        localStorage.getItem("medzyraTimeline")
    ) || [];


const demoEventTitles = [
    "Patient information submitted",
    "Medical history uploaded",
    "Prescription uploaded",
    "Laboratory report uploaded",
    "AI document analysis completed"
];


timelineEvents = timelineEvents.filter(
    event => event.source === "real" || !demoEventTitles.includes(event.title)
);

localStorage.setItem(
    "medzyraTimeline",
    JSON.stringify(timelineEvents)
);



const timeline =
    document.getElementById("timeline");

const timelineEmpty =
    document.getElementById("timelineEmpty");

const documentCount =
    document.getElementById("documentCount");

const actionCount =
    document.getElementById("actionCount");

const aiCount =
    document.getElementById("aiCount");



/* =====================================
   DISPLAY TIMELINE
===================================== */

function displayTimeline(filter = "all") {

    timeline.innerHTML = "";


    let filteredEvents =
        timelineEvents.filter(event => {

            if (filter === "all") {

                return true;

            }

            return event.type === filter;

        });


    if (filteredEvents.length === 0) {

        timeline.style.display = "none";

        timelineEmpty.style.display = "block";

        updateCounters();

        return;

    }


    timeline.style.display = "block";

    timelineEmpty.style.display = "none";


    /*
       Group events by date
    */

    let currentDate = "";


    filteredEvents.forEach(event => {


        if (event.date !== currentDate) {

            currentDate = event.date;


            const dateElement =
                document.createElement("div");


            dateElement.className =
                "timeline-date";


            dateElement.textContent =
                event.date;


            timeline.appendChild(dateElement);

        }



        /* Event */

        const eventElement =
            document.createElement("div");


        eventElement.className =
            "timeline-event";


        eventElement.dataset.type =
            event.type;



        /* Dot */

        const dot =
            document.createElement("div");


        dot.className =
            "event-dot";



        /* Card */

        const card =
            document.createElement("div");


        card.className =
            "event-card";



        /* Left */

        const left =
            document.createElement("div");


        left.className =
            "event-left";



        /* Icon */

        const icon =
            document.createElement("div");


        icon.className =
            "event-icon";


        icon.textContent =
            event.icon;



        /* Details */

        const details =
            document.createElement("div");


        details.className =
            "event-details";



        const title =
            document.createElement("div");


        title.className =
            "event-title";


        title.textContent =
            event.title;



        const description =
            document.createElement("div");


        description.className =
            "event-description";


        description.textContent =
            event.description;



        /* Tag */

        const tag =
            document.createElement("span");


        tag.className =
            "event-tag";


        tag.textContent =
            event.type;



        details.appendChild(title);

        details.appendChild(description);

        details.appendChild(tag);



        left.appendChild(icon);

        left.appendChild(details);



        /* Time */

        const time =
            document.createElement("div");


        time.className =
            "event-time";


        time.textContent =
            event.time;



        card.appendChild(left);

        card.appendChild(time);


        eventElement.appendChild(dot);

        eventElement.appendChild(card);


        timeline.appendChild(eventElement);

    });


    updateCounters();

}



/* =====================================
   COUNTERS
===================================== */

function updateCounters() {

    const documents =
        timelineEvents.filter(
            event => event.type === "document"
        ).length;


    const actions =
        timelineEvents.filter(
            event => event.type === "action"
        ).length;


    const ai =
        timelineEvents.filter(
            event => event.type === "ai"
        ).length;


    documentCount.textContent =
        documents;


    actionCount.textContent =
        actions;


    aiCount.textContent =
        ai;

}



/* =====================================
   SAVE TIMELINE
===================================== */

function saveTimeline() {

    localStorage.setItem(
        "medzyraTimeline",
        JSON.stringify(timelineEvents)
    );

}



/* =====================================
   FILTERS
===================================== */

document
    .querySelectorAll(".filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {


                document
                    .querySelectorAll(".filter")
                    .forEach(btn => {

                        btn.classList.remove("active");

                    });


                this.classList.add("active");


                const filter =
                    this.dataset.filter;


                displayTimeline(filter);

            }
        );

    });



/* =====================================
   CLEAR TIMELINE
===================================== */

document
    .getElementById("clearTimeline")
    .addEventListener(
        "click",
        function () {


            const confirmClear =
                confirm(
                    "Are you sure you want to clear the timeline?"
                );


            if (!confirmClear) {

                return;

            }


            timelineEvents = [];

            localStorage.removeItem(
                "medzyraTimeline"
            );


            displayTimeline();

        }
    );



/* =====================================
   NAVIGATION
===================================== */

function goToDocuments() {

    window.location.href =
        "documents.html";

}


function goBack() {

    window.history.back();

}


function continuePage() {

    window.location.href =
        "summary.html";

}



/* =====================================
   START
===================================== */

displayTimeline();