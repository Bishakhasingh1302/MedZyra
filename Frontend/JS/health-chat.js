/* =========================================================
   MEDZYRA - AI HEALTH INTERVIEW
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://medzyra-backend.onrender.com/api";


/* =========================================================
   STATE
========================================================= */

let interviewId = null;

let currentQuestion = null;

let answeredQuestions = 0;

let checkInStarted = false;

let voiceActive = false;

const savedInterfaceLanguage =
    localStorage.getItem("medzyraLanguage") || "english";

let selectedLanguage =
    savedInterfaceLanguage === "bengali"
        ? "bn"
        : savedInterfaceLanguage === "hindi"
            ? "hi"
            : savedInterfaceLanguage === "nepali"
                ? "ne"
            : "en";

let discussionMode = null;

let discussionConversation = [];

let voiceConversationActive = false;

const UI_TRANSLATIONS = {
    en: {
        interview: "Health Interview",
        subtitle: "AI-assisted patient check-in",
        step: "Question",
        answered: "answered",
        welcomeTitle: "Let's understand how you're feeling.",
        welcomeText: "I'll ask you a few simple questions before your consultation. You can type, tap, or speak your answers.",
        privacy: "Your answers are part of your health check-in.",
        start: "Start check-in",
        inputPlaceholder: "Type your answer...",
        type: "Type",
        speak: "Speak",
        tap: "Tap options",
        online: "Online",
        complete: "Health Check-in Complete",
        categories: "Possible symptom categories",
        doctor: "Recommended healthcare professional",
        nextStep: "Next step",
        discussPrompt: "Would you like to discuss this health topic further with MedZyra?",
        discussHint: "Ask follow-up questions about your result in the way that feels easiest.",
        chatText: "Chat by text",
        tapChoose: "Tap to choose",
        useVoice: "Use voice",
        uploadDocuments: "No, upload documents",
        discussionReady: "Of course. What would you like to discuss about your health summary?",
        touchReady: "You can type a question or use the microphone. Touch mode is ready for choosing quick options.",
        voiceReady: "Voice mode is ready. Tap the microphone and ask your follow-up question.",
        languageChanged: "Language changed. The new language will be used for the next questions.",
        goDocuments: "Discussion ended. You can upload your documents now.",
        hello: "Hello",
        discussionError: "Sorry, I couldn't continue the discussion. Please try again."
    },
    hi: {
        interview: "स्वास्थ्य साक्षात्कार",
        subtitle: "AI-सहायता प्राप्त स्वास्थ्य जांच",
        step: "प्रश्न",
        answered: "उत्तर दिए",
        welcomeTitle: "आइए समझते हैं कि आप कैसा महसूस कर रहे हैं।",
        welcomeText: "मैं आपसे परामर्श से पहले कुछ आसान सवाल पूछूंगा। आप टाइप, टैप या बोलकर जवाब दे सकते हैं।",
        privacy: "आपके जवाब आपकी स्वास्थ्य जांच का हिस्सा हैं।",
        start: "जांच शुरू करें",
        inputPlaceholder: "अपना जवाब लिखें...",
        type: "टाइप",
        speak: "बोलें",
        tap: "विकल्प चुनें",
        online: "ऑनलाइन",
        complete: "स्वास्थ्य जांच पूरी हुई",
        categories: "संभावित लक्षण श्रेणियां",
        doctor: "अनुशंसित स्वास्थ्य विशेषज्ञ",
        nextStep: "अगला कदम",
        discussPrompt: "क्या आप इस स्वास्थ्य विषय पर MedZyra से और चर्चा करना चाहेंगे?",
        discussHint: "अपने परिणाम के बारे में आसान तरीके से सवाल पूछें।",
        chatText: "टेक्स्ट से चैट",
        tapChoose: "टैप करके चुनें",
        useVoice: "आवाज का उपयोग करें",
        uploadDocuments: "नहीं, दस्तावेज अपलोड करें",
        discussionReady: "बिल्कुल। आप अपने स्वास्थ्य सारांश के बारे में क्या चर्चा करना चाहेंगे?",
        touchReady: "आप सवाल लिख सकते हैं या माइक्रोफोन का उपयोग कर सकते हैं। टच मोड विकल्प चुनने के लिए तैयार है।",
        voiceReady: "वॉयस मोड तैयार है। माइक्रोफोन दबाकर अपना सवाल पूछें।",
        languageChanged: "भाषा बदल गई है। अगले सवाल नई भाषा में होंगे।",
        goDocuments: "चर्चा समाप्त हुई। अब आप अपने दस्तावेज अपलोड कर सकते हैं।",
        hello: "नमस्ते",
        discussionError: "क्षमा करें, चर्चा जारी नहीं रह सकी। कृपया फिर प्रयास करें।"
    },
    bn: {
        interview: "স্বাস্থ্য সাক্ষাৎকার",
        subtitle: "AI সহায়তায় স্বাস্থ্য পরীক্ষা",
        step: "প্রশ্ন",
        answered: "উত্তর দেওয়া হয়েছে",
        welcomeTitle: "আপনি কেমন অনুভব করছেন তা বুঝে নিই।",
        welcomeText: "পরামর্শের আগে আমি আপনাকে কয়েকটি সহজ প্রশ্ন করব। আপনি টাইপ, ট্যাপ বা কথা বলে উত্তর দিতে পারেন।",
        privacy: "আপনার উত্তর স্বাস্থ্য পরীক্ষার অংশ।",
        start: "পরীক্ষা শুরু করুন",
        inputPlaceholder: "আপনার উত্তর লিখুন...",
        type: "টাইপ",
        speak: "বলুন",
        tap: "বিকল্পে ট্যাপ করুন",
        online: "অনলাইন",
        complete: "স্বাস্থ্য পরীক্ষা সম্পন্ন",
        categories: "সম্ভাব্য উপসর্গের ধরন",
        doctor: "প্রস্তাবিত স্বাস্থ্যকর্মী",
        nextStep: "পরবর্তী ধাপ",
        discussPrompt: "আপনি কি MedZyra-এর সঙ্গে এই স্বাস্থ্য বিষয়টি আরও আলোচনা করতে চান?",
        discussHint: "আপনার ফলাফল সম্পর্কে সহজভাবে প্রশ্ন করুন।",
        chatText: "টেক্সটে চ্যাট",
        tapChoose: "ট্যাপ করে বেছে নিন",
        useVoice: "ভয়েস ব্যবহার করুন",
        uploadDocuments: "না, নথি আপলোড করুন",
        discussionReady: "অবশ্যই। আপনার স্বাস্থ্য সারাংশ নিয়ে কী আলোচনা করতে চান?",
        touchReady: "আপনি প্রশ্ন টাইপ করতে বা মাইক্রোফোন ব্যবহার করতে পারেন। টাচ মোড প্রস্তুত।",
        voiceReady: "ভয়েস মোড প্রস্তুত। মাইক্রোফোনে ট্যাপ করে প্রশ্ন করুন।",
        languageChanged: "ভাষা পরিবর্তন হয়েছে। পরের প্রশ্নগুলো নতুন ভাষায় হবে।",
        goDocuments: "আলোচনা শেষ হয়েছে। এখন আপনি নথি আপলোড করতে পারেন।",
        hello: "নমস্কার",
        discussionError: "দুঃখিত, আলোচনা চালিয়ে যাওয়া যায়নি। আবার চেষ্টা করুন।"
    },
    ne: {
        interview: "स्वास्थ्य अन्तर्वार्ता",
        subtitle: "AI-सहायता प्राप्त स्वास्थ्य जाँच",
        step: "प्रश्न",
        answered: "उत्तर दिइयो",
        welcomeTitle: "तपाईंलाई कस्तो महसुस भइरहेको छ बुझौं।",
        welcomeText: "परामर्शअघि म केही सरल प्रश्न सोध्नेछु। तपाईं टाइप, ट्याप वा बोलेर उत्तर दिन सक्नुहुन्छ।",
        privacy: "तपाईंका उत्तर स्वास्थ्य जाँचको हिस्सा हुन्।",
        start: "जाँच सुरु गर्नुहोस्",
        inputPlaceholder: "आफ्नो उत्तर लेख्नुहोस्...",
        type: "टाइप",
        speak: "बोल्नुहोस्",
        tap: "विकल्प छान्नुहोस्",
        online: "अनलाइन",
        complete: "स्वास्थ्य जाँच पूरा भयो",
        categories: "सम्भावित लक्षणका प्रकार",
        doctor: "सिफारिस गरिएको स्वास्थ्यकर्मी",
        nextStep: "अर्को कदम",
        discussPrompt: "के तपाईं MedZyra सँग यो स्वास्थ्य विषयमा थप छलफल गर्न चाहनुहुन्छ?",
        discussHint: "आफ्नो नतिजाबारे सजिलो तरिकाले प्रश्न सोध्नुहोस्।",
        chatText: "टेक्स्टमा कुराकानी",
        tapChoose: "ट्याप गरेर छान्नुहोस्",
        useVoice: "आवाज प्रयोग गर्नुहोस्",
        uploadDocuments: "होइन, कागजात अपलोड गर्नुहोस्",
        discussionReady: "अवश्य। तपाईं आफ्नो स्वास्थ्य सारांशबारे के छलफल गर्न चाहनुहुन्छ?",
        touchReady: "तपाईं प्रश्न टाइप गर्न वा माइक्रोफोन प्रयोग गर्न सक्नुहुन्छ। टच मोड तयार छ।",
        voiceReady: "आवाज मोड तयार छ। माइक्रोफोन थिचेर प्रश्न सोध्नुहोस्।",
        languageChanged: "भाषा परिवर्तन भयो। अर्को प्रश्न नयाँ भाषामा हुनेछ।",
        goDocuments: "छलफल समाप्त भयो। अब तपाईं कागजात अपलोड गर्न सक्नुहुन्छ।",
        hello: "नमस्ते",
        discussionError: "माफ गर्नुहोस्, छलफल जारी राख्न सकिएन। कृपया फेरि प्रयास गर्नुहोस्।"
    }
};

