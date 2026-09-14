const $ = id => document.getElementById(id);

let users = JSON.parse(localStorage.getItem("medikiosk_users") || "[]");
let currentUser = JSON.parse(localStorage.getItem("medikiosk_current") || "null");
const otpStore = {};
const predefinedAllergies = [
  "Penicillin", "Peanuts", "Shellfish", "Eggs", "Milk", "Soy", "Wheat", "Tree Nuts", "Fish",
  "Latex", "Dust Mites", "Pollen", "Animal Dander", "Mold", "Bee Sting", "Sulfa Drugs", "Aspirin",
  "Ibuprofen", "Tomatoes", "Strawberries"
];

function toast(message){
  const el=$("toast"); el.textContent=message; el.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.classList.remove("show"),2600);
}
function saveUsers(){localStorage.setItem("medikiosk_users",JSON.stringify(users));}
function toggleOtpControls(show){
  $("otpSection").classList.toggle("hidden",!show);
  $("loginSubmitBtn").classList.toggle("hidden",!show);
  $("forgotBtn").classList.toggle("hidden",!show);
}
function findUserByIdentifier(identifier){
  if(!identifier) return null;
  const cleanIdentifier=identifier.trim().toLowerCase();
  return users.find(u=>(u.email||"").toLowerCase()===cleanIdentifier || (u.phone||"").replace(/\D/g,"")===cleanIdentifier.replace(/\D/g,""));
}
function sendOtp(identifier){
  const user=findUserByIdentifier(identifier);
  if(!user){toast("Account not found. Please create an account first."); return false;}
  const otp=String(Math.floor(100000+Math.random()*900000));
  otpStore[user.id]=otp;
  $("loginOtp").value="";
  toggleOtpControls(true);
  toast(`OTP sent successfully. Demo code: ${otp}`);
  $("loginOtp").focus();
  return true;
}
function renderAllergySuggestions(){
  const container=$("allergySuggestions");
  if(!container)return;
  container.innerHTML=predefinedAllergies.map(allergy=>`
    <button type="button" class="allergy-chip" data-allergy="${allergy}" style="border:1px solid #cfe3f7; background:#fff; color:#1b4d82; border-radius:999px; padding:6px 10px; font-size:12px; font-weight:600; cursor:pointer;">
      ${allergy}
    </button>
  `).join("");

  container.querySelectorAll(".allergy-chip").forEach(button=>{
    button.onclick=()=>{
      const allergiesField=$("allergies");
      if(!allergiesField)return;
      const existing=(allergiesField.value||"").split(",").map(item=>item.trim()).filter(Boolean);
      const selected=button.dataset.allergy;
      if(!existing.includes(selected)){
        existing.push(selected);
        allergiesField.value=existing.join(", ");
      }
      allergiesField.focus();
    };
  });
}
function calculateAge(dob){
  if(!dob) return "—";
  const birthDate=new Date(dob);
  if(Number.isNaN(birthDate.getTime())) return "—";
  const today=new Date();
  let age=today.getFullYear()-birthDate.getFullYear();
  const monthDiff=today.getMonth()-birthDate.getMonth();
  if(monthDiff<0 || (monthDiff===0 && today.getDate()<birthDate.getDate())) age--;
  return age;
}
function setAuthMode(mode){
  const login=mode==="login";
  $("loginForm").classList.toggle("hidden",!login);
  $("registerForm").classList.toggle("hidden",login);
  $("authTitle").textContent=login?"Welcome back.":"Create your account.";
  $("authSubtitle").textContent=login?"Sign in to continue your complete health journey.":"Tell us a little about yourself to build your health profile.";
  if(login){
    $("loginOtp").value="";
    toggleOtpControls(false);
  }
  window.scrollTo({top:0,behavior:"smooth"});
}
function showStep(n){
  $("step1").classList.toggle("hidden",n!==1); $("step2").classList.toggle("hidden",n!==2);
  $("stepNumber").textContent=n; $("regProgress").style.width=n===1?"50%":"100%";
}
function validateStep1(){
  const ids=["fullName","phone","email","dob","gender","bloodGroup","city","emergency"];
  for(const id of ids){ if(!$(id).value.trim()){toast("Please complete all required details.");$(id).focus();return false;} }
  if(!$("terms").checked){toast("Please accept the Terms & Conditions.");return false;}
  if(!/^\d{10}$/.test($("phone").value.replace(/\D/g,""))){toast("Enter a valid 10-digit phone number.");return false;}
  if(!/^\d{10}$/.test($("emergency").value.replace(/\D/g,""))){toast("Enter a valid emergency contact number.");return false;}
  return true;
}
$("showRegister").onclick=()=>{setAuthMode("register");showStep(1)};
$("showLogin").onclick=()=>setAuthMode("login");
$("nextStep").onclick=()=>{if(validateStep1())showStep(2)};
$("backStep").onclick=()=>showStep(1);

$("loginForm").addEventListener("submit",e=>{
  e.preventDefault();
  const identifier=$("loginIdentifier").value.trim();
  const otp=$("loginOtp").value.trim();
  const user=findUserByIdentifier(identifier);
  if(!user){toast("Account not found. Please create an account first.");return}
  if(!otp){toast("Please enter the OTP sent to your registered email or phone."); return}
  if(otpStore[user.id]!==otp){toast("Invalid OTP. Please resend and try again."); return}
  currentUser=user; localStorage.setItem("medikiosk_current",JSON.stringify(user)); enterDashboard();
});

$("sendOtpBtn").onclick=()=>{
  const identifier=$("loginIdentifier").value.trim();
  if(!identifier){toast("Enter your email or phone first."); $("loginIdentifier").focus(); return;}
  sendOtp(identifier);
};

$("loginIdentifier").addEventListener("input",()=>{
  if(!$("loginIdentifier").value.trim()){
    toggleOtpControls(false);
  }
});

$("registerForm").addEventListener("submit",e=>{
  e.preventDefault();
  const email=$("email").value.trim().toLowerCase(), phone=$("phone").value.replace(/\D/g,"");
  if(users.some(u=>u.email===email)){toast("An account with this email already exists.");showStep(1);return}
  if(users.some(u=>u.phone===phone)){toast("An account with this phone already exists.");showStep(1);return}
  const user={
    id:Date.now(), fullName:$("fullName").value.trim(), phone, email,
    dob:$("dob").value, age:calculateAge($("dob").value), gender:$("gender").value, bloodGroup:$("bloodGroup").value, city:$("city").value.trim(),
    emergency:$("emergency").value.replace(/\D/g,""), height:$("height").value||"Not added",
    weight:$("weight").value||"Not added", allergies:$("allergies").value.trim()||"None",
    smoking:$("smoking").value, drinking:$("drinking").value, exercise:$("exercise").value,
    chronic:$("chronic").value.trim()||"None", appointments:[], medicines:[], documents:[]
  };
  users.push(user); saveUsers(); currentUser=user; localStorage.setItem("medikiosk_current",JSON.stringify(user));
  toast("Account created successfully!");
  enterDashboard();
});

function enterDashboard(){
  $("authScreen").classList.add("hidden");$("dashboardScreen").classList.remove("hidden");
  renderUser(); showView("home");
}
function renderUser(){
  if(!currentUser)return;
  $("userNameTop").textContent=currentUser.fullName.split(" ")[0];
  $("avatar").textContent=currentUser.fullName.charAt(0).toUpperCase();
  $("healthBlood").textContent=currentUser.bloodGroup;
  $("healthAge").textContent=currentUser.dob ? calculateAge(currentUser.dob) : (currentUser.age || "—");
  $("healthHeight").textContent=currentUser.height==="Not added"?"—":currentUser.height+" cm";
  $("healthWeight").textContent=currentUser.weight==="Not added"?"—":currentUser.weight+" kg";
  $("basicInfo").innerHTML=infoRows([
    ["Full Name",currentUser.fullName],["Email",currentUser.email],["Phone",currentUser.phone],["Date of Birth",currentUser.dob||"Not added"],["Gender",currentUser.gender],["City",currentUser.city]
  ]);
  $("medicalInfo").innerHTML=infoRows([
    ["Blood Group",currentUser.bloodGroup],["Allergies",currentUser.allergies],["Chronic Conditions",currentUser.chronic]
  ]);
  $("lifestyleInfo").innerHTML=infoRows([
    ["Smoking",currentUser.smoking],["Drinking",currentUser.drinking],["Exercise",currentUser.exercise]
  ]);
  $("emergencyInfo").innerHTML=infoRows([["Emergency Contact",currentUser.emergency]]);
  $("setName").value=currentUser.fullName;$("setEmail").value=currentUser.email;
  renderAppointments();renderMedicines();renderDocuments();
}
function infoRows(rows){return rows.map(r=>`<div class="info-row"><span>${r[0]}</span><span>${escapeHTML(String(r[1]))}</span></div>`).join("")}
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

function showView(view){
  document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));
  $("view"+view.charAt(0).toUpperCase()+view.slice(1)).classList.remove("hidden");
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
}
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>showView(b.dataset.view));
document.querySelectorAll("[data-view-jump]").forEach(b=>b.onclick=()=>showView(b.dataset.viewJump));

$("bookBtn").onclick=()=>{
  const date=$("apptDate").value,time=$("apptTime").value,dept=$("apptDept").value;
  if(!date||!time){toast("Select an appointment date and time.");return}
  currentUser.appointments.push({id:Date.now(),dept,date,time});
  syncCurrent();renderAppointments();toast("Appointment booked successfully.");
};
function renderAppointments(){
  const list=$("appointmentList");
  if(!currentUser?.appointments?.length){list.innerHTML='<div class="empty-state" style="padding:35px"><span>▣</span><h3>No upcoming appointments</h3><p>Your booked appointments will appear here.</p></div>';return}
  list.innerHTML=currentUser.appointments.map(a=>`<div class="list-item"><div><b>${escapeHTML(a.dept)}</b><small>${a.date} • ${a.time}</small></div><button class="delete-btn" onclick="deleteAppointment(${a.id})">Cancel</button></div>`).join("");
}
window.deleteAppointment=id=>{currentUser.appointments=currentUser.appointments.filter(a=>a.id!==id);syncCurrent();renderAppointments();toast("Appointment cancelled.")};

$("docInput").onchange=e=>{
  const file=e.target.files[0];if(!file)return;
  currentUser.documents.push({id:Date.now(),name:file.name,size:(file.size/1024).toFixed(1)+" KB",date:new Date().toLocaleDateString()});
  syncCurrent();renderDocuments();e.target.value="";toast("Document added to your records.");
};
function renderDocuments(){
  const list=$("documentList");
  if(!currentUser?.documents?.length){list.innerHTML="";return}
  list.innerHTML=currentUser.documents.map(d=>`<div class="list-item"><div><b>▤ ${escapeHTML(d.name)}</b><small>${d.size} • Added ${d.date}</small></div><button class="delete-btn" onclick="deleteDocument(${d.id})">Remove</button></div>`).join("");
}
window.deleteDocument=id=>{currentUser.documents=currentUser.documents.filter(d=>d.id!==id);syncCurrent();renderDocuments();toast("Document removed.")};

$("addMedBtn").onclick=()=>{
  const name=$("medName").value.trim(),dose=$("medDose").value.trim(),time=$("medTime").value;
  if(!name||!dose||!time){toast("Enter medicine, dosage and time.");return}
  currentUser.medicines.push({id:Date.now(),name,dose,time});
  syncCurrent();renderMedicines();$("medName").value="";$("medDose").value="";$("medTime").value="";toast("Medicine added.");
};
function renderMedicines(){
  const list=$("medicineList");
  if(!currentUser?.medicines?.length){list.innerHTML='<div class="empty-state" style="padding:35px"><span>◷</span><h3>No medicines added</h3><p>Add your regular medicines above.</p></div>';return}
  list.innerHTML=currentUser.medicines.map(m=>`<div class="list-item"><div><b>${escapeHTML(m.name)}</b><small>${escapeHTML(m.dose)} • ${m.time}</small></div><button class="delete-btn" onclick="deleteMedicine(${m.id})">Remove</button></div>`).join("");
}
window.deleteMedicine=id=>{currentUser.medicines=currentUser.medicines.filter(m=>m.id!==id);syncCurrent();renderMedicines();toast("Medicine removed.")};

$("saveSettings").onclick=()=>{
  const name=$("setName").value.trim(),email=$("setEmail").value.trim().toLowerCase();
  if(!name||!email){toast("Name and email are required.");return}
  currentUser.fullName=name;currentUser.email=email;syncCurrent();renderUser();toast("Settings saved.");
};
function syncCurrent(){
  const i=users.findIndex(u=>u.id===currentUser.id);if(i>-1)users[i]=currentUser;
  saveUsers();localStorage.setItem("medikiosk_current",JSON.stringify(currentUser));
}
$("logoutBtn").onclick=()=>{localStorage.removeItem("medikiosk_current");currentUser=null;$("dashboardScreen").classList.add("hidden");$("authScreen").classList.remove("hidden");$("loginForm").reset();setAuthMode("login");toast("Logged out successfully.")};
$("forgotBtn").onclick=()=>{
  const identifier=$("loginIdentifier").value.trim();
  if(!identifier){toast("Enter your email or phone first."); $("loginIdentifier").focus(); return;}
  sendOtp(identifier);
};
$("assistantBtn").onclick=()=>toast("AI Assistant demo: How can I help with your health records?");
$("addFamilyBtn").onclick=()=>toast("Family member module is ready for integration.");

renderAllergySuggestions();
if(currentUser)enterDashboard();
else setAuthMode("login");
