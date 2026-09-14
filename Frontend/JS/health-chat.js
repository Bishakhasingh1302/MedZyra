/* =========================================================
   MEDZYRA AI HEALTH CHAT
   ========================================================= */


/* ================= STATE ================= */

let currentQuestion = 0;

let answeredQuestions = 0;

let checkInStarted = false;

let voiceActive = false;

let redFlagDetected = false;

let selectedLanguage = "en";


/* ================= QUESTIONS ================= */

const questions = {

    en: [

        {
            id: "concern",

            text:
                "What is your main health concern today?",

            type: "options",

            options: [
                "Pain",
                "Fever",
                "Breathing problem",
                "Stomach problem",
                "Other"
            ]
        },

        {
            id: "duration",

            text:
                "How long have you been experiencing this?",

            type: "options",

            options: [
                "Less than 24 hours",
                "2–7 days",
                "1–4 weeks",
                "More than a month"
            ]
        },

        {
            id: "severity",

            text:
                "How would you describe the severity of your symptoms?",

            type: "options",

            options: [
                "Mild",
                "Moderate",
                "Severe"
            ]
        },

        {
            id: "location",

            text:
                "Where exactly are you experiencing the problem?",

            type: "options",

            options: [
                "Upper body",
                "Lower body",
                "Left side",
                "Right side",
                "All over"
            ]
        },

        {
            id: "breathing",

            text:
                "Are you currently having difficulty breathing?",

            type: "options",

            options: [
                "No",
                "A little",
                "Yes, severe"
            ]
        },

        {
            id: "chest",

            text:
                "Are you experiencing severe or unusual chest pain?",

            type: "options",

            options: [
                "No",
                "Mild discomfort",
                "Yes"
            ]
        },

        {
            id: "symptoms",

            text:
                "Is there anything else you would like your doctor to know?",

            type: "text"
        },

        {
            id: "final",

            text:
                "Thank you. Your health check-in is complete.",

            type: "final"
        }

    ],


    hi: [

        {
            id: "concern",

            text:
                "आज आपकी मुख्य स्वास्थ्य समस्या क्या है?",

            type: "options",

            options: [
                "दर्द",
                "बुखार",
                "सांस लेने में समस्या",
                "पेट की समस्या",
                "अन्य"
            ]
        },

        {
            id: "duration",

            text:
                "आपको यह समस्या कब से हो रही है?",

            type: "options",

            options: [
                "24 घंटे से कम",
                "2–7 दिन",
                "1–4 सप्ताह",
                "एक महीने से अधिक"
            ]
        },

        {
            id: "severity",

            text:
                "आप अपने लक्षणों की गंभीरता को कैसे बताएंगे?",

            type: "options",

            options: [
                "हल्का",
                "मध्यम",
                "गंभीर"
            ]
        },

        {
            id: "location",

            text:
                "आपको यह समस्या शरीर के किस हिस्से में महसूस हो रही है?",

            type: "options",

            options: [
                "ऊपरी शरीर",
                "निचला शरीर",
                "बाईं ओर",
                "दाईं ओर",
                "पूरे शरीर में"
            ]
        },

        {
            id: "breathing",

            text:
                "क्या आपको अभी सांस लेने में कठिनाई हो रही है?",

            type: "options",

            options: [
                "नहीं",
                "थोड़ी",
                "हाँ, बहुत ज्यादा"
            ]
        },

        {
            id: "chest",

            text:
                "क्या आपको तेज या असामान्य सीने में दर्द हो रहा है?",

            type: "options",

            options: [
                "नहीं",
                "हल्की परेशानी",
                "हाँ"
            ]
        },

        {
            id: "symptoms",

            text:
                "क्या आप डॉक्टर को कुछ और बताना चाहते हैं?",

            type: "text"
        },

        {
            id: "final",

            text:
                "धन्यवाद। आपका स्वास्थ्य चेक-इन पूरा हो गया है।",

            type: "final"
        }

    ],


    bn: [

        {
            id: "concern",

            text:
                "আজ আপনার প্রধান স্বাস্থ্য সমস্যা কী?",

            type: "options",

            options: [
                "ব্যথা",
                "জ্বর",
                "শ্বাসকষ্ট",
                "পেটের সমস্যা",
                "অন্যান্য"
            ]
        },

        {
            id: "duration",

            text:
                "এই সমস্যা কতদিন ধরে হচ্ছে?",

            type: "options",

            options: [
                "২৪ ঘণ্টার কম",
                "২–৭ দিন",
                "১–৪ সপ্তাহ",
                "এক মাসের বেশি"
            ]
        },

        {
            id: "severity",

            text:
                "আপনার উপসর্গ কতটা গুরুতর?",

            type: "options",

            options: [
                "হালকা",
                "মাঝারি",
                "গুরুতর"
            ]
        },

        {
            id: "location",

            text:
                "শরীরের কোথায় সমস্যাটি অনুভব করছেন?",

            type: "options",

            options: [
                "উপরের অংশ",
                "নিচের অংশ",
                "বাম দিকে",
                "ডান দিকে",
                "সারা শরীরে"
            ]
        },

        {
            id: "breathing",

            text:
                "আপনার কি এখন শ্বাস নিতে সমস্যা হচ্ছে?",

            type: "options",

            options: [
                "না",
                "সামান্য",
                "হ্যাঁ, গুরুতর"
            ]
        },

        {
            id: "chest",

            text:
                "আপনার কি তীব্র বা অস্বাভাবিক বুকে ব্যথা হচ্ছে?",

            type: "options",

            options: [
                "না",
                "হালকা অস্বস্তি",
                "হ্যাঁ"
            ]
        },

        {
            id: "symptoms",

            text:
                "ডাক্তারকে জানানোর মতো আর কিছু আছে কি?",

            type: "text"
        },

        {
            id: "final",

            text:
                "ধন্যবাদ। আপনার স্বাস্থ্য চেক-ইন সম্পূর্ণ হয়েছে।",

            type: "final"
        }

    ],


    ne: [

        {
            id: "concern",

            text:
                "आज तपाईंको मुख्य स्वास्थ्य समस्या के हो?",

            type: "options",

            options: [
                "दुखाइ",
                "ज्वरो",
                "सास फेर्न समस्या",
                "पेटको समस्या",
                "अन्य"
            ]
        },

        {
            id: "duration",

            text:
                "यो समस्या कति समयदेखि भइरहेको छ?",

            type: "options",

            options: [
                "२४ घण्टाभन्दा कम",
                "२–७ दिन",
                "१–४ हप्ता",
                "एक महिनाभन्दा बढी"
            ]
        },

        {
            id: "severity",

            text:
                "तपाईंको लक्षण कति गम्भीर छन्?",

            type: "options",

            options: [
                "हल्का",
                "मध्यम",
                "गम्भीर"
            ]
        },

        {
            id: "location",

            text:
                "समस्या शरीरको कुन भागमा महसुस भइरहेको छ?",

            type: "options",

            options: [
                "माथिल्लो भाग",
                "तल्लो भाग",
                "बायाँ भाग",
                "दायाँ भाग",
                "सबैतिर"
            ]
        },

        {
            id: "breathing",

            text:
                "के तपाईंलाई अहिले सास फेर्न गाह्रो भइरहेको छ?",

            type: "options",

            options: [
                "छैन",
                "अलिकति",
                "हो, धेरै"
            ]
        },

        {
            id: "chest",

            text:
                "के तपाईंलाई गम्भीर वा असामान्य छाती दुखिरहेको छ?",

            type: "options",

            options: [
                "छैन",
                "हल्का असहजता",
                "हो"
            ]
        },

        {
            id: "symptoms",

            text:
                "डाक्टरलाई भन्न चाहनुभएको अरू केही छ?",

            type: "text"
        },

        {
            id: "final",

            text:
                "धन्यवाद। तपाईंको स्वास्थ्य चेक-इन पूरा भयो।",

            type: "final"
        }

    ]

};


