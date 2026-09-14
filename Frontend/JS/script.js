/* =========================================================
   MEDZYRA - REGISTRATION + REAL OTP LOGIN + DASHBOARD
   ========================================================= */


/* =========================================================
   API
   ========================================================= */

const API_URL = "http://localhost:5000/api";


/* =========================================================
   HELPER
   ========================================================= */

const $ = id => document.getElementById(id);

function normalizeLoginIdentifier(value) {

    const identifier = value.trim().toLowerCase();
    const phoneDigits = identifier.replace(/\D/g, "");

    if (/^[6-9]\d{9}$/.test(phoneDigits)) {

        return `+91${phoneDigits}`;
    }

    if (/^91[6-9]\d{9}$/.test(phoneDigits)) {

        return `+${phoneDigits}`;
    }

    return identifier;
}

function isIndianMobile(value) {

    const phoneDigits = value.replace(/\D/g, "");

    return /^[6-9]\d{9}$/.test(phoneDigits) ||
        /^91[6-9]\d{9}$/.test(phoneDigits);
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

let users = JSON.parse(
    localStorage.getItem("medikiosk_users") || "[]"
);

let currentUser = JSON.parse(
    localStorage.getItem("medikiosk_current") || "null"
);


/* =========================================================
   LOGIN STATE
   ========================================================= */

let loginIdentifier = "";
let otpSent = false;


/* =========================================================
   ALLERGY LIST
   ========================================================= */

const predefinedAllergies = [
    "Penicillin",
    "Peanuts",
    "Shellfish",
    "Eggs",
    "Milk",
    "Soy",
    "Wheat",
    "Tree Nuts",
    "Fish",
    "Latex",
    "Dust Mites",
    "Pollen",
    "Animal Dander",
    "Mold",
    "Bee Sting",
    "Sulfa Drugs",
    "Aspirin",
    "Ibuprofen",
    "Tomatoes",
    "Strawberries"
];


/* =========================================================
   TOAST
   ========================================================= */

function toast(message) {

    const el = $("toast");

    if (!el) return;

    el.textContent = message;

    el.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {

        el.classList.remove("show");

    }, 2600);
}


/* =========================================================
   LOCAL USER STORAGE
   ========================================================= */

function saveUsers() {

    localStorage.setItem(
        "medikiosk_users",
        JSON.stringify(users)
    );
}


/* =========================================================
   OTP CONTROLS
   ========================================================= */

function toggleOtpControls(show) {

    if ($("otpSection")) {

        $("otpSection").classList.toggle(
            "hidden",
            !show
        );
    }

    if ($("loginSubmitBtn")) {

        $("loginSubmitBtn").classList.toggle(
            "hidden",
            !show
        );
    }

    if ($("forgotBtn")) {

        $("forgotBtn").classList.toggle(
            "hidden",
            !show
        );
    }
}


/* =========================================================
   ALLERGY SUGGESTIONS
   ========================================================= */

function renderAllergySuggestions() {

    const container =
        $("allergySuggestions");

    if (!container) return;

    container.innerHTML =
        predefinedAllergies
            .map(allergy => `

                <button
                    type="button"
                    class="allergy-chip"
                    data-allergy="${escapeHTML(allergy)}"
                    style="
                        border:1px solid #cfe3f7;
                        background:#fff;
                        color:#1b4d82;
                        border-radius:999px;
                        padding:6px 10px;
                        font-size:12px;
                        font-weight:600;
                        cursor:pointer;
                    "
                >
                    ${escapeHTML(allergy)}
                </button>

            `)
            .join("");


    container
        .querySelectorAll(".allergy-chip")
        .forEach(button => {

            button.onclick = () => {

                const allergiesField =
                    $("allergies");

                if (!allergiesField) return;

                const existing =
                    (allergiesField.value || "")
                        .split(",")
                        .map(item => item.trim())
                        .filter(Boolean);

                const selected =
                    button.dataset.allergy;

                if (!existing.includes(selected)) {

                    existing.push(selected);

                    allergiesField.value =
                        existing.join(", ");
                }

                allergiesField.focus();
            };
        });
}


