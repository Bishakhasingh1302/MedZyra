/* =========================================================
   MEDZYRA - AI HEALTH INTERVIEW
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
    "http://localhost:5000/api";


/* =========================================================
   STATE
========================================================= */

let interviewId = null;

let currentQuestion = null;

let answeredQuestions = 0;

let checkInStarted = false;

let voiceActive = false;

let selectedLanguage = "en";


/* =========================================================
   DOM
========================================================= */

const messages =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const voiceButton =
    document.getElementById("voiceButton");

const startChatBtn =
    document.getElementById("startChatBtn");

const startRow =
    document.getElementById("startRow");

const typingIndicator =
    document.getElementById("typingIndicator");

const answeredCount =
    document.getElementById("answeredCount");

const totalQuestions =
    document.getElementById("totalQuestions");

const progressFill =
    document.getElementById("progressFill");

const stepText =
    document.getElementById("stepText");

const patientName =
    document.getElementById("patientName");

const languageSelect =
    document.getElementById("languageSelect");


/* =========================================================
   RED FLAG
========================================================= */

const redFlagOverlay =
    document.getElementById("redFlagOverlay");

const redFlagMessage =
    document.getElementById("redFlagMessage");


/* =========================================================
   AUTH TOKEN
========================================================= */

function getToken() {

    return (
        localStorage.getItem("medzyra_access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken")
    );
}