/* ================= DOM ================= */

const messages =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const voiceButton =
    document.getElementById("voiceButton");

const typingIndicator =
    document.getElementById("typingIndicator");

const startRow =
    document.getElementById("startRow");

const answeredCount =
    document.getElementById("answeredCount");

const totalQuestions =
    document.getElementById("totalQuestions");

const progressFill =
    document.getElementById("progressFill");

const stepText =
    document.getElementById("stepText");

const languageSelect =
    document.getElementById("languageSelect");


/* ================= START ================= */

function startCheckIn() {

    checkInStarted = true;

    startRow.style.display = "none";

    messageInput.disabled = false;

    sendButton.disabled = false;

    currentQuestion = 0;

    answeredQuestions = 0;

    askNextQuestion();
}


/* ================= ASK QUESTION ================= */

function askNextQuestion() {

    const list = questions[selectedLanguage];

    const question = list[currentQuestion];

    if (!question) {

        finishCheckIn();

        return;
    }


    if (question.type === "final") {

        addBotMessage(question.text);

        finishCheckIn();

        return;
    }


    showTyping();


    setTimeout(() => {

        hideTyping();

        addBotMessage(
            question.text,
            question.options || null
        );

    }, 650);
}


/* ================= BOT MESSAGE ================= */

function addBotMessage(text, options = null) {

    const row =
        document.createElement("div");

    row.className =
        "message-row bot-row";


    let optionsHTML = "";


    if (options) {

        optionsHTML = `
            <div class="options">

                ${options.map(option => `

                    <button
                        class="option-button"
                        onclick="selectOption(this)"
                        data-value="${escapeHTML(option)}"
                    >

                        ${escapeHTML(option)}

                    </button>

                `).join("")}

            </div>
        `;
    }


    row.innerHTML = `

        <div class="bot-avatar">

            <i class="fa-solid fa-sparkles"></i>

        </div>

        <div class="message-content">

            <div class="bot-label">
                MedZyra AI
                <span>● Online</span>
            </div>

            <div class="message bot-message">

                ${escapeHTML(text)}

            </div>

            ${optionsHTML}

        </div>

    `;


    messages.appendChild(row);

    scrollToBottom();
}