/* =========================================================
   CALCULATE AGE
   ========================================================= */

function calculateAge(dob) {

    if (!dob) return "—";

    const birthDate =
        new Date(dob);

    if (
        Number.isNaN(
            birthDate.getTime()
        )
    ) {

        return "—";
    }

    const today =
        new Date();

    let age =
        today.getFullYear() -
        birthDate.getFullYear();

    const monthDiff =
        today.getMonth() -
        birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (
            monthDiff === 0 &&
            today.getDate() <
            birthDate.getDate()
        )
    ) {

        age--;
    }

    return age;
}


/* =========================================================
   AUTH MODE
   ========================================================= */

function setAuthMode(mode) {

    const login =
        mode === "login";


    if ($("loginForm")) {

        $("loginForm")
            .classList
            .toggle(
                "hidden",
                !login
            );
    }


    if ($("registerForm")) {

        $("registerForm")
            .classList
            .toggle(
                "hidden",
                login
            );
    }


    if ($("authTitle")) {

        $("authTitle").textContent =
            login
                ? "Welcome back."
                : "Create your account.";
    }


    if ($("authSubtitle")) {

        $("authSubtitle").textContent =
            login
                ? "Sign in to continue your complete health journey."
                : "Tell us a little about yourself to build your health profile.";
    }


    if (login) {

        loginIdentifier = "";

        otpSent = false;


        if ($("loginOtp")) {

            $("loginOtp").value = "";
        }


        if ($("loginIdentifier")) {

            $("loginIdentifier").value = "";
        }


        toggleOtpControls(false);
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   REGISTRATION STEPS
   ========================================================= */

function showStep(n) {

    if ($("step1")) {

        $("step1")
            .classList
            .toggle(
                "hidden",
                n !== 1
            );
    }


    if ($("step2")) {

        $("step2")
            .classList
            .toggle(
                "hidden",
                n !== 2
            );
    }


    if ($("stepNumber")) {

        $("stepNumber").textContent = n;
    }


    if ($("regProgress")) {

        $("regProgress").style.width =
            n === 1
                ? "50%"
                : "100%";
    }
}


/* =========================================================
   VALIDATE STEP 1
   ========================================================= */

function validateStep1() {

    const ids = [
        "fullName",
        "phone",
        "email",
        "dob",
        "gender",
        "bloodGroup",
        "city",
        "emergency"
    ];


    for (const id of ids) {

        const field = $(id);

        if (!field) continue;

        if (!field.value.trim()) {

            toast(
                "Please complete all required details."
            );

            field.focus();

            return false;
        }
    }


    if (
        $("terms") &&
        !$("terms").checked
    ) {

        toast(
            "Please accept the Terms & Conditions."
        );

        return false;
    }


    const phone =
        $("phone")
            .value
            .replace(/\D/g, "");

    if (!isIndianMobile(phone)) {

        toast(
            "Enter a valid 10-digit phone number."
        );

        $("phone").focus();

        return false;
    }


    const emergency =
        $("emergency")
            .value
            .replace(/\D/g, "");

    if (!isIndianMobile(emergency)) {

        toast(
            "Enter a valid emergency contact number."
        );

        $("emergency").focus();

        return false;
    }


    return true;
}


/* =========================================================
   AUTH BUTTONS
   ========================================================= */

if ($("showRegister")) {

    $("showRegister").onclick = () => {

        setAuthMode("register");

        showStep(1);
    };
}


if ($("showLogin")) {

    $("showLogin").onclick = () => {

        setAuthMode("login");
    };
}


/* =========================================================
   NEXT STEP
   ========================================================= */

if ($("nextStep")) {

    $("nextStep").onclick = () => {

        if (validateStep1()) {

            showStep(2);
        }
    };
}


/* =========================================================
   BACK STEP
   ========================================================= */

if ($("backStep")) {

    $("backStep").onclick = () => {

        showStep(1);
    };
}


/* =========================================================
   SEND REAL SUPABASE OTP
   ========================================================= */

if ($("sendOtpBtn")) {

    $("sendOtpBtn").onclick = async () => {

        const identifier =
            $("loginIdentifier")
                .value
                .trim()
                .toLowerCase();


        if (!identifier) {

            toast(
                "Please enter your email address."
            );

            $("loginIdentifier").focus();

            return;
        }


        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhone = isIndianMobile(identifier);

        if (!isEmail && !isPhone) {

            toast(
                "Please enter a valid email address or phone number."
            );

            $("loginIdentifier").focus();

            return;
        }


        loginIdentifier =
            normalizeLoginIdentifier(identifier);


        const button =
            $("sendOtpBtn");


        button.disabled = true;

        button.textContent =
            "Sending OTP...";


        try {

            const response =
                await fetch(
                    `${API_URL}/auth/send-otp`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            identifier:
                                loginIdentifier
                        })
                    }
                );


            const result =
                await response.json();


            console.log(
                "Send OTP Response:",
                result
            );


            if (
                !response.ok ||
                !result.success
            ) {

                toast(
                    result.message ||
                    "Failed to send OTP."
                );

                return;
            }


            otpSent = true;


            toggleOtpControls(true);


            if ($("loginOtp")) {

                $("loginOtp").value = "";

                $("loginOtp").focus();
            }


            toast(
                "8-digit OTP sent to your email 📧"
            );


        } catch (error) {

            console.error(
                "Send OTP Error:",
                error
            );

            toast(
                "Unable to connect to MedZyra server."
            );


        } finally {

            button.disabled = false;

            button.textContent =
                "Send OTP";
        }
    };
}


