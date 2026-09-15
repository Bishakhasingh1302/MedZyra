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

let discussionMode = null;

let discussionConversation = [];

let voiceConversationActive = false;

const END_CONVERSATION_PATTERNS = [
    /\bend (the )?conversation\b/i,
    /\bstop (the )?conversation\b/i,
    /\bclose (the )?conversation\b/i,
    /\bfinish (the )?conversation\b/i,
    /\bi('m| am) done\b/i,
    /\bthat('s| is) all\b/i,
    /\bno more questions\b/i,
    /\bgoodbye\b/i
];


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

function loadPatientName() {
    try {
        const storedUser = JSON.parse(
            localStorage.getItem("medikiosk_current") || "null"
        );
        const name = storedUser?.fullName || storedUser?.full_name;

        if (name && patientName) {
            patientName.textContent = `Hello, ${name}`;
        }
    } catch (error) {
        console.warn("Unable to load stored patient name:", error);
    }
}


/* =========================================================
   RED FLAG
========================================================= */

const redFlagOverlay =
    document.getElementById("redFlagOverlay");

const redFlagMessage =
    document.getElementById("redFlagMessage");

async function apiRequest(path, options = {}) {
    const token = localStorage.getItem("medikiosk_token");
    const response = await fetch(`${API_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        },
        ...options
    });
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    if (!response.ok) {
        const message = typeof data === "string" ? data : data.message;
        throw new Error(message || `Request failed with status ${response.status}`);
    }
    return data;
}

async function startCheckIn() {
    if (checkInStarted) {
        return;
    }

    const token = localStorage.getItem("medikiosk_token");

    if (!token) {
        addBotMessage("Please sign in first so your health check-in can be saved securely.");
        setTimeout(() => {
            window.location.href = "../Authentication/index.html";
        }, 900);
        return;
    }

    checkInStarted = true;
    startChatBtn.disabled = true;
    startRow.style.display = "none";
    showTyping();

    try {
        const result = await apiRequest("/health-interview/start", {
            method: "POST",
            body: JSON.stringify({ language: selectedLanguage })
        });
        const data = result.data || result;
        interviewId = data.interviewId || data.id;

        if (data.patientName && patientName) {
            patientName.textContent = `Hello, ${data.patientName}`;
        }

        displayQuestion(data.question);
        updateProgress();
    } catch (error) {
        hideTyping();
        checkInStarted = false;
        startChatBtn.disabled = false;
        startRow.style.display = "flex";
        addBotMessage(
            error.message ||
            "Sorry, I couldn't start the health interview. Please try again."
        );
        console.error("Start interview error:", error);
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

        if (voiceConversationActive) {
            speakResponse(question.text);
        }


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
        "message-row bot-row";

    const avatar =
        document.createElement("div");

    avatar.className =
        "bot-avatar";

    avatar.innerHTML =
        '<i class="fa-solid fa-sparkles"></i>';

    wrapper.appendChild(avatar);

    const messageGroup =
        document.createElement("div");

    messageGroup.className =
        "message-content";

    const label =
        document.createElement("div");

    label.className =
        "bot-label";

    label.innerHTML =
        'MedZyra AI <span>● Online</span>';

    messageGroup.appendChild(label);


    const content =
        document.createElement("div");


    content.className =
        "message bot-message";


    content.innerHTML =
        escapeHTML(text);


    messageGroup.appendChild(content);


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


        messageGroup.appendChild(
            optionsContainer
        );
    }


    wrapper.appendChild(messageGroup);

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
        "user-row";

    const messageGroup =
        document.createElement("div");

    messageGroup.className =
        "user-message-group";

    const label =
        document.createElement("div");

    label.className =
        "user-label";

    label.innerHTML =
        'You <i class="fa-solid fa-check"></i>';

    messageGroup.appendChild(label);


    const content =
        document.createElement("div");


    content.className =
        "message user-message";


    content.textContent =
        text;


    messageGroup.appendChild(content);

    const avatar =
        document.createElement("div");

    avatar.className =
        "user-avatar";

    avatar.innerHTML =
        '<i class="fa-solid fa-user"></i>';

    wrapper.appendChild(messageGroup);
    wrapper.appendChild(avatar);


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

    if (discussionMode) {
        addUserMessage(answer);

        if (shouldEndConversation(answer)) {
            endDiscussion();
            return;
        }

        messageInput.disabled = true;
        sendButton.disabled = true;
        voiceButton.disabled = true;
        showTyping();

        try {
            const result = await apiRequest("/health-ai/chat", {
                method: "POST",
                body: JSON.stringify({
                    message: answer,
                    language: selectedLanguage,
                    conversation: discussionConversation,
                    interactionMode: discussionMode
                })
            });

            hideTyping();
            const data = result.data || {};
            const responseText = data.question || data.message || data.summary || "I am ready to continue discussing this with you.";
            discussionConversation.push(
                { role: "user", content: answer },
                { role: "assistant", content: responseText }
            );
            addBotMessage(responseText);

            if (voiceConversationActive) {
                speakResponse(responseText);
            }

            updateInputState();
        } catch (error) {
            hideTyping();
            addBotMessage("Sorry, I couldn't continue the discussion. Please try again.");
            console.error("Discussion chat error:", error);
            updateInputState();
        }

        return;
    }


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
                data.assessment,
                data.discussion,
                data.patientName
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
            error.message ||
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
    assessment,
    discussion = {},
    returnedPatientName = ""
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


    if (returnedPatientName && patientName) {
        patientName.textContent = `Hello, ${returnedPatientName}`;
    }

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

        <div class="discussion-panel">
            <div class="discussion-copy">
                <span class="discussion-kicker">NEXT, WITH MEDZYRA</span>
                <h4>${escapeHTML(
                    discussion.prompt ||
                    "Would you like to discuss this health topic further with MedZyra?"
                )}</h4>
                <p>Ask follow-up questions about your result in the way that feels easiest.</p>
            </div>
            <div class="interaction-actions" role="group" aria-label="Choose interaction mode">
                <button type="button" class="interaction-button primary" onclick="continueDiscussion('text')">
                    <i class="fa-regular fa-message"></i>
                    Chat by text
                </button>
                <button type="button" class="interaction-button" onclick="continueDiscussion('touch')">
                    <i class="fa-solid fa-hand-pointer"></i>
                    Tap to choose
                </button>
                <button type="button" class="interaction-button" onclick="continueDiscussion('voice')">
                    <i class="fa-solid fa-microphone"></i>
                    Use voice
                </button>
                <button type="button" class="interaction-button secondary" onclick="skipDiscussion()">
                    <i class="fa-solid fa-arrow-right"></i>
                    No, upload documents
                </button>
            </div>
        </div>

    `;


    messages.appendChild(
        wrapper
    );


    scrollToBottom();


    updateProgress(
        true
    );
}

function continueDiscussion(mode) {
    const prompt = document.querySelector(".discussion-panel");

    if (
        mode === "voice" &&
        (!recognition || !window.speechSynthesis)
    ) {
        addBotMessage("Voice input is not supported in this browser. You can continue by text or touch.");
        return;
    }

    if (prompt) {
        prompt.classList.add("discussion-selected");
    }

    discussionMode = mode;
    voiceConversationActive = mode === "voice";
    discussionConversation = [];

    currentQuestion = {
        id: "discussion",
        type: "text",
        text: "What would you like to discuss?"
    };

    addBotMessage(
        mode === "voice"
            ? "Voice mode is ready. Tap the microphone and ask your follow-up question."
            : "Of course. What would you like to discuss about your health summary?"
    );

    updateInputState();

    if (mode === "touch") {
        addBotMessage("You can type a question or use the microphone. Touch mode is enabled for choosing quick options when they are available.");
    }

    if (voiceConversationActive) {
        speakResponse("Voice mode is ready. Tap the microphone and ask your follow-up question.");
    }
}

function shouldEndConversation(message) {
    return END_CONVERSATION_PATTERNS.some(pattern =>
        pattern.test(String(message || ""))
    );
}

function skipDiscussion() {
    endDiscussion("You chose to continue to document upload.");
}

function endDiscussion(message = "Discussion ended. You can upload your documents now.") {
    discussionMode = null;
    voiceConversationActive = false;
    currentQuestion = null;

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    if (recognition && voiceActive) {
        recognition.stop();
    }

    messageInput.disabled = true;
    sendButton.disabled = true;
    voiceButton.disabled = true;

    addBotMessage(message);

    setTimeout(() => {
        window.location.href = "../Document/documents.html";
    }, 900);
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

function speakResponse(text) {
    if (!voiceConversationActive || !window.speechSynthesis) {
        return;
    }

    window.speechSynthesis.cancel();

    const languageMap = {
        en: "en-IN",
        hi: "hi-IN",
        bn: "bn-IN",
        ne: "ne-NP"
    };

    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.lang = languageMap[selectedLanguage] || "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
}


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

    setTimeout(() => {
        window.location.href = "../Document/documents.html";
    }, 1500);
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

        loadPatientName();

        updateInputState();

        updateProgress();

    }
);