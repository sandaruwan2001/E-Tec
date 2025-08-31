// Init AOS animations
AOS.init({ once: true, duration: 600, easing: 'ease-out' });

// Theme: default to system; click toggle; double-click reset to Auto
(function(){
  const storageKey = 'etec-theme';
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  const getStored = () => localStorage.getItem(storageKey);
  const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const autoMode = () => prefersDark() ? 'dark' : 'light';

  function apply(theme){ root.setAttribute('data-bs-theme', theme); }
  function updateIcon(){
    const mode = root.getAttribute('data-bs-theme') || autoMode();
    const sun = themeToggle?.querySelector('.sun');
    const moon = themeToggle?.querySelector('.moon');
    if (sun && moon){
      sun.style.display = (mode === 'dark') ? 'none' : 'inline';
      moon.style.display = (mode === 'dark') ? 'inline' : 'none';
    }
    themeToggle?.setAttribute('aria-label', `Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`);
  }

  // Init
  const saved = getStored();
  if (saved) apply(saved); else apply(autoMode());
  updateIcon();

  // Click = toggle (manual)
  themeToggle?.addEventListener('click', () => {
    const now = root.getAttribute('data-bs-theme') || autoMode();
    const next = (now === 'dark') ? 'light' : 'dark';
    apply(next);
    localStorage.setItem(storageKey, next);
    updateIcon();
  });

  // Double-click = back to Auto
  themeToggle?.addEventListener('dblclick', () => {
    localStorage.removeItem(storageKey);
    apply(autoMode());
    updateIcon();
  });

  // Follow OS changes only in Auto
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!getStored()){ apply(autoMode()); updateIcon(); }
  });
})();

// Year
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Back to top
const toTop = document.getElementById('toTop');
const revealTop = () => { if (window.scrollY > 600) toTop?.classList.add('show'); else toTop?.classList.remove('show'); };
window.addEventListener('scroll', revealTop, { passive: true });
toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
revealTop();

// Video play placeholder
document.querySelector('.video .play')?.addEventListener('click', () => {
  alert('Add your video URL or YouTube link here.');
});

// Forms: contact + newsletter (simple validation)
const contactForm = document.querySelector('form.form');
const showError = (el, msg) => {
  const holder = el.closest('.form-row')?.querySelector('.error');
  if (holder) holder.textContent = msg || '';
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
};
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const ids = ['name','email','program','message'];
  let valid = true;
  ids.forEach(id => {
    const f = contactForm.querySelector('#'+id);
    if (!f) return;
    if (!f.value.trim()) { showError(f, 'Required'); valid = false; }
    else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) { showError(f, 'Enter a valid email'); valid = false; }
    else showError(f, '');
  });
  if (!valid) return;
  alert('Thanks! We will contact you soon.');
  contactForm.reset();
});
const newsletter = document.querySelector('.newsletter');
newsletter?.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = newsletter.querySelector('input[type="email"]');
  if (!input.value.trim()) { input.focus(); return; }
  alert('Subscribed! Check your inbox.');
  input.value = '';
});

// ======= Simple Portal (Demo with localStorage) =======
const DB = {
  keys: { accounts:'etec_accounts', marks:'etec_marks', events:'etec_events', current:'etec_current_user' },
  getAccounts(){ return JSON.parse(localStorage.getItem(this.keys.accounts) || '{}'); },
  setAccounts(obj){ localStorage.setItem(this.keys.accounts, JSON.stringify(obj)); },
  getMarks(){ return JSON.parse(localStorage.getItem(this.keys.marks) || '[]'); },
  setMarks(arr){ localStorage.setItem(this.keys.marks, JSON.stringify(arr)); },
  getEvents(){ return JSON.parse(localStorage.getItem(this.keys.events) || '[]'); },
  setEvents(arr){ localStorage.setItem(this.keys.events, JSON.stringify(arr)); },
  getCurrent(){ const j = localStorage.getItem(this.keys.current); return j ? JSON.parse(j) : null; },
  setCurrent(u){ if (u) localStorage.setItem(this.keys.current, JSON.stringify(u)); else localStorage.removeItem(this.keys.current); }
};

// Seed demo admin if none
(function seedAdmin(){
  const accounts = DB.getAccounts();
  const hasAdmin = Object.values(accounts).some(a => a.role === 'admin');
  if (!hasAdmin){
    const admin = {
      id: 'admin@etec.lk',
      email: 'admin@etec.lk',
      role: 'admin',
      name: 'E‑Tec Admin',
      password: 'admin123'
    };
    accounts[admin.email] = admin;
    DB.setAccounts(accounts);
  }
})();

// Elements
const openLoginBtn = document.getElementById('openLogin');
const openLoginBtn2 = document.getElementById('openLogin2');
const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');
const tabs = document.querySelectorAll('.tab');
const navDashboardItem = document.getElementById('navDashboardItem');
const dashUserName = document.getElementById('dashUserName');
const dashboardSection = document.getElementById('dashboard');
const adminTools = document.getElementById('adminTools');
const myDetails = document.getElementById('myDetails');
const eventsList = document.getElementById('eventsList');
const marksTbody = document.querySelector('#marksTable tbody');
const logoutBtn = document.getElementById('logoutBtn');

// Modal open/close
const showLogin = () => { loginModal?.classList.add('open'); loginModal?.setAttribute('aria-hidden','false'); };
const hideLogin = () => { loginModal?.classList.remove('open'); loginModal?.setAttribute('aria-hidden','true'); };
openLoginBtn?.addEventListener('click', showLogin);
openLoginBtn2?.addEventListener('click', showLogin);
closeLogin?.addEventListener('click', hideLogin);
loginModal?.addEventListener('click', (e) => { if (e.target === loginModal) hideLogin(); });

// Tabs
tabs.forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('d-none'));
  const target = document.querySelector(btn.dataset.target);
  target?.classList.remove('d-none');
}));

// Helpers
function normalizeId(id){
  if (!id) return '';
  id = id.trim();
  if (id.includes('@')) return id.toLowerCase(); // email
  return id.toUpperCase(); // reg no like ET-0001
}
function accountsArray(){
  const acc = DB.getAccounts();
  return Object.values(acc);
}
function findAccount(identifier){
  const accounts = DB.getAccounts();
  const id = normalizeId(identifier);
  if (accounts[id]) return accounts[id]; // email key
  return Object.values(accounts).find(a => (a.regNo && normalizeId(a.regNo) === id)) || null;
}
function saveAccount(obj){
  const accounts = DB.getAccounts();
  const key = (obj.email || obj.id).toLowerCase();
  accounts[key] = obj;
  DB.setAccounts(accounts);
}
function setLoggedInUI(user){
  const isLogged = !!user;
  if (isLogged){
    dashUserName.textContent = user.name || 'Student';
    adminTools?.classList.toggle('d-none', user.role !== 'admin');
    navDashboardItem?.classList.toggle('d-none', false);
    logoutBtn?.classList.toggle('d-none', false);
    document.getElementById('openLogin')?.classList.add('d-none');
    dashboardSection?.classList.toggle('d-none', false);
    renderDashboard(user);
    location.hash = '#dashboard';
  } else {
    adminTools?.classList.add('d-none');
    navDashboardItem?.classList.add('d-none');
    logoutBtn?.classList.add('d-none');
    document.getElementById('openLogin')?.classList.remove('d-none');
    dashboardSection?.classList.add('d-none');
  }
}

// Forms
const studentLoginForm = document.getElementById('studentLoginForm');
const adminLoginForm = document.getElementById('adminLoginForm');
const studentSignupForm = document.getElementById('studentSignupForm');

studentLoginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('stuLoginId').value;
  const pw = document.getElementById('stuLoginPw').value;
  const acc = findAccount(id);
  if (!acc || acc.role !== 'student') return alert('Account not found or not a student');
  if (acc.password !== pw) return alert('Wrong password');
  DB.setCurrent({ email: acc.email, regNo: acc.regNo, role: acc.role, name: acc.name, stream: acc.stream, medium: acc.medium });
  hideLogin(); setLoggedInUI(DB.getCurrent());
});

adminLoginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('admLoginEmail').value;
  const pw = document.getElementById('admLoginPw').value;
  const acc = findAccount(email);
  if (!acc || acc.role !== 'admin') return alert('Admin not found');
  if (acc.password !== pw) return alert('Wrong password');
  DB.setCurrent({ email: acc.email, role: acc.role, name: acc.name });
  hideLogin(); setLoggedInUI(DB.getCurrent());
});

studentSignupForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('suName').value.trim();
  const email = document.getElementById('suEmail').value.trim().toLowerCase();
  const regNo = normalizeId(document.getElementById('suReg').value);
  const stream = document.getElementById('suStream').value;
  const medium = document.getElementById('suMedium').value;
  const pw = document.getElementById('suPw').value;
  if (!name || !email || !regNo || !stream || !medium || !pw) return alert('Please fill all fields');
  if (findAccount(email) || findAccount(regNo)) return alert('Account already exists for this email or Reg. No');
  saveAccount({ id: email, email, regNo, role:'student', name, stream, medium, password: pw });
  alert('Account created. You can login now.');
  document.querySelector('.tab[data-target="#studentLogin"]')?.click();
});

logoutBtn?.addEventListener('click', () => {
  DB.setCurrent(null);
  setLoggedInUI(null);
  alert('Logged out');
});

// Renderers
function renderEvents(){
  const evs = DB.getEvents().sort((a,b)=> (a.date||'').localeCompare(b.date));
  eventsList.innerHTML = evs.length ? '' : '<li>No upcoming events</li>';
  evs.forEach(e => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${e.title}</strong> — ${e.date || ''}<br><small>${e.desc || ''}</small>`;
    eventsList.appendChild(li);
  });
}

function renderMarksFor(regNo){
  const marks = DB.getMarks().filter(m => normalizeId(m.regNo) === normalizeId(regNo))
    .sort((a,b)=> (a.createdAt||0)-(b.createdAt||0));
  marksTbody.innerHTML = '';
  marks.forEach(m => {
    const tr = document.createElement('tr');
    const date = new Date(m.createdAt || Date.now()).toLocaleDateString();
    tr.innerHTML = `<td>${date}</td><td>${m.exam}</td><td>${m.subject}</td><td>${m.score}/${m.outOf}</td>`;
    marksTbody.appendChild(tr);
  });
}

function renderMyDetails(user){
  myDetails.innerHTML = `
    <div><strong>Name:</strong> ${user.name || '-'}</div>
    <div><strong>Email:</strong> ${user.email || '-'}</div>
    ${user.regNo ? `<div><strong>Reg. No:</strong> ${user.regNo}</div>`:''}
    ${user.stream ? `<div><strong>Stream:</strong> ${user.stream}</div>`:''}
    ${user.medium ? `<div><strong>Medium:</strong> ${user.medium}</div>`:''}
  `;
}

function renderStudentsTable(){
  const tbody = document.querySelector('#studentsTable tbody');
  const q = (document.getElementById('studentSearch')?.value || '').toLowerCase();
  const rows = accountsArray().filter(a => a.role === 'student').filter(a => {
    const s = `${a.name} ${a.email} ${a.regNo}`.toLowerCase();
    return s.includes(q);
  });
  tbody.innerHTML = '';
  rows.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.regNo||''}</td><td>${s.name||''}</td><td>${s.email||''}</td><td>${s.stream||''}</td><td>${s.medium||''}</td>`;
    tbody.appendChild(tr);
  });
}

function renderDashboard(user){
  renderEvents();
  renderMyDetails(user);
  if (user.role === 'student' && user.regNo) renderMarksFor(user.regNo);
  if (user.role === 'admin') renderStudentsTable();
}

// Admin actions
document.getElementById('eventForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('evTitle').value.trim();
  const date = document.getElementById('evDate').value;
  const desc = document.getElementById('evDesc').value.trim();
  if (!title) return alert('Title required');
  const evs = DB.getEvents();
  evs.push({ id: crypto.randomUUID?.() || String(Date.now()), title, date, desc });
  DB.setEvents(evs);
  e.target.reset();
  renderEvents();
  alert('Event saved');
});

document.getElementById('marksForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const regNo = document.getElementById('mkReg').value;
  const subject = document.getElementById('mkSubject').value;
  const exam = document.getElementById('mkExam').value;
  const score = parseFloat(document.getElementById('mkScore').value);
  const outOf = parseFloat(document.getElementById('mkOutOf').value);
  if (!regNo || !subject || !exam || isNaN(score) || isNaN(outOf)) return alert('Please fill all fields');
  const marks = DB.getMarks();
  marks.push({ regNo: normalizeId(regNo), subject, exam, score, outOf, createdAt: Date.now() });
  DB.setMarks(marks);
  e.target.reset();
  const user = DB.getCurrent();
  if (user?.role === 'student' && normalizeId(user.regNo) === normalizeId(regNo)) renderMarksFor(user.regNo);
  alert('Mark added');
});

document.getElementById('studentSearch')?.addEventListener('input', renderStudentsTable);

// Restore session if any
setLoggedInUI(DB.getCurrent());