/* =========================================================
   VERIFY REAL SUPABASE OTP
   ========================================================= */

if ($("loginForm")) {

    $("loginForm").addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const identifier =
                normalizeLoginIdentifier(
                    $("loginIdentifier").value
                );


            const otp =
                $("loginOtp")
                    .value
                    .trim();


            if (!identifier) {

                toast(
                    "Please enter your email address."
                );

                return;
            }


            if (!otpSent) {

                toast(
                    "Please request an OTP first."
                );

                return;
            }


            /* =========================================
               8-DIGIT OTP VALIDATION
               ========================================= */

            if (!/^\d{8}$/.test(otp)) {

                toast(
                    "Please enter the 8-digit OTP."
                );

                $("loginOtp").focus();

                return;
            }


            const button =
                $("loginSubmitBtn");


            if (button) {

                button.disabled = true;

                button.textContent =
                    "Verifying...";
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/verify-otp`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                identifier:
                                    identifier,

                                otp:
                                    otp

                            })
                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "Verify OTP Response:",
                    result
                );


                if (
                    !response.ok ||
                    !result.success
                ) {

                    toast(
                        result.message ||
                        "Invalid or expired OTP."
                    );

                    return;
                }


                /* =========================================
                   SAVE SUPABASE TOKENS
                   ========================================= */

                if (
                    result.data &&
                    result.data.accessToken
                ) {

                    localStorage.setItem(
                        "medzyra_access_token",
                        result.data.accessToken
                    );
                }


                if (
                    result.data &&
                    result.data.refreshToken
                ) {

                    localStorage.setItem(
                        "medzyra_refresh_token",
                        result.data.refreshToken
                    );
                }


                /* =========================================
                   USER DATA
                   ========================================= */

                const user =
                    result.data;


                currentUser = {

                    id:
                        user.userId,

                    fullName:
                        user.fullName,

                    email:
                        user.email,

                    phone:
                        user.phone,

                    appointments: [],

                    medicines: [],

                    documents: []
                };


                /* =========================================
                   SAVE CURRENT USER
                   ========================================= */

                syncCurrent();


                /* =========================================
                   LOGIN SUCCESS
                   ========================================= */

                toast(
                    "Login successful 🎉"
                );


                /* =========================================
                   OPEN DASHBOARD
                   ========================================= */

                enterDashboard();


        } catch (error) {

                console.error(
                    "Verify OTP Error:",
                    error
                );

                toast(
                    "Unable to connect to MedZyra server."
                );


        } finally {

                if (button) {

                    button.disabled = false;

                    button.textContent =
                        "Login";
                }
            }
        }
    );
}


/* =========================================================
   LOGIN IDENTIFIER INPUT
   ========================================================= */

if ($("loginIdentifier")) {

    $("loginIdentifier")
        .addEventListener(
            "input",
            () => {

                otpSent = false;

                if (
                    !$("loginIdentifier")
                        .value
                        .trim()
                ) {

                    toggleOtpControls(false);
                }
            }
        );
}


/* =========================================================
   REGISTRATION FORM
   ========================================================= */

if ($("registerForm")) {

    $("registerForm").addEventListener(
        "submit",
        async e => {

            e.preventDefault();


            /* =========================================
               STEP 1 DATA
               ========================================= */

            const fullName =
                $("fullName")
                    .value
                    .trim();


            const phoneInput =
                $("phone").value;

            const phone =
                normalizeLoginIdentifier(phoneInput);


            const email =
                $("email")
                    .value
                    .trim()
                    .toLowerCase();


            const dateOfBirth =
                $("dob")
                    .value;


            const gender =
                $("gender")
                    .value;


            const bloodGroup =
                $("bloodGroup")
                    .value;


            const city =
                $("city")
                    .value
                    .trim();


            const emergencyInput =
                $("emergency").value;

            const emergencyContact =
                normalizeLoginIdentifier(emergencyInput);


            const termsAccepted =
                $("terms")
                    .checked;


            /* =========================================
               STEP 2 DATA
               ========================================= */

            const height =
                $("height")
                    .value ||
                null;


            const weight =
                $("weight")
                    .value ||
                null;


            const allergies =
                $("allergies")
                    .value
                    .trim() ||
                "None";


            const smoking =
                $("smoking")
                    .value;


            const drinking =
                $("drinking")
                    .value;


            const exercise =
                $("exercise")
                    .value;


            const chronicConditions =
                $("chronic")
                    .value
                    .trim() ||
                "None";


            /* =========================================
               VALIDATION
               ========================================= */

            if (!fullName) {

                toast(
                    "Please enter your full name."
                );

                return;
            }


            if (!phone) {

                toast(
                    "Please enter your phone number."
                );

                return;
            }


            if (!isIndianMobile(phone)) {

                toast(
                    "Enter a valid 10-digit phone number."
                );

                return;
            }


            if (!email) {

                toast(
                    "Please enter your email."
                );

                return;
            }


            if (!termsAccepted) {

                toast(
                    "Please accept the Terms & Conditions."
                );

                return;
            }


            /* =========================================
               PREPARE BACKEND DATA
               ========================================= */

            const registrationData = {

                fullName,

                phone,

                email,

                dateOfBirth,

                gender,

                bloodGroup,

                city,

                emergencyContact,

                termsAccepted,

                height,

                weight,

                allergies,

                smoking,

                drinking,

                exercise,

                chronicConditions
            };


            console.log(
                "Sending registration data:",
                registrationData
            );


            /* =========================================
               CREATE ACCOUNT BUTTON
               ========================================= */

            const createAccountBtn =
                $("registerForm")
                    .querySelector(
                        'button[type="submit"]'
                    );


            if (createAccountBtn) {

                createAccountBtn.disabled =
                    true;

                createAccountBtn.textContent =
                    "Creating Account...";
            }


            try {

                /* =====================================
                   CALL MEDZYRA BACKEND
                   ===================================== */

                const response =
                    await fetch(
                        `${API_URL}/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    registrationData
                                )
                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "Backend response:",
                    result
                );


                /* =====================================
                   HANDLE BACKEND ERROR
                   ===================================== */

                if (
                    !response.ok ||
                    !result.success
                ) {

                    toast(
                        result.message ||
                        "Failed to create account."
                    );

                    return;
                }


                /* =====================================
                   USER ID FROM SUPABASE
                   ===================================== */

                const userId =
                    result.data.userId;


                /* =====================================
                   CREATE DASHBOARD USER OBJECT
                   ===================================== */

                currentUser = {

                    id:
                        userId,

                    fullName,

                    phone,

                    email,

                    dob:
                        dateOfBirth,

                    age:
                        calculateAge(
                            dateOfBirth
                        ),

                    gender,

                    bloodGroup,

                    city,

                    emergency:
                        emergencyContact,

                    height:
                        height ||
                        "Not added",

                    weight:
                        weight ||
                        "Not added",

                    allergies,

                    smoking,

                    drinking,

                    exercise,

                    chronic:
                        chronicConditions,

                    appointments: [],

                    medicines: [],

                    documents: []
                };


                /* =====================================
                   SAVE CURRENT USER
                   ===================================== */

                syncCurrent();


                /* =====================================
                   SUCCESS
                   ===================================== */

                toast(
                    "Account created successfully! 🎉"
                );


                /* =====================================
                   OPEN DASHBOARD
                   ===================================== */

                enterDashboard();


            } catch (error) {

                console.error(
                    "Registration request error:",
                    error
                );

                toast(
                    "Unable to connect to MedZyra server."
                );


            } finally {

                /* =====================================
                   ENABLE BUTTON AGAIN
                   ===================================== */

                if (createAccountBtn) {

                    createAccountBtn.disabled =
                        false;

                    createAccountBtn.textContent =
                        "Create Account ✓";
                }
            }
        }
    );
}