/* ================= USER MESSAGE ================= */

function addUserMessage(text) {

    const row =
        document.createElement("div");

    row.className =
        "user-row";


    row.innerHTML = `

        <div class="user-message">

            ${escapeHTML(text)}

        </div>

    `;


    messages.appendChild(row);

    scrollToBottom();
}


/* ================= OPTION ================= */

function selectOption(button) {

    const value =
        button.dataset.value;

    addUserMessage(value);

    processAnswer(value);

}


/* ================= TEXT ================= */

function sendMessage() {

    const value =
        messageInput.value.trim();


    if (!value) return;


    addUserMessage(value);

    messageInput.value = "";

    updateSendButton();

    processAnswer(value);
}


/* ================= ANSWER PROCESSING ================= */

function processAnswer(answer) {

    const question =
        questions[selectedLanguage][currentQuestion];


    answeredQuestions++;

    updateProgress();


    /*
       Prototype red-flag rules.

       In production, these should be replaced
       by validated clinical decision logic
       and backend processing.
    */

    if (checkForRedFlag(question, answer)) {

        redFlagDetected = true;

        setTimeout(() => {

            showRedFlag(answer);

        }, 400);

        return;
    }


    currentQuestion++;


    setTimeout(() => {

        askNextQuestion();

    }, 450);
}


/* ================= RED FLAG ================= */