/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        getToken();


    if (!token) {

        throw new Error(
            "Authentication token not found. Please login again."
        );
    }


    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`,

                    ...(options.headers || {})
                }
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed"
        );
    }


    return data;
}


/* =========================================================
   START CHECK-IN
========================================================= */

async function startCheckIn() {

    if (checkInStarted) {
        return;
    }


    checkInStarted = true;


    startChatBtn.disabled = true;


    showTyping();


    try {

        const result =
            await apiRequest(
                "/health-interview/start",
                {
                    method: "POST",

                    body: JSON.stringify({
                        language:
                            selectedLanguage
                    })
                }
            );


        hideTyping();


        interviewId =
            result.data.interviewId;


        currentQuestion =
            result.data.question;


        answeredQuestions = 0;


        if (startRow) {
            startRow.style.display =
                "none";
        }


        displayQuestion(
            currentQuestion
        );


        updateProgress();


    } catch (error) {

        hideTyping();

        checkInStarted = false;

        startChatBtn.disabled = false;


        addBotMessage(
            "Sorry, I couldn't start the health interview. Please try again."
        );


        console.error(error);
    }
}


/* =========================================================
   DISPLAY QUESTION
========================================================= */

function displayQuestion(question) {

    currentQuestion =
        question;


    showTyping();


    setTimeout(() => {

        hideTyping();


        addBotMessage(
            question.text,
            question.options || []
        );


        updateInputState();

    }, 500);
}


/* =========================================================
   BOT MESSAGE
========================================================= */

function addBotMessage(
    text,
    options = []
) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message bot-message";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    content.innerHTML =
        escapeHTML(text);


    wrapper.appendChild(content);


    /* -----------------------------------------------------
       OPTIONS
    ----------------------------------------------------- */

    if (
        Array.isArray(options) &&
        options.length > 0
    ) {

        const optionsContainer =
            document.createElement("div");


        optionsContainer.className =
            "chat-options";


        options.forEach(option => {

            const button =
                document.createElement("button");


            button.type =
                "button";


            button.className =
                "chat-option";


            if (
                typeof option === "string"
            ) {

                button.textContent =
                    option;

                button.dataset.value =
                    option;

            } else {

                button.textContent =
                    option.label ||
                    option.text ||
                    option.value;

                button.dataset.value =
                    option.value ||
                    option.label ||
                    option.text;
            }


            button.addEventListener(
                "click",
                () => {

                    processAnswer(
                        button.dataset.value
                    );

                }
            );


            optionsContainer.appendChild(
                button
            );

        });


        wrapper.appendChild(
            optionsContainer
        );
    }


    messages.appendChild(
        wrapper
    );


    scrollToBottom();
}


/* =========================================================
   USER MESSAGE
========================================================= */

function addUserMessage(text) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message user-message";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    content.textContent =
        text;


    wrapper.appendChild(
        content
    );


    messages.appendChild(
        wrapper
    );


    scrollToBottom();
}


/* =========================================================
   SEND TEXT
========================================================= */

async function sendMessage() {

    if (
        !currentQuestion ||
        currentQuestion.type !== "text"
    ) {
        return;
    }


    const answer =
        messageInput.value.trim();


    if (!answer) {
        return;
    }


    messageInput.value = "";


    await processAnswer(
        answer
    );
}


/* =========================================================
   PROCESS ANSWER
========================================================= */

async function processAnswer(answer) {

    if (!answer || !currentQuestion) {
        return;
    }


    /* -----------------------------------------------------
       SHOW USER MESSAGE
    ----------------------------------------------------- */

    addUserMessage(answer);


    /* -----------------------------------------------------
       DISABLE INPUT
    ----------------------------------------------------- */

    messageInput.disabled = true;

    sendButton.disabled = true;

    voiceButton.disabled = true;


    /* -----------------------------------------------------
       DISABLE OLD OPTIONS
    ----------------------------------------------------- */

    document
        .querySelectorAll(".chat-option")
        .forEach(button => {

            button.disabled = true;

        });


    answeredQuestions++;


    updateProgress();


    showTyping();


    try {

        const result =
            await apiRequest(
                "/health-interview/message",
                {
                    method: "POST",

                    body: JSON.stringify({

                        interviewId,

                        questionId:
                            currentQuestion.id,

                        questionText:
                            currentQuestion.text,

                        answer,

                        language:
                            selectedLanguage

                    })
                }
            );


        hideTyping();


        const data =
            result.data;


        /* =================================================
           RED FLAG
        ================================================= */

        if (
            data.type === "redFlag"
        ) {

            showRedFlag(
                data.message
            );

            return;
        }


        /* =================================================
           COMPLETED
        ================================================= */

        if (
            data.type === "completed"
        ) {

            showAssessment(
                data.assessment
            );

            return;
        }


        /* =================================================
           NEXT QUESTION
        ================================================= */

        if (
            data.type === "question"
        ) {

            displayQuestion(
                data.question
            );

            return;
        }


    } catch (error) {

        hideTyping();


        addBotMessage(
            "Sorry, something went wrong while processing your answer. Please try again."
        );


        console.error(
            "Chat Error:",
            error
        );


        updateInputState();
    }
}


/* =========================================================
   ASSESSMENT
========================================================= */

function showAssessment(
    assessment
) {

    currentQuestion = null;


    messageInput.disabled = true;

    sendButton.disabled = true;

    voiceButton.disabled = true;


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "assessment-card";


    const categories =
        Array.isArray(
            assessment.possibleCategories
        )
            ? assessment.possibleCategories
            : [];


    wrapper.innerHTML = `

        <h3>🩺 Health Check-in Complete</h3>

        <p>
            ${escapeHTML(
                assessment.summary || ""
            )}
        </p>

        <h4>Possible symptom categories</h4>

        <ul>
            ${
                categories
                    .map(
                        item =>
                            `<li>${escapeHTML(item)}</li>`
                    )
                    .join("")
            }
        </ul>

        <h4>Recommended healthcare professional</h4>

        <p>
            👨‍⚕️
            ${escapeHTML(
                assessment.recommendedDoctor ||
                "General Physician"
            )}
        </p>

        <h4>Next step</h4>

        <p>
            ${escapeHTML(
                assessment.nextStep || ""
            )}
        </p>

        <small>
            ⚠️ ${escapeHTML(
                assessment.disclaimer ||
                "This is not a diagnosis."
            )}
        </small>

    `;


    messages.appendChild(
        wrapper
    );


    scrollToBottom();


    updateProgress(
        true
    );
}


/* =========================================================
   RED FLAG DISPLAY
========================================================= */

function showRedFlag(message) {

    if (
        redFlagMessage
    ) {

        redFlagMessage.textContent =
            message;
    }


    if (
        redFlagOverlay
    ) {

        redFlagOverlay.style.display =
            "flex";
    }
}


/* =========================================================
   ALERT CLINICAL STAFF
========================================================= */

function alertClinicalStaff() {

    addBotMessage(
        "🚨 Please inform a healthcare professional immediately and seek urgent medical attention."
    );


    if (redFlagOverlay) {

        redFlagOverlay.style.display =
            "none";
    }
}


/* =========================================================
   CONTINUE AFTER FLAG
========================================================= */

function continueAfterFlag() {

    /*
       For safety, we do NOT automatically
       continue an urgent interview.
    */

    if (redFlagOverlay) {

        redFlagOverlay.style.display =
            "none";
    }


    addBotMessage(
        "⚠️ Because a potentially urgent symptom was detected, please seek medical attention before continuing this assessment."
    );


    currentQuestion = null;


    messageInput.disabled = true;

    sendButton.disabled = true;

    voiceButton.disabled = true;
}


/* =========================================================
   INPUT STATE
========================================================= */

function updateInputState() {

    if (!currentQuestion) {

        messageInput.disabled = true;

        sendButton.disabled = true;

        voiceButton.disabled = true;

        return;
    }


    const textMode =
        currentQuestion.type === "text";


    messageInput.disabled =
        !textMode;


    sendButton.disabled =
        !textMode;


    voiceButton.disabled =
        !textMode;
}


/* =========================================================
   PROGRESS
========================================================= */

function updateProgress(
    completed = false
) {

    if (completed) {

        progressFill.style.width =
            "100%";

        stepText.textContent =
            "Complete";

        return;
    }


    const percentage =
        Math.min(
            90,
            Math.max(
                5,
                answeredQuestions * 10
            )
        );


    progressFill.style.width =
        `${percentage}%`;


    if (stepText) {

        stepText.textContent =
            `Question ${answeredQuestions + 1}`;
    }


    if (answeredCount) {

        answeredCount.textContent =
            answeredQuestions;
    }


    if (totalQuestions) {

        totalQuestions.textContent =
            "dynamic";
    }
}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    if (typingIndicator) {

        typingIndicator.style.display =
            "flex";
    }


    scrollToBottom();
}


function hideTyping() {

    if (typingIndicator) {

        typingIndicator.style.display =
            "none";
    }
}


/* =========================================================
   SCROLL
========================================================= */

function scrollToBottom() {

    if (messages) {

        setTimeout(() => {

            messages.scrollTop =
                messages.scrollHeight;

        }, 50);
    }
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   LANGUAGE
========================================================= */

if (languageSelect) {

    languageSelect.addEventListener(
        "change",
        function () {

            selectedLanguage =
                this.value;


            if (!checkInStarted) {
                return;
            }


            addBotMessage(
                "🌐 Language changed. The new language will be used for the next questions."
            );
        }
    );
}


/* =========================================================
   ENTER KEY
========================================================= */

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }
        }
    );
}


/* =========================================================
   VOICE
========================================================= */

let recognition = null;


if (
    "webkitSpeechRecognition" in window ||
    "SpeechRecognition" in window
) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.lang =
        "en-IN";


    recognition.onstart =
        function () {

            voiceActive = true;

            if (voiceButton) {

                voiceButton.classList.add(
                    "active"
                );
            }
        };


    recognition.onend =
        function () {

            voiceActive = false;

            if (voiceButton) {

                voiceButton.classList.remove(
                    "active"
                );
            }
        };


    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0].transcript;


            if (messageInput) {

                messageInput.value =
                    transcript;
            }


            sendMessage();
        };


    recognition.onerror =
        function (event) {

            console.error(
                "Speech Recognition Error:",
                event.error
            );

        };
}


/* =========================================================
   TOGGLE VOICE
========================================================= */

function toggleVoice() {

    if (!recognition) {

        alert(
            "Voice input is not supported in this browser."
        );

        return;
    }


    if (!currentQuestion) {
        return;
    }


    if (
        currentQuestion.type !== "text"
    ) {

        return;
    }


    const languageMap = {

        en: "en-IN",

        hi: "hi-IN",

        bn: "bn-IN",

        ne: "ne-NP"

    };


    recognition.lang =
        languageMap[selectedLanguage] ||
        "en-IN";


    if (voiceActive) {

        recognition.stop();

    } else {

        recognition.start();
    }
}


/* =========================================================
   BACK
========================================================= */

function goBack() {

    window.history.back();
}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateInputState();

        updateProgress();

    }
);