/* =========================================================
   ENTER DASHBOARD
   ========================================================= */

function enterDashboard() {

    if ($("authScreen")) {

        $("authScreen")
            .classList
            .add("hidden");
    }


    if ($("dashboardScreen")) {

        $("dashboardScreen")
            .classList
            .remove("hidden");
    }


    renderUser();

    showView("home");
}


/* =========================================================
   RENDER USER
   ========================================================= */

function renderUser() {

    if (!currentUser) return;


    if ($("userNameTop")) {

        $("userNameTop").textContent =
            currentUser.fullName
                ? currentUser.fullName
                    .split(" ")[0]
                : "User";
    }


    if ($("avatar")) {

        $("avatar").textContent =
            currentUser.fullName
                ? currentUser.fullName
                    .charAt(0)
                    .toUpperCase()
                : "U";
    }


    if ($("healthBlood")) {

        $("healthBlood").textContent =
            currentUser.bloodGroup ||
            "—";
    }


    if ($("healthAge")) {

        $("healthAge").textContent =
            currentUser.dob
                ? calculateAge(
                    currentUser.dob
                )
                : (
                    currentUser.age ||
                    "—"
                );
    }


    if ($("healthHeight")) {

        $("healthHeight").textContent =
            currentUser.height ===
            "Not added"

                ? "—"

                : (
                    currentUser.height
                        ? currentUser.height +
                          " cm"
                        : "—"
                );
    }


    if ($("healthWeight")) {

        $("healthWeight").textContent =
            currentUser.weight ===
            "Not added"

                ? "—"

                : (
                    currentUser.weight
                        ? currentUser.weight +
                          " kg"
                        : "—"
                );
    }


    if ($("basicInfo")) {

        $("basicInfo").innerHTML =
            infoRows([

                [
                    "Full Name",
                    currentUser.fullName
                ],

                [
                    "Email",
                    currentUser.email
                ],

                [
                    "Phone",
                    currentUser.phone
                ],

                [
                    "Date of Birth",
                    currentUser.dob ||
                    "Not added"
                ],

                [
                    "Gender",
                    currentUser.gender
                ],

                [
                    "City",
                    currentUser.city
                ]

            ]);
    }


    if ($("medicalInfo")) {

        $("medicalInfo").innerHTML =
            infoRows([

                [
                    "Blood Group",
                    currentUser.bloodGroup
                ],

                [
                    "Allergies",
                    currentUser.allergies
                ],

                [
                    "Chronic Conditions",
                    currentUser.chronic
                ]

            ]);
    }


    if ($("lifestyleInfo")) {

        $("lifestyleInfo").innerHTML =
            infoRows([

                [
                    "Smoking",
                    currentUser.smoking
                ],

                [
                    "Drinking",
                    currentUser.drinking
                ],

                [
                    "Exercise",
                    currentUser.exercise
                ]

            ]);
    }


    if ($("emergencyInfo")) {

        $("emergencyInfo").innerHTML =
            infoRows([

                [
                    "Emergency Contact",
                    currentUser.emergency
                ]

            ]);
    }


    if ($("setName")) {

        $("setName").value =
            currentUser.fullName ||
            "";
    }


    if ($("setEmail")) {

        $("setEmail").value =
            currentUser.email ||
            "";
    }


    renderAppointments();

    renderMedicines();

    renderDocuments();
}


/* =========================================================
   INFO ROWS
   ========================================================= */

function infoRows(rows) {

    return rows
        .map(row => `

            <div class="info-row">

                <span>
                    ${escapeHTML(
                        String(
                            row[0] ??
                            ""
                        )
                    )}
                </span>

                <span>
                    ${escapeHTML(
                        String(
                            row[1] ??
                            ""
                        )
                    )}
                </span>

            </div>

        `)
        .join("");
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(s) {

    return String(s).replace(
        /[&<>"']/g,
        c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[c])
    );
}


/* =========================================================
   DASHBOARD VIEWS
   ========================================================= */

function showView(view) {

    document
        .querySelectorAll(".view")
        .forEach(v =>
            v.classList.add("hidden")
        );


    const target =
        $(
            "view" +
            view.charAt(0).toUpperCase() +
            view.slice(1)
        );


    if (target) {

        target
            .classList
            .remove("hidden");
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.view ===
                view
            );
        });
}


/* =========================================================
   NAVIGATION
   ========================================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.onclick = () => {

            showView(
                button.dataset.view
            );
        };
    });


document
    .querySelectorAll("[data-view-jump]")
    .forEach(button => {

        button.onclick = () => {

            showView(
                button.dataset.viewJump
            );
        };
    });


/* =========================================================
   APPOINTMENTS
   ========================================================= */

