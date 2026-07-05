import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAlfiHsi8QG1QaS-4utweqwmpA-FpaGMRs",
  authDomain: "zen-english.firebaseapp.com",
  projectId: "zen-english",
  storageBucket: "zen-english.firebasestorage.app",
  messagingSenderId: "898388024088",
  appId: "1:898388024088:web:635fe8b72c4fd82e5c9c6d",
};

// Must match the admin check in Firestore security rules (request.auth.token.email == ADMIN_EMAIL).
// The rule is what actually protects the data — this is only for showing the right UI.
const ADMIN_EMAIL = 'thanhquangkhac3@gmail.com';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const adminBody = document.getElementById('admin-body');
let cachedUsers = [];

function renderSignedOut() {
  adminBody.innerHTML = `
    <h3>Đăng Nhập Quản Trị</h3>
    <p class="lesson-body-desc">Đăng nhập bằng tài khoản Google quản trị để xem danh sách người dùng.</p>
    <button class="auth-google-btn" id="admin-login-btn"><i class="fab fa-google"></i> Đăng nhập bằng Google</button>
  `;
  document.getElementById('admin-login-btn').addEventListener('click', async () => {
    try { await signInWithPopup(auth, provider); }
    catch (err) { alert('Đăng nhập thất bại: ' + err.message); }
  });
}

function renderAccessDenied(email) {
  adminBody.innerHTML = `
    <h3>Không Có Quyền Truy Cập</h3>
    <p class="lesson-body-desc">Tài khoản <strong>${email}</strong> không phải tài khoản quản trị.</p>
    <button class="auth-google-btn auth-logout-btn" id="admin-logout-btn"><i class="fas fa-sign-out-alt"></i> Đăng Xuất</button>
  `;
  document.getElementById('admin-logout-btn').addEventListener('click', () => signOut(auth));
}

function renderLoading() {
  adminBody.innerHTML = `<p class="lesson-body-desc">Đang tải danh sách người dùng...</p>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function formatDate(ts) {
  if (!ts || typeof ts.toDate !== 'function') return '';
  return ts.toDate().toLocaleString('vi-VN');
}

function renderUserTable() {
  const rows = cachedUsers.map((u) => `
    <tr>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.job)}</td>
      <td>${escapeHtml(u.phone)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${escapeHtml(u.level || '')}</td>
      <td>${formatDate(u.createdAt)}</td>
    </tr>
  `).join('');

  adminBody.innerHTML = `
    <div class="admin-toolbar">
      <span class="lesson-body-desc" style="margin:0;">Tổng cộng: <strong>${cachedUsers.length}</strong> người dùng</span>
      <div class="admin-toolbar-actions">
        <button class="lesson-nav-btn" id="admin-refresh-btn"><i class="fas fa-sync"></i> Làm mới</button>
        <button class="lesson-nav-btn btn-primary" id="admin-export-btn"><i class="fas fa-file-csv"></i> Xuất CSV</button>
        <button class="lesson-nav-btn" id="admin-logout-btn2"><i class="fas fa-sign-out-alt"></i> Đăng Xuất</button>
      </div>
    </div>
    <div class="admin-table-wrap">
      <table class="lesson-result-table">
        <thead>
          <tr><th>Họ Tên</th><th>Nghề Nghiệp</th><th>SĐT</th><th>Email</th><th>Trình Độ</th><th>Ngày Đăng Ký</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6">Chưa có người dùng nào.</td></tr>'}</tbody>
      </table>
    </div>
  `;

  document.getElementById('admin-refresh-btn').addEventListener('click', loadUsers);
  document.getElementById('admin-export-btn').addEventListener('click', exportCsv);
  document.getElementById('admin-logout-btn2').addEventListener('click', () => signOut(auth));
}

function exportCsv() {
  const header = ['Ho Ten', 'Nghe Nghiep', 'SDT', 'Email', 'Trinh Do', 'Ngay Dang Ky'];
  const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [header.map(csvEscape).join(',')];
  cachedUsers.forEach((u) => {
    lines.push([u.name, u.job, u.phone, u.email, u.level, formatDate(u.createdAt)].map(csvEscape).join(','));
  });
  // BOM so Excel opens Vietnamese diacritics correctly instead of mojibake.
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zen-english-users-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function loadUsers() {
  renderLoading();
  try {
    const snap = await getDocs(collection(db, 'users'));
    cachedUsers = snap.docs.map((d) => d.data());
    renderUserTable();
  } catch (err) {
    adminBody.innerHTML = `<p class="lesson-body-desc">Lỗi khi tải dữ liệu: ${escapeHtml(err.message)}</p>`;
  }
}

onAuthStateChanged(auth, (user) => {
  if (!user) { renderSignedOut(); return; }
  if (user.email !== ADMIN_EMAIL) { renderAccessDenied(user.email); return; }
  loadUsers();
});