function t(key) {
    return UI_TRANSLATIONS[selectedLanguage]?.[key] || UI_TRANSLATIONS.en[key] || key;
}

function applyInterfaceTranslations() {
    const textMap = {
        headerTitle: "interview",
        headerSubtitle: "subtitle",
        stepLabel: "step",
        answeredLabel: "answered",
        welcomeTitle: "welcomeTitle",
        welcomeText: "welcomeText",
        privacyNote: "privacy",
        startLabel: "start",
        typeHint: "type",
        speakHint: "speak",
        tapHint: "tap",
        onlineLabel: "online"
    };

    Object.entries(textMap).forEach(([id, key]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = t(key);
        }
    });

    if (messageInput) {
        messageInput.placeholder = t("inputPlaceholder");
    }
}

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

if (languageSelect) {
    languageSelect.value = selectedLanguage;
}

applyInterfaceTranslations();

function loadPatientName() {
    try {
        const storedUser = JSON.parse(
            localStorage.getItem("medikiosk_current") || "null"
        );
        const name = storedUser?.fullName || storedUser?.full_name;

        if (name && patientName) {
            patientName.textContent = `${t("hello")}, ${name}`;
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
    const token = localStorage.getItem("medikiosk_token") || localStorage.getItem("token");
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

    const token = localStorage.getItem("medikiosk_token") || localStorage.getItem("token");

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
            patientName.textContent = `${t("hello")}, ${data.patientName}`;
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
            const result = await apiRequest("/health-ai/interview-discussion", {
                method: "POST",
                body: JSON.stringify({
                    interviewId,
                    message: answer,
                    language: selectedLanguage,
                    conversation: discussionConversation,
                    interactionMode: discussionMode
                })
            });

            hideTyping();
            const data = result.data || {};
            const responseText = data.question || data.message || data.summary || t("discussionReady");
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
            addBotMessage(t("discussionError"));
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
        patientName.textContent = `${t("hello")}, ${returnedPatientName}`;
    }

    wrapper.innerHTML = `

        <h3>🩺 ${escapeHTML(t("complete"))}</h3>

        <p>
            ${escapeHTML(
                assessment.summary || ""
            )}
        </p>

        <h4>${escapeHTML(t("categories"))}</h4>

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

        <h4>${escapeHTML(t("doctor"))}</h4>

        <p>
            👨‍⚕️
            ${escapeHTML(
                assessment.recommendedDoctor ||
                "General Physician"
            )}
        </p>

        <h4>${escapeHTML(t("nextStep"))}</h4>

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
                    selectedLanguage === "en" && discussion.prompt
                        ? discussion.prompt
                        : t("discussPrompt")
                )}</h4>
                <p>${escapeHTML(t("discussHint"))}</p>
            </div>
            <div class="interaction-actions" role="group" aria-label="Choose interaction mode">
                <button type="button" class="interaction-button primary" onclick="continueDiscussion('text')">
                    <i class="fa-regular fa-message"></i>
                    ${escapeHTML(t("chatText"))}
                </button>
                <button type="button" class="interaction-button" onclick="continueDiscussion('touch')">
                    <i class="fa-solid fa-hand-pointer"></i>
                    ${escapeHTML(t("tapChoose"))}
                </button>
                <button type="button" class="interaction-button" onclick="continueDiscussion('voice')">
                    <i class="fa-solid fa-microphone"></i>
                    ${escapeHTML(t("useVoice"))}
                </button>
                <button type="button" class="interaction-button secondary" onclick="skipDiscussion()">
                    <i class="fa-solid fa-arrow-right"></i>
                    ${escapeHTML(t("uploadDocuments"))}
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
            ? t("voiceReady")
            : t("discussionReady")
    );

    updateInputState();

    if (mode === "touch") {
        addBotMessage(t("touchReady"));
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

function endDiscussion(message = t("goDocuments")) {
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
            `${t("step")} ${answeredQuestions + 1}`;
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

            const interfaceLanguage =
                selectedLanguage === "bn"
                    ? "bengali"
                    : selectedLanguage === "hi"
                        ? "hindi"
                        : selectedLanguage === "ne"
                            ? "nepali"
                            : "english";

            localStorage.setItem(
                "medzyraLanguage",
                interfaceLanguage
            );

            window.dispatchEvent(
                new CustomEvent("medzyra-language-change", {
                    detail: interfaceLanguage
                })
            );


            if (!checkInStarted) {
                return;
            }


            applyInterfaceTranslations();

            addBotMessage(`🌐 ${t("languageChanged")}`);
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