if ($("bookBtn")) {

    $("bookBtn").onclick = () => {

        const date =
            $("apptDate").value;

        const time =
            $("apptTime").value;

        const dept =
            $("apptDept").value;


        if (!date || !time) {

            toast(
                "Select an appointment date and time."
            );

            return;
        }


        if (!currentUser) {

            toast(
                "Please login first."
            );

            return;
        }


        if (!currentUser.appointments) {

            currentUser.appointments = [];
        }


        currentUser.appointments.push({

            id:
                Date.now(),

            dept,

            date,

            time
        });


        syncCurrent();

        renderAppointments();


        toast(
            "Appointment booked successfully."
        );
    };
}


/* =========================================================
   RENDER APPOINTMENTS
   ========================================================= */

function renderAppointments() {

    const list =
        $("appointmentList");

    if (!list) return;


    if (
        !currentUser?.appointments?.length
    ) {

        list.innerHTML = `

            <div
                class="empty-state"
                style="padding:35px"
            >

                <span>▣</span>

                <h3>
                    No upcoming appointments
                </h3>

                <p>
                    Your booked appointments
                    will appear here.
                </p>

            </div>

        `;

        return;
    }


    list.innerHTML =
        currentUser.appointments
            .map(
                appointment => `

                    <div class="list-item">

                        <div>

                            <b>
                                ${escapeHTML(
                                    appointment.dept
                                )}
                            </b>

                            <small>
                                ${escapeHTML(
                                    appointment.date
                                )}
                                •
                                ${escapeHTML(
                                    appointment.time
                                )}
                            </small>

                        </div>

                        <button
                            class="delete-btn"
                            onclick="deleteAppointment(${appointment.id})"
                        >
                            Cancel
                        </button>

                    </div>

                `
            )
            .join("");
}


/* =========================================================
   DELETE APPOINTMENT
   ========================================================= */

window.deleteAppointment =
    id => {

        if (!currentUser) return;


        currentUser.appointments =
            currentUser.appointments
                .filter(
                    appointment =>
                        appointment.id !== id
                );


        syncCurrent();

        renderAppointments();

        toast(
            "Appointment cancelled."
        );
    };


/* =========================================================
   DOCUMENT UPLOAD
   ========================================================= */