function checkForRedFlag(question, answer) {

    const text =
        answer.toLowerCase();


    if (question.id === "breathing") {

        return (
            text.includes("yes") ||
            text.includes("severe") ||
            text.includes("गंभीर") ||
            text.includes("হ্যাঁ") ||
            text.includes("गाह्रो")
        );

    }


    if (question.id === "chest") {

        return (
            text === "yes" ||
            text.includes("हाँ") ||
            text.includes("হ্যাঁ") ||
            text === "हो"
        );

    }


    if (question.id === "severity") {

        return (
            text === "severe" ||
            text.includes("गंभीर") ||
            text.includes("গুরুতর")
        );

    }


    /*
       Text-based emergency keyword detection.
    */

    const emergencyWords = [

        "can't breathe",
        "cannot breathe",
        "difficulty breathing",
        "severe chest pain",
        "unconscious",
        "fainted",
        "heavy bleeding",

        "सांस नहीं",
        "सीने में तेज दर्द",

        "শ্বাস নিতে পারছি না",
        "তীব্র বুকে ব্যথা",

        "सास फेर्न सक्दिन",
        "छाती धेरै दुख्यो"

    ];


    return emergencyWords.some(word =>
        text.includes(word)
    );
}


/* ================= RED FLAG MODAL ================= */

function showRedFlag(answer) {

    const overlay =
        document.getElementById("redFlagOverlay");

    const message =
        document.getElementById("redFlagMessage");


    message.innerText =
        "Your response may indicate a symptom that needs prompt clinical attention. A member of the clinical team should review your response.";


    overlay.classList.add("show");

}


/* ================= ALERT ================= */

function alertClinicalStaff() {

    const overlay =
        document.getElementById("redFlagOverlay");


    overlay.classList.remove("show");


    addBotMessage(
        "I've marked your response for clinical attention. Please wait for assistance."
    );


    /*
       In production:

       fetch("/api/clinical-alert", {
           method: "POST",
           headers: {
               "Content-Type": "application/json",
               "Authorization": "Bearer TOKEN"
           },
           body: JSON.stringify({
               patientId: "...",
               reason: "...",
               severity: "urgent"
           })
       });

    */

    console.log(
        "CLINICAL ALERT: Staff notification triggered."
    );


    currentQuestion++;

    setTimeout(() => {

        askNextQuestion();

    }, 700);
}


/* ================= CONTINUE ================= */

function continueAfterFlag() {

    document
        .getElementById("redFlagOverlay")
        .classList.remove("show");


    addBotMessage(
        "We'll continue carefully. Your response has been recorded for the clinical team."
    );


    currentQuestion++;


    setTimeout(() => {

        askNextQuestion();

    }, 700);
}


/* ================= PROGRESS ================= */

function updateProgress() {

    answeredCount.innerText =
        answeredQuestions;


    const total =
        questions[selectedLanguage].length - 1;


    totalQuestions.innerText =
        total;


    const percentage =
        Math.min(
            (answeredQuestions / total) * 100,
            100
        );


    progressFill.style.width =
        percentage + "%";


    stepText.innerText =
        `Step ${Math.min(currentQuestion + 1, 4)} of 4`;
}


/* ================= TYPING ================= */

function showTyping() {

    typingIndicator.style.display =
        "flex";

    scrollToBottom();
}


function hideTyping() {

    typingIndicator.style.display =
        "none";
}


/* ================= VOICE ================= */

let recognition;


function toggleVoice() {

    /*
       Browser Web Speech API.
       Works best in Chrome/Edge.
    */

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Voice input is not supported in this browser. Please use Chrome or Edge."
        );

        return;
    }


    if (voiceActive) {

        recognition.stop();

        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.lang =
        getSpeechLanguage();


    recognition.interimResults =
        false;

    recognition.continuous =
        false;


    recognition.onstart = function () {

        voiceActive = true;

        voiceButton.classList.add(
            "recording"
        );

        voiceButton.innerHTML =
            '<i class="fa-solid fa-stop"></i>';
    };


    recognition.onresult =
        function(event) {

            const transcript =
                event.results[0][0].transcript;


            messageInput.value =
                transcript;


            updateSendButton();

            sendMessage();
        };


    recognition.onerror =
        function(event) {

            console.log(
                "Voice error:",
                event.error
            );
        };


    recognition.onend =
        function() {

            voiceActive = false;

            voiceButton.classList.remove(
                "recording"
            );

            voiceButton.innerHTML =
                '<i class="fa-solid fa-microphone"></i>';
        };


    recognition.start();
}


/* ================= LANGUAGE ================= */

languageSelect.addEventListener(
    "change",
    function() {

        selectedLanguage =
            this.value;


        if (!checkInStarted) return;


        addBotMessage(
            getLanguageChangeMessage()
        );


        /*
           For a real application,
           store language preference in backend.
        */

        currentQuestion = 0;

        answeredQuestions = 0;

        updateProgress();

    }
);


function getSpeechLanguage() {

    const languages = {

        en: "en-IN",

        hi: "hi-IN",

        bn: "bn-IN",

        ne: "ne-NP"

    };


    return languages[selectedLanguage] ||
        "en-IN";
}


function getLanguageChangeMessage() {

    const messages = {

        en:
            "I'll continue the health check-in in English.",

        hi:
            "मैं स्वास्थ्य चेक-इन हिंदी में जारी रखूंगा।",

        bn:
            "আমি বাংলায় স্বাস্থ্য চেক-ইন চালিয়ে যাব।",

        ne:
            "म नेपालीमा स्वास्थ्य चेक-इन जारी राख्नेछु।"

    };


    return messages[selectedLanguage];
}


/* ================= INPUT STATE ================= */

messageInput.addEventListener(
    "input",
    updateSendButton
);


messageInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();
        }

    }
);


function updateSendButton() {

    if (messageInput.value.trim()) {

        sendButton.classList.add(
            "active"
        );

    } else {

        sendButton.classList.remove(
            "active"
        );
    }
}


/* ================= FINISH ================= */

function finishCheckIn() {

    messageInput.disabled = true;

    sendButton.disabled = true;

    voiceButton.disabled = true;


    progressFill.style.width =
        "100%";

    stepText.innerText =
        "Check-in complete";


    setTimeout(() => {

        showCompletionCard();

    }, 500);
}


/* ================= COMPLETION ================= */

function showCompletionCard() {

    const row =
        document.createElement("div");

    row.className =
        "message-row bot-row";


    row.innerHTML = `

        <div class="bot-avatar">

            <i class="fa-solid fa-check"></i>

        </div>

        <div class="message-content">

            <div class="bot-label">
                MedZyra AI
            </div>

            <div class="message">

                <h3>
                    Check-in complete
                </h3>

                <p>
                    Your responses have been recorded
                    and are ready for your healthcare team.
                </p>

                <div style="
                    margin-top:15px;
                    padding:12px;
                    background:#eefaf8;
                    border-radius:12px;
                    color:#087f78;
                    font-size:12px;
                ">

                    <i class="fa-solid fa-shield-heart"></i>

                    Your information is ready for clinical review.

                </div>

            </div>

        </div>

    `;


    messages.appendChild(row);

    scrollToBottom();
}


/* ================= SCROLL ================= */

function scrollToBottom() {

    setTimeout(() => {

        window.scrollTo({

            top:
                document.body.scrollHeight,

            behavior: "smooth"

        });

    }, 100);
}


/* ================= ESCAPE HTML ================= */

function escapeHTML(value) {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ================= BACK ================= */

function goBack() {

    if (checkInStarted) {

        const confirmBack =
            confirm(
                "Leave this health check-in?"
            );

        if (!confirmBack) return;
    }


    window.history.back();
}


/* ================= INITIAL ================= */

updateProgress();