import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAlfiHsi8QG1QaS-4utweqwmpA-FpaGMRs",
  authDomain: "zen-english.firebaseapp.com",
  projectId: "zen-english",
  storageBucket: "zen-english.firebasestorage.app",
  messagingSenderId: "898388024088",
  appId: "1:898388024088:web:635fe8b72c4fd82e5c9c6d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Progress/state keys that get mirrored between localStorage (offline/instant) and
// Firestore (per-account, cross-device). Kept as a flat list so both sync directions
// stay in one place instead of scattered across app.js.
const LOCAL_KEYS = ['zen-streak', 'zen-xp', 'zen-mistakes', 'zen-level', 'zen-tracker', 'zen-lesson-progress'];

function readLocalState() {
  const state = {};
  LOCAL_KEYS.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (raw === null) return;
    try { state[key] = JSON.parse(raw); } catch { state[key] = raw; }
  });
  return state;
}

function applyCloudState(cloudData) {
  if (!cloudData) return;
  LOCAL_KEYS.forEach((key) => {
    if (cloudData[key] === undefined) return;
    const value = cloudData[key];
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
}

let currentUser = null;
let profileLoaded = null;
let syncTimer = null;

function scheduleSync() {
  if (!currentUser) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const localState = readLocalState();
    setDoc(doc(db, 'users', currentUser.uid), { ...localState, updatedAt: serverTimestamp() }, { merge: true })
      .catch((err) => console.error('Zen English: cloud sync failed', err));
  }, 1200);
}

window.addEventListener('zen:data-changed', scheduleSync);

// ---------------------------------------------------------------------------
// UI wiring
// ---------------------------------------------------------------------------
const authOverlay = document.getElementById('auth-overlay');
const authBody = document.getElementById('auth-body');
const authCloseBtn = document.getElementById('auth-close-btn');

function openAuthOverlay() {
  authOverlay.classList.add('open');
  authOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  renderAuthBody();
}

function closeAuthOverlay() {
  authOverlay.classList.remove('open');
  authOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

authCloseBtn?.addEventListener('click', closeAuthOverlay);
authOverlay?.addEventListener('click', (e) => { if (e.target === authOverlay) closeAuthOverlay(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && authOverlay.classList.contains('open')) closeAuthOverlay();
});

document.querySelectorAll('.account-btn').forEach((btn) => {
  btn.addEventListener('click', () => openAuthOverlay());
});

function setAccountButtonLabel(text) {
  document.querySelectorAll('.account-btn-label').forEach((el) => { el.textContent = text; });
}

function renderAuthBody() {
  if (!currentUser) {
    authBody.innerHTML = `
      <h3>Đăng Nhập</h3>
      <p class="lesson-body-desc">Đăng nhập để lưu lộ trình, streak, XP và tiến độ học tập riêng của bạn — dùng được trên mọi thiết bị.</p>
      <button class="auth-google-btn" id="auth-google-btn"><i class="fab fa-google"></i> Đăng nhập bằng Google</button>
    `;
    document.getElementById('auth-google-btn').addEventListener('click', handleGoogleSignIn);
    return;
  }

  if (!profileLoaded) {
    authBody.innerHTML = `<p class="lesson-body-desc">Đang tải thông tin tài khoản...</p>`;
    return;
  }

  if (!profileLoaded.name) {
    authBody.innerHTML = `
      <h3>Hoàn Tất Hồ Sơ</h3>
      <p class="lesson-body-desc">Cho Zen English biết thêm về bạn để cá nhân hoá lộ trình học.</p>
      <div class="auth-field"><label for="profile-name">Họ và tên</label><input type="text" id="profile-name" placeholder="Nguyễn Văn A"></div>
      <div class="auth-field"><label for="profile-job">Nghề nghiệp</label><input type="text" id="profile-job" placeholder="Nhân viên văn phòng, IT, Sales..."></div>
      <div class="auth-field"><label for="profile-phone">Số điện thoại</label><input type="tel" id="profile-phone" placeholder="09xxxxxxxx"></div>
      <button class="auth-google-btn" id="profile-save-btn">Lưu và bắt đầu</button>
    `;
    document.getElementById('profile-save-btn').addEventListener('click', handleSaveProfile);
    return;
  }

  authBody.innerHTML = `
    <h3>Tài Khoản Của Bạn</h3>
    <div class="auth-account-card">
      ${currentUser.photoURL
        ? `<img class="auth-avatar" src="${currentUser.photoURL}" alt="">`
        : '<div class="auth-avatar auth-avatar--fallback"><i class="fas fa-user"></i></div>'}
      <div class="auth-account-info">
        <div class="auth-account-name">${profileLoaded.name}</div>
        ${profileLoaded.job ? `<div class="auth-account-sub">${profileLoaded.job}</div>` : ''}
        <div class="auth-account-sub">${currentUser.email || ''}</div>
      </div>
    </div>
    <button class="auth-google-btn auth-logout-btn" id="auth-logout-btn"><i class="fas fa-sign-out-alt"></i> Đăng Xuất</button>
  `;
  document.getElementById('auth-logout-btn').addEventListener('click', () => signOut(auth));
}

async function handleGoogleSignIn() {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error(err);
    alert('Đăng nhập thất bại: ' + err.message);
  }
}

async function handleSaveProfile() {
  const name = document.getElementById('profile-name').value.trim();
  const job = document.getElementById('profile-job').value.trim();
  const phone = document.getElementById('profile-phone').value.trim();
  if (!name) { alert('Vui lòng nhập họ và tên.'); return; }

  const localState = readLocalState();
  const docData = {
    name, job, phone,
    email: currentUser.email || '',
    createdAt: serverTimestamp(),
    ...localState,
  };
  await setDoc(doc(db, 'users', currentUser.uid), docData, { merge: true });
  profileLoaded = { name, job, phone };
  sessionStorage.setItem('zen-cloud-synced', currentUser.uid);
  setAccountButtonLabel(name);
  renderAuthBody();
}

onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (!user) {
    profileLoaded = null;
    setAccountButtonLabel('Đăng Nhập');
    if (authOverlay.classList.contains('open')) renderAuthBody();
    return;
  }

  setAccountButtonLabel(user.displayName || 'Tài khoản');

  const snap = await getDoc(doc(db, 'users', user.uid));
  if (snap.exists()) {
    profileLoaded = snap.data();
    const alreadySynced = sessionStorage.getItem('zen-cloud-synced') === user.uid;
    applyCloudState(profileLoaded);
    if (!alreadySynced) {
      // First time this browser session sees cloud data — reload once so every
      // localStorage-driven view in app.js picks up the synced values.
      sessionStorage.setItem('zen-cloud-synced', user.uid);
      window.location.reload();
      return;
    }
  } else {
    profileLoaded = {};
  }

  if (authOverlay.classList.contains('open')) renderAuthBody();
});