if ($("docInput")) {

    $("docInput").onchange = e => {

        const file =
            e.target.files[0];

        if (!file) return;


        if (!currentUser) {

            toast(
                "Please login first."
            );

            return;
        }


        if (!currentUser.documents) {

            currentUser.documents = [];
        }


        currentUser.documents.push({

            id:
                Date.now(),

            name:
                file.name,

            size:
                (
                    file.size /
                    1024
                ).toFixed(1) +
                " KB",

            date:
                new Date()
                    .toLocaleDateString()
        });


        syncCurrent();

        renderDocuments();

        e.target.value = "";


        toast(
            "Document added to your records."
        );
    };
}


/* =========================================================
   RENDER DOCUMENTS
   ========================================================= */

function renderDocuments() {

    const list =
        $("documentList");

    if (!list) return;


    if (
        !currentUser?.documents?.length
    ) {

        list.innerHTML = "";

        return;
    }


    list.innerHTML =
        currentUser.documents
            .map(
                document => `

                    <div class="list-item">

                        <div>

                            <b>
                                ▤
                                ${escapeHTML(
                                    document.name
                                )}
                            </b>

                            <small>
                                ${escapeHTML(
                                    document.size
                                )}
                                • Added
                                ${escapeHTML(
                                    document.date
                                )}
                            </small>

                        </div>

                        <button
                            class="delete-btn"
                            onclick="deleteDocument(${document.id})"
                        >
                            Remove
                        </button>

                    </div>

                `
            )
            .join("");
}


/* =========================================================
   DELETE DOCUMENT
   ========================================================= */

window.deleteDocument =
    id => {

        if (!currentUser) return;


        currentUser.documents =
            currentUser.documents
                .filter(
                    document =>
                        document.id !== id
                );


        syncCurrent();

        renderDocuments();

        toast(
            "Document removed."
        );
    };


/* =========================================================
   MEDICINES
   ========================================================= */

if ($("addMedBtn")) {

    $("addMedBtn").onclick = () => {

        const name =
            $("medName")
                .value
                .trim();

        const dose =
            $("medDose")
                .value
                .trim();

        const time =
            $("medTime")
                .value;


        if (!name || !dose || !time) {

            toast(
                "Enter medicine, dosage and time."
            );

            return;
        }


        if (!currentUser) {

            toast(
                "Please login first."
            );

            return;
        }


        if (!currentUser.medicines) {

            currentUser.medicines = [];
        }


        currentUser.medicines.push({

            id:
                Date.now(),

            name,

            dose,

            time
        });


        syncCurrent();

        renderMedicines();


        $("medName").value = "";

        $("medDose").value = "";

        $("medTime").value = "";


        toast(
            "Medicine added."
        );
    };
}


/* =========================================================
   RENDER MEDICINES
   ========================================================= */

function renderMedicines() {

    const list =
        $("medicineList");

    if (!list) return;


    if (
        !currentUser?.medicines?.length
    ) {

        list.innerHTML = `

            <div
                class="empty-state"
                style="padding:35px"
            >

                <span>◷</span>

                <h3>
                    No medicines added
                </h3>

                <p>
                    Add your regular
                    medicines above.
                </p>

            </div>

        `;

        return;
    }


    list.innerHTML =
        currentUser.medicines
            .map(
                medicine => `

                    <div class="list-item">

                        <div>

                            <b>
                                ${escapeHTML(
                                    medicine.name
                                )}
                            </b>

                            <small>
                                ${escapeHTML(
                                    medicine.dose
                                )}
                                •
                                ${escapeHTML(
                                    medicine.time
                                )}
                            </small>

                        </div>

                        <button
                            class="delete-btn"
                            onclick="deleteMedicine(${medicine.id})"
                        >
                            Remove
                        </button>

                    </div>

                `
            )
            .join("");
}


/* =========================================================
   DELETE MEDICINE
   ========================================================= */

window.deleteMedicine =
    id => {

        if (!currentUser) return;


        currentUser.medicines =
            currentUser.medicines
                .filter(
                    medicine =>
                        medicine.id !== id
                );


        syncCurrent();

        renderMedicines();

        toast(
            "Medicine removed."
        );
    };


/* =========================================================
   SETTINGS
   ========================================================= */

if ($("saveSettings")) {

    $("saveSettings").onclick = () => {

        const name =
            $("setName")
                .value
                .trim();

        const email =
            $("setEmail")
                .value
                .trim()
                .toLowerCase();


        if (!name || !email) {

            toast(
                "Name and email are required."
            );

            return;
        }


        if (!currentUser) {

            toast(
                "Please login first."
            );

            return;
        }


        currentUser.fullName =
            name;

        currentUser.email =
            email;


        syncCurrent();

        renderUser();


        toast(
            "Settings saved."
        );
    };
}


/* =========================================================
   SYNC CURRENT USER
   ========================================================= */

function syncCurrent() {

    if (!currentUser) return;


    const index =
        users.findIndex(
            user =>
                user.id ===
                currentUser.id
        );


    if (index > -1) {

        users[index] =
            currentUser;

    } else {

        users.push(
            currentUser
        );
    }


    saveUsers();


    localStorage.setItem(
        "medikiosk_current",
        JSON.stringify(
            currentUser
        )
    );


    localStorage.setItem(
        "currentUser",
        JSON.stringify(
            currentUser
        )
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

if ($("logoutBtn")) {

    $("logoutBtn").onclick = () => {

        localStorage.removeItem(
            "medikiosk_current"
        );

        localStorage.removeItem(
            "currentUser"
        );

        localStorage.removeItem(
            "medzyra_access_token"
        );

        localStorage.removeItem(
            "medzyra_refresh_token"
        );


        currentUser = null;

        loginIdentifier = "";

        otpSent = false;


        if ($("dashboardScreen")) {

            $("dashboardScreen")
                .classList
                .add("hidden");
        }


        if ($("authScreen")) {

            $("authScreen")
                .classList
                .remove("hidden");
        }


        if ($("loginForm")) {

            $("loginForm").reset();
        }


        toggleOtpControls(false);

        setAuthMode("login");


        toast(
            "Logged out successfully."
        );
    };
}


/* =========================================================
   RESEND OTP
   ========================================================= */

if ($("forgotBtn")) {

    $("forgotBtn").onclick = async () => {

        const identifier =
            $("loginIdentifier")
                .value
                .trim()
                .toLowerCase();


        if (!identifier) {

            toast(
                "Enter your email address first."
            );

            $("loginIdentifier").focus();

            return;
        }


        loginIdentifier =
            identifier;


        const button =
            $("forgotBtn");


        button.disabled = true;

        button.textContent =
            "Sending...";


        try {

            const response =
                await fetch(
                    `${API_URL}/auth/send-otp`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            identifier:
                                identifier
                        })
                    }
                );


            const result =
                await response.json();


            console.log(
                "Resend OTP Response:",
                result
            );


            if (
                !response.ok ||
                !result.success
            ) {

                toast(
                    result.message ||
                    "Failed to resend OTP."
                );

                return;
            }


            otpSent = true;


            toggleOtpControls(true);


            if ($("loginOtp")) {

                $("loginOtp").value = "";

                $("loginOtp").focus();
            }


            toast(
                "New 8-digit OTP sent 📧"
            );


        } catch (error) {

            console.error(
                "Resend OTP Error:",
                error
            );

            toast(
                "Unable to connect to MedZyra server."
            );


        } finally {

            button.disabled = false;

            button.textContent =
                "Resend OTP";
        }
    };
}


/* =========================================================
   AI ASSISTANT
   ========================================================= */

if ($("assistantBtn")) {

    $("assistantBtn").onclick = () => {

        toast(
            "AI Assistant demo: How can I help with your health records?"
        );
    };
}


/* =========================================================
   FAMILY MEMBER
   ========================================================= */

if ($("addFamilyBtn")) {

    $("addFamilyBtn").onclick = () => {

        toast(
            "Family member module is ready for integration."
        );
    };
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

renderAllergySuggestions();


if (currentUser) {

    enterDashboard();

} else {

    setAuthMode("login");
}