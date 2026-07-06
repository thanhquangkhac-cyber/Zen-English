document.addEventListener('DOMContentLoaded', () => {

  // Tells auth.js (if a user is signed in) that progress data changed and should sync to Firestore.
  function notifyDataChanged() {
    window.dispatchEvent(new CustomEvent('zen:data-changed'));
  }

  // ============================================================
  // 1. Theme Management (Light / Dark)
  // ============================================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('zen-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('zen-theme', next);
    });
  }

  // ============================================================
  // 2. Scroll Progress Bar + Scroll-to-Top
  // ============================================================
  const progressBar = document.getElementById('scroll-progress-bar');
  const scrollTopBtn = document.getElementById('scroll-to-top');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = `${(scrolled / total) * 100}%`;
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', scrolled > 400);
  }, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ============================================================
  // 3. Mobile Drawer Navigation
  // ============================================================
  const mobileMenuBtn  = document.getElementById('mobile-menu-toggle');
  const mobileDrawer   = document.getElementById('mobile-drawer');
  const mobileOverlay  = document.getElementById('mobile-overlay');
  const drawerCloseBtn = document.getElementById('mobile-drawer-close');

  function openDrawer() {
    mobileDrawer?.classList.add('open');
    mobileOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    mobileDrawer?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  mobileMenuBtn?.addEventListener('click', openDrawer);
  drawerCloseBtn?.addEventListener('click', closeDrawer);
  mobileOverlay?.addEventListener('click', closeDrawer);

  // Close drawer on any nav link click
  document.querySelectorAll('.mobile-nav-link, .mobile-drawer-cta').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Theme toggle inside drawer
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  themeToggleMobile?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('zen-theme', next);
  });

  // ============================================================
  // 3b. Bottom Navigation Active State
  // ============================================================
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  const sectionIds = ['home', 'phuong-phap', 'lo-trinh', 'muc-tieu', 'tai-nguyen', 'habit-tracker', 'hoi-dap'];

  function updateBottomNav() {
    if (window.innerWidth > 768) return;
    let current = 'home';
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.getBoundingClientRect().top <= 120) current = id;
    });
    bottomNavItems.forEach(item => {
      const sec = item.getAttribute('data-section');
      item.classList.toggle('active', sec === current);
    });
  }

  window.addEventListener('scroll', updateBottomNav, { passive: true });
  updateBottomNav();

  // ============================================================
  // 4. Scroll-Reveal Animations (IntersectionObserver)
  // ============================================================
  document.querySelectorAll('.section-header, .method-card, .resource-card, .faq-item, .tracker-layout, .wotd-card, .cta-final-card, .quote-carousel, .planner-card, .estimator-layout').forEach(el => {
    el.classList.add('reveal-up');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

  // ============================================================
  // 5. Profile-based Planner (audience selector + time sub-tabs)
  // ============================================================
  function animateSkillBars(panel) {
    panel.querySelectorAll('.skill-bar-fill').forEach(bar => {
      const target = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { bar.style.width = target; });
      });
    });
  }

  // Profile card selection
  const profileCards = document.querySelectorAll('.profile-card');
  const profilePanels = document.querySelectorAll('.profile-panel');
  const LEVEL_KEY = 'zen-level';

  // Restore last chosen level (used to personalize the daily lesson too)
  const savedLevel = localStorage.getItem(LEVEL_KEY);
  if (savedLevel) {
    profileCards.forEach(c => c.classList.toggle('active', c.getAttribute('data-profile') === savedLevel));
    profilePanels.forEach(p => p.classList.toggle('active', p.id === `panel-${savedLevel}`));
  }

  profileCards.forEach(card => {
    card.addEventListener('click', () => {
      const profile = card.getAttribute('data-profile');
      localStorage.setItem(LEVEL_KEY, profile);
      notifyDataChanged();

      profileCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      profilePanels.forEach(panel => {
        if (panel.id === `panel-${profile}`) {
          panel.classList.add('active');
          animateSkillBars(panel);
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // Animate bars for the initially active panel
  const initialPanel = document.querySelector('.profile-panel.active');
  if (initialPanel) {
    setTimeout(() => animateSkillBars(initialPanel), 400);
  }

  // Time sub-tabs inside each profile panel
  document.querySelectorAll('.profile-panel').forEach(panel => {
    const timeBtns  = panel.querySelectorAll('.pp-time-btn');
    const timePanes = panel.querySelectorAll('.pp-schedule-pane');

    timeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const time = btn.getAttribute('data-time');
        timeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        timePanes.forEach(pane => {
          pane.classList.toggle('active', pane.getAttribute('data-time') === time);
        });
      });
    });
  });

  // ============================================================
  // 6. Target Timeline Estimator
  // ============================================================
  const currentLevelSelect = document.getElementById('current-level');
  const targetLevelSelect  = document.getElementById('target-level');
  const dailyTimeSelect    = document.getElementById('daily-time');
  const calculateBtn       = document.getElementById('calculate-btn');
  const resultTimeEl       = document.getElementById('result-time');
  const resultAdviceEl     = document.getElementById('result-advice');
  const resultIconEl       = document.getElementById('result-icon');

  const levelHours = { a1: 0, a2: 100, b1: 250, b2: 450, c1: 700 };
  const adviceMatrix = {
    15: 'Quỹ thời gian 15 phút rất tốt để duy trì thói quen. Cố gắng tăng lên 30 phút vào những ngày cuối tuần để rút ngắn lộ trình.',
    30: 'Quỹ thời gian 30 phút là điểm cân bằng lý tưởng cho người đi làm. Bạn có tốc độ tiến bộ bền vững — hãy tập trung vào nghe podcast và từ vựng thực tế.',
    60: 'Tuyệt vời! 60 phút mỗi ngày là tốc độ bứt phá. Áp dụng triệt để Output-First: shadowing và viết báo cáo ngắn để tăng tốc phản xạ.',
  };

  function calculateTimeline() {
    if (!currentLevelSelect || !targetLevelSelect || !dailyTimeSelect) return;
    const cur = currentLevelSelect.value;
    const tgt = targetLevelSelect.value;
    const mins = parseInt(dailyTimeSelect.value, 10);
    const curH = levelHours[cur];
    const tgtH = levelHours[tgt];

    if (curH >= tgtH) {
      resultTimeEl.textContent = '0 Tháng';
      resultAdviceEl.textContent = 'Bạn đã đạt hoặc vượt mục tiêu này! Hãy chọn một mục tiêu cao hơn để tiếp tục phát triển.';
      resultIconEl.innerHTML = '<i class="fas fa-check-double"></i>';
      return;
    }

    const months = Math.ceil((tgtH - curH) / (mins / 60) / 30);
    resultIconEl.innerHTML = months <= 6
      ? '<i class="fas fa-bolt"></i>'
      : months <= 12
        ? '<i class="fas fa-calendar-check"></i>'
        : '<i class="fas fa-hourglass-half"></i>';

    resultTimeEl.style.opacity = '0';
    setTimeout(() => {
      resultTimeEl.textContent = `~ ${months} Tháng`;
      resultTimeEl.style.opacity = '1';
      resultTimeEl.style.transition = 'opacity 0.3s ease';
    }, 150);

    let advice = adviceMatrix[mins] || adviceMatrix[30];
    if (tgt === 'c1') advice += ' Mục tiêu C1 đòi hỏi khả năng thuyết trình chuyên nghiệp — hãy tăng cường đọc báo cáo tài chính / chuyên ngành bằng tiếng Anh.';
    resultAdviceEl.textContent = advice;
  }

  if (calculateBtn) calculateBtn.addEventListener('click', calculateTimeline);
  calculateTimeline();

  // ============================================================
  // 7. Resources Filter
  // ============================================================
  const filterBtns    = document.querySelectorAll('.resource-filter-btn');
  const resourceCards = document.querySelectorAll('.resource-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      resourceCards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.style.display = match ? 'flex' : 'none';
      });
    });
  });

  // ============================================================
  // 8. FAQ Accordion
  // ============================================================
  document.querySelectorAll('.faq-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ============================================================
  // 9. HSE Vocabulary Topic Tabs
  // ============================================================
  const vocabTabBtns = document.querySelectorAll('.vocab-tab-btn');
  const vocabTabPanes = document.querySelectorAll('.vocab-tab-pane');

  vocabTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const topic = btn.getAttribute('data-vocab');
      vocabTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      vocabTabPanes.forEach(pane => {
        pane.classList.toggle('active', pane.getAttribute('data-vocab') === topic);
      });
    });
  });

  // ============================================================
  // 10. HSE Dialogue Accordion
  // ============================================================
  document.querySelectorAll('.hse-acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const body = item.querySelector('.hse-acc-body');
      const isOpen = item.classList.contains('active');

      document.querySelectorAll('.hse-acc-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.hse-acc-body').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // ============================================================
  // 11. Word of the Day
  // ============================================================
  const words = [
    { word: 'Proactive',    phonetic: '/proʊˈæktɪv/',   pos: 'adjective', meaning: 'Chủ động; hành động trước khi vấn đề xảy ra thay vì chờ đợi và phản ứng', example: '"We need a more <strong>proactive</strong> approach to handling customer complaints."' },
    { word: 'Concise',      phonetic: '/kənˈsaɪs/',     pos: 'adjective', meaning: 'Súc tích; diễn đạt ngắn gọn nhưng đầy đủ ý nghĩa', example: '"Please keep your presentation <strong>concise</strong> — we have 10 minutes."' },
    { word: 'Collaborate',  phonetic: '/kəˈlæbəreɪt/', pos: 'verb',      meaning: 'Hợp tác; cùng làm việc với nhau để đạt mục tiêu chung', example: '"Our teams will <strong>collaborate</strong> on the Q3 product launch."' },
    { word: 'Deadline',     phonetic: '/ˈdedlaɪn/',     pos: 'noun',      meaning: 'Hạn chót; thời điểm cần hoàn thành công việc', example: '"The <strong>deadline</strong> for this report is Friday at 5 PM."' },
    { word: 'Leverage',     phonetic: '/ˈlevərɪdʒ/',    pos: 'verb',      meaning: 'Tận dụng; sử dụng tài nguyên hoặc lợi thế sẵn có để đạt kết quả tốt hơn', example: '"We should <strong>leverage</strong> our existing client relationships."' },
    { word: 'Streamline',   phonetic: '/ˈstriːmlaɪn/',  pos: 'verb',      meaning: 'Tối giản hóa; làm cho quy trình hiệu quả hơn bằng cách loại bỏ những bước không cần thiết', example: '"Let\'s <strong>streamline</strong> the approval process to save time."' },
    { word: 'Feasible',     phonetic: '/ˈfiːzɪbəl/',    pos: 'adjective', meaning: 'Khả thi; có thể thực hiện được trong điều kiện thực tế', example: '"Is it <strong>feasible</strong> to launch the new feature by next month?"' },
    { word: 'Benchmark',    phonetic: '/ˈbentʃmɑːrk/',  pos: 'noun/verb', meaning: 'Tiêu chuẩn tham chiếu; thước đo để so sánh hiệu suất', example: '"We use our competitors as a <strong>benchmark</strong> for pricing strategy."' },
    { word: 'Stakeholder',  phonetic: '/ˈsteɪkhəʊldər/',pos: 'noun',      meaning: 'Các bên liên quan; những người có quyền lợi hoặc ảnh hưởng đến dự án', example: '"All key <strong>stakeholders</strong> must approve the budget before we proceed."' },
    { word: 'Scalable',     phonetic: '/ˈskeɪləbəl/',   pos: 'adjective', meaning: 'Có khả năng mở rộng quy mô; dễ dàng phát triển hoặc thu nhỏ theo nhu cầu', example: '"We need a <strong>scalable</strong> solution that works for 10 or 10,000 users."' },
    { word: 'Transparent',  phonetic: '/trænsˈpærənt/', pos: 'adjective', meaning: 'Minh bạch; cởi mở và rõ ràng trong giao tiếp hoặc hoạt động', example: '"Our team values being <strong>transparent</strong> about project progress."' },
    { word: 'Prioritize',   phonetic: '/praɪˈɒrɪtaɪz/', pos: 'verb',      meaning: 'Ưu tiên; sắp xếp công việc theo thứ tự quan trọng', example: '"You need to <strong>prioritize</strong> tasks based on their business impact."' },
  ];

  const todayIdx = new Date().getDate() % words.length;
  let wotdIdx = todayIdx;

  function renderWotd(idx) {
    const w = words[idx];
    const wordEl    = document.getElementById('wotd-word');
    const phoneEl   = document.getElementById('wotd-phonetic');
    const posEl     = document.getElementById('wotd-pos');
    const meaningEl = document.getElementById('wotd-meaning');
    const exEl      = document.getElementById('wotd-ex-text');
    if (!wordEl) return;

    [wordEl, phoneEl, posEl, meaningEl, exEl].forEach(el => { el.style.opacity = '0'; });
    setTimeout(() => {
      wordEl.textContent    = w.word;
      phoneEl.textContent   = w.phonetic;
      posEl.textContent     = w.pos;
      meaningEl.textContent = w.meaning;
      exEl.innerHTML        = w.example;
      [wordEl, phoneEl, posEl, meaningEl, exEl].forEach(el => {
        el.style.transition = 'opacity 0.3s ease';
        el.style.opacity = '1';
      });
    }, 200);
  }

  renderWotd(wotdIdx);

  const wotdNextBtn = document.getElementById('wotd-next');
  if (wotdNextBtn) {
    wotdNextBtn.addEventListener('click', () => {
      wotdIdx = (wotdIdx + 1) % words.length;
      renderWotd(wotdIdx);
      addXP(2);
    });
  }

  const wotdSaveBtn = document.getElementById('wotd-save-btn');
  if (wotdSaveBtn) {
    wotdSaveBtn.addEventListener('click', () => {
      const w = words[wotdIdx];
      addMistake({ word: w.word, meaning: w.meaning, phonetic: w.phonetic });
    });
  }

  // ============================================================
  // 10. Daily Habit Tracker (with LocalStorage + Streak)
  // ============================================================
  const TRACKER_KEY = 'zen-tracker';
  const STREAK_KEY  = 'zen-streak';
  const TOTAL_HABITS = 6;

  function getTodayStr() {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  }

  function loadTracker() {
    try { return JSON.parse(localStorage.getItem(TRACKER_KEY)) || {}; } catch { return {}; }
  }

  function saveTracker(data) {
    localStorage.setItem(TRACKER_KEY, JSON.stringify(data));
    notifyDataChanged();
  }

  function loadStreak() {
    try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, lastDate: '', freezes: 0, lastFreezeWeek: '' }; } catch { return { count: 0, lastDate: '', freezes: 0, lastFreezeWeek: '' }; }
  }

  function saveStreak(data) {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    notifyDataChanged();
  }

  function updateStreakIfAllDone(doneCount, today) {
    if (doneCount < TOTAL_HABITS) return;
    const streak = loadStreak();
    if (streak.lastDate === today) return; // already counted today
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    streak.count = (streak.lastDate === yStr) ? streak.count + 1 : 1;
    streak.lastDate = today;
    saveStreak(streak);
    renderStreak();
  }

  function renderStreak() {
    const streak = loadStreak();
    const el = document.getElementById('streak-count');
    if (el) el.textContent = streak.count;
    const freezeEl = document.getElementById('freeze-count');
    if (freezeEl) freezeEl.textContent = streak.freezes || 0;
  }

  // ── Streak Freeze: refills 1 lá chắn/tuần (tối đa 2), tự bảo vệ streak khi lỡ 1 ngày ──
  function getWeekKey(date) {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - day);
    return d.toISOString().slice(0, 10);
  }

  function showToast(message) {
    let toast = document.getElementById('zen-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'zen-toast';
      toast.className = 'zen-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  function maintainStreakFreeze() {
    const streak = loadStreak();
    if (typeof streak.freezes !== 'number') streak.freezes = 0;

    const weekKey = getWeekKey(new Date());
    if (streak.lastFreezeWeek !== weekKey) {
      streak.freezes = Math.min(2, streak.freezes + 1);
      streak.lastFreezeWeek = weekKey;
    }

    const today = getTodayStr();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    if (streak.count > 0 && streak.lastDate !== today && streak.lastDate !== yStr) {
      if (streak.freezes > 0) {
        streak.freezes -= 1;
        streak.lastDate = yStr; // giữ nguyên chuỗi, coi như hôm qua đã được bảo vệ
        showToast('🛡️ Đã dùng 1 lá chắn để bảo vệ chuỗi của bạn!');
      } else {
        streak.count = 0;
      }
    }

    saveStreak(streak);
  }

  // ============================================================
  // Micro-XP: cộng điểm cho từng hành động nhỏ, không chỉ theo ngày
  // ============================================================
  const XP_KEY = 'zen-xp';
  const XP_PER_LEVEL = 100;

  function loadXP() {
    try { return JSON.parse(localStorage.getItem(XP_KEY)) || { xp: 0 }; } catch { return { xp: 0 }; }
  }

  function saveXP(data) {
    localStorage.setItem(XP_KEY, JSON.stringify(data));
    notifyDataChanged();
  }

  function renderXP() {
    const data = loadXP();
    const level = Math.floor(data.xp / XP_PER_LEVEL) + 1;
    const inLevel = data.xp % XP_PER_LEVEL;
    const levelEl = document.getElementById('xp-level');
    const valueEl = document.getElementById('xp-value');
    const fillEl  = document.getElementById('xp-bar-fill');
    if (levelEl) levelEl.textContent = `Cấp ${level}`;
    if (valueEl) valueEl.textContent = `${inLevel} / ${XP_PER_LEVEL} XP`;
    if (fillEl) fillEl.style.width = `${(inLevel / XP_PER_LEVEL) * 100}%`;
  }

  function addXP(amount) {
    const data = loadXP();
    const prevLevel = Math.floor(data.xp / XP_PER_LEVEL);
    data.xp = Math.max(0, data.xp + amount);
    saveXP(data);
    renderXP();
    const newLevel = Math.floor(data.xp / XP_PER_LEVEL);
    if (newLevel > prevLevel) showToast(`🎉 Lên Cấp ${newLevel + 1}! Tiếp tục phát huy nhé.`);
  }

  // ============================================================
  // Sổ tay lỗi cá nhân hoá: lưu từ cần ôn lại xuyên suốt các section
  // ============================================================
  const MISTAKES_KEY = 'zen-mistakes';

  function loadMistakes() {
    try { return JSON.parse(localStorage.getItem(MISTAKES_KEY)) || []; } catch { return []; }
  }

  function saveMistakes(list) {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(list));
    notifyDataChanged();
  }

  function renderMistakes() {
    const list = loadMistakes();
    const wrap = document.getElementById('review-list');
    if (!wrap) return;

    if (list.length === 0) {
      wrap.innerHTML = '<div class="review-empty" id="review-empty">Chưa có từ nào được lưu. Bấm "Lưu ôn lại" ở phần Từ Vựng Hôm Nay để thêm.</div>';
      return;
    }

    wrap.innerHTML = list.map(item => `
      <div class="review-item" data-word="${item.word}">
        <div class="review-item-text">
          <span class="review-item-word">${item.word}</span>
          <span class="review-item-meaning">${item.meaning}</span>
        </div>
        <button class="review-item-remove" aria-label="Xóa từ khỏi sổ tay">&times;</button>
      </div>
    `).join('');

    wrap.querySelectorAll('.review-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const word = btn.closest('.review-item').getAttribute('data-word');
        removeMistake(word);
      });
    });
  }

  function addMistake(item) {
    const list = loadMistakes();
    if (list.some(i => i.word === item.word)) {
      showToast(`"${item.word}" đã có trong sổ tay rồi.`);
      return;
    }
    list.unshift({ ...item, addedDate: getTodayStr() });
    saveMistakes(list.slice(0, 20));
    renderMistakes();
    addXP(3);
    showToast(`📒 Đã lưu "${item.word}" vào sổ tay ôn lại.`);
  }

  function removeMistake(word) {
    saveMistakes(loadMistakes().filter(i => i.word !== word));
    renderMistakes();
  }

  function updateProgressRing(done, total) {
    const circumference = 2 * Math.PI * 50; // r=50 → 314.16
    const offset = circumference - (done / total) * circumference;
    const ringFill = document.getElementById('ring-fill');
    const ringPct  = document.getElementById('ring-pct');
    const ringCount = document.getElementById('ring-count');
    if (ringFill) ringFill.style.strokeDashoffset = offset;
    if (ringPct)  ringPct.textContent = `${Math.round((done / total) * 100)}%`;
    if (ringCount) ringCount.textContent = `${done} / ${total} mục tiêu`;
  }

  function renderHabits() {
    const today   = getTodayStr();
    const tracker = loadTracker();
    const todayData = tracker[today] || {};
    const items = document.querySelectorAll('.habit-item');
    let doneCount = 0;

    items.forEach(item => {
      const id = item.getAttribute('data-id');
      if (todayData[id]) {
        item.classList.add('done');
        doneCount++;
      } else {
        item.classList.remove('done');
      }
    });

    updateProgressRing(doneCount, TOTAL_HABITS);
    renderStreak();

    const banner = document.getElementById('completed-banner');
    if (banner) banner.classList.toggle('show', doneCount === TOTAL_HABITS);

    return doneCount;
  }

  function initTrackerEvents() {
    const today = getTodayStr();

    // Set date label
    const dateEl = document.getElementById('tracker-date');
    if (dateEl) {
      const d = new Date();
      dateEl.textContent = d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    document.querySelectorAll('.habit-item').forEach(item => {
      item.addEventListener('click', () => {
        const id      = item.getAttribute('data-id');
        const tracker = loadTracker();
        if (!tracker[today]) tracker[today] = {};
        tracker[today][id] = !tracker[today][id];
        saveTracker(tracker);
        addXP(tracker[today][id] ? 5 : -5);
        const done = renderHabits();
        updateStreakIfAllDone(done, today);
      });
    });

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const tracker = loadTracker();
        tracker[today] = {};
        saveTracker(tracker);
        renderHabits();
      });
    }
  }

  maintainStreakFreeze();
  renderHabits();
  initTrackerEvents();
  renderXP();
  renderMistakes();

  // Also update the hero visual card streak display
  const heroStreakEl = document.querySelector('.stat-row:nth-child(2) .stat-value');
  if (heroStreakEl) {
    const streak = loadStreak();
    if (streak.count > 0) {
      heroStreakEl.textContent = `${streak.count} Ngày liên tiếp`;
      const bar = document.querySelector('.stat-row:nth-child(2) .progress-bar-fill');
      if (bar) bar.style.width = `${Math.min(100, (streak.count / 30) * 100)}%`;
    }
  }

  // ============================================================
  // 11. Motivational Quotes Carousel
  // ============================================================
  const quotes = [
    { text: 'Đừng đợi đủ thời gian mới bắt đầu. Hãy bắt đầu với thời gian bạn đang có.', author: '— Zen English' },
    { text: 'Học mỗi ngày một chút, sau một năm bạn sẽ ngạc nhiên về khoảng cách mình đã đi được.', author: '— Nguyên tắc Kaizen' },
    { text: 'Bạn không cần phải hoàn hảo. Bạn chỉ cần nhất quán.', author: '— Zen English' },
    { text: 'Ngôn ngữ là cửa sổ dẫn đến những cơ hội bạn chưa từng thấy.', author: '— Nelson Mandela (phỏng theo)' },
    { text: 'Mỗi chuyên gia đều từng là người mới bắt đầu. Sự khác biệt là họ không bỏ cuộc.', author: '— Zen English' },
  ];

  let currentQuote = 0;
  let quoteTimer = null;

  function renderQuoteDots() {
    const dotsEl = document.getElementById('q-dots');
    if (!dotsEl) return;
    dotsEl.innerHTML = quotes.map((_, i) =>
      `<div class="q-dot${i === currentQuote ? ' active' : ''}" data-qi="${i}"></div>`
    ).join('');
    dotsEl.querySelectorAll('.q-dot').forEach(dot => {
      dot.addEventListener('click', () => goQuote(parseInt(dot.getAttribute('data-qi'))));
    });
  }

  function goQuote(idx) {
    const textEl   = document.getElementById('quote-text');
    const authorEl = document.getElementById('quote-author');
    if (!textEl || !authorEl) return;

    textEl.style.opacity   = '0';
    authorEl.style.opacity = '0';
    setTimeout(() => {
      currentQuote = (idx + quotes.length) % quotes.length;
      textEl.textContent   = quotes[currentQuote].text;
      authorEl.textContent = quotes[currentQuote].author;
      textEl.style.opacity   = '1';
      authorEl.style.opacity = '1';
      renderQuoteDots();
    }, 300);

    clearInterval(quoteTimer);
    quoteTimer = setInterval(() => goQuote(currentQuote + 1), 6000);
  }

  const qPrev = document.getElementById('q-prev');
  const qNext = document.getElementById('q-next');
  if (qPrev) qPrev.addEventListener('click', () => goQuote(currentQuote - 1));
  if (qNext) qNext.addEventListener('click', () => goQuote(currentQuote + 1));

  renderQuoteDots();
  quoteTimer = setInterval(() => goQuote(currentQuote + 1), 6000);

  // ── Section 12: Everyday Conversations — Chapter Tabs ──
  const gtTabBtns = document.querySelectorAll('.gt-tab-btn');
  const gtPanes = document.querySelectorAll('.gt-pane');
  gtTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-gt');
      gtTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gtPanes.forEach(p => p.classList.toggle('active', p.getAttribute('data-gt') === target));
    });
  });

  // ── Section 13: Everyday Conversations — Dialogue Accordion ──
  document.querySelectorAll('.gt-acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const body = item.querySelector('.gt-acc-body');
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.gt-acc-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.gt-acc-body').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // ── Section 14: Listening Practice — Category Filter ──
  const lnTabBtns = document.querySelectorAll('.ln-tab-btn');
  const lnCards = document.querySelectorAll('.ln-card');
  lnTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-ln');
      lnTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      lnCards.forEach(card => {
        const match = cat === 'all' || card.getAttribute('data-ln') === cat;
        card.classList.toggle('hidden', !match);
      });
    });
  });

  // ============================================================
  // 15. Daily Lesson Overlay — Từ Vựng → Đọc Hiểu → Nghe & Nói → Viết → Đánh Giá
  // ============================================================
  const LESSONS = {
    beginner: {
      badge: 'A1 - A2',
      days: [
        { // Day 1
          vocab: [
            { word: 'Meeting',   phonetic: '/ˈmiːtɪŋ/',   meaning: 'Cuộc họp',     quiz: { options: ['Lịch trình', 'Cuộc họp', 'Báo cáo', 'Đồng nghiệp'], correct: 1 } },
            { word: 'Schedule',  phonetic: '/ˈskedʒuːl/', meaning: 'Lịch trình',   quiz: { options: ['Đồng nghiệp', 'Báo cáo', 'Lịch trình', 'Thư điện tử'], correct: 2 } },
            { word: 'Email',     phonetic: '/ˈiːmeɪl/',   meaning: 'Thư điện tử', quiz: { options: ['Thư điện tử', 'Cuộc họp', 'Lịch trình', 'Báo cáo'], correct: 0 } },
            { word: 'Colleague', phonetic: '/ˈkɒliːɡ/',   meaning: 'Đồng nghiệp', quiz: { options: ['Báo cáo', 'Đồng nghiệp', 'Thư điện tử', 'Cuộc họp'], correct: 1 } },
            { word: 'Report',    phonetic: '/rɪˈpɔːrt/',  meaning: 'Báo cáo',     quiz: { options: ['Lịch trình', 'Thư điện tử', 'Đồng nghiệp', 'Báo cáo'], correct: 3 } },
          ],
          reading: {
            title: 'A Normal Work Day',
            passage: 'Every morning, Lan checks her email before the daily meeting. She writes her schedule for the day and talks with her colleagues about new tasks. After lunch, she replies to emails and prepares for tomorrow\'s meeting.',
            quiz: [
              { q: 'Lan làm gì đầu tiên vào buổi sáng?', options: ['Đi họp', 'Kiểm tra email', 'Ăn trưa', 'Viết lịch trình'], correct: 1 },
              { q: 'Lan làm gì sau bữa trưa?', options: ['Trả lời email', 'Đi ngủ', 'Về nhà', 'Gọi điện'], correct: 0 },
            ],
          },
          listening: [
            'Nice to meet you. How are you doing?',
            'Could you speak more slowly, please?',
            'I have a meeting at 10 AM.',
          ],
          writing: {
            prompt: 'Viết 3-5 câu tiếng Anh mô tả công việc bạn đã làm hôm nay.',
            minWords: 15,
            phrases: ['I checked my email', 'I had a meeting with', 'I talked to my colleague about', 'My schedule today was'],
            sentenceBuilder: [
              { scrambled: 'I / (check) / my email / every morning', answer: 'I check my email every morning' },
              { scrambled: 'She / (have) / a meeting / at 10 AM', answer: 'She has a meeting at 10 AM' },
            ],
          },
        },
        { // Day 2
          vocab: [
            { word: 'Attend',   phonetic: '/əˈtend/',      meaning: 'Tham dự',    quiz: { options: ['Cập nhật', 'Tham dự', 'Trợ lý', 'Tài liệu'], correct: 1 } },
            { word: 'Reminder', phonetic: '/rɪˈmaɪndər/',  meaning: 'Lời nhắc',   quiz: { options: ['Lời nhắc', 'Tài liệu', 'Tham dự', 'Trợ lý'], correct: 0 } },
            { word: 'Update',   phonetic: '/ʌpˈdeɪt/',     meaning: 'Cập nhật',   quiz: { options: ['Trợ lý', 'Tham dự', 'Cập nhật', 'Lời nhắc'], correct: 2 } },
            { word: 'Assistant',phonetic: '/əˈsɪstənt/',   meaning: 'Trợ lý',     quiz: { options: ['Tài liệu', 'Trợ lý', 'Lời nhắc', 'Cập nhật'], correct: 1 } },
            { word: 'Document', phonetic: '/ˈdɒkjumənt/',  meaning: 'Tài liệu',   quiz: { options: ['Tham dự', 'Cập nhật', 'Lời nhắc', 'Tài liệu'], correct: 3 } },
          ],
          reading: {
            title: 'Preparing for a Client Call',
            passage: 'Before the client call, Nam sends a reminder to his assistant to update the document. He wants to attend the call with the latest numbers ready.',
            quiz: [
              { q: 'Nam nhờ trợ lý làm gì?', options: ['Đặt lịch họp mới', 'Cập nhật tài liệu', 'Gọi cho khách hàng', 'In báo cáo'], correct: 1 },
              { q: 'Nam muốn điều gì khi tham dự cuộc gọi?', options: ['Có số liệu mới nhất', 'Đến trễ', 'Ghi âm lại', 'Huỷ cuộc gọi'], correct: 0 },
            ],
          },
          listening: [
            'Can you send me a reminder before the call?',
            'I need to update this document today.',
            'Please attend the meeting on my behalf.',
          ],
          writing: {
            prompt: 'Viết 3-5 câu tiếng Anh về một cuộc gọi công việc bạn sắp tham dự.',
            minWords: 15,
            phrases: ['I will attend the call', 'Please send a reminder', 'I need to update', 'Could you help me'],
            sentenceBuilder: [
              { scrambled: 'I / (attend) / the meeting / tomorrow', answer: 'I attend the meeting tomorrow' },
              { scrambled: 'She / (send) / a reminder / yesterday', answer: 'She sent a reminder yesterday' },
            ],
          },
        },
        { // Day 3
          vocab: [
            { word: 'Department', phonetic: '/dɪˈpɑːrtmənt/', meaning: 'Phòng ban',     quiz: { options: ['Nhiệm vụ', 'Phòng ban', 'Tiến độ', 'Giao việc'], correct: 1 } },
            { word: 'Manager',    phonetic: '/ˈmænɪdʒər/',   meaning: 'Quản lý',       quiz: { options: ['Quản lý', 'Phòng ban', 'Nhiệm vụ', 'Tiến độ'], correct: 0 } },
            { word: 'Task',       phonetic: '/tæsk/',         meaning: 'Nhiệm vụ',      quiz: { options: ['Giao việc', 'Tiến độ', 'Nhiệm vụ', 'Quản lý'], correct: 2 } },
            { word: 'Assign',     phonetic: '/əˈsaɪn/',       meaning: 'Giao (việc)',   quiz: { options: ['Phòng ban', 'Giao (việc)', 'Quản lý', 'Nhiệm vụ'], correct: 1 } },
            { word: 'Progress',   phonetic: '/ˈprɑːɡres/',    meaning: 'Tiến độ',       quiz: { options: ['Nhiệm vụ', 'Quản lý', 'Tiến độ', 'Phòng ban'], correct: 2 } },
          ],
          reading: {
            title: 'A New Task',
            passage: 'My manager assigned a new task to our department this morning. I need to check my progress every day and report by Friday.',
            quiz: [
              { q: 'Ai giao nhiệm vụ mới?', options: ['Khách hàng', 'Quản lý', 'Đồng nghiệp', 'Trợ lý'], correct: 1 },
              { q: 'Cần báo cáo tiến độ khi nào?', options: ['Mỗi giờ', 'Cuối tháng', 'Thứ Sáu', 'Không cần báo cáo'], correct: 2 },
            ],
          },
          listening: [
            'My manager assigned this task to me.',
            'What\'s the progress on your project?',
            'Which department do you work in?',
          ],
          writing: {
            prompt: 'Viết 3-5 câu mô tả một nhiệm vụ quản lý vừa giao cho bạn.',
            minWords: 15,
            phrases: ['My manager assigned', 'I work in the department of', 'The progress is', 'I need to finish by'],
            sentenceBuilder: [
              { scrambled: 'My manager / (assign) / this task / last week', answer: 'My manager assigned this task last week' },
              { scrambled: 'I / (check) / my progress / every day', answer: 'I check my progress every day' },
            ],
          },
        },

  // ---------- WEEK: Lam quen dong nghiep moi (Day 4-8) ----------
  { // Day 4
    vocab: [
      { word: 'Introduce', phonetic: '/ˌɪntrəˈdjuːs/', meaning: 'Giới thiệu', quiz: { options: ['Chào mừng', 'Giới thiệu', 'Mới', 'Bắt tay'], correct: 1 } },
      { word: 'Welcome',   phonetic: '/ˈwelkəm/',      meaning: 'Chào mừng',  quiz: { options: ['Chào mừng', 'Giới thiệu', 'Bắt tay', 'Mới'], correct: 0 } },
      { word: 'New',       phonetic: '/njuː/',         meaning: 'Mới',        quiz: { options: ['Bắt tay', 'Mới', 'Chào mừng', 'Giới thiệu'], correct: 1 } },
      { word: 'Handshake', phonetic: '/ˈhændʃeɪk/',    meaning: 'Bắt tay',    quiz: { options: ['Mới', 'Chào mừng', 'Bắt tay', 'Giới thiệu'], correct: 2 } },
      { word: 'Team',      phonetic: '/tiːm/',         meaning: 'Đội nhóm',   quiz: { options: ['Đội nhóm', 'Mới', 'Bắt tay', 'Chào mừng'], correct: 0 } },
    ],
    reading: {
      title: 'A New Team Member',
      passage: 'Today, Hoa introduces the new employee to the team. Everyone says "welcome" and gives a friendly handshake. The new colleague smiles and says he is happy to join the team.',
      quiz: [
        { q: 'Hoa làm gì với nhân viên mới?', options: ['Giới thiệu anh ấy với đội nhóm', 'Cho anh ấy nghỉ việc', 'Gửi email', 'Đặt lịch họp'], correct: 0 },
        { q: 'Đội nhóm nói gì với người mới?', options: ['Tạm biệt', 'Chào mừng', 'Xin lỗi', 'Cảm ơn'], correct: 1 },
      ],
    },
    listening: [
      'Let me introduce you to the team.',
      'Welcome to the company!',
      'Nice to have a new member on our team.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu tiếng Anh giới thiệu bản thân với một đồng nghiệp mới.',
      minWords: 15,
      phrases: ['Let me introduce myself', 'Welcome to the team', 'I am new here', 'Nice to shake your hand'],
      sentenceBuilder: [
        { scrambled: 'She / (introduce) / the new employee / today', answer: 'She introduces the new employee today' },
        { scrambled: 'We / (welcome) / him / to the team', answer: 'We welcome him to the team' },
      ],
    },
  },
  { // Day 5
    vocab: [
      { word: 'Name tag',  phonetic: '/neɪm tæɡ/',    meaning: 'Thẻ tên',     quiz: { options: ['Thẻ tên', 'Bàn làm việc', 'Tầng', 'Nội quy'], correct: 0 } },
      { word: 'Desk',      phonetic: '/desk/',         meaning: 'Bàn làm việc', quiz: { options: ['Tầng', 'Bàn làm việc', 'Thẻ tên', 'Nội quy'], correct: 1 } },
      { word: 'Floor',     phonetic: '/flɔːr/',        meaning: 'Tầng (nhà)',  quiz: { options: ['Nội quy', 'Thẻ tên', 'Tầng (nhà)', 'Bàn làm việc'], correct: 2 } },
      { word: 'Rule',      phonetic: '/ruːl/',         meaning: 'Nội quy',     quiz: { options: ['Bàn làm việc', 'Tầng', 'Nội quy', 'Thẻ tên'], correct: 2 },  },
      { word: 'Friendly',  phonetic: '/ˈfrendli/',     meaning: 'Thân thiện', quiz: { options: ['Thân thiện', 'Tầng', 'Nội quy', 'Bàn làm việc'], correct: 0 } },
    ],
    reading: {
      title: 'My First Day',
      passage: 'Minh gets his name tag and finds his desk on the third floor. His manager explains the office rules. Everyone is friendly and helps him feel comfortable.',
      quiz: [
        { q: 'Bàn của Minh ở đâu?', options: ['Tầng ba', 'Tầng một', 'Ngoài sân', 'Phòng họp'], correct: 0 },
        { q: 'Đồng nghiệp đối xử với Minh như thế nào?', options: ['Lạnh lùng', 'Thân thiện', 'Bận rộn', 'Nghiêm khắc'], correct: 1 },
      ],
    },
    listening: [
      'Here is your name tag.',
      'Your desk is on the third floor.',
      'Everyone here is very friendly.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu mô tả ngày đầu tiên đi làm của bạn.',
      minWords: 15,
      phrases: ['My desk is on', 'I got my name tag', 'The office rules are', 'Everyone is friendly'],
      sentenceBuilder: [
        { scrambled: 'My desk / (be) / on the third floor', answer: 'My desk is on the third floor' },
        { scrambled: 'He / (get) / his name tag / this morning', answer: 'He got his name tag this morning' },
      ],
    },
  },
  { // Day 6
    vocab: [
      { word: 'Position',  phonetic: '/pəˈzɪʃn/',    meaning: 'Vị trí (công việc)', quiz: { options: ['Vị trí (công việc)', 'Kinh nghiệm', 'Bộ phận', 'Chức danh'], correct: 0 } },
      { word: 'Experience',phonetic: '/ɪkˈspɪəriəns/', meaning: 'Kinh nghiệm', quiz: { options: ['Chức danh', 'Kinh nghiệm', 'Bộ phận', 'Vị trí (công việc)'], correct: 1 } },
      { word: 'Title',     phonetic: '/ˈtaɪtl/',     meaning: 'Chức danh',   quiz: { options: ['Bộ phận', 'Vị trí (công việc)', 'Chức danh', 'Kinh nghiệm'], correct: 2 } },
      { word: 'Section',   phonetic: '/ˈsekʃn/',     meaning: 'Bộ phận',     quiz: { options: ['Bộ phận', 'Chức danh', 'Kinh nghiệm', 'Vị trí (công việc)'], correct: 0 } },
      { word: 'Role',      phonetic: '/rəʊl/',       meaning: 'Vai trò',     quiz: { options: ['Kinh nghiệm', 'Vai trò', 'Chức danh', 'Bộ phận'], correct: 1 } },
    ],
    reading: {
      title: 'Talking About My Job',
      passage: 'Tuan asks a new colleague about her position and experience. She says her title is Sales Executive and her role is in the marketing section. Tuan is happy to know more about her.',
      quiz: [
        { q: 'Chức danh của cô ấy là gì?', options: ['Sales Executive', 'Manager', 'Assistant', 'Trainer'], correct: 0 },
        { q: 'Cô ấy làm việc ở bộ phận nào?', options: ['Kế toán', 'Marketing', 'Nhân sự', 'IT'], correct: 1 },
      ],
    },
    listening: [
      'What is your position here?',
      'I have three years of experience.',
      'My role is in the marketing section.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu giới thiệu vị trí công việc và kinh nghiệm của bạn.',
      minWords: 15,
      phrases: ['My position is', 'I have experience in', 'My title is', 'My role is to'],
      sentenceBuilder: [
        { scrambled: 'My title / (be) / Sales Executive', answer: 'My title is Sales Executive' },
        { scrambled: 'She / (have) / three years / of experience', answer: 'She has three years of experience' },
      ],
    },
  },
  { // Day 7
    vocab: [
      { word: 'Contact',   phonetic: '/ˈkɒntækt/',  meaning: 'Liên hệ',   quiz: { options: ['Liên hệ', 'Số điện thoại', 'Danh thiếp', 'Trao đổi'], correct: 0 } },
      { word: 'Phone number', phonetic: '/fəʊn ˈnʌmbər/', meaning: 'Số điện thoại', quiz: { options: ['Danh thiếp', 'Số điện thoại', 'Trao đổi', 'Liên hệ'], correct: 1 } },
      { word: 'Business card', phonetic: '/ˈbɪznəs kɑːrd/', meaning: 'Danh thiếp', quiz: { options: ['Danh thiếp', 'Liên hệ', 'Số điện thoại', 'Trao đổi'], correct: 0 } },
      { word: 'Exchange',  phonetic: '/ɪksˈtʃeɪndʒ/', meaning: 'Trao đổi', quiz: { options: ['Số điện thoại', 'Danh thiếp', 'Trao đổi', 'Liên hệ'], correct: 2 } },
      { word: 'Chat',      phonetic: '/tʃæt/',       meaning: 'Trò chuyện', quiz: { options: ['Trò chuyện', 'Liên hệ', 'Danh thiếp', 'Số điện thoại'], correct: 0 } },
    ],
    reading: {
      title: 'Making a New Friend at Work',
      passage: 'Mai exchanges business cards with a new colleague. They contact each other by phone number and chat about their hometowns. Mai feels she has made a new friend at work.',
      quiz: [
        { q: 'Mai và đồng nghiệp mới trao đổi gì?', options: ['Danh thiếp', 'Tài liệu', 'Email công việc', 'Báo cáo'], correct: 0 },
        { q: 'Họ trò chuyện về chủ đề gì?', options: ['Quê hương', 'Lương thưởng', 'Thời tiết', 'Deadline'], correct: 0 },
      ],
    },
    listening: [
      'Can we exchange business cards?',
      'What is your phone number?',
      'Let\'s chat sometime after work.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn làm quen với một đồng nghiệp mới.',
      minWords: 15,
      phrases: ['We exchanged business cards', 'Can I have your phone number', 'We chatted about', 'I contacted her by'],
      sentenceBuilder: [
        { scrambled: 'We / (exchange) / business cards / yesterday', answer: 'We exchanged business cards yesterday' },
        { scrambled: 'I / (contact) / him / by phone', answer: 'I contact him by phone' },
      ],
    },
  },
  { // Day 8
    vocab: [
      { word: 'Hobby',    phonetic: '/ˈhɒbi/',    meaning: 'Sở thích',   quiz: { options: ['Sở thích', 'Giống nhau', 'Khác nhau', 'Chia sẻ'], correct: 0 } },
      { word: 'Similar',  phonetic: '/ˈsɪmɪlər/', meaning: 'Giống nhau', quiz: { options: ['Khác nhau', 'Giống nhau', 'Chia sẻ', 'Sở thích'], correct: 1 } },
      { word: 'Different',phonetic: '/ˈdɪfrənt/', meaning: 'Khác nhau',  quiz: { options: ['Khác nhau', 'Sở thích', 'Giống nhau', 'Chia sẻ'], correct: 0 } },
      { word: 'Share',    phonetic: '/ʃer/',      meaning: 'Chia sẻ',    quiz: { options: ['Giống nhau', 'Khác nhau', 'Chia sẻ', 'Sở thích'], correct: 2 } },
      { word: 'Interest', phonetic: '/ˈɪntrəst/', meaning: 'Sự quan tâm', quiz: { options: ['Sự quan tâm', 'Chia sẻ', 'Khác nhau', 'Giống nhau'], correct: 0 } },
    ],
    reading: {
      title: 'Common Interests',
      passage: 'Duc shares his hobby of playing badminton with a new colleague. They find they have similar interests, even though their working styles are different. Duc is glad to find a friend with the same hobby.',
      quiz: [
        { q: 'Sở thích của Đức là gì?', options: ['Chơi cầu lông', 'Đọc sách', 'Nấu ăn', 'Xem phim'], correct: 0 },
        { q: 'Điều gì giống nhau giữa hai người?', options: ['Sở thích', 'Phong cách làm việc', 'Vị trí công việc', 'Giờ làm việc'], correct: 0 },
      ],
    },
    listening: [
      'What are your hobbies?',
      'We have similar interests.',
      'Our working styles are quite different.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu chia sẻ sở thích của bạn với một đồng nghiệp.',
      minWords: 15,
      phrases: ['My hobby is', 'We have similar interests', 'We are different in', 'I want to share'],
      sentenceBuilder: [
        { scrambled: 'She / (share) / her hobby / with me', answer: 'She shares her hobby with me' },
        { scrambled: 'We / (have) / similar interests', answer: 'We have similar interests' },
      ],
    },
  },
  // ---------- WEEK: Gio giac cong so (Day 9-13) ----------
  { // Day 9
    vocab: [
      { word: 'Punctual',  phonetic: '/ˈpʌŋktʃuəl/', meaning: 'Đúng giờ',   quiz: { options: ['Đúng giờ', 'Trễ', 'Sớm', 'Nghỉ'], correct: 0 } },
      { word: 'Late',      phonetic: '/leɪt/',       meaning: 'Trễ, muộn', quiz: { options: ['Sớm', 'Trễ, muộn', 'Đúng giờ', 'Nghỉ'], correct: 1 } },
      { word: 'Early',     phonetic: '/ˈɜːrli/',     meaning: 'Sớm',       quiz: { options: ['Sớm', 'Trễ, muộn', 'Nghỉ', 'Đúng giờ'], correct: 0 } },
      { word: 'Clock in',  phonetic: '/klɒk ɪn/',    meaning: 'Chấm công (vào)', quiz: { options: ['Chấm công (vào)', 'Chấm công (ra)', 'Sớm', 'Trễ, muộn'], correct: 0 } },
      { word: 'Clock out', phonetic: '/klɒk aʊt/',   meaning: 'Chấm công (ra)', quiz: { options: ['Chấm công (vào)', 'Sớm', 'Chấm công (ra)', 'Trễ, muộn'], correct: 2 } },
    ],
    reading: {
      title: 'On Time Every Day',
      passage: 'Linh is always punctual. She never comes late to work. She likes to clock in early and clock out at 6 PM. Her manager says she is a good example for the team.',
      quiz: [
        { q: 'Linh có thường xuyên đi trễ không?', options: ['Có, rất thường xuyên', 'Không bao giờ', 'Thỉnh thoảng', 'Luôn luôn'], correct: 1 },
        { q: 'Linh chấm công ra lúc mấy giờ?', options: ['6 giờ tối', '5 giờ tối', '7 giờ tối', '8 giờ tối'], correct: 0 },
      ],
    },
    listening: [
      'Please try to be punctual.',
      'I clock in at eight every morning.',
      'Don\'t forget to clock out before you leave.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về giờ giấc đi làm hàng ngày của bạn.',
      minWords: 15,
      phrases: ['I clock in at', 'I try to be punctual', 'I clock out at', 'I am never late'],
      sentenceBuilder: [
        { scrambled: 'She / (clock in) / at eight / every morning', answer: 'She clocks in at eight every morning' },
        { scrambled: 'He / (be) / never late / for work', answer: 'He is never late for work' },
      ],
    },
  },
  { // Day 10
    vocab: [
      { word: 'Overtime',  phonetic: '/ˈəʊvətaɪm/', meaning: 'Làm thêm giờ', quiz: { options: ['Làm thêm giờ', 'Nghỉ trưa', 'Giờ hành chính', 'Giờ cao điểm'], correct: 0 } },
      { word: 'Lunch break', phonetic: '/lʌntʃ breɪk/', meaning: 'Giờ nghỉ trưa', quiz: { options: ['Giờ hành chính', 'Giờ nghỉ trưa', 'Làm thêm giờ', 'Giờ cao điểm'], correct: 1 } },
      { word: 'Office hours', phonetic: '/ˈɒfɪs aʊərz/', meaning: 'Giờ hành chính', quiz: { options: ['Giờ hành chính', 'Giờ cao điểm', 'Giờ nghỉ trưa', 'Làm thêm giờ'], correct: 0 } },
      { word: 'Rush hour', phonetic: '/rʌʃ aʊər/', meaning: 'Giờ cao điểm', quiz: { options: ['Giờ nghỉ trưa', 'Làm thêm giờ', 'Giờ cao điểm', 'Giờ hành chính'], correct: 2 } },
      { word: 'Break time', phonetic: '/breɪk taɪm/', meaning: 'Giờ giải lao', quiz: { options: ['Giờ giải lao', 'Giờ hành chính', 'Làm thêm giờ', 'Giờ cao điểm'], correct: 0 } },
    ],
    reading: {
      title: 'A Busy Schedule',
      passage: 'Office hours at Phong\'s company are from 8 AM to 5 PM. He takes a short lunch break at noon. Sometimes he works overtime, and he tries to leave before rush hour to avoid traffic.',
      quiz: [
        { q: 'Giờ hành chính của công ty Phong bắt đầu lúc mấy giờ?', options: ['8 giờ sáng', '9 giờ sáng', '7 giờ sáng', '10 giờ sáng'], correct: 0 },
        { q: 'Vì sao Phong muốn về trước giờ cao điểm?', options: ['Để tránh kẹt xe', 'Để ăn trưa', 'Để họp', 'Để nghỉ ngơi'], correct: 0 },
      ],
    },
    listening: [
      'Our office hours are from 8 to 5.',
      'I take my lunch break at noon.',
      'I try to avoid rush hour traffic.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu mô tả giờ làm việc và giờ nghỉ trưa ở công ty bạn.',
      minWords: 15,
      phrases: ['Our office hours are', 'I take a lunch break at', 'I sometimes work overtime', 'I avoid rush hour by'],
      sentenceBuilder: [
        { scrambled: 'Our office hours / (be) / from 8 to 5', answer: 'Our office hours are from 8 to 5' },
        { scrambled: 'He / (take) / a lunch break / at noon', answer: 'He takes a lunch break at noon' },
      ],
    },
  },
  { // Day 11
    vocab: [
      { word: 'Day off',   phonetic: '/deɪ ɒf/',   meaning: 'Ngày nghỉ',   quiz: { options: ['Ngày nghỉ', 'Ngày làm việc', 'Nghỉ ốm', 'Trễ giờ'], correct: 0 } },
      { word: 'Working day', phonetic: '/ˈwɜːrkɪŋ deɪ/', meaning: 'Ngày làm việc', quiz: { options: ['Nghỉ ốm', 'Ngày nghỉ', 'Ngày làm việc', 'Trễ giờ'], correct: 2 } },
      { word: 'Sick leave', phonetic: '/sɪk liːv/', meaning: 'Nghỉ ốm', quiz: { options: ['Ngày làm việc', 'Nghỉ ốm', 'Ngày nghỉ', 'Trễ giờ'], correct: 1 } },
      { word: 'Weekday',   phonetic: '/ˈwiːkdeɪ/', meaning: 'Ngày trong tuần', quiz: { options: ['Ngày trong tuần', 'Ngày nghỉ', 'Nghỉ ốm', 'Ngày làm việc'], correct: 0 } },
      { word: 'Weekend',   phonetic: '/ˈwiːkend/', meaning: 'Cuối tuần', quiz: { options: ['Ngày làm việc', 'Cuối tuần', 'Nghỉ ốm', 'Ngày trong tuần'], correct: 1 } },
    ],
    reading: {
      title: 'Planning My Week',
      passage: 'Trang works five weekdays and rests on the weekend. Yesterday, she felt sick, so she took a sick leave. Today is a working day again, and she feels much better.',
      quiz: [
        { q: 'Trang làm việc mấy ngày trong tuần?', options: ['Năm ngày', 'Sáu ngày', 'Bốn ngày', 'Bảy ngày'], correct: 0 },
        { q: 'Vì sao hôm qua Trang nghỉ?', options: ['Cô ấy bị ốm', 'Cô ấy đi du lịch', 'Công ty đóng cửa', 'Cô ấy có việc riêng'], correct: 0 },
      ],
    },
    listening: [
      'I need to take a sick leave today.',
      'We work five weekdays a week.',
      'I rest on the weekend.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về lịch làm việc và ngày nghỉ trong tuần của bạn.',
      minWords: 15,
      phrases: ['I work on weekdays', 'I rest on the weekend', 'I took a sick leave', 'Today is a working day'],
      sentenceBuilder: [
        { scrambled: 'She / (take) / a sick leave / yesterday', answer: 'She took a sick leave yesterday' },
        { scrambled: 'I / (rest) / on the weekend', answer: 'I rest on the weekend' },
      ],
    },
  },
  { // Day 12
    vocab: [
      { word: 'Shift',     phonetic: '/ʃɪft/',      meaning: 'Ca làm việc', quiz: { options: ['Ca làm việc', 'Giờ tan làm', 'Giờ bắt đầu', 'Nghỉ giải lao'], correct: 0 } },
      { word: 'Start time',phonetic: '/stɑːrt taɪm/', meaning: 'Giờ bắt đầu', quiz: { options: ['Giờ tan làm', 'Ca làm việc', 'Giờ bắt đầu', 'Nghỉ giải lao'], correct: 2 } },
      { word: 'Finish time', phonetic: '/ˈfɪnɪʃ taɪm/', meaning: 'Giờ tan làm', quiz: { options: ['Giờ tan làm', 'Giờ bắt đầu', 'Ca làm việc', 'Nghỉ giải lao'], correct: 0 } },
      { word: 'Break',     phonetic: '/breɪk/',     meaning: 'Nghỉ giải lao', quiz: { options: ['Giờ bắt đầu', 'Nghỉ giải lao', 'Ca làm việc', 'Giờ tan làm'], correct: 1 } },
      { word: 'On time',   phonetic: '/ɒn taɪm/',   meaning: 'Đúng giờ (thành ngữ)', quiz: { options: ['Đúng giờ (thành ngữ)', 'Ca làm việc', 'Nghỉ giải lao', 'Giờ bắt đầu'], correct: 0 } },
    ],
    reading: {
      title: 'Morning Shift',
      passage: 'Huy works the morning shift. His start time is 7 AM and his finish time is 3 PM. He takes a short break at 10 AM. Huy always arrives on time.',
      quiz: [
        { q: 'Huy làm ca nào?', options: ['Ca sáng', 'Ca chiều', 'Ca tối', 'Ca đêm'], correct: 0 },
        { q: 'Huy nghỉ giải lao lúc mấy giờ?', options: ['10 giờ sáng', '9 giờ sáng', '11 giờ sáng', '2 giờ chiều'], correct: 0 },
      ],
    },
    listening: [
      'My shift starts at 7 AM.',
      'What time is your break?',
      'I always arrive on time.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu mô tả ca làm việc của bạn, gồm giờ bắt đầu và giờ tan làm.',
      minWords: 15,
      phrases: ['My shift starts at', 'My finish time is', 'I take a break at', 'I always arrive on time'],
      sentenceBuilder: [
        { scrambled: 'His shift / (start) / at 7 AM', answer: 'His shift starts at 7 AM' },
        { scrambled: 'She / (arrive) / on time / every day', answer: 'She arrives on time every day' },
      ],
    },
  },
  { // Day 13
    vocab: [
      { word: 'Timesheet', phonetic: '/ˈtaɪmʃiːt/', meaning: 'Bảng chấm công', quiz: { options: ['Bảng chấm công', 'Giờ làm việc', 'Đơn xin nghỉ', 'Ngày lễ'], correct: 0 } },
      { word: 'Working hours', phonetic: '/ˈwɜːrkɪŋ aʊərz/', meaning: 'Giờ làm việc', quiz: { options: ['Đơn xin nghỉ', 'Giờ làm việc', 'Bảng chấm công', 'Ngày lễ'], correct: 1 } },
      { word: 'Leave form', phonetic: '/liːv fɔːrm/', meaning: 'Đơn xin nghỉ', quiz: { options: ['Giờ làm việc', 'Bảng chấm công', 'Đơn xin nghỉ', 'Ngày lễ'], correct: 2 } },
      { word: 'Holiday',   phonetic: '/ˈhɒlədeɪ/',   meaning: 'Ngày lễ',     quiz: { options: ['Ngày lễ', 'Đơn xin nghỉ', 'Giờ làm việc', 'Bảng chấm công'], correct: 0 } },
      { word: 'Fill in',   phonetic: '/fɪl ɪn/',    meaning: 'Điền vào',   quiz: { options: ['Bảng chấm công', 'Điền vào', 'Ngày lễ', 'Giờ làm việc'], correct: 1 } },
    ],
    reading: {
      title: 'Filling Out Forms',
      passage: 'Every Friday, Ngoc fills in her timesheet to record her working hours. Next week is a holiday, so she also fills in a leave form to plan her day off in advance.',
      quiz: [
        { q: 'Ngọc điền bảng chấm công vào ngày nào?', options: ['Thứ Sáu', 'Thứ Hai', 'Thứ Tư', 'Chủ Nhật'], correct: 0 },
        { q: 'Vì sao Ngọc điền đơn xin nghỉ?', options: ['Vì tuần sau có ngày lễ', 'Vì cô ấy bị ốm', 'Vì cô ấy đi công tác', 'Vì công ty đóng cửa'], correct: 0 },
      ],
    },
    listening: [
      'Please fill in your timesheet.',
      'How many working hours this week?',
      'Don\'t forget the leave form for the holiday.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc điền bảng chấm công hoặc đơn xin nghỉ.',
      minWords: 15,
      phrases: ['I fill in my timesheet', 'My working hours are', 'I need a leave form', 'Next holiday is'],
      sentenceBuilder: [
        { scrambled: 'She / (fill in) / her timesheet / every Friday', answer: 'She fills in her timesheet every Friday' },
        { scrambled: 'I / (need) / a leave form / for the holiday', answer: 'I need a leave form for the holiday' },
      ],
    },
  },
  // ---------- WEEK: Van phong pham & thiet bi (Day 14-18) ----------
  { // Day 14
    vocab: [
      { word: 'Printer',   phonetic: '/ˈprɪntər/',  meaning: 'Máy in',     quiz: { options: ['Máy in', 'Bút', 'Giấy', 'Kẹp giấy'], correct: 0 } },
      { word: 'Pen',       phonetic: '/pen/',       meaning: 'Bút',        quiz: { options: ['Giấy', 'Kẹp giấy', 'Bút', 'Máy in'], correct: 2 } },
      { word: 'Paper',     phonetic: '/ˈpeɪpər/',   meaning: 'Giấy',       quiz: { options: ['Giấy', 'Bút', 'Máy in', 'Kẹp giấy'], correct: 0 } },
      { word: 'Paper clip',phonetic: '/ˈpeɪpər klɪp/', meaning: 'Kẹp giấy', quiz: { options: ['Máy in', 'Kẹp giấy', 'Bút', 'Giấy'], correct: 1 } },
      { word: 'Stapler',   phonetic: '/ˈsteɪplər/', meaning: 'Máy bấm ghim', quiz: { options: ['Máy bấm ghim', 'Giấy', 'Bút', 'Máy in'], correct: 0 } },
    ],
    reading: {
      title: 'Office Supplies',
      passage: 'Lan needs to print a report, but the printer is out of paper. She asks a colleague for some paper and a stapler. She also borrows a pen and a paper clip to organize her documents.',
      quiz: [
        { q: 'Vì sao Lan không in được báo cáo?', options: ['Máy in hết giấy', 'Máy in bị hỏng', 'Cô ấy quên mật khẩu', 'Không có mực'], correct: 0 },
        { q: 'Lan mượn thêm gì để sắp xếp tài liệu?', options: ['Kẹp giấy và bút', 'Ghế mới', 'Laptop', 'Điện thoại'], correct: 0 },
      ],
    },
    listening: [
      'The printer is out of paper.',
      'Can I borrow your pen?',
      'Do you have a stapler?',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về các văn phòng phẩm bạn thường dùng ở công ty.',
      minWords: 15,
      phrases: ['I need some paper', 'Can I borrow your pen', 'The printer is out of', 'I use a stapler to'],
      sentenceBuilder: [
        { scrambled: 'The printer / (be) / out of paper', answer: 'The printer is out of paper' },
        { scrambled: 'She / (borrow) / a pen / from him', answer: 'She borrows a pen from him' },
      ],
    },
  },
  { // Day 15
    vocab: [
      { word: 'Laptop',    phonetic: '/ˈlæptɒp/',  meaning: 'Máy tính xách tay', quiz: { options: ['Máy tính xách tay', 'Màn hình', 'Bàn phím', 'Chuột'], correct: 0 } },
      { word: 'Monitor',   phonetic: '/ˈmɒnɪtər/', meaning: 'Màn hình',    quiz: { options: ['Bàn phím', 'Chuột', 'Màn hình', 'Máy tính xách tay'], correct: 2 } },
      { word: 'Keyboard',  phonetic: '/ˈkiːbɔːrd/',meaning: 'Bàn phím',   quiz: { options: ['Bàn phím', 'Màn hình', 'Chuột', 'Máy tính xách tay'], correct: 0 } },
      { word: 'Mouse',     phonetic: '/maʊs/',     meaning: 'Chuột (máy tính)', quiz: { options: ['Máy tính xách tay', 'Chuột (máy tính)', 'Bàn phím', 'Màn hình'], correct: 1 } },
      { word: 'Charger',   phonetic: '/ˈtʃɑːrdʒər/',meaning: 'Bộ sạc',    quiz: { options: ['Bộ sạc', 'Màn hình', 'Chuột', 'Bàn phím'], correct: 0 } },
    ],
    reading: {
      title: 'New Equipment',
      passage: 'Tuan gets a new laptop, monitor, and keyboard for his desk. Unfortunately, his mouse does not work and his charger is missing. He asks the IT department for help.',
      quiz: [
        { q: 'Thiết bị nào bị hỏng?', options: ['Chuột', 'Bàn phím', 'Màn hình', 'Máy tính xách tay'], correct: 0 },
        { q: 'Tuấn nhờ bộ phận nào giúp đỡ?', options: ['IT', 'Nhân sự', 'Kế toán', 'Marketing'], correct: 0 },
      ],
    },
    listening: [
      'My mouse is not working.',
      'I need a new charger.',
      'Can IT check my laptop, please?',
    ],
    writing: {
      prompt: 'Viết 3-5 câu mô tả các thiết bị máy tính bạn dùng ở văn phòng.',
      minWords: 15,
      phrases: ['I use a laptop for', 'My mouse is not working', 'I need a new charger', 'The monitor is'],
      sentenceBuilder: [
        { scrambled: 'His mouse / (not / work) / today', answer: 'His mouse does not work today' },
        { scrambled: 'She / (need) / a new charger', answer: 'She needs a new charger' },
      ],
    },
  },
  { // Day 16
    vocab: [
      { word: 'Cabinet',   phonetic: '/ˈkæbɪnət/', meaning: 'Tủ hồ sơ',  quiz: { options: ['Tủ hồ sơ', 'Kệ sách', 'Ngăn kéo', 'Bảng trắng'], correct: 0 } },
      { word: 'Shelf',     phonetic: '/ʃelf/',    meaning: 'Kệ sách',    quiz: { options: ['Ngăn kéo', 'Kệ sách', 'Tủ hồ sơ', 'Bảng trắng'], correct: 1 } },
      { word: 'Drawer',    phonetic: '/drɔːr/',   meaning: 'Ngăn kéo',   quiz: { options: ['Ngăn kéo', 'Bảng trắng', 'Tủ hồ sơ', 'Kệ sách'], correct: 0 } },
      { word: 'Whiteboard',phonetic: '/ˈwaɪtbɔːrd/', meaning: 'Bảng trắng', quiz: { options: ['Kệ sách', 'Tủ hồ sơ', 'Bảng trắng', 'Ngăn kéo'], correct: 2 } },
      { word: 'Marker',    phonetic: '/ˈmɑːrkər/', meaning: 'Bút lông',   quiz: { options: ['Bút lông', 'Ngăn kéo', 'Kệ sách', 'Tủ hồ sơ'], correct: 0 } },
    ],
    reading: {
      title: 'Organizing the Office',
      passage: 'Mai keeps old files in the cabinet and new books on the shelf. She stores small items in her drawer. During meetings, she writes ideas on the whiteboard with a marker.',
      quiz: [
        { q: 'Mai để hồ sơ cũ ở đâu?', options: ['Tủ hồ sơ', 'Kệ sách', 'Ngăn kéo', 'Bảng trắng'], correct: 0 },
        { q: 'Mai viết ý tưởng ở đâu trong cuộc họp?', options: ['Bảng trắng', 'Ngăn kéo', 'Tủ hồ sơ', 'Kệ sách'], correct: 0 },
      ],
    },
    listening: [
      'Please put the files in the cabinet.',
      'The books are on the shelf.',
      'Can you write it on the whiteboard?',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn sắp xếp đồ dùng trong văn phòng.',
      minWords: 15,
      phrases: ['I keep files in the cabinet', 'The books are on the shelf', 'I write on the whiteboard', 'I store items in the drawer'],
      sentenceBuilder: [
        { scrambled: 'She / (keep) / old files / in the cabinet', answer: 'She keeps old files in the cabinet' },
        { scrambled: 'He / (write) / ideas / on the whiteboard', answer: 'He writes ideas on the whiteboard' },
      ],
    },
  },
  { // Day 17
    vocab: [
      { word: 'Air conditioner', phonetic: '/eər kənˈdɪʃənər/', meaning: 'Máy lạnh', quiz: { options: ['Máy lạnh', 'Máy photocopy', 'Máy hủy giấy', 'Đèn bàn'], correct: 0 } },
      { word: 'Photocopier', phonetic: '/ˈfəʊtəʊkɒpiər/', meaning: 'Máy photocopy', quiz: { options: ['Đèn bàn', 'Máy hủy giấy', 'Máy photocopy', 'Máy lạnh'], correct: 2 } },
      { word: 'Shredder', phonetic: '/ˈʃredər/', meaning: 'Máy hủy giấy', quiz: { options: ['Máy hủy giấy', 'Máy lạnh', 'Đèn bàn', 'Máy photocopy'], correct: 0 } },
      { word: 'Lamp',     phonetic: '/læmp/',   meaning: 'Đèn bàn',    quiz: { options: ['Máy photocopy', 'Máy lạnh', 'Đèn bàn', 'Máy hủy giấy'], correct: 2 } },
      { word: 'Broken',   phonetic: '/ˈbrəʊkən/', meaning: 'Bị hỏng',   quiz: { options: ['Bị hỏng', 'Đèn bàn', 'Máy lạnh', 'Máy photocopy'], correct: 0 } },
    ],
    reading: {
      title: 'Equipment Problems',
      passage: 'The air conditioner in the office is broken today, and it is very hot. The photocopier is also not working well. Duc uses the shredder to destroy old documents while waiting for the repair team.',
      quiz: [
        { q: 'Vì sao văn phòng nóng?', options: ['Máy lạnh bị hỏng', 'Đèn bàn bị hỏng', 'Cửa sổ mở', 'Máy photocopy bị hỏng'], correct: 0 },
        { q: 'Đức dùng máy gì để hủy tài liệu cũ?', options: ['Máy hủy giấy', 'Máy photocopy', 'Máy lạnh', 'Đèn bàn'], correct: 0 },
      ],
    },
    listening: [
      'The air conditioner is broken.',
      'The photocopier is not working.',
      'I need to use the shredder.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một thiết bị văn phòng bị hỏng và cách bạn xử lý.',
      minWords: 15,
      phrases: ['The air conditioner is broken', 'I need to use the shredder', 'The photocopier is not working', 'I asked for a repair'],
      sentenceBuilder: [
        { scrambled: 'The air conditioner / (be) / broken today', answer: 'The air conditioner is broken today' },
        { scrambled: 'He / (use) / the shredder / for old documents', answer: 'He uses the shredder for old documents' },
      ],
    },
  },
  { // Day 18
    vocab: [
      { word: 'Order',    phonetic: '/ˈɔːrdər/',  meaning: 'Đặt hàng',    quiz: { options: ['Đặt hàng', 'Kho', 'Cạn kiệt', 'Nguồn cung'], correct: 0 } },
      { word: 'Storage',  phonetic: '/ˈstɔːrɪdʒ/', meaning: 'Kho lưu trữ', quiz: { options: ['Cạn kiệt', 'Kho lưu trữ', 'Đặt hàng', 'Nguồn cung'], correct: 1 } },
      { word: 'Run out',  phonetic: '/rʌn aʊt/', meaning: 'Cạn kiệt, hết', quiz: { options: ['Nguồn cung', 'Đặt hàng', 'Kho lưu trữ', 'Cạn kiệt, hết'], correct: 3 } },
      { word: 'Supply',   phonetic: '/səˈplaɪ/', meaning: 'Nguồn cung',   quiz: { options: ['Nguồn cung', 'Cạn kiệt', 'Kho lưu trữ', 'Đặt hàng'], correct: 0 } },
      { word: 'Request',  phonetic: '/rɪˈkwest/', meaning: 'Yêu cầu, đề nghị', quiz: { options: ['Kho lưu trữ', 'Yêu cầu, đề nghị', 'Nguồn cung', 'Cạn kiệt'], correct: 1 } },
    ],
    reading: {
      title: 'Office Supply Request',
      passage: 'The storage room is running out of paper and pens. Nam sends a request to order more office supplies. He hopes the new supply will arrive by next week.',
      quiz: [
        { q: 'Kho văn phòng phẩm đang thiếu gì?', options: ['Giấy và bút', 'Máy tính', 'Ghế', 'Bàn'], correct: 0 },
        { q: 'Nam làm gì để có thêm đồ dùng?', options: ['Gửi yêu cầu đặt hàng', 'Tự mua bằng tiền túi', 'Mượn công ty khác', 'Không làm gì'], correct: 0 },
      ],
    },
    listening: [
      'We are running out of paper.',
      'I sent a request to order more supplies.',
      'The new supply will arrive next week.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc đặt thêm văn phòng phẩm khi kho sắp hết.',
      minWords: 15,
      phrases: ['We are running out of', 'I sent a request to order', 'The supply will arrive', 'The storage room needs'],
      sentenceBuilder: [
        { scrambled: 'We / (run out) / of paper / today', answer: 'We run out of paper today' },
        { scrambled: 'He / (send) / a request / yesterday', answer: 'He sent a request yesterday' },
      ],
    },
  },
  // ---------- WEEK: Nghi phep (Day 19-23) ----------
  { // Day 19
    vocab: [
      { word: 'Vacation', phonetic: '/vəˈkeɪʃn/', meaning: 'Kỳ nghỉ',    quiz: { options: ['Kỳ nghỉ', 'Xin phép', 'Được duyệt', 'Từ chối'], correct: 0 } },
      { word: 'Permission',phonetic: '/pərˈmɪʃn/', meaning: 'Sự cho phép', quiz: { options: ['Được duyệt', 'Kỳ nghỉ', 'Sự cho phép', 'Từ chối'], correct: 2 } },
      { word: 'Approve',  phonetic: '/əˈpruːv/',  meaning: 'Phê duyệt', quiz: { options: ['Phê duyệt', 'Kỳ nghỉ', 'Từ chối', 'Sự cho phép'], correct: 0 } },
      { word: 'Reject',   phonetic: '/rɪˈdʒekt/', meaning: 'Từ chối',   quiz: { options: ['Sự cho phép', 'Từ chối', 'Phê duyệt', 'Kỳ nghỉ'], correct: 1 } },
      { word: 'Apply',    phonetic: '/əˈplaɪ/',   meaning: 'Xin (phép)', quiz: { options: ['Xin (phép)', 'Từ chối', 'Kỳ nghỉ', 'Phê duyệt'], correct: 0 } },
    ],
    reading: {
      title: 'Applying for Vacation',
      passage: 'Hoa wants to apply for a vacation next month. She asks her manager for permission. Her manager approves the request quickly, because Hoa has finished all her tasks.',
      quiz: [
        { q: 'Hoa xin phép điều gì?', options: ['Nghỉ phép', 'Tăng lương', 'Đổi phòng ban', 'Làm thêm giờ'], correct: 0 },
        { q: 'Quản lý phản hồi thế nào?', options: ['Phê duyệt', 'Từ chối', 'Không trả lời', 'Yêu cầu chờ'], correct: 0 },
      ],
    },
    listening: [
      'I want to apply for a vacation.',
      'Can I have your permission?',
      'My manager approved my request.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc xin nghỉ phép của bạn.',
      minWords: 15,
      phrases: ['I want to apply for', 'I need permission from', 'My manager approved', 'My request was rejected'],
      sentenceBuilder: [
        { scrambled: 'She / (apply) / for a vacation / next month', answer: 'She applies for a vacation next month' },
        { scrambled: 'He / (approve) / the request / quickly', answer: 'He approves the request quickly' },
      ],
    },
  },
  { // Day 20
    vocab: [
      { word: 'Annual leave', phonetic: '/ˈænjuəl liːv/', meaning: 'Phép năm', quiz: { options: ['Phép năm', 'Nghỉ không lương', 'Nghỉ thai sản', 'Nghỉ việc riêng'], correct: 0 } },
      { word: 'Unpaid leave', phonetic: '/ʌnˈpeɪd liːv/', meaning: 'Nghỉ không lương', quiz: { options: ['Nghỉ thai sản', 'Phép năm', 'Nghỉ không lương', 'Nghỉ việc riêng'], correct: 2 } },
      { word: 'Maternity leave', phonetic: '/məˈtɜːrnəti liːv/', meaning: 'Nghỉ thai sản', quiz: { options: ['Nghỉ thai sản', 'Nghỉ việc riêng', 'Phép năm', 'Nghỉ không lương'], correct: 0 } },
      { word: 'Personal leave', phonetic: '/ˈpɜːrsənl liːv/', meaning: 'Nghỉ việc riêng', quiz: { options: ['Nghỉ không lương', 'Nghỉ việc riêng', 'Nghỉ thai sản', 'Phép năm'], correct: 1 } },
      { word: 'Remaining', phonetic: '/rɪˈmeɪnɪŋ/', meaning: 'Còn lại',   quiz: { options: ['Còn lại', 'Phép năm', 'Nghỉ không lương', 'Nghỉ thai sản'], correct: 0 } },
    ],
    reading: {
      title: 'Types of Leave',
      passage: 'Trang has 12 days of annual leave this year. She has used 8 days, so 4 days are remaining. If she needs more time off, she can take unpaid leave or personal leave.',
      quiz: [
        { q: 'Trang còn bao nhiêu ngày phép năm?', options: ['4 ngày', '8 ngày', '12 ngày', '0 ngày'], correct: 0 },
        { q: 'Nếu cần nghỉ thêm, Trang có thể làm gì?', options: ['Nghỉ không lương', 'Nghỉ việc luôn', 'Không được nghỉ', 'Đổi công ty'], correct: 0 },
      ],
    },
    listening: [
      'How many days of annual leave do you have?',
      'I have 4 days remaining.',
      'She is taking maternity leave next month.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về số ngày phép năm còn lại của bạn.',
      minWords: 15,
      phrases: ['I have days of annual leave', 'I have used', 'days are remaining', 'I might take unpaid leave'],
      sentenceBuilder: [
        { scrambled: 'She / (have) / 4 days / remaining', answer: 'She has 4 days remaining' },
        { scrambled: 'He / (take) / unpaid leave / next week', answer: 'He takes unpaid leave next week' },
      ],
    },
  },
  { // Day 21
    vocab: [
      { word: 'Substitute', phonetic: '/ˈsʌbstɪtjuːt/', meaning: 'Người thay thế', quiz: { options: ['Người thay thế', 'Bàn giao', 'Trở lại', 'Vắng mặt'], correct: 0 } },
      { word: 'Hand over', phonetic: '/hænd ˈəʊvər/', meaning: 'Bàn giao', quiz: { options: ['Trở lại', 'Bàn giao', 'Vắng mặt', 'Người thay thế'], correct: 1 } },
      { word: 'Return',   phonetic: '/rɪˈtɜːrn/', meaning: 'Trở lại (làm việc)', quiz: { options: ['Bàn giao', 'Người thay thế', 'Trở lại (làm việc)', 'Vắng mặt'], correct: 2 } },
      { word: 'Absent',   phonetic: '/ˈæbsənt/', meaning: 'Vắng mặt',   quiz: { options: ['Vắng mặt', 'Trở lại (làm việc)', 'Người thay thế', 'Bàn giao'], correct: 0 } },
      { word: 'Cover for', phonetic: '/ˈkʌvər fɔːr/', meaning: 'Làm thay cho', quiz: { options: ['Người thay thế', 'Vắng mặt', 'Trở lại (làm việc)', 'Làm thay cho'], correct: 3 } },
    ],
    reading: {
      title: 'Before Going on Leave',
      passage: 'Before her vacation, Ngoc hands over her tasks to a substitute. Her colleague agrees to cover for her while she is absent. Ngoc plans to return to work on Monday.',
      quiz: [
        { q: 'Ngọc làm gì trước khi đi nghỉ?', options: ['Bàn giao công việc', 'Xin nghỉ việc', 'Đi công tác', 'Họp với sếp'], correct: 0 },
        { q: 'Khi nào Ngọc trở lại làm việc?', options: ['Thứ Hai', 'Thứ Ba', 'Chủ Nhật', 'Thứ Sáu'], correct: 0 },
      ],
    },
    listening: [
      'I will hand over my tasks before I leave.',
      'Can you cover for me next week?',
      'I will return to work on Monday.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc bàn giao công việc trước khi bạn nghỉ phép.',
      minWords: 15,
      phrases: ['I will hand over my tasks', 'Can you cover for me', 'I will return on', 'I will be absent on'],
      sentenceBuilder: [
        { scrambled: 'She / (hand over) / her tasks / before vacation', answer: 'She hands over her tasks before vacation' },
        { scrambled: 'He / (return) / to work / on Monday', answer: 'He returns to work on Monday' },
      ],
    },
  },
  { // Day 22
    vocab: [
      { word: 'Emergency', phonetic: '/ɪˈmɜːrdʒənsi/', meaning: 'Khẩn cấp', quiz: { options: ['Khẩn cấp', 'Thông báo trước', 'Lý do', 'Đột xuất'], correct: 0 } },
      { word: 'Notice',   phonetic: '/ˈnəʊtɪs/', meaning: 'Thông báo trước', quiz: { options: ['Đột xuất', 'Thông báo trước', 'Lý do', 'Khẩn cấp'], correct: 1 } },
      { word: 'Reason',   phonetic: '/ˈriːzn/',  meaning: 'Lý do',        quiz: { options: ['Lý do', 'Khẩn cấp', 'Đột xuất', 'Thông báo trước'], correct: 0 } },
      { word: 'Sudden',   phonetic: '/ˈsʌdn/',   meaning: 'Đột xuất, bất ngờ', quiz: { options: ['Thông báo trước', 'Lý do', 'Đột xuất, bất ngờ', 'Khẩn cấp'], correct: 2 } },
      { word: 'Inform',   phonetic: '/ɪnˈfɔːrm/',meaning: 'Thông báo (cho ai đó)', quiz: { options: ['Thông báo (cho ai đó)', 'Lý do', 'Khẩn cấp', 'Đột xuất'], correct: 0 } },
    ],
    reading: {
      title: 'A Sudden Leave',
      passage: 'Phong has a family emergency and needs a sudden leave. He informs his manager right away, even without much notice. He explains the reason clearly and promises to update his progress.',
      quiz: [
        { q: 'Vì sao Phong cần nghỉ đột xuất?', options: ['Có việc gia đình khẩn cấp', 'Anh ấy đi du lịch', 'Anh ấy bị mất xe', 'Anh ấy muốn nghỉ ngơi'], correct: 0 },
        { q: 'Phong làm gì ngay khi cần nghỉ?', options: ['Thông báo cho quản lý', 'Im lặng nghỉ luôn', 'Nhờ đồng nghiệp giấu', 'Gửi email cho khách hàng'], correct: 0 },
      ],
    },
    listening: [
      'I have a family emergency.',
      'I am sorry for the sudden notice.',
      'I will inform my manager right away.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn xử lý khi cần nghỉ đột xuất.',
      minWords: 15,
      phrases: ['I have an emergency', 'I informed my manager', 'The reason is', 'I am sorry for the sudden notice'],
      sentenceBuilder: [
        { scrambled: 'He / (inform) / his manager / right away', answer: 'He informs his manager right away' },
        { scrambled: 'She / (have) / a family emergency', answer: 'She has a family emergency' },
      ],
    },
  },
  { // Day 23
    vocab: [
      { word: 'Public holiday', phonetic: '/ˈpʌblɪk ˈhɒlədeɪ/', meaning: 'Ngày lễ quốc gia', quiz: { options: ['Ngày lễ quốc gia', 'Nghỉ bù', 'Trước ngày lễ', 'Sau ngày lễ'], correct: 0 } },
      { word: 'Compensation day', phonetic: '/ˌkɒmpenˈseɪʃn deɪ/', meaning: 'Ngày nghỉ bù', quiz: { options: ['Trước ngày lễ', 'Ngày nghỉ bù', 'Ngày lễ quốc gia', 'Sau ngày lễ'], correct: 1 } },
      { word: 'Beforehand', phonetic: '/bɪˈfɔːrhænd/', meaning: 'Trước đó',   quiz: { options: ['Trước đó', 'Ngày lễ quốc gia', 'Ngày nghỉ bù', 'Sau ngày lễ'], correct: 0 } },
      { word: 'Afterward', phonetic: '/ˈɑːftərwərd/', meaning: 'Sau đó',     quiz: { options: ['Ngày nghỉ bù', 'Trước đó', 'Sau đó', 'Ngày lễ quốc gia'], correct: 2 } },
      { word: 'Long weekend', phonetic: '/lɒŋ wiːkˈend/', meaning: 'Kỳ nghỉ cuối tuần dài', quiz: { options: ['Kỳ nghỉ cuối tuần dài', 'Sau đó', 'Trước đó', 'Ngày nghỉ bù'], correct: 0 } },
    ],
    reading: {
      title: 'Planning Around a Public Holiday',
      passage: 'Next week is a public holiday, and the company gives everyone a long weekend. Duc plans to finish his work beforehand so he can relax afterward. He is happy about the extra compensation day too.',
      quiz: [
        { q: 'Tuần sau công ty của Đức có gì đặc biệt?', options: ['Ngày lễ quốc gia', 'Ngày lương', 'Ngày họp lớn', 'Ngày kiểm tra'], correct: 0 },
        { q: 'Đức dự định làm gì trước kỳ nghỉ?', options: ['Hoàn thành công việc trước', 'Nghỉ việc', 'Đi công tác', 'Không làm gì'], correct: 0 },
      ],
    },
    listening: [
      'Next week is a public holiday.',
      'We have a long weekend.',
      'I will finish my work beforehand.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về kế hoạch của bạn cho kỳ nghỉ lễ sắp tới.',
      minWords: 15,
      phrases: ['Next week is a public holiday', 'We have a long weekend', 'I will finish my work beforehand', 'I plan to relax afterward'],
      sentenceBuilder: [
        { scrambled: 'The company / (give) / a long weekend', answer: 'The company gives a long weekend' },
        { scrambled: 'He / (finish) / his work / beforehand', answer: 'He finishes his work beforehand' },
      ],
    },
  },
  // ---------- WEEK: An trua & giao luu (Day 24-28) ----------
  { // Day 24
    vocab: [
      { word: 'Canteen',  phonetic: '/kænˈtiːn/', meaning: 'Căng tin',   quiz: { options: ['Căng tin', 'Thực đơn', 'Đặt món', 'Món ăn'], correct: 0 } },
      { word: 'Menu',     phonetic: '/ˈmenjuː/', meaning: 'Thực đơn',   quiz: { options: ['Món ăn', 'Thực đơn', 'Căng tin', 'Đặt món'], correct: 1 } },
      { word: 'Order food', phonetic: '/ˈɔːrdər fuːd/', meaning: 'Đặt món (ăn)', quiz: { options: ['Đặt món (ăn)', 'Căng tin', 'Thực đơn', 'Món ăn'], correct: 0 } },
      { word: 'Dish',     phonetic: '/dɪʃ/',   meaning: 'Món ăn',    quiz: { options: ['Thực đơn', 'Đặt món', 'Món ăn', 'Căng tin'], correct: 2 } },
      { word: 'Delicious', phonetic: '/dɪˈlɪʃəs/', meaning: 'Ngon',   quiz: { options: ['Ngon', 'Món ăn', 'Thực đơn', 'Căng tin'], correct: 0 } },
    ],
    reading: {
      title: 'Lunch at the Canteen',
      passage: 'Every day, Linh eats lunch at the company canteen. She checks the menu and orders food she likes. Today\'s dish is fried rice, and she thinks it is delicious.',
      quiz: [
        { q: 'Linh ăn trưa ở đâu?', options: ['Căng tin công ty', 'Nhà hàng', 'Nhà riêng', 'Quán cà phê'], correct: 0 },
        { q: 'Linh nghĩ gì về món ăn hôm nay?', options: ['Ngon', 'Dở', 'Quá mặn', 'Quá cay'], correct: 0 },
      ],
    },
    listening: [
      'Let\'s eat at the canteen.',
      'What is on the menu today?',
      'This dish is really delicious.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về bữa trưa của bạn ở căng tin công ty.',
      minWords: 15,
      phrases: ['I eat lunch at the canteen', 'I check the menu', 'I order food I like', 'This dish is delicious'],
      sentenceBuilder: [
        { scrambled: 'She / (eat) / lunch / at the canteen', answer: 'She eats lunch at the canteen' },
        { scrambled: 'He / (order) / fried rice / today', answer: 'He orders fried rice today' },
      ],
    },
  },
  { // Day 25
    vocab: [
      { word: 'Invite',   phonetic: '/ɪnˈvaɪt/', meaning: 'Mời',        quiz: { options: ['Mời', 'Cùng nhau', 'Tham gia', 'Từ chối lời mời'], correct: 0 } },
      { word: 'Together', phonetic: '/təˈɡeðər/', meaning: 'Cùng nhau', quiz: { options: ['Tham gia', 'Cùng nhau', 'Mời', 'Từ chối lời mời'], correct: 1 } },
      { word: 'Join',     phonetic: '/dʒɔɪn/',  meaning: 'Tham gia',    quiz: { options: ['Tham gia', 'Cùng nhau', 'Mời', 'Từ chối lời mời'], correct: 0 } },
      { word: 'Decline',  phonetic: '/dɪˈklaɪn/', meaning: 'Từ chối lời mời', quiz: { options: ['Mời', 'Tham gia', 'Cùng nhau', 'Từ chối lời mời'], correct: 3 } },
      { word: 'Treat',    phonetic: '/triːt/',  meaning: 'Mời (trả tiền, đãi)', quiz: { options: ['Mời (trả tiền, đãi)', 'Tham gia', 'Từ chối lời mời', 'Cùng nhau'], correct: 0 } },
    ],
    reading: {
      title: 'Lunch Together',
      passage: 'Minh invites his colleagues to eat lunch together. Most of them join happily, but one colleague declines because she has a call. Minh decides to treat everyone to celebrate his birthday.',
      quiz: [
        { q: 'Vì sao một đồng nghiệp từ chối lời mời?', options: ['Cô ấy có cuộc gọi', 'Cô ấy không đói', 'Cô ấy bận việc khác', 'Cô ấy không thích món ăn'], correct: 0 },
        { q: 'Minh mời mọi người ăn trưa nhân dịp gì?', options: ['Sinh nhật của Minh', 'Ngày lễ', 'Hoàn thành dự án', 'Ngày lương'], correct: 0 },
      ],
    },
    listening: [
      'Would you like to join us for lunch?',
      'Let\'s eat together today.',
      'I would like to treat everyone today.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc mời đồng nghiệp đi ăn trưa cùng nhau.',
      minWords: 15,
      phrases: ['I invite my colleagues to', 'We eat lunch together', 'I would like to treat', 'She declined the invitation'],
      sentenceBuilder: [
        { scrambled: 'He / (invite) / his colleagues / to lunch', answer: 'He invites his colleagues to lunch' },
        { scrambled: 'She / (decline) / the invitation / today', answer: 'She declines the invitation today' },
      ],
    },
  },
  { // Day 26
    vocab: [
      { word: 'Coffee break', phonetic: '/ˈkɒfi breɪk/', meaning: 'Giờ giải lao cà phê', quiz: { options: ['Giờ giải lao cà phê', 'Trò chuyện phiếm', 'Uống', 'Trả tiền'], correct: 0 } },
      { word: 'Small talk', phonetic: '/smɔːl tɔːk/', meaning: 'Trò chuyện phiếm', quiz: { options: ['Uống', 'Trò chuyện phiếm', 'Trả tiền', 'Giờ giải lao cà phê'], correct: 1 } },
      { word: 'Drink',    phonetic: '/drɪŋk/', meaning: 'Uống',        quiz: { options: ['Uống', 'Trò chuyện phiếm', 'Giờ giải lao cà phê', 'Trả tiền'], correct: 0 } },
      { word: 'Pay',      phonetic: '/peɪ/',  meaning: 'Trả tiền',   quiz: { options: ['Trò chuyện phiếm', 'Uống', 'Trả tiền', 'Giờ giải lao cà phê'], correct: 2 } },
      { word: 'Relax',    phonetic: '/rɪˈlæks/', meaning: 'Thư giãn', quiz: { options: ['Thư giãn', 'Trả tiền', 'Uống', 'Trò chuyện phiếm'], correct: 0 } },
    ],
    reading: {
      title: 'A Coffee Break',
      passage: 'During the coffee break, Tuan and his colleagues drink coffee and make small talk. They relax for ten minutes before going back to work. Tuan usually pays for his own drink.',
      quiz: [
        { q: 'Tuấn và đồng nghiệp làm gì trong giờ giải lao?', options: ['Uống cà phê và trò chuyện', 'Họp khẩn', 'Đi mua sắm', 'Ngủ trưa'], correct: 0 },
        { q: 'Ai trả tiền cho ly cà phê của Tuấn?', options: ['Tuấn tự trả', 'Công ty trả', 'Đồng nghiệp trả', 'Không ai trả'], correct: 0 },
      ],
    },
    listening: [
      'Let\'s take a coffee break.',
      'We made some small talk.',
      'I need to relax for a bit.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về giờ giải lao cà phê ở công ty bạn.',
      minWords: 15,
      phrases: ['I take a coffee break', 'We make small talk about', 'I pay for my own drink', 'I relax for a few minutes'],
      sentenceBuilder: [
        { scrambled: 'They / (drink) / coffee / together', answer: 'They drink coffee together' },
        { scrambled: 'He / (relax) / for ten minutes', answer: 'He relaxes for ten minutes' },
      ],
    },
  },
  { // Day 27
    vocab: [
      { word: 'Restaurant', phonetic: '/ˈrestrɒnt/', meaning: 'Nhà hàng', quiz: { options: ['Nhà hàng', 'Đặt bàn', 'Hóa đơn', 'Chia tiền'], correct: 0 } },
      { word: 'Book a table', phonetic: '/bʊk ə ˈteɪbl/', meaning: 'Đặt bàn', quiz: { options: ['Hóa đơn', 'Đặt bàn', 'Chia tiền', 'Nhà hàng'], correct: 1 } },
      { word: 'Bill',     phonetic: '/bɪl/',   meaning: 'Hóa đơn',    quiz: { options: ['Chia tiền', 'Nhà hàng', 'Hóa đơn', 'Đặt bàn'], correct: 2 } },
      { word: 'Split',    phonetic: '/splɪt/', meaning: 'Chia (tiền)', quiz: { options: ['Chia (tiền)', 'Đặt bàn', 'Nhà hàng', 'Hóa đơn'], correct: 0 } },
      { word: 'Reservation', phonetic: '/ˌrezərˈveɪʃn/', meaning: 'Sự đặt chỗ trước', quiz: { options: ['Nhà hàng', 'Sự đặt chỗ trước', 'Hóa đơn', 'Chia tiền'], correct: 1 } },
      ],
    reading: {
      title: 'Team Lunch at a Restaurant',
      passage: 'Trang books a table at a nearby restaurant for the team. She makes a reservation for six people. At the end, everyone agrees to split the bill equally.',
      quiz: [
        { q: 'Trang đặt bàn cho bao nhiêu người?', options: ['Sáu người', 'Bốn người', 'Tám người', 'Hai người'], correct: 0 },
        { q: 'Cuối buổi, mọi người làm gì với hóa đơn?', options: ['Chia đều', 'Một người trả hết', 'Không ai trả', 'Công ty trả'], correct: 0 },
      ],
    },
    listening: [
      'I booked a table for six.',
      'Can we split the bill?',
      'Do you have a reservation?',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một bữa ăn trưa cùng đội nhóm tại nhà hàng.',
      minWords: 15,
      phrases: ['I booked a table for', 'We split the bill', 'I made a reservation', 'The restaurant is'],
      sentenceBuilder: [
        { scrambled: 'She / (book) / a table / for six people', answer: 'She books a table for six people' },
        { scrambled: 'They / (split) / the bill / equally', answer: 'They split the bill equally' },
      ],
    },
  },
  { // Day 28
    vocab: [
      { word: 'Celebrate', phonetic: '/ˈseləbreɪt/', meaning: 'Ăn mừng', quiz: { options: ['Ăn mừng', 'Sinh nhật', 'Món quà', 'Bánh kem'], correct: 0 } },
      { word: 'Birthday', phonetic: '/ˈbɜːrθdeɪ/', meaning: 'Sinh nhật', quiz: { options: ['Món quà', 'Sinh nhật', 'Ăn mừng', 'Bánh kem'], correct: 1 } },
      { word: 'Gift',     phonetic: '/ɡɪft/', meaning: 'Món quà',     quiz: { options: ['Món quà', 'Ăn mừng', 'Bánh kem', 'Sinh nhật'], correct: 0 } },
      { word: 'Cake',     phonetic: '/keɪk/', meaning: 'Bánh kem',    quiz: { options: ['Ăn mừng', 'Bánh kem', 'Món quà', 'Sinh nhật'], correct: 1 } },
      { word: 'Congratulate', phonetic: '/kənˈɡrætʃuleɪt/', meaning: 'Chúc mừng', quiz: { options: ['Chúc mừng', 'Món quà', 'Bánh kem', 'Sinh nhật'], correct: 0 } },
    ],
    reading: {
      title: 'A Birthday Celebration',
      passage: 'The team celebrates Huy\'s birthday with a small cake. Everyone congratulates him and gives him a small gift. Huy feels happy to work with such kind colleagues.',
      quiz: [
        { q: 'Đội nhóm ăn mừng sự kiện gì?', options: ['Sinh nhật của Huy', 'Ngày lễ', 'Hoàn thành dự án', 'Ngày công ty thành lập'], correct: 0 },
        { q: 'Mọi người tặng Huy gì?', options: ['Món quà nhỏ', 'Tiền mặt', 'Vé du lịch', 'Không tặng gì'], correct: 0 },
      ],
    },
    listening: [
      'Happy birthday! Let\'s celebrate.',
      'We got you a small gift.',
      'Congratulations on your birthday!',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc ăn mừng sinh nhật của một đồng nghiệp.',
      minWords: 15,
      phrases: ['We celebrate his birthday', 'We give him a gift', 'We congratulate her on', 'The cake is'],
      sentenceBuilder: [
        { scrambled: 'The team / (celebrate) / his birthday / today', answer: 'The team celebrates his birthday today' },
        { scrambled: 'They / (give) / him / a small gift', answer: 'They give him a small gift' },
      ],
    },
  },
  // ---------- WEEK: Dat lich hen (Day 29-33) ----------
  { // Day 29
    vocab: [
      { word: 'Appointment', phonetic: '/əˈpɔɪntmənt/', meaning: 'Lịch hẹn', quiz: { options: ['Lịch hẹn', 'Rảnh', 'Bận', 'Xác nhận'], correct: 0 } },
      { word: 'Available', phonetic: '/əˈveɪləbl/', meaning: 'Rảnh, có sẵn', quiz: { options: ['Bận', 'Rảnh, có sẵn', 'Lịch hẹn', 'Xác nhận'], correct: 1 } },
      { word: 'Busy',     phonetic: '/ˈbɪzi/', meaning: 'Bận',        quiz: { options: ['Bận', 'Rảnh, có sẵn', 'Xác nhận', 'Lịch hẹn'], correct: 0 } },
      { word: 'Confirm',  phonetic: '/kənˈfɜːrm/', meaning: 'Xác nhận', quiz: { options: ['Xác nhận', 'Bận', 'Lịch hẹn', 'Rảnh, có sẵn'], correct: 0 } },
      { word: 'Arrange',  phonetic: '/əˈreɪndʒ/', meaning: 'Sắp xếp',  quiz: { options: ['Sắp xếp', 'Xác nhận', 'Bận', 'Lịch hẹn'], correct: 0 } },
    ],
    reading: {
      title: 'Setting Up an Appointment',
      passage: 'Duc wants to arrange an appointment with the HR manager. He checks when she is available, because she is often busy in the morning. They confirm a meeting time for 2 PM.',
      quiz: [
        { q: 'Đức muốn hẹn gặp ai?', options: ['Quản lý nhân sự', 'Khách hàng', 'Giám đốc', 'Đồng nghiệp'], correct: 0 },
        { q: 'Vì sao Đức cần kiểm tra thời gian rảnh?', options: ['Vì quản lý thường bận buổi sáng', 'Vì Đức quên lịch', 'Vì công ty đóng cửa', 'Vì cuộc hẹn bị hủy'], correct: 0 },
      ],
    },
    listening: [
      'I would like to arrange an appointment.',
      'Are you available this afternoon?',
      'Let\'s confirm the meeting time.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc đặt lịch hẹn với đồng nghiệp hoặc quản lý.',
      minWords: 15,
      phrases: ['I want to arrange an appointment', 'Are you available at', 'Let\'s confirm the time', 'I am busy in the morning'],
      sentenceBuilder: [
        { scrambled: 'He / (arrange) / an appointment / with her', answer: 'He arranges an appointment with her' },
        { scrambled: 'They / (confirm) / the meeting / time', answer: 'They confirm the meeting time' },
      ],
    },
  },
  { // Day 30
    vocab: [
      { word: 'Postpone', phonetic: '/pəʊstˈpəʊn/', meaning: 'Hoãn lại', quiz: { options: ['Hoãn lại', 'Hủy bỏ', 'Đổi lịch', 'Xin lỗi'], correct: 0 } },
      { word: 'Cancel',   phonetic: '/ˈkænsl/', meaning: 'Hủy bỏ',    quiz: { options: ['Đổi lịch', 'Hủy bỏ', 'Xin lỗi', 'Hoãn lại'], correct: 1 } },
      { word: 'Reschedule', phonetic: '/riːˈskedʒuːl/', meaning: 'Đổi lịch', quiz: { options: ['Đổi lịch', 'Hủy bỏ', 'Hoãn lại', 'Xin lỗi'], correct: 0 } },
      { word: 'Apologize', phonetic: '/əˈpɒlədʒaɪz/', meaning: 'Xin lỗi', quiz: { options: ['Hoãn lại', 'Hủy bỏ', 'Xin lỗi', 'Đổi lịch'], correct: 2 } },
      { word: 'Inconvenient', phonetic: '/ˌɪnkənˈviːniənt/', meaning: 'Bất tiện', quiz: { options: ['Bất tiện', 'Hủy bỏ', 'Đổi lịch', 'Xin lỗi'], correct: 0 } },
    ],
    reading: {
      title: 'Changing Plans',
      passage: 'Ngoc needs to postpone her appointment because something urgent happened. She apologizes for the inconvenient change and asks to reschedule for tomorrow. Her colleague understands and does not cancel the meeting.',
      quiz: [
        { q: 'Vì sao Ngọc phải hoãn lịch hẹn?', options: ['Có việc gấp xảy ra', 'Cô ấy quên lịch', 'Đối tác hủy', 'Cô ấy bị ốm'], correct: 0 },
        { q: 'Ngọc muốn dời cuộc hẹn sang khi nào?', options: ['Ngày mai', 'Tuần sau', 'Tháng sau', 'Không dời'], correct: 0 },
      ],
    },
    listening: [
      'I need to postpone our appointment.',
      'I am sorry for the inconvenient change.',
      'Can we reschedule for tomorrow?',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc bạn phải dời hoặc hủy một cuộc hẹn.',
      minWords: 15,
      phrases: ['I need to postpone', 'I apologize for', 'Can we reschedule for', 'I am sorry for the inconvenience'],
      sentenceBuilder: [
        { scrambled: 'She / (postpone) / the appointment / today', answer: 'She postpones the appointment today' },
        { scrambled: 'They / (reschedule) / the meeting / for tomorrow', answer: 'They reschedule the meeting for tomorrow' },
      ],
    },
  },
  { // Day 31
    vocab: [
      { word: 'Calendar', phonetic: '/ˈkælɪndər/', meaning: 'Lịch (làm việc)', quiz: { options: ['Lịch (làm việc)', 'Mời họp', 'Đặt lịch', 'Trống lịch'], correct: 0 } },
      { word: 'Invite (someone) to a meeting', phonetic: '/ɪnˈvaɪt/', meaning: 'Mời họp', quiz: { options: ['Trống lịch', 'Đặt lịch', 'Mời họp', 'Lịch (làm việc)'], correct: 2 } },
      { word: 'Set a time', phonetic: '/set ə taɪm/', meaning: 'Đặt lịch',   quiz: { options: ['Đặt lịch', 'Trống lịch', 'Lịch (làm việc)', 'Mời họp'], correct: 0 } },
      { word: 'Free slot', phonetic: '/friː slɒt/', meaning: 'Khung giờ trống', quiz: { options: ['Mời họp', 'Lịch (làm việc)', 'Khung giờ trống', 'Đặt lịch'], correct: 2 } },
      { word: 'Check',    phonetic: '/tʃek/', meaning: 'Kiểm tra',    quiz: { options: ['Kiểm tra', 'Đặt lịch', 'Mời họp', 'Khung giờ trống'], correct: 0 } },
    ],
    reading: {
      title: 'Checking the Calendar',
      passage: 'Phong checks his calendar for a free slot. He wants to set a time to invite his colleague to a meeting. He finds an open time at 3 PM and sends the invitation.',
      quiz: [
        { q: 'Phong kiểm tra cái gì trước?', options: ['Lịch làm việc', 'Email', 'Bảng lương', 'Danh sách khách hàng'], correct: 0 },
        { q: 'Phong tìm được khung giờ trống lúc mấy giờ?', options: ['3 giờ chiều', '2 giờ chiều', '4 giờ chiều', '1 giờ chiều'], correct: 0 },
      ],
    },
    listening: [
      'Let me check my calendar.',
      'I have a free slot at 3 PM.',
      'I will set a time for the meeting.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn kiểm tra lịch và đặt lịch họp.',
      minWords: 15,
      phrases: ['I check my calendar', 'I have a free slot at', 'I set a time for', 'I invite him to a meeting'],
      sentenceBuilder: [
        { scrambled: 'He / (check) / his calendar / every morning', answer: 'He checks his calendar every morning' },
        { scrambled: 'She / (find) / a free slot / at 3 PM', answer: 'She finds a free slot at 3 PM' },
      ],
    },
  },
  { // Day 32
    vocab: [
      { word: 'On the phone', phonetic: '/ɒn ðə fəʊn/', meaning: 'Đang gọi điện', quiz: { options: ['Đang gọi điện', 'Xác nhận địa điểm', 'Xin số điện thoại', 'Gọi lại'], correct: 0 } },
      { word: 'Location', phonetic: '/ləʊˈkeɪʃn/', meaning: 'Địa điểm',   quiz: { options: ['Đang gọi điện', 'Địa điểm', 'Xin số điện thoại', 'Gọi lại'], correct: 1 } },
      { word: 'Call back', phonetic: '/kɔːl bæk/', meaning: 'Gọi lại',   quiz: { options: ['Gọi lại', 'Địa điểm', 'Đang gọi điện', 'Xin số điện thoại'], correct: 0 } },
      { word: 'Ask for a number', phonetic: '/ɑːsk fɔːr ə ˈnʌmbər/', meaning: 'Xin số điện thoại', quiz: { options: ['Địa điểm', 'Gọi lại', 'Xin số điện thoại', 'Đang gọi điện'], correct: 2 } },
      { word: 'Confirm the location', phonetic: '/kənˈfɜːrm ðə ləʊˈkeɪʃn/', meaning: 'Xác nhận địa điểm', quiz: { options: ['Xác nhận địa điểm', 'Gọi lại', 'Đang gọi điện', 'Xin số điện thoại'], correct: 0 } },
    ],
    reading: {
      title: 'Arranging Where to Meet',
      passage: 'Lan is on the phone with a client to confirm the location of their appointment. She asks for his number in case she needs to call back. They agree to meet at the coffee shop near the office.',
      quiz: [
        { q: 'Lan đang làm gì?', options: ['Gọi điện xác nhận địa điểm', 'Viết báo cáo', 'Đọc email', 'Đi họp'], correct: 0 },
        { q: 'Hai người hẹn gặp nhau ở đâu?', options: ['Quán cà phê gần công ty', 'Nhà hàng', 'Văn phòng khách hàng', 'Sân bay'], correct: 0 },
      ],
    },
    listening: [
      'I am on the phone with a client.',
      'Can I confirm the location?',
      'I will call you back later.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc xác nhận địa điểm gặp mặt qua điện thoại.',
      minWords: 15,
      phrases: ['I am on the phone with', 'I want to confirm the location', 'I will call back', 'Can I ask for your number'],
      sentenceBuilder: [
        { scrambled: 'She / (confirm) / the location / by phone', answer: 'She confirms the location by phone' },
        { scrambled: 'He / (call back) / in the afternoon', answer: 'He calls back in the afternoon' },
      ],
    },
  },
  { // Day 33
    vocab: [
      { word: 'Show up',  phonetic: '/ʃəʊ ʌp/', meaning: 'Đến (xuất hiện)', quiz: { options: ['Đến (xuất hiện)', 'Vắng mặt (không báo trước)', 'Sắp tới', 'Chờ đợi'], correct: 0 } },
      { word: 'No-show',  phonetic: '/nəʊ ʃəʊ/', meaning: 'Vắng mặt (không báo trước)', quiz: { options: ['Sắp tới', 'Vắng mặt (không báo trước)', 'Chờ đợi', 'Đến (xuất hiện)'], correct: 1 } },
      { word: 'Upcoming', phonetic: '/ʌpˈkʌmɪŋ/', meaning: 'Sắp tới',     quiz: { options: ['Chờ đợi', 'Đến (xuất hiện)', 'Sắp tới', 'Vắng mặt (không báo trước)'], correct: 2 } },
      { word: 'Wait',     phonetic: '/weɪt/', meaning: 'Chờ đợi',      quiz: { options: ['Chờ đợi', 'Sắp tới', 'Vắng mặt (không báo trước)', 'Đến (xuất hiện)'], correct: 0 } },
      { word: 'On schedule', phonetic: '/ɒn ˈskedʒuːl/', meaning: 'Đúng lịch trình', quiz: { options: ['Đúng lịch trình', 'Vắng mặt (không báo trước)', 'Chờ đợi', 'Sắp tới'], correct: 0 } },
    ],
    reading: {
      title: 'An Upcoming Appointment',
      passage: 'Tuan has an upcoming appointment at 9 AM. He waits at the meeting room, but the client does not show up. Luckily, the client calls to say he is still on schedule, just a little late.',
      quiz: [
        { q: 'Tuấn chờ ai ở phòng họp?', options: ['Khách hàng', 'Đồng nghiệp', 'Quản lý', 'Trợ lý'], correct: 0 },
        { q: 'Khách hàng gọi điện nói gì?', options: ['Vẫn đúng lịch trình, chỉ hơi trễ', 'Sẽ không đến', 'Đổi ngày khác', 'Đã đến rồi'], correct: 0 },
      ],
    },
    listening: [
      'I have an upcoming appointment.',
      'He did not show up on time.',
      'We are still on schedule.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc chờ đợi ai đó cho một cuộc hẹn sắp tới.',
      minWords: 15,
      phrases: ['I have an upcoming appointment', 'I wait for', 'He did not show up', 'We are on schedule'],
      sentenceBuilder: [
        { scrambled: 'He / (wait) / at the meeting room', answer: 'He waits at the meeting room' },
        { scrambled: 'The client / (call) / to say / he is late', answer: 'The client calls to say he is late' },
      ],
    },
  },
  // ---------- WEEK: Goi dien thoai co ban (Day 34-38) ----------
  { // Day 34
    vocab: [
      { word: 'Hold on',  phonetic: '/həʊld ɒn/', meaning: 'Chờ máy',    quiz: { options: ['Chờ máy', 'Gác máy', 'Nhấc máy', 'Số nhánh'], correct: 0 } },
      { word: 'Hang up',  phonetic: '/hæŋ ʌp/', meaning: 'Gác máy',    quiz: { options: ['Nhấc máy', 'Gác máy', 'Chờ máy', 'Số nhánh'], correct: 1 } },
      { word: 'Pick up',  phonetic: '/pɪk ʌp/', meaning: 'Nhấc máy',   quiz: { options: ['Nhấc máy', 'Chờ máy', 'Số nhánh', 'Gác máy'], correct: 0 } },
      { word: 'Extension', phonetic: '/ɪkˈstenʃn/', meaning: 'Số nhánh (nội bộ)', quiz: { options: ['Gác máy', 'Số nhánh (nội bộ)', 'Chờ máy', 'Nhấc máy'], correct: 1 } },
      { word: 'Line',     phonetic: '/laɪn/', meaning: 'Đường dây (điện thoại)', quiz: { options: ['Đường dây (điện thoại)', 'Số nhánh', 'Gác máy', 'Chờ máy'], correct: 0 } },
    ],
    reading: {
      title: 'Answering the Phone',
      passage: 'When the phone rings, Mai picks up quickly. She asks the caller to hold on while she transfers the line to extension 205. After the call, she hangs up politely.',
      quiz: [
        { q: 'Mai làm gì khi điện thoại reo?', options: ['Nhấc máy nhanh', 'Không trả lời', 'Nhờ người khác', 'Tắt điện thoại'], correct: 0 },
        { q: 'Mai chuyển cuộc gọi đến số nhánh nào?', options: ['205', '105', '305', '405'], correct: 0 },
      ],
    },
    listening: [
      'Please hold on for a moment.',
      'Can you transfer me to extension 205?',
      'I will hang up now, thank you.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn trả lời điện thoại ở công ty.',
      minWords: 15,
      phrases: ['I pick up the phone', 'Please hold on', 'I transfer the call to extension', 'I hang up after'],
      sentenceBuilder: [
        { scrambled: 'She / (pick up) / the phone / quickly', answer: 'She picks up the phone quickly' },
        { scrambled: 'He / (hang up) / politely / after the call', answer: 'He hangs up politely after the call' },
      ],
    },
  },
  { // Day 35
    vocab: [
      { word: 'Message',  phonetic: '/ˈmesɪdʒ/', meaning: 'Lời nhắn',   quiz: { options: ['Lời nhắn', 'Gọi nhầm số', 'Chuyển tiếp', 'Không có tín hiệu'], correct: 0 } },
      { word: 'Wrong number', phonetic: '/rɒŋ ˈnʌmbər/', meaning: 'Gọi nhầm số', quiz: { options: ['Chuyển tiếp', 'Gọi nhầm số', 'Lời nhắn', 'Không có tín hiệu'], correct: 1 } },
      { word: 'Forward',  phonetic: '/ˈfɔːrwərd/', meaning: 'Chuyển tiếp', quiz: { options: ['Chuyển tiếp', 'Lời nhắn', 'Không có tín hiệu', 'Gọi nhầm số'], correct: 0 } },
      { word: 'No signal', phonetic: '/nəʊ ˈsɪɡnl/', meaning: 'Không có tín hiệu', quiz: { options: ['Gọi nhầm số', 'Không có tín hiệu', 'Lời nhắn', 'Chuyển tiếp'], correct: 1 } },
      { word: 'Leave a message', phonetic: '/liːv ə ˈmesɪdʒ/', meaning: 'Để lại lời nhắn', quiz: { options: ['Để lại lời nhắn', 'Không có tín hiệu', 'Chuyển tiếp', 'Gọi nhầm số'], correct: 0 } },
    ],
    reading: {
      title: 'A Phone Problem',
      passage: 'Nam calls a client, but there is no signal, so the call drops. He tries again and realizes he dialed a wrong number. Finally, he reaches the right person and leaves a message.',
      quiz: [
        { q: 'Vì sao cuộc gọi đầu tiên bị rớt?', options: ['Không có tín hiệu', 'Khách hàng không nghe máy', 'Hết pin', 'Máy bị hỏng'], correct: 0 },
        { q: 'Nam nhận ra điều gì ở lần gọi thứ hai?', options: ['Anh ấy gọi nhầm số', 'Khách hàng đã đổi số', 'Cuộc gọi quá ngắn', 'Số điện thoại bị chặn'], correct: 0 },
      ],
    },
    listening: [
      'Sorry, there is no signal here.',
      'I think you have the wrong number.',
      'Can I leave a message for him?',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một lần bạn gặp sự cố khi gọi điện thoại.',
      minWords: 15,
      phrases: ['There is no signal', 'I dialed a wrong number', 'I would like to leave a message', 'I will forward the call'],
      sentenceBuilder: [
        { scrambled: 'He / (dial) / a wrong number / by mistake', answer: 'He dials a wrong number by mistake' },
        { scrambled: 'She / (leave) / a message / for him', answer: 'She leaves a message for him' },
      ],
    },
  },
  { // Day 36
    vocab: [
      { word: 'Speak up', phonetic: '/spiːk ʌp/', meaning: 'Nói to hơn', quiz: { options: ['Nói to hơn', 'Nghe rõ', 'Ồn ào', 'Yên tĩnh'], correct: 0 } },
      { word: 'Clearly',  phonetic: '/ˈklɪərli/', meaning: 'Nghe rõ, rõ ràng', quiz: { options: ['Ồn ào', 'Nghe rõ, rõ ràng', 'Nói to hơn', 'Yên tĩnh'], correct: 1 } },
      { word: 'Noisy',    phonetic: '/ˈnɔɪzi/', meaning: 'Ồn ào',      quiz: { options: ['Ồn ào', 'Yên tĩnh', 'Nghe rõ', 'Nói to hơn'], correct: 0 } },
      { word: 'Quiet',    phonetic: '/ˈkwaɪət/', meaning: 'Yên tĩnh',   quiz: { options: ['Nói to hơn', 'Ồn ào', 'Yên tĩnh', 'Nghe rõ'], correct: 2 } },
      { word: 'Repeat',   phonetic: '/rɪˈpiːt/', meaning: 'Nhắc lại',   quiz: { options: ['Nhắc lại', 'Yên tĩnh', 'Ồn ào', 'Nghe rõ'], correct: 0 } },
    ],
    reading: {
      title: 'A Bad Phone Line',
      passage: 'The street outside is noisy, so Huy cannot hear the caller clearly. He politely asks the caller to speak up and repeat the last sentence. He moves to a quiet room to continue the call.',
      quiz: [
        { q: 'Vì sao Huy nghe không rõ?', options: ['Đường phố ồn ào', 'Điện thoại hỏng', 'Không có tín hiệu', 'Người gọi nói tiếng nước ngoài'], correct: 0 },
        { q: 'Huy làm gì để nghe rõ hơn?', options: ['Chuyển vào phòng yên tĩnh', 'Cúp máy', 'Nhờ đồng nghiệp nghe hộ', 'Tắt điện thoại'], correct: 0 },
      ],
    },
    listening: [
      'Could you speak up, please?',
      'I cannot hear you clearly.',
      'Can you repeat that, please?',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn xử lý khi nghe điện thoại không rõ.',
      minWords: 15,
      phrases: ['I cannot hear clearly', 'Could you speak up', 'Can you repeat that', 'It is too noisy here'],
      sentenceBuilder: [
        { scrambled: 'He / (ask) / her / to speak up', answer: 'He asks her to speak up' },
        { scrambled: 'She / (move) / to a quiet room', answer: 'She moves to a quiet room' },
      ],
    },
  },
  { // Day 37
    vocab: [
      { word: 'Video call', phonetic: '/ˈvɪdiəʊ kɔːl/', meaning: 'Cuộc gọi video', quiz: { options: ['Cuộc gọi video', 'Kết nối', 'Micro', 'Camera'], correct: 0 } },
      { word: 'Connect',  phonetic: '/kəˈnekt/', meaning: 'Kết nối',   quiz: { options: ['Micro', 'Kết nối', 'Camera', 'Cuộc gọi video'], correct: 1 } },
      { word: 'Microphone', phonetic: '/ˈmaɪkrəfəʊn/', meaning: 'Micro', quiz: { options: ['Micro', 'Kết nối', 'Cuộc gọi video', 'Camera'], correct: 0 } },
      { word: 'Camera',   phonetic: '/ˈkæmərə/', meaning: 'Camera',    quiz: { options: ['Kết nối', 'Camera', 'Micro', 'Cuộc gọi video'], correct: 1 } },
      { word: 'Mute',     phonetic: '/mjuːt/', meaning: 'Tắt tiếng',  quiz: { options: ['Tắt tiếng', 'Camera', 'Micro', 'Kết nối'], correct: 0 } },
    ],
    reading: {
      title: 'Joining a Video Call',
      passage: 'Trang joins a video call with a partner company. She connects her microphone and turns on her camera. When she is not speaking, she remembers to mute herself.',
      quiz: [
        { q: 'Trang tham gia loại cuộc gọi nào?', options: ['Cuộc gọi video', 'Cuộc gọi thường', 'Tin nhắn thoại', 'Email'], correct: 0 },
        { q: 'Trang làm gì khi không nói?', options: ['Tắt tiếng micro', 'Tắt camera', 'Rời khỏi phòng họp', 'Ngủ'], correct: 0 },
      ],
    },
    listening: [
      'Let\'s join the video call now.',
      'Please turn on your microphone.',
      'Can you mute yourself, please?',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc tham gia một cuộc gọi video công việc.',
      minWords: 15,
      phrases: ['I join a video call', 'I turn on my camera', 'I mute my microphone', 'I connect to the meeting'],
      sentenceBuilder: [
        { scrambled: 'She / (join) / the video call / on time', answer: 'She joins the video call on time' },
        { scrambled: 'He / (mute) / himself / during the call', answer: 'He mutes himself during the call' },
      ],
    },
  },
  { // Day 38
    vocab: [
      { word: 'Voicemail', phonetic: '/ˈvɔɪsmeɪl/', meaning: 'Thư thoại', quiz: { options: ['Thư thoại', 'Nhắn tin', 'Gọi lỡ', 'Xin lỗi vì gọi trễ'], correct: 0 } },
      { word: 'Text',     phonetic: '/tekst/', meaning: 'Nhắn tin',    quiz: { options: ['Gọi lỡ', 'Nhắn tin', 'Thư thoại', 'Xin lỗi vì gọi trễ'], correct: 1 } },
      { word: 'Missed call', phonetic: '/mɪst kɔːl/', meaning: 'Cuộc gọi nhỡ', quiz: { options: ['Cuộc gọi nhỡ', 'Nhắn tin', 'Thư thoại', 'Xin lỗi vì gọi trễ'], correct: 0 } },
      { word: 'Return a call', phonetic: '/rɪˈtɜːrn ə kɔːl/', meaning: 'Gọi lại (khi bị nhỡ)', quiz: { options: ['Thư thoại', 'Gọi lại (khi bị nhỡ)', 'Nhắn tin', 'Cuộc gọi nhỡ'], correct: 1 } },
      { word: 'Sorry for the delay', phonetic: '/ˈsɒri fɔːr ðə dɪˈleɪ/', meaning: 'Xin lỗi vì gọi trễ', quiz: { options: ['Xin lỗi vì gọi trễ', 'Cuộc gọi nhỡ', 'Nhắn tin', 'Thư thoại'], correct: 0 } },
    ],
    reading: {
      title: 'Missed Calls',
      passage: 'Duc sees three missed calls from a client. He listens to the voicemail and decides to return the call right away. He says "sorry for the delay" and they continue their conversation by text later.',
      quiz: [
        { q: 'Đức nhận được bao nhiêu cuộc gọi nhỡ?', options: ['Ba cuộc', 'Một cuộc', 'Hai cuộc', 'Bốn cuộc'], correct: 0 },
        { q: 'Đức làm gì đầu tiên khi thấy cuộc gọi nhỡ?', options: ['Nghe thư thoại', 'Nhắn tin ngay', 'Bỏ qua', 'Gọi cho đồng nghiệp'], correct: 0 },
      ],
    },
    listening: [
      'I have a missed call from you.',
      'I listened to your voicemail.',
      'Sorry for the delay in returning your call.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc xử lý cuộc gọi nhỡ từ khách hàng hoặc đồng nghiệp.',
      minWords: 15,
      phrases: ['I have a missed call from', 'I listen to the voicemail', 'I return the call', 'Sorry for the delay'],
      sentenceBuilder: [
        { scrambled: 'He / (return) / the call / right away', answer: 'He returns the call right away' },
        { scrambled: 'She / (listen) / to the voicemail / first', answer: 'She listens to the voicemail first' },
      ],
    },
  },
  // ---------- WEEK: Thoi tiet & di lai (Day 39-43) ----------
  { // Day 39
    vocab: [
      { word: 'Rain',     phonetic: '/reɪn/', meaning: 'Mưa',         quiz: { options: ['Mưa', 'Nắng', 'Gió', 'Nóng'], correct: 0 } },
      { word: 'Sunny',    phonetic: '/ˈsʌni/', meaning: 'Nắng',       quiz: { options: ['Gió', 'Nóng', 'Nắng', 'Mưa'], correct: 2 } },
      { word: 'Windy',    phonetic: '/ˈwɪndi/', meaning: 'Có gió',    quiz: { options: ['Có gió', 'Nắng', 'Mưa', 'Nóng'], correct: 0 } },
      { word: 'Hot',      phonetic: '/hɒt/', meaning: 'Nóng',        quiz: { options: ['Mưa', 'Có gió', 'Nắng', 'Nóng'], correct: 3 } },
      { word: 'Umbrella', phonetic: '/ʌmˈbrelə/', meaning: 'Cây dù, ô', quiz: { options: ['Cây dù, ô', 'Nóng', 'Có gió', 'Nắng'], correct: 0 } },
    ],
    reading: {
      title: 'Weather Today',
      passage: 'It is very hot and sunny in the morning, but the news says there will be rain in the afternoon. Ngoc brings an umbrella just in case. Later, it becomes windy before the rain starts.',
      quiz: [
        { q: 'Thời tiết buổi sáng như thế nào?', options: ['Nóng và nắng', 'Mưa lớn', 'Lạnh', 'Có tuyết'], correct: 0 },
        { q: 'Ngọc mang theo gì để phòng mưa?', options: ['Cây dù', 'Áo mưa', 'Ủng', 'Áo khoác'], correct: 0 },
      ],
    },
    listening: [
      'It is hot and sunny today.',
      'Don\'t forget your umbrella.',
      'It looks windy this afternoon.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu mô tả thời tiết hôm nay ở nơi bạn làm việc.',
      minWords: 15,
      phrases: ['It is hot and sunny', 'I bring an umbrella', 'It might rain later', 'It is windy today'],
      sentenceBuilder: [
        { scrambled: 'It / (be) / hot and sunny / today', answer: 'It is hot and sunny today' },
        { scrambled: 'She / (bring) / an umbrella / just in case', answer: 'She brings an umbrella just in case' },
      ],
    },
  },
  { // Day 40
    vocab: [
      { word: 'Traffic jam', phonetic: '/ˈtræfɪk dʒæm/', meaning: 'Kẹt xe', quiz: { options: ['Kẹt xe', 'Xe buýt', 'Đi bộ', 'Xe máy'], correct: 0 } },
      { word: 'Bus',      phonetic: '/bʌs/', meaning: 'Xe buýt',    quiz: { options: ['Đi bộ', 'Xe buýt', 'Kẹt xe', 'Xe máy'], correct: 1 } },
      { word: 'Motorbike', phonetic: '/ˈməʊtərbaɪk/', meaning: 'Xe máy', quiz: { options: ['Kẹt xe', 'Xe buýt', 'Xe máy', 'Đi bộ'], correct: 2 } },
      { word: 'Walk',     phonetic: '/wɔːk/', meaning: 'Đi bộ',      quiz: { options: ['Đi bộ', 'Xe máy', 'Xe buýt', 'Kẹt xe'], correct: 0 } },
      { word: 'Commute',  phonetic: '/kəˈmjuːt/', meaning: 'Đi làm (di chuyển hàng ngày)', quiz: { options: ['Kẹt xe', 'Đi làm (di chuyển hàng ngày)', 'Xe buýt', 'Xe máy'], correct: 1 } },
    ],
    reading: {
      title: 'Getting to Work',
      passage: 'Phong commutes to work by motorbike every day. This morning, there was a big traffic jam, so he arrived a little late. Some of his colleagues take the bus, and one prefers to walk.',
      quiz: [
        { q: 'Phong đi làm bằng phương tiện gì?', options: ['Xe máy', 'Xe buýt', 'Đi bộ', 'Ô tô'], correct: 0 },
        { q: 'Vì sao Phong đến trễ sáng nay?', options: ['Kẹt xe', 'Xe hỏng', 'Ngủ quên', 'Trời mưa lớn'], correct: 0 },
      ],
    },
    listening: [
      'I commute by motorbike every day.',
      'There was a big traffic jam this morning.',
      'She prefers to walk to work.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn di chuyển đi làm hàng ngày.',
      minWords: 15,
      phrases: ['I commute by', 'There was a traffic jam', 'I take the bus to', 'I prefer to walk'],
      sentenceBuilder: [
        { scrambled: 'He / (commute) / by motorbike / every day', answer: 'He commutes by motorbike every day' },
        { scrambled: 'There / (be) / a big traffic jam / this morning', answer: 'There was a big traffic jam this morning' },
      ],
    },
  },
  { // Day 41
    vocab: [
      { word: 'Cold',     phonetic: '/kəʊld/', meaning: 'Lạnh',       quiz: { options: ['Lạnh', 'Mát mẻ', 'Ẩm', 'Khô'], correct: 0 } },
      { word: 'Cool',     phonetic: '/kuːl/', meaning: 'Mát mẻ',     quiz: { options: ['Ẩm', 'Khô', 'Mát mẻ', 'Lạnh'], correct: 2 } },
      { word: 'Humid',    phonetic: '/ˈhjuːmɪd/', meaning: 'Ẩm',      quiz: { options: ['Ẩm', 'Khô', 'Mát mẻ', 'Lạnh'], correct: 0 } },
      { word: 'Dry',      phonetic: '/draɪ/', meaning: 'Khô',        quiz: { options: ['Lạnh', 'Khô', 'Ẩm', 'Mát mẻ'], correct: 1 } },
      { word: 'Season',   phonetic: '/ˈsiːzn/', meaning: 'Mùa',       quiz: { options: ['Mùa', 'Khô', 'Ẩm', 'Lạnh'], correct: 0 } },
    ],
    reading: {
      title: 'Talking About Seasons',
      passage: 'Lan says the rainy season is very humid, but she likes the cool weather in November. Her colleague from the north tells her that winter there is much colder and drier than in the south.',
      quiz: [
        { q: 'Lan thích thời tiết như thế nào vào tháng 11?', options: ['Mát mẻ', 'Nóng', 'Ẩm', 'Có gió lớn'], correct: 0 },
        { q: 'Mùa đông ở miền Bắc như thế nào so với miền Nam?', options: ['Lạnh và khô hơn', 'Nóng hơn', 'Ẩm hơn', 'Không khác gì'], correct: 0 },
      ],
    },
    listening: [
      'The rainy season is very humid.',
      'I like the cool weather in November.',
      'Winter here is cold and dry.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu so sánh các mùa trong năm ở nơi bạn sống.',
      minWords: 15,
      phrases: ['The rainy season is humid', 'I like the cool weather', 'Winter is cold and dry', 'My favorite season is'],
      sentenceBuilder: [
        { scrambled: 'She / (like) / the cool weather / in November', answer: 'She likes the cool weather in November' },
        { scrambled: 'Winter / (be) / cold and dry / there', answer: 'Winter is cold and dry there' },
      ],
    },
  },
  { // Day 42
    vocab: [
      { word: 'Flight',   phonetic: '/flaɪt/', meaning: 'Chuyến bay', quiz: { options: ['Chuyến bay', 'Hoãn (chuyến bay)', 'Ga tàu', 'Sân bay'], correct: 0 } },
      { word: 'Delay',    phonetic: '/dɪˈleɪ/', meaning: 'Sự trễ, hoãn', quiz: { options: ['Ga tàu', 'Sự trễ, hoãn', 'Sân bay', 'Chuyến bay'], correct: 1 } },
      { word: 'Airport',  phonetic: '/ˈeərpɔːrt/', meaning: 'Sân bay', quiz: { options: ['Sân bay', 'Sự trễ, hoãn', 'Ga tàu', 'Chuyến bay'], correct: 0 } },
      { word: 'Train station', phonetic: '/treɪn ˈsteɪʃn/', meaning: 'Ga tàu', quiz: { options: ['Chuyến bay', 'Sân bay', 'Ga tàu', 'Sự trễ, hoãn'], correct: 2 } },
      { word: 'Business trip', phonetic: '/ˈbɪznəs trɪp/', meaning: 'Chuyến công tác', quiz: { options: ['Chuyến công tác', 'Ga tàu', 'Sân bay', 'Sự trễ, hoãn'], correct: 0 } },
    ],
    reading: {
      title: 'A Business Trip',
      passage: 'Tuan is going on a business trip to Da Nang. He arrives at the airport early, but his flight has a delay of one hour. He calls his manager to update the new schedule.',
      quiz: [
        { q: 'Tuấn đi công tác ở đâu?', options: ['Đà Nẵng', 'Hà Nội', 'Hải Phòng', 'Nha Trang'], correct: 0 },
        { q: 'Chuyến bay của Tuấn bị làm sao?', options: ['Trễ một tiếng', 'Bị hủy', 'Đổi cổng', 'Đến sớm'], correct: 0 },
      ],
    },
    listening: [
      'My flight has a delay.',
      'I am at the airport now.',
      'This is my first business trip.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một chuyến công tác bạn từng đi hoặc sắp đi.',
      minWords: 15,
      phrases: ['I am going on a business trip', 'My flight has a delay', 'I arrive at the airport', 'I update the schedule'],
      sentenceBuilder: [
        { scrambled: 'He / (go) / on a business trip / next week', answer: 'He goes on a business trip next week' },
        { scrambled: 'The flight / (have) / a delay / today', answer: 'The flight has a delay today' },
      ],
    },
  },
  { // Day 43
    vocab: [
      { word: 'Parking',  phonetic: '/ˈpɑːrkɪŋ/', meaning: 'Bãi đỗ xe', quiz: { options: ['Bãi đỗ xe', 'Xe hơi', 'Đầy chỗ', 'Còn trống'], correct: 0 } },
      { word: 'Car',      phonetic: '/kɑːr/', meaning: 'Xe hơi',      quiz: { options: ['Còn trống', 'Xe hơi', 'Bãi đỗ xe', 'Đầy chỗ'], correct: 1 } },
      { word: 'Full',     phonetic: '/fʊl/', meaning: 'Đầy chỗ, hết chỗ', quiz: { options: ['Đầy chỗ, hết chỗ', 'Xe hơi', 'Còn trống', 'Bãi đỗ xe'], correct: 0 } },
      { word: 'Empty',    phonetic: '/ˈempti/', meaning: 'Còn trống', quiz: { options: ['Bãi đỗ xe', 'Đầy chỗ', 'Còn trống', 'Xe hơi'], correct: 2 } },
      { word: 'Nearby',   phonetic: '/ˌnɪərˈbaɪ/', meaning: 'Gần đó', quiz: { options: ['Gần đó', 'Đầy chỗ', 'Còn trống', 'Xe hơi'], correct: 0 } },
    ],
    reading: {
      title: 'Finding a Parking Spot',
      passage: 'The office parking lot is full this morning, so Minh has to find a spot nearby. He parks his car on a quiet street. Next time, he plans to arrive earlier to find an empty spot.',
      quiz: [
        { q: 'Vì sao Minh phải tìm chỗ đỗ xe gần đó?', options: ['Bãi đỗ xe công ty đầy', 'Xe của anh ấy hỏng', 'Anh ấy quên chìa khóa', 'Bãi đỗ xe đóng cửa'], correct: 0 },
        { q: 'Lần sau Minh dự định làm gì?', options: ['Đến sớm hơn', 'Đi xe buýt', 'Đi bộ', 'Đổi xe khác'], correct: 0 },
      ],
    },
    listening: [
      'The parking lot is full today.',
      'I found an empty spot nearby.',
      'Where did you park your car?',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc tìm chỗ đỗ xe khi đi làm.',
      minWords: 15,
      phrases: ['The parking lot is full', 'I park my car', 'I found a spot nearby', 'I arrive earlier to find'],
      sentenceBuilder: [
        { scrambled: 'The parking lot / (be) / full / this morning', answer: 'The parking lot is full this morning' },
        { scrambled: 'He / (park) / his car / on a quiet street', answer: 'He parks his car on a quiet street' },
      ],
    },
  },
  // ---------- WEEK: Huong dan cong viec moi (Day 44-48) ----------
  { // Day 44
    vocab: [
      { word: 'Training', phonetic: '/ˈtreɪnɪŋ/', meaning: 'Đào tạo',   quiz: { options: ['Đào tạo', 'Hướng dẫn viên', 'Làm theo', 'Học viên'], correct: 0 } },
      { word: 'Trainer',  phonetic: '/ˈtreɪnər/', meaning: 'Hướng dẫn viên', quiz: { options: ['Học viên', 'Hướng dẫn viên', 'Đào tạo', 'Làm theo'], correct: 1 } },
      { word: 'Trainee',  phonetic: '/ˌtreɪˈniː/', meaning: 'Học viên', quiz: { options: ['Học viên', 'Đào tạo', 'Hướng dẫn viên', 'Làm theo'], correct: 0 } },
      { word: 'Follow',   phonetic: '/ˈfɒləʊ/', meaning: 'Làm theo',    quiz: { options: ['Hướng dẫn viên', 'Học viên', 'Làm theo', 'Đào tạo'], correct: 2 } },
      { word: 'Explain',  phonetic: '/ɪkˈspleɪn/', meaning: 'Giải thích', quiz: { options: ['Giải thích', 'Học viên', 'Đào tạo', 'Hướng dẫn viên'], correct: 0 } },
    ],
    reading: {
      title: 'First Day of Training',
      passage: 'Hoa is a trainee at her new company. The trainer explains each step slowly and asks her to follow the process carefully. After the training, Hoa feels more confident about her new job.',
      quiz: [
        { q: 'Hoa đang ở vai trò nào?', options: ['Học viên', 'Hướng dẫn viên', 'Quản lý', 'Khách hàng'], correct: 0 },
        { q: 'Hoa cảm thấy thế nào sau buổi đào tạo?', options: ['Tự tin hơn', 'Chán nản', 'Mệt mỏi', 'Lo lắng hơn'], correct: 0 },
      ],
    },
    listening: [
      'This is my first training session.',
      'Can you explain this step again?',
      'Please follow the process carefully.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một buổi đào tạo bạn đã tham gia ở công ty.',
      minWords: 15,
      phrases: ['I am a trainee', 'The trainer explains', 'I follow the process', 'I feel more confident'],
      sentenceBuilder: [
        { scrambled: 'The trainer / (explain) / each step / slowly', answer: 'The trainer explains each step slowly' },
        { scrambled: 'She / (follow) / the process / carefully', answer: 'She follows the process carefully' },
      ],
    },
  },
  { // Day 45
    vocab: [
      { word: 'Instruction', phonetic: '/ɪnˈstrʌkʃn/', meaning: 'Hướng dẫn (chỉ dẫn)', quiz: { options: ['Hướng dẫn (chỉ dẫn)', 'Từng bước', 'Ghi chú', 'Thực hành'], correct: 0 } },
      { word: 'Step by step', phonetic: '/step baɪ step/', meaning: 'Từng bước', quiz: { options: ['Ghi chú', 'Từng bước', 'Hướng dẫn (chỉ dẫn)', 'Thực hành'], correct: 1 } },
      { word: 'Note',     phonetic: '/nəʊt/', meaning: 'Ghi chú',      quiz: { options: ['Ghi chú', 'Thực hành', 'Từng bước', 'Hướng dẫn (chỉ dẫn)'], correct: 0 } },
      { word: 'Practice',  phonetic: '/ˈpræktɪs/', meaning: 'Thực hành', quiz: { options: ['Hướng dẫn (chỉ dẫn)', 'Ghi chú', 'Thực hành', 'Từng bước'], correct: 2 } },
      { word: 'Understand', phonetic: '/ˌʌndərˈstænd/', meaning: 'Hiểu', quiz: { options: ['Hiểu', 'Thực hành', 'Ghi chú', 'Từng bước'], correct: 0 } },
    ],
    reading: {
      title: 'Learning Step by Step',
      passage: 'Nam gives instructions step by step so the new employee can understand easily. She takes notes during the session and later practices on her own computer.',
      quiz: [
        { q: 'Nam hướng dẫn theo cách nào?', options: ['Từng bước một', 'Toàn bộ một lần', 'Chỉ nói miệng', 'Gửi video'], correct: 0 },
        { q: 'Nhân viên mới làm gì trong buổi hướng dẫn?', options: ['Ghi chú', 'Ngủ gật', 'Nghe nhạc', 'Rời đi sớm'], correct: 0 },
      ],
    },
    listening: [
      'Let me give you the instructions step by step.',
      'I will take some notes.',
      'I need more time to practice.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn học một kỹ năng mới từng bước.',
      minWords: 15,
      phrases: ['I follow instructions step by step', 'I take notes', 'I practice every day', 'I understand it now'],
      sentenceBuilder: [
        { scrambled: 'He / (give) / instructions / step by step', answer: 'He gives instructions step by step' },
        { scrambled: 'She / (take) / notes / during the session', answer: 'She takes notes during the session' },
      ],
    },
  },
  { // Day 46
    vocab: [
      { word: 'Guide',    phonetic: '/ɡaɪd/', meaning: 'Hướng dẫn (tài liệu)', quiz: { options: ['Hướng dẫn (tài liệu)', 'Sổ tay', 'Khó', 'Dễ'], correct: 0 } },
      { word: 'Handbook', phonetic: '/ˈhændbʊk/', meaning: 'Sổ tay',     quiz: { options: ['Dễ', 'Sổ tay', 'Hướng dẫn (tài liệu)', 'Khó'], correct: 1 } },
      { word: 'Difficult', phonetic: '/ˈdɪfɪkəlt/', meaning: 'Khó',      quiz: { options: ['Khó', 'Hướng dẫn (tài liệu)', 'Sổ tay', 'Dễ'], correct: 0 } },
      { word: 'Easy',     phonetic: '/ˈiːzi/', meaning: 'Dễ',           quiz: { options: ['Sổ tay', 'Khó', 'Dễ', 'Hướng dẫn (tài liệu)'], correct: 2 } },
      { word: 'Skill',    phonetic: '/skɪl/', meaning: 'Kỹ năng',       quiz: { options: ['Kỹ năng', 'Dễ', 'Khó', 'Sổ tay'], correct: 0 } },
    ],
    reading: {
      title: 'Using the Employee Handbook',
      passage: 'Every new employee gets a handbook as a guide for company rules. Some parts are difficult to understand at first, but most parts are easy. Mai reads it carefully to improve her work skills.',
      quiz: [
        { q: 'Nhân viên mới nhận được gì để tìm hiểu nội quy?', options: ['Sổ tay hướng dẫn', 'Video', 'Bài kiểm tra', 'Không có gì'], correct: 0 },
        { q: 'Mai đọc sổ tay để làm gì?', options: ['Cải thiện kỹ năng làm việc', 'Học ngoại ngữ', 'Xin nghỉ phép', 'Đổi công việc'], correct: 0 },
      ],
    },
    listening: [
      'Please read the employee handbook.',
      'This part is a bit difficult.',
      'I want to improve my skills.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một sổ tay hoặc tài liệu hướng dẫn bạn nhận được ở công ty.',
      minWords: 15,
      phrases: ['I got a handbook as a guide', 'Some parts are difficult', 'Other parts are easy', 'I want to improve my skills'],
      sentenceBuilder: [
        { scrambled: 'She / (read) / the handbook / carefully', answer: 'She reads the handbook carefully' },
        { scrambled: 'This part / (be) / a bit difficult', answer: 'This part is a bit difficult' },
      ],
    },
  },
  { // Day 47
    vocab: [
      { word: 'Mistake',  phonetic: '/mɪˈsteɪk/', meaning: 'Lỗi sai',   quiz: { options: ['Lỗi sai', 'Sửa lỗi', 'Cẩn thận', 'Học hỏi'], correct: 0 } },
      { word: 'Correct',  phonetic: '/kəˈrekt/', meaning: 'Sửa lỗi, đúng', quiz: { options: ['Cẩn thận', 'Sửa lỗi, đúng', 'Học hỏi', 'Lỗi sai'], correct: 1 } },
      { word: 'Careful',  phonetic: '/ˈkeərfl/', meaning: 'Cẩn thận',  quiz: { options: ['Cẩn thận', 'Lỗi sai', 'Sửa lỗi, đúng', 'Học hỏi'], correct: 0 } },
      { word: 'Learn',    phonetic: '/lɜːrn/', meaning: 'Học hỏi',      quiz: { options: ['Sửa lỗi, đúng', 'Cẩn thận', 'Học hỏi', 'Lỗi sai'], correct: 2 } },
      { word: 'Improve',  phonetic: '/ɪmˈpruːv/', meaning: 'Cải thiện', quiz: { options: ['Cải thiện', 'Lỗi sai', 'Cẩn thận', 'Sửa lỗi, đúng'], correct: 0 } },
    ],
    reading: {
      title: 'Learning from Mistakes',
      passage: 'Duc makes a small mistake in his first report. His manager helps him correct it and reminds him to be careful next time. Duc learns from this experience and works to improve every day.',
      quiz: [
        { q: 'Đức mắc lỗi ở đâu?', options: ['Bản báo cáo đầu tiên', 'Cuộc họp', 'Email khách hàng', 'Bảng chấm công'], correct: 0 },
        { q: 'Quản lý nhắc Đức điều gì?', options: ['Cẩn thận hơn lần sau', 'Nghỉ việc', 'Làm lại từ đầu', 'Không cần sửa'], correct: 0 },
      ],
    },
    listening: [
      'I made a small mistake.',
      'Can you help me correct this?',
      'I will be more careful next time.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một lỗi sai bạn từng mắc phải và cách bạn học hỏi từ đó.',
      minWords: 15,
      phrases: ['I made a mistake in', 'My manager helped me correct', 'I will be careful next time', 'I learn from this'],
      sentenceBuilder: [
        { scrambled: 'He / (make) / a small mistake / yesterday', answer: 'He makes a small mistake yesterday' },
        { scrambled: 'She / (learn) / from her mistakes', answer: 'She learns from her mistakes' },
      ],
    },
  },
  { // Day 48
    vocab: [
      { word: 'Question', phonetic: '/ˈkwestʃən/', meaning: 'Câu hỏi',  quiz: { options: ['Câu hỏi', 'Trả lời', 'Rõ ràng', 'Không chắc chắn'], correct: 0 } },
      { word: 'Answer',   phonetic: '/ˈɑːnsər/', meaning: 'Trả lời',   quiz: { options: ['Rõ ràng', 'Trả lời', 'Câu hỏi', 'Không chắc chắn'], correct: 1 } },
      { word: 'Clear',    phonetic: '/klɪər/', meaning: 'Rõ ràng',      quiz: { options: ['Rõ ràng', 'Câu hỏi', 'Trả lời', 'Không chắc chắn'], correct: 0 } },
      { word: 'Unsure',   phonetic: '/ʌnˈʃʊər/', meaning: 'Không chắc chắn', quiz: { options: ['Trả lời', 'Rõ ràng', 'Không chắc chắn', 'Câu hỏi'], correct: 2 } },
      { word: 'Double-check', phonetic: '/ˈdʌbl tʃek/', meaning: 'Kiểm tra lại', quiz: { options: ['Kiểm tra lại', 'Câu hỏi', 'Trả lời', 'Rõ ràng'], correct: 0 } },
    ],
    reading: {
      title: 'Asking Questions',
      passage: 'When Linh is unsure about a task, she always asks a question. Her manager gives a clear answer and encourages her to double-check her work. Linh feels more confident when things are clear.',
      quiz: [
        { q: 'Linh làm gì khi không chắc về công việc?', options: ['Đặt câu hỏi', 'Tự đoán', 'Bỏ qua', 'Hỏi khách hàng'], correct: 0 },
        { q: 'Quản lý khuyến khích Linh làm gì?', options: ['Kiểm tra lại công việc', 'Làm nhanh hơn', 'Không hỏi nữa', 'Nghỉ việc'], correct: 0 },
      ],
    },
    listening: [
      'I have a question about this task.',
      'Can you give me a clear answer?',
      'I want to double-check my work.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc bạn đặt câu hỏi khi chưa chắc chắn về công việc.',
      minWords: 15,
      phrases: ['I have a question about', 'I am unsure about', 'I want to double-check', 'My manager gives a clear answer'],
      sentenceBuilder: [
        { scrambled: 'She / (ask) / a question / when unsure', answer: 'She asks a question when unsure' },
        { scrambled: 'He / (double-check) / his work / carefully', answer: 'He double-checks his work carefully' },
      ],
    },
  },
  // ---------- WEEK: Feedback don gian (Day 49-53) ----------
  { // Day 49
    vocab: [
      { word: 'Praise',   phonetic: '/preɪz/', meaning: 'Khen ngợi',   quiz: { options: ['Khen ngợi', 'Góp ý', 'Cải tiến', 'Đánh giá'], correct: 0 } },
      { word: 'Comment',  phonetic: '/ˈkɒment/', meaning: 'Góp ý',      quiz: { options: ['Cải tiến', 'Góp ý', 'Khen ngợi', 'Đánh giá'], correct: 1 } },
      { word: 'Suggestion', phonetic: '/səˈdʒestʃən/', meaning: 'Đề xuất, cải tiến', quiz: { options: ['Khen ngợi', 'Đánh giá', 'Đề xuất, cải tiến', 'Góp ý'], correct: 2 } },
      { word: 'Evaluate', phonetic: '/ɪˈvæljueɪt/', meaning: 'Đánh giá', quiz: { options: ['Đánh giá', 'Cải tiến', 'Khen ngợi', 'Góp ý'], correct: 0 } },
      { word: 'Encourage', phonetic: '/ɪnˈkʌrɪdʒ/', meaning: 'Khuyến khích', quiz: { options: ['Khuyến khích', 'Đánh giá', 'Góp ý', 'Khen ngợi'], correct: 0 } },
    ],
    reading: {
      title: 'Getting Feedback',
      passage: 'Mai\'s manager gives her a positive comment about her report. He praises her hard work and offers a small suggestion to make it better. Mai feels encouraged to keep improving.',
      quiz: [
        { q: 'Quản lý nói gì về báo cáo của Mai?', options: ['Khen ngợi', 'Chê bai', 'Không nói gì', 'Yêu cầu làm lại toàn bộ'], correct: 0 },
        { q: 'Mai cảm thấy thế nào sau khi nghe feedback?', options: ['Được khuyến khích', 'Buồn', 'Tức giận', 'Sợ hãi'], correct: 0 },
      ],
    },
    listening: [
      'I have some feedback for you.',
      'Great job, I really praise your effort.',
      'Here is a small suggestion for you.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một lần bạn nhận được feedback tích cực từ quản lý.',
      minWords: 15,
      phrases: ['My manager gives me feedback', 'He praises my work', 'She offers a suggestion', 'I feel encouraged'],
      sentenceBuilder: [
        { scrambled: 'He / (praise) / her hard work', answer: 'He praises her hard work' },
        { scrambled: 'She / (feel) / encouraged / to improve', answer: 'She feels encouraged to improve' },
      ],
    },
  },
  { // Day 50
    vocab: [
      { word: 'Weakness', phonetic: '/ˈwiːknəs/', meaning: 'Điểm yếu', quiz: { options: ['Điểm yếu', 'Điểm mạnh', 'Tiến bộ', 'Mục tiêu'], correct: 0 } },
      { word: 'Strength', phonetic: '/streŋθ/', meaning: 'Điểm mạnh', quiz: { options: ['Tiến bộ', 'Điểm mạnh', 'Mục tiêu', 'Điểm yếu'], correct: 1 } },
      { word: 'Improvement', phonetic: '/ɪmˈpruːvmənt/', meaning: 'Sự tiến bộ', quiz: { options: ['Điểm yếu', 'Điểm mạnh', 'Sự tiến bộ', 'Mục tiêu'], correct: 2 } },
      { word: 'Goal',     phonetic: '/ɡəʊl/', meaning: 'Mục tiêu',     quiz: { options: ['Mục tiêu', 'Điểm yếu', 'Điểm mạnh', 'Sự tiến bộ'], correct: 0 } },
      { word: 'Honest',   phonetic: '/ˈɒnɪst/', meaning: 'Thẳng thắn, trung thực', quiz: { options: ['Thẳng thắn, trung thực', 'Mục tiêu', 'Điểm yếu', 'Sự tiến bộ'], correct: 0 } },
    ],
    reading: {
      title: 'An Honest Review',
      passage: 'Tuan\'s manager talks about his strengths and weaknesses in an honest way. She notices his improvement in teamwork but wants him to set a clear goal for public speaking.',
      quiz: [
        { q: 'Quản lý đánh giá Tuấn thế nào?', options: ['Thẳng thắn, trung thực', 'Chỉ khen', 'Chỉ chê', 'Không nói gì'], correct: 0 },
        { q: 'Tuấn có tiến bộ ở kỹ năng nào?', options: ['Làm việc nhóm', 'Nói trước đám đông', 'Viết email', 'Quản lý thời gian'], correct: 0 },
      ],
    },
    listening: [
      'Let\'s talk about your strengths and weaknesses.',
      'I notice great improvement in your work.',
      'What is your goal for next month?',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về điểm mạnh và điểm yếu của bạn trong công việc.',
      minWords: 15,
      phrases: ['My strength is', 'My weakness is', 'I want to improve', 'My goal is to'],
      sentenceBuilder: [
        { scrambled: 'She / (notice) / his improvement / in teamwork', answer: 'She notices his improvement in teamwork' },
        { scrambled: 'He / (set) / a clear goal / for himself', answer: 'He sets a clear goal for himself' },
      ],
    },
  },
  { // Day 51
    vocab: [
      { word: 'Well done', phonetic: '/wel dʌn/', meaning: 'Làm tốt lắm', quiz: { options: ['Làm tốt lắm', 'Cố gắng hơn', 'Đủ tốt', 'Xuất sắc'], correct: 0 } },
      { word: 'Try harder', phonetic: '/traɪ ˈhɑːrdər/', meaning: 'Cố gắng hơn', quiz: { options: ['Xuất sắc', 'Đủ tốt', 'Cố gắng hơn', 'Làm tốt lắm'], correct: 2 } },
      { word: 'Good enough', phonetic: '/ɡʊd ɪˈnʌf/', meaning: 'Đủ tốt', quiz: { options: ['Đủ tốt', 'Xuất sắc', 'Làm tốt lắm', 'Cố gắng hơn'], correct: 0 } },
      { word: 'Excellent', phonetic: '/ˈeksələnt/', meaning: 'Xuất sắc', quiz: { options: ['Cố gắng hơn', 'Làm tốt lắm', 'Đủ tốt', 'Xuất sắc'], correct: 3 } },
      { word: 'Keep up',  phonetic: '/kiːp ʌp/', meaning: 'Duy trì (phong độ)', quiz: { options: ['Duy trì (phong độ)', 'Cố gắng hơn', 'Xuất sắc', 'Đủ tốt'], correct: 0 } },
    ],
    reading: {
      title: 'Words of Encouragement',
      passage: 'The manager tells Trang, "Well done on this project!" She says the result is excellent, not just good enough. She encourages Trang to keep up the good work next month.',
      quiz: [
        { q: 'Quản lý nhận xét kết quả của Trang thế nào?', options: ['Xuất sắc', 'Chỉ đủ tốt', 'Chưa đạt', 'Cần làm lại'], correct: 0 },
        { q: 'Quản lý khuyến khích Trang làm gì?', options: ['Duy trì phong độ', 'Nghỉ ngơi nhiều hơn', 'Chuyển bộ phận', 'Học thêm khóa mới'], correct: 0 },
      ],
    },
    listening: [
      'Well done on this project!',
      'The result is excellent.',
      'Keep up the good work.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu khen ngợi một đồng nghiệp về công việc họ đã hoàn thành tốt.',
      minWords: 15,
      phrases: ['Well done on', 'The result is excellent', 'Keep up the good work', 'You did a great job'],
      sentenceBuilder: [
        { scrambled: 'She / (say) / well done / to Trang', answer: 'She says well done to Trang' },
        { scrambled: 'He / (encourage) / her / to keep up', answer: 'He encourages her to keep up' },
      ],
    },
  },
  { // Day 52
    vocab: [
      { word: 'Performance', phonetic: '/pərˈfɔːrməns/', meaning: 'Hiệu suất làm việc', quiz: { options: ['Hiệu suất làm việc', 'Xếp hạng', 'Kỳ đánh giá', 'Kết quả'], correct: 0 } },
      { word: 'Rating',  phonetic: '/ˈreɪtɪŋ/', meaning: 'Xếp hạng',    quiz: { options: ['Kết quả', 'Xếp hạng', 'Kỳ đánh giá', 'Hiệu suất làm việc'], correct: 1 } },
      { word: 'Review period', phonetic: '/rɪˈvjuː ˈpɪəriəd/', meaning: 'Kỳ đánh giá', quiz: { options: ['Xếp hạng', 'Hiệu suất làm việc', 'Kỳ đánh giá', 'Kết quả'], correct: 2 } },
      { word: 'Result',   phonetic: '/rɪˈzʌlt/', meaning: 'Kết quả',    quiz: { options: ['Kết quả', 'Kỳ đánh giá', 'Hiệu suất làm việc', 'Xếp hạng'], correct: 0 } },
      { word: 'Satisfied', phonetic: '/ˈsætɪsfaɪd/', meaning: 'Hài lòng', quiz: { options: ['Hài lòng', 'Kết quả', 'Xếp hạng', 'Kỳ đánh giá'], correct: 0 } },
    ],
    reading: {
      title: 'Performance Review',
      passage: 'It is the end of the review period, and Phong receives his performance rating. He is satisfied with the result because he worked hard this quarter. He plans to do even better next time.',
      quiz: [
        { q: 'Phong nhận được điều gì vào cuối kỳ đánh giá?', options: ['Xếp hạng hiệu suất', 'Tiền thưởng', 'Ngày nghỉ thêm', 'Thẻ quà tặng'], correct: 0 },
        { q: 'Phong cảm thấy thế nào về kết quả?', options: ['Hài lòng', 'Thất vọng', 'Tức giận', 'Không quan tâm'], correct: 0 },
      ],
    },
    listening: [
      'The review period has ended.',
      'I am satisfied with my performance rating.',
      'I want to do even better next time.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về kỳ đánh giá hiệu suất làm việc của bạn.',
      minWords: 15,
      phrases: ['My review period ended', 'I am satisfied with', 'My performance rating is', 'I want to do better'],
      sentenceBuilder: [
        { scrambled: 'He / (receive) / his performance rating / today', answer: 'He receives his performance rating today' },
        { scrambled: 'She / (be) / satisfied / with the result', answer: 'She is satisfied with the result' },
      ],
    },
  },
  { // Day 53
    vocab: [
      { word: 'Constructive', phonetic: '/kənˈstrʌktɪv/', meaning: 'Mang tính xây dựng', quiz: { options: ['Mang tính xây dựng', 'Lắng nghe', 'Chấp nhận', 'Bảo vệ (ý kiến)'], correct: 0 } },
      { word: 'Listen',   phonetic: '/ˈlɪsn/', meaning: 'Lắng nghe',    quiz: { options: ['Chấp nhận', 'Lắng nghe', 'Bảo vệ (ý kiến)', 'Mang tính xây dựng'], correct: 1 } },
      { word: 'Accept',   phonetic: '/əkˈsept/', meaning: 'Chấp nhận',  quiz: { options: ['Lắng nghe', 'Bảo vệ (ý kiến)', 'Chấp nhận', 'Mang tính xây dựng'], correct: 2 } },
      { word: 'Defend',   phonetic: '/dɪˈfend/', meaning: 'Bảo vệ (ý kiến)', quiz: { options: ['Bảo vệ (ý kiến)', 'Chấp nhận', 'Mang tính xây dựng', 'Lắng nghe'], correct: 0 } },
      { word: 'Open-minded', phonetic: '/ˌəʊpən ˈmaɪndɪd/', meaning: 'Cởi mở', quiz: { options: ['Mang tính xây dựng', 'Bảo vệ (ý kiến)', 'Lắng nghe', 'Cởi mở'], correct: 3 } },
    ],
    reading: {
      title: 'Receiving Constructive Feedback',
      passage: 'Huy listens carefully when his manager gives constructive feedback. Instead of defending himself, he stays open-minded and accepts the advice. This helps him grow faster in his career.',
      quiz: [
        { q: 'Huy làm gì khi nghe feedback?', options: ['Lắng nghe cẩn thận', 'Phản bác ngay', 'Bỏ đi', 'Im lặng không phản ứng'], correct: 0 },
        { q: 'Huy có thái độ như thế nào?', options: ['Cởi mở', 'Bảo thủ', 'Tức giận', 'Thờ ơ'], correct: 0 },
      ],
    },
    listening: [
      'I will listen to your feedback.',
      'This feedback is constructive.',
      'I try to stay open-minded.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn đón nhận feedback mang tính xây dựng.',
      minWords: 15,
      phrases: ['I listen carefully to', 'This feedback is constructive', 'I stay open-minded', 'I accept the advice'],
      sentenceBuilder: [
        { scrambled: 'He / (listen) / carefully / to feedback', answer: 'He listens carefully to feedback' },
        { scrambled: 'She / (accept) / the advice / happily', answer: 'She accepts the advice happily' },
      ],
    },
  },
  // ---------- WEEK: Chao hoi khach (Day 54-58) ----------
  { // Day 54
    vocab: [
      { word: 'Guest',    phonetic: '/ɡest/', meaning: 'Khách',       quiz: { options: ['Khách', 'Lễ tân', 'Sảnh chờ', 'Ký tên'], correct: 0 } },
      { word: 'Receptionist', phonetic: '/rɪˈsepʃənɪst/', meaning: 'Lễ tân', quiz: { options: ['Sảnh chờ', 'Ký tên', 'Lễ tân', 'Khách'], correct: 2 } },
      { word: 'Lobby',    phonetic: '/ˈlɒbi/', meaning: 'Sảnh chờ',    quiz: { options: ['Sảnh chờ', 'Khách', 'Lễ tân', 'Ký tên'], correct: 0 } },
      { word: 'Sign in',  phonetic: '/saɪn ɪn/', meaning: 'Ký tên (vào sổ)', quiz: { options: ['Lễ tân', 'Khách', 'Sảnh chờ', 'Ký tên (vào sổ)'], correct: 3 } },
      { word: 'Visitor',  phonetic: '/ˈvɪzɪtər/', meaning: 'Khách tham quan', quiz: { options: ['Khách tham quan', 'Lễ tân', 'Ký tên', 'Sảnh chờ'], correct: 0 } },
    ],
    reading: {
      title: 'Welcoming a Guest',
      passage: 'A guest arrives at the lobby and the receptionist greets him warmly. She asks the visitor to sign in before going upstairs. Duc comes down to welcome the guest personally.',
      quiz: [
        { q: 'Khách phải làm gì trước khi lên lầu?', options: ['Ký tên vào sổ', 'Đợi 30 phút', 'Trả phí', 'Gọi điện trước'], correct: 0 },
        { q: 'Ai xuống đón khách?', options: ['Đức', 'Lễ tân', 'Bảo vệ', 'Quản lý nhân sự'], correct: 0 },
      ],
    },
    listening: [
      'Welcome! Please have a seat in the lobby.',
      'Could you sign in here, please?',
      'I am here to meet our visitor.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn chào đón một vị khách đến công ty.',
      minWords: 15,
      phrases: ['A guest arrives at', 'The receptionist greets', 'Please sign in here', 'I welcome the visitor'],
      sentenceBuilder: [
        { scrambled: 'The receptionist / (greet) / the guest / warmly', answer: 'The receptionist greets the guest warmly' },
        { scrambled: 'He / (sign in) / at the lobby', answer: 'He signs in at the lobby' },
      ],
    },
  },
  { // Day 55
    vocab: [
      { word: 'Offer',    phonetic: '/ˈɒfər/', meaning: 'Mời (đề nghị)', quiz: { options: ['Mời (đề nghị)', 'Nước uống', 'Chỉ đường', 'Ngồi chờ'], correct: 0 } },
      { word: 'Beverage', phonetic: '/ˈbevərɪdʒ/', meaning: 'Nước uống', quiz: { options: ['Ngồi chờ', 'Nước uống', 'Chỉ đường', 'Mời (đề nghị)'], correct: 1 } },
      { word: 'Direct',   phonetic: '/dəˈrekt/', meaning: 'Chỉ đường',  quiz: { options: ['Nước uống', 'Ngồi chờ', 'Chỉ đường', 'Mời (đề nghị)'], correct: 2 } },
      { word: 'Have a seat', phonetic: '/hæv ə siːt/', meaning: 'Ngồi chờ (mời ngồi)', quiz: { options: ['Chỉ đường', 'Ngồi chờ (mời ngồi)', 'Mời (đề nghị)', 'Nước uống'], correct: 1 } },
      { word: 'Shortly',  phonetic: '/ˈʃɔːrtli/', meaning: 'Chốc lát nữa', quiz: { options: ['Chốc lát nữa', 'Chỉ đường', 'Nước uống', 'Ngồi chờ'], correct: 0 } },
    ],
    reading: {
      title: 'Hosting a Client',
      passage: 'Ngoc offers the client a beverage and asks him to have a seat. She directs him to the meeting room and says the manager will arrive shortly. The client feels well taken care of.',
      quiz: [
        { q: 'Ngọc mời khách dùng gì?', options: ['Nước uống', 'Bánh kẹo', 'Danh thiếp', 'Tài liệu'], correct: 0 },
        { q: 'Ngọc nói quản lý sẽ đến khi nào?', options: ['Chốc lát nữa', 'Ngày mai', 'Không đến', 'Sau một tiếng'], correct: 0 },
      ],
    },
    listening: [
      'Would you like a beverage?',
      'Please have a seat.',
      'The manager will arrive shortly.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn tiếp đón một khách hàng đến văn phòng.',
      minWords: 15,
      phrases: ['I offer a beverage', 'Please have a seat', 'I direct the guest to', 'She will arrive shortly'],
      sentenceBuilder: [
        { scrambled: 'She / (offer) / the client / a beverage', answer: 'She offers the client a beverage' },
        { scrambled: 'He / (direct) / the guest / to the room', answer: 'He directs the guest to the room' },
      ],
    },
  },
  { // Day 56
    vocab: [
      { word: 'Badge',    phonetic: '/bædʒ/', meaning: 'Thẻ ra vào',    quiz: { options: ['Thẻ ra vào', 'An ninh', 'Ký hợp đồng', 'Cổng vào'], correct: 0 } },
      { word: 'Security', phonetic: '/sɪˈkjʊərəti/', meaning: 'An ninh, bảo vệ', quiz: { options: ['Cổng vào', 'An ninh, bảo vệ', 'Thẻ ra vào', 'Ký hợp đồng'], correct: 1 } },
      { word: 'Sign a contract', phonetic: '/saɪn ə ˈkɒntrækt/', meaning: 'Ký hợp đồng', quiz: { options: ['Ký hợp đồng', 'Thẻ ra vào', 'An ninh, bảo vệ', 'Cổng vào'], correct: 0 } },
      { word: 'Entrance', phonetic: '/ˈentrəns/', meaning: 'Cổng vào', quiz: { options: ['An ninh, bảo vệ', 'Thẻ ra vào', 'Ký hợp đồng', 'Cổng vào'], correct: 3 } },
      { word: 'Identification', phonetic: '/aɪˌdentɪfɪˈkeɪʃn/', meaning: 'Giấy tờ tùy thân', quiz: { options: ['Giấy tờ tùy thân', 'Thẻ ra vào', 'An ninh, bảo vệ', 'Cổng vào'], correct: 0 } },
    ],
    reading: {
      title: 'Visitor Security Rules',
      passage: 'At the entrance, security asks every visitor for identification. The receptionist then gives the guest a temporary badge. Today, a partner company visits to sign a contract with our team.',
      quiz: [
        { q: 'Bảo vệ yêu cầu khách xuất trình gì?', options: ['Giấy tờ tùy thân', 'Danh thiếp', 'Vé xe', 'Hộ chiếu bản gốc'], correct: 0 },
        { q: 'Công ty đối tác đến để làm gì?', options: ['Ký hợp đồng', 'Phỏng vấn', 'Đào tạo', 'Tham quan'], correct: 0 },
      ],
    },
    listening: [
      'Can I see your identification, please?',
      'Here is your visitor badge.',
      'We are here to sign the contract.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về quy trình an ninh khi khách đến công ty bạn.',
      minWords: 15,
      phrases: ['Security asks for identification', 'Here is your badge', 'We sign the contract', 'Please enter through the entrance'],
      sentenceBuilder: [
        { scrambled: 'Security / (ask) / for identification / at the entrance', answer: 'Security asks for identification at the entrance' },
        { scrambled: 'They / (sign) / the contract / today', answer: 'They sign the contract today' },
      ],
    },
  },
  { // Day 57
    vocab: [
      { word: 'Tour',     phonetic: '/tʊər/', meaning: 'Chuyến tham quan', quiz: { options: ['Chuyến tham quan', 'Nhân viên bảo vệ', 'Ấn tượng', 'Cửa hàng lưu niệm'], correct: 0 } },
      { word: 'Guard',    phonetic: '/ɡɑːrd/', meaning: 'Nhân viên bảo vệ', quiz: { options: ['Ấn tượng', 'Nhân viên bảo vệ', 'Chuyến tham quan', 'Cửa hàng lưu niệm'], correct: 1 } },
      { word: 'Impressed', phonetic: '/ɪmˈprest/', meaning: 'Ấn tượng', quiz: { options: ['Chuyến tham quan', 'Cửa hàng lưu niệm', 'Ấn tượng', 'Nhân viên bảo vệ'], correct: 2 } },
      { word: 'Facility', phonetic: '/fəˈsɪləti/', meaning: 'Cơ sở vật chất', quiz: { options: ['Cơ sở vật chất', 'Ấn tượng', 'Chuyến tham quan', 'Nhân viên bảo vệ'], correct: 0 } },
      { word: 'Show around', phonetic: '/ʃəʊ əˈraʊnd/', meaning: 'Dẫn đi tham quan', quiz: { options: ['Nhân viên bảo vệ', 'Ấn tượng', 'Cơ sở vật chất', 'Dẫn đi tham quan'], correct: 3 } },
    ],
    reading: {
      title: 'A Company Tour',
      passage: 'Linh shows a group of visitors around the office on a short tour. They are impressed by the modern facility. A friendly guard at the door welcomes them warmly.',
      quiz: [
        { q: 'Linh làm gì với nhóm khách?', options: ['Dẫn họ đi tham quan', 'Mời họ ăn trưa', 'Ký hợp đồng', 'Giới thiệu sản phẩm'], correct: 0 },
        { q: 'Khách cảm thấy thế nào về cơ sở vật chất?', options: ['Ấn tượng', 'Thất vọng', 'Bình thường', 'Không quan tâm'], correct: 0 },
      ],
    },
    listening: [
      'Let me show you around the office.',
      'We are impressed by your facility.',
      'The guard welcomed us at the door.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc dẫn khách tham quan văn phòng công ty.',
      minWords: 15,
      phrases: ['I show visitors around', 'They are impressed by', 'The facility is', 'The guard welcomes'],
      sentenceBuilder: [
        { scrambled: 'She / (show) / visitors / around the office', answer: 'She shows visitors around the office' },
        { scrambled: 'They / (be) / impressed / by the facility', answer: 'They are impressed by the facility' },
      ],
    },
  },
  { // Day 58
    vocab: [
      { word: 'Farewell', phonetic: '/feərˈwel/', meaning: 'Lời tạm biệt', quiz: { options: ['Lời tạm biệt', 'Tiễn khách', 'Cảm ơn vì đã đến', 'Hẹn gặp lại'], correct: 0 } },
      { word: 'See off',  phonetic: '/siː ɒf/', meaning: 'Tiễn khách',   quiz: { options: ['Hẹn gặp lại', 'Tiễn khách', 'Lời tạm biệt', 'Cảm ơn vì đã đến'], correct: 1 } },
      { word: 'Thanks for coming', phonetic: '/θæŋks fɔːr ˈkʌmɪŋ/', meaning: 'Cảm ơn vì đã đến', quiz: { options: ['Cảm ơn vì đã đến', 'Tiễn khách', 'Hẹn gặp lại', 'Lời tạm biệt'], correct: 0 } },
      { word: 'See you again', phonetic: '/siː juː əˈɡen/', meaning: 'Hẹn gặp lại', quiz: { options: ['Lời tạm biệt', 'Cảm ơn vì đã đến', 'Tiễn khách', 'Hẹn gặp lại'], correct: 3 } },
      { word: 'Safe trip', phonetic: '/seɪf trɪp/', meaning: 'Chuyến đi bình an', quiz: { options: ['Chuyến đi bình an', 'Tiễn khách', 'Lời tạm biệt', 'Hẹn gặp lại'], correct: 0 } },
    ],
    reading: {
      title: 'Saying Goodbye to a Guest',
      passage: 'At the end of the visit, Mai says a warm farewell to the guest. She sees him off to the entrance and says, "Thanks for coming, have a safe trip!" The guest smiles and says, "See you again."',
      quiz: [
        { q: 'Mai làm gì khi khách ra về?', options: ['Tiễn khách ra cổng', 'Không tiễn', 'Nhờ người khác tiễn', 'Gọi taxi cho khách'], correct: 0 },
        { q: 'Khách nói gì khi tạm biệt?', options: ['See you again', 'Goodbye forever', 'I am angry', 'No thank you'], correct: 0 },
      ],
    },
    listening: [
      'Thanks for coming today.',
      'I will see you off to the entrance.',
      'Have a safe trip home.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn nói lời tạm biệt với khách khi họ ra về.',
      minWords: 15,
      phrases: ['Thanks for coming', 'I see the guest off', 'Have a safe trip', 'See you again soon'],
      sentenceBuilder: [
        { scrambled: 'She / (see off) / the guest / to the entrance', answer: 'She sees off the guest to the entrance' },
        { scrambled: 'He / (say) / thanks for coming / today', answer: 'He says thanks for coming today' },
      ],
    },
  },
  // ---------- WEEK: Cong nghe van phong co ban (Day 59-63) ----------
  { // Day 59
    vocab: [
      { word: 'Password', phonetic: '/ˈpæswɜːrd/', meaning: 'Mật khẩu', quiz: { options: ['Mật khẩu', 'Đăng nhập', 'Đăng xuất', 'Tài khoản'], correct: 0 } },
      { word: 'Log in',   phonetic: '/lɒɡ ɪn/', meaning: 'Đăng nhập',  quiz: { options: ['Tài khoản', 'Đăng nhập', 'Mật khẩu', 'Đăng xuất'], correct: 1 } },
      { word: 'Log out',  phonetic: '/lɒɡ aʊt/', meaning: 'Đăng xuất', quiz: { options: ['Đăng xuất', 'Mật khẩu', 'Tài khoản', 'Đăng nhập'], correct: 0 } },
      { word: 'Account',  phonetic: '/əˈkaʊnt/', meaning: 'Tài khoản', quiz: { options: ['Đăng nhập', 'Đăng xuất', 'Tài khoản', 'Mật khẩu'], correct: 2 } },
      { word: 'Forget',   phonetic: '/fərˈɡet/', meaning: 'Quên',      quiz: { options: ['Quên', 'Tài khoản', 'Đăng xuất', 'Mật khẩu'], correct: 0 } },
    ],
    reading: {
      title: 'Logging In',
      passage: 'Every morning, Nam logs in to his work account using a password. Today, he forgets his password and asks IT to reset it. He remembers to log out before leaving the office.',
      quiz: [
        { q: 'Vấn đề của Nam hôm nay là gì?', options: ['Anh ấy quên mật khẩu', 'Máy tính bị hỏng', 'Không có mạng', 'Tài khoản bị khóa'], correct: 0 },
        { q: 'Nam nhớ làm gì trước khi rời văn phòng?', options: ['Đăng xuất', 'Tắt đèn', 'Khóa cửa', 'Gọi điện'], correct: 0 },
      ],
    },
    listening: [
      'I forget my password.',
      'Can you help me log in?',
      'Please log out before you leave.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc đăng nhập tài khoản công việc mỗi ngày.',
      minWords: 15,
      phrases: ['I log in every morning', 'I forget my password', 'I ask IT to reset', 'I log out before leaving'],
      sentenceBuilder: [
        { scrambled: 'He / (log in) / every morning', answer: 'He logs in every morning' },
        { scrambled: 'She / (forget) / her password / today', answer: 'She forgets her password today' },
      ],
    },
  },
  { // Day 60
    vocab: [
      { word: 'Save',     phonetic: '/seɪv/', meaning: 'Lưu (tập tin)', quiz: { options: ['Lưu (tập tin)', 'Xóa', 'Tải xuống', 'Tải lên'], correct: 0 } },
      { word: 'Delete',   phonetic: '/dɪˈliːt/', meaning: 'Xóa',        quiz: { options: ['Tải lên', 'Xóa', 'Lưu (tập tin)', 'Tải xuống'], correct: 1 } },
      { word: 'Download', phonetic: '/ˈdaʊnləʊd/', meaning: 'Tải xuống', quiz: { options: ['Lưu (tập tin)', 'Xóa', 'Tải xuống', 'Tải lên'], correct: 2 } },
      { word: 'Upload',   phonetic: '/ˈʌpləʊd/', meaning: 'Tải lên',   quiz: { options: ['Tải lên', 'Tải xuống', 'Xóa', 'Lưu (tập tin)'], correct: 0 } },
      { word: 'Folder',   phonetic: '/ˈfəʊldər/', meaning: 'Thư mục',   quiz: { options: ['Thư mục', 'Tải lên', 'Xóa', 'Lưu (tập tin)'], correct: 0 } },
    ],
    reading: {
      title: 'Managing Files',
      passage: 'Trang saves her report in a folder before she uploads it to the shared drive. She downloads an old file to check, then deletes a duplicate copy that she no longer needs.',
      quiz: [
        { q: 'Trang lưu báo cáo vào đâu trước khi tải lên?', options: ['Một thư mục', 'USB', 'Email', 'Máy in'], correct: 0 },
        { q: 'Trang xóa cái gì?', options: ['Bản sao trùng lặp', 'Toàn bộ thư mục', 'Tài khoản của cô', 'Mật khẩu'], correct: 0 },
      ],
    },
    listening: [
      'I need to save this file.',
      'Please upload it to the shared drive.',
      'I will delete the duplicate copy.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn quản lý tập tin trên máy tính.',
      minWords: 15,
      phrases: ['I save my file in', 'I upload it to', 'I download the file', 'I delete the old copy'],
      sentenceBuilder: [
        { scrambled: 'She / (save) / her report / in a folder', answer: 'She saves her report in a folder' },
        { scrambled: 'He / (delete) / the duplicate copy', answer: 'He deletes the duplicate copy' },
      ],
    },
  },
  { // Day 61
    vocab: [
      { word: 'Attachment', phonetic: '/əˈtætʃmənt/', meaning: 'Tệp đính kèm', quiz: { options: ['Tệp đính kèm', 'Gửi', 'Nhận', 'Hộp thư đến'], correct: 0 } },
      { word: 'Send',     phonetic: '/send/', meaning: 'Gửi',           quiz: { options: ['Nhận', 'Gửi', 'Hộp thư đến', 'Tệp đính kèm'], correct: 1 } },
      { word: 'Receive',  phonetic: '/rɪˈsiːv/', meaning: 'Nhận',        quiz: { options: ['Gửi', 'Tệp đính kèm', 'Nhận', 'Hộp thư đến'], correct: 2 } },
      { word: 'Inbox',    phonetic: '/ˈɪnbɒks/', meaning: 'Hộp thư đến', quiz: { options: ['Hộp thư đến', 'Nhận', 'Gửi', 'Tệp đính kèm'], correct: 0 } },
      { word: 'Spam',     phonetic: '/spæm/', meaning: 'Thư rác',       quiz: { options: ['Thư rác', 'Gửi', 'Nhận', 'Hộp thư đến'], correct: 0 } },
    ],
    reading: {
      title: 'Sending Emails',
      passage: 'Phong sends an email with an important attachment to a client. Later, he checks his inbox and receives a fast reply. He also cleans out some spam emails from last week.',
      quiz: [
        { q: 'Phong gửi email kèm theo gì?', options: ['Tệp đính kèm quan trọng', 'Ảnh cá nhân', 'Video', 'Không có gì'], correct: 0 },
        { q: 'Phong dọn dẹp gì trong hộp thư?', options: ['Thư rác', 'Email công việc', 'Danh bạ', 'Lịch làm việc'], correct: 0 },
      ],
    },
    listening: [
      'I sent the file as an attachment.',
      'Did you receive my email?',
      'Check your inbox, please.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc gửi email công việc kèm tệp đính kèm.',
      minWords: 15,
      phrases: ['I send an email with', 'I receive a reply from', 'I check my inbox', 'I clean out spam emails'],
      sentenceBuilder: [
        { scrambled: 'He / (send) / an email / with an attachment', answer: 'He sends an email with an attachment' },
        { scrambled: 'She / (receive) / a fast reply', answer: 'She receives a fast reply' },
      ],
    },
  },
  { // Day 62
    vocab: [
      { word: 'Software', phonetic: '/ˈsɒftweər/', meaning: 'Phần mềm', quiz: { options: ['Phần mềm', 'Cài đặt', 'Cập nhật (phần mềm)', 'Trục trặc'], correct: 0 } },
      { word: 'Install',  phonetic: '/ɪnˈstɔːl/', meaning: 'Cài đặt',   quiz: { options: ['Cập nhật (phần mềm)', 'Cài đặt', 'Trục trặc', 'Phần mềm'], correct: 1 } },
      { word: 'Upgrade',  phonetic: '/ʌpˈɡreɪd/', meaning: 'Cập nhật (phần mềm)', quiz: { options: ['Phần mềm', 'Trục trặc', 'Cập nhật (phần mềm)', 'Cài đặt'], correct: 2 } },
      { word: 'Glitch',   phonetic: '/ɡlɪtʃ/', meaning: 'Trục trặc',   quiz: { options: ['Trục trặc', 'Phần mềm', 'Cài đặt', 'Cập nhật (phần mềm)'], correct: 0 } },
      { word: 'Restart',  phonetic: '/riːˈstɑːrt/', meaning: 'Khởi động lại', quiz: { options: ['Khởi động lại', 'Trục trặc', 'Cài đặt', 'Phần mềm'], correct: 0 } },
    ],
    reading: {
      title: 'A Software Glitch',
      passage: 'The new software has a small glitch after Huy installs it. IT suggests he restart his computer to fix the problem. After the upgrade, everything runs smoothly again.',
      quiz: [
        { q: 'Vấn đề Huy gặp phải là gì?', options: ['Phần mềm bị trục trặc', 'Máy tính bị mất điện', 'Chuột bị hỏng', 'Không có mạng'], correct: 0 },
        { q: 'IT khuyên Huy làm gì?', options: ['Khởi động lại máy', 'Mua máy mới', 'Gọi nhà cung cấp', 'Không làm gì'], correct: 0 },
      ],
    },
    listening: [
      'I need to install this software.',
      'There is a small glitch.',
      'Please restart your computer.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một lần bạn gặp trục trặc phần mềm ở công ty.',
      minWords: 15,
      phrases: ['I install new software', 'There is a glitch in', 'I restart my computer', 'After the upgrade'],
      sentenceBuilder: [
        { scrambled: 'He / (install) / the new software / today', answer: 'He installs the new software today' },
        { scrambled: 'She / (restart) / her computer / to fix it', answer: 'She restarts her computer to fix it' },
      ],
    },
  },
  { // Day 63
    vocab: [
      { word: 'Cloud',    phonetic: '/klaʊd/', meaning: 'Đám mây (lưu trữ)', quiz: { options: ['Đám mây (lưu trữ)', 'Sao lưu', 'Chia sẻ', 'Quyền truy cập'], correct: 0 } },
      { word: 'Backup',   phonetic: '/ˈbækʌp/', meaning: 'Sao lưu',     quiz: { options: ['Quyền truy cập', 'Sao lưu', 'Chia sẻ', 'Đám mây (lưu trữ)'], correct: 1 } },
      { word: 'Share a file', phonetic: '/ʃer ə faɪl/', meaning: 'Chia sẻ tệp', quiz: { options: ['Sao lưu', 'Đám mây (lưu trữ)', 'Chia sẻ tệp', 'Quyền truy cập'], correct: 2 } },
      { word: 'Access',   phonetic: '/ˈækses/', meaning: 'Quyền truy cập', quiz: { options: ['Quyền truy cập', 'Sao lưu', 'Chia sẻ tệp', 'Đám mây (lưu trữ)'], correct: 0 } },
      { word: 'Storage space', phonetic: '/ˈstɔːrɪdʒ speɪs/', meaning: 'Dung lượng lưu trữ', quiz: { options: ['Dung lượng lưu trữ', 'Chia sẻ tệp', 'Quyền truy cập', 'Sao lưu'], correct: 0 } },
    ],
    reading: {
      title: 'Using Cloud Storage',
      passage: 'Duc backs up his files to the cloud every Friday. He shares a file with his team and gives them access to view it. He notices the storage space is almost full and asks IT for more.',
      quiz: [
        { q: 'Đức sao lưu tệp vào ngày nào?', options: ['Thứ Sáu', 'Thứ Hai', 'Thứ Tư', 'Chủ Nhật'], correct: 0 },
        { q: 'Đức nhận ra điều gì về dung lượng lưu trữ?', options: ['Gần đầy', 'Còn rất nhiều', 'Bị lỗi', 'Không dùng được'], correct: 0 },
      ],
    },
    listening: [
      'I back up my files to the cloud.',
      'Can you give me access to this file?',
      'The storage space is almost full.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về việc sử dụng lưu trữ đám mây trong công việc.',
      minWords: 15,
      phrases: ['I back up my files to the cloud', 'I share a file with', 'I give access to', 'The storage space is'],
      sentenceBuilder: [
        { scrambled: 'He / (back up) / his files / every Friday', answer: 'He backs up his files every Friday' },
        { scrambled: 'She / (share) / a file / with her team', answer: 'She shares a file with her team' },
      ],
    },
  },
  // ---------- WEEK: Tien luong & phuc loi co ban (Day 64-68) ----------
  { // Day 64
    vocab: [
      { word: 'Salary',   phonetic: '/ˈsæləri/', meaning: 'Lương',      quiz: { options: ['Lương', 'Ngày lãnh lương', 'Tăng lương', 'Khấu trừ'], correct: 0 } },
      { word: 'Payday',   phonetic: '/ˈpeɪdeɪ/', meaning: 'Ngày lãnh lương', quiz: { options: ['Tăng lương', 'Ngày lãnh lương', 'Khấu trừ', 'Lương'], correct: 1 } },
      { word: 'Raise',    phonetic: '/reɪz/', meaning: 'Tăng lương',     quiz: { options: ['Ngày lãnh lương', 'Khấu trừ', 'Tăng lương', 'Lương'], correct: 2 } },
      { word: 'Deduction', phonetic: '/dɪˈdʌkʃn/', meaning: 'Khấu trừ', quiz: { options: ['Khấu trừ', 'Lương', 'Tăng lương', 'Ngày lãnh lương'], correct: 0 } },
      { word: 'Bank transfer', phonetic: '/bæŋk ˈtrænsfɜːr/', meaning: 'Chuyển khoản ngân hàng', quiz: { options: ['Chuyển khoản ngân hàng', 'Khấu trừ', 'Tăng lương', 'Lương'], correct: 0 } },
    ],
    reading: {
      title: 'Payday',
      passage: 'Today is payday, and Mai checks her salary through a bank transfer. She notices a small deduction for insurance. She is also happy to hear about a possible raise next quarter.',
      quiz: [
        { q: 'Mai nhận lương qua hình thức nào?', options: ['Chuyển khoản ngân hàng', 'Tiền mặt', 'Séc', 'Chuyển qua ví điện tử'], correct: 0 },
        { q: 'Mai để ý thấy điều gì trong bảng lương?', options: ['Một khoản khấu trừ nhỏ', 'Lương bị thiếu nhiều', 'Không nhận được lương', 'Lương tăng gấp đôi'], correct: 0 },
      ],
    },
    listening: [
      'Today is payday.',
      'I check my salary through bank transfer.',
      'I might get a raise next quarter.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về ngày lãnh lương và cách bạn nhận lương.',
      minWords: 15,
      phrases: ['Today is payday', 'I receive my salary by', 'There is a small deduction for', 'I hope for a raise'],
      sentenceBuilder: [
        { scrambled: 'She / (check) / her salary / today', answer: 'She checks her salary today' },
        { scrambled: 'He / (receive) / a raise / next quarter', answer: 'He receives a raise next quarter' },
      ],
    },
  },
  { // Day 65
    vocab: [
      { word: 'Bonus',    phonetic: '/ˈbəʊnəs/', meaning: 'Tiền thưởng', quiz: { options: ['Tiền thưởng', 'Bảo hiểm', 'Phúc lợi', 'Trợ cấp'], correct: 0 } },
      { word: 'Insurance', phonetic: '/ɪnˈʃʊərəns/', meaning: 'Bảo hiểm', quiz: { options: ['Phúc lợi', 'Bảo hiểm', 'Trợ cấp', 'Tiền thưởng'], correct: 1 } },
      { word: 'Benefit',  phonetic: '/ˈbenɪfɪt/', meaning: 'Phúc lợi',   quiz: { options: ['Phúc lợi', 'Tiền thưởng', 'Trợ cấp', 'Bảo hiểm'], correct: 0 } },
      { word: 'Allowance', phonetic: '/əˈlaʊəns/', meaning: 'Trợ cấp',  quiz: { options: ['Bảo hiểm', 'Phúc lợi', 'Trợ cấp', 'Tiền thưởng'], correct: 2 } },
      { word: 'Annual bonus', phonetic: '/ˈænjuəl ˈbəʊnəs/', meaning: 'Thưởng hàng năm', quiz: { options: ['Thưởng hàng năm', 'Bảo hiểm', 'Phúc lợi', 'Trợ cấp'], correct: 0 } },
    ],
    reading: {
      title: 'Company Benefits',
      passage: 'Tuan\'s company offers health insurance and a lunch allowance as part of its benefits. At the end of the year, he also receives an annual bonus. He feels grateful for these benefits.',
      quiz: [
        { q: 'Công ty Tuấn cung cấp phúc lợi gì?', options: ['Bảo hiểm sức khỏe và trợ cấp ăn trưa', 'Xe đưa đón miễn phí', 'Nhà ở miễn phí', 'Không có phúc lợi gì'], correct: 0 },
        { q: 'Tuấn nhận được gì vào cuối năm?', options: ['Thưởng hàng năm', 'Ngày nghỉ thêm', 'Thẻ quà tặng', 'Không có gì'], correct: 0 },
      ],
    },
    listening: [
      'We have health insurance as a benefit.',
      'I received my annual bonus.',
      'The company gives a lunch allowance.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về các phúc lợi bạn nhận được ở công ty.',
      minWords: 15,
      phrases: ['My company offers', 'I receive health insurance', 'I get an annual bonus', 'The lunch allowance is'],
      sentenceBuilder: [
        { scrambled: 'The company / (offer) / health insurance', answer: 'The company offers health insurance' },
        { scrambled: 'He / (receive) / an annual bonus', answer: 'He receives an annual bonus' },
      ],
    },
  },
  { // Day 66
    vocab: [
      { word: 'Payslip',  phonetic: '/ˈpeɪslɪp/', meaning: 'Phiếu lương', quiz: { options: ['Phiếu lương', 'Thuế thu nhập', 'Lương thực nhận', 'Lương cơ bản'], correct: 0 } },
      { word: 'Income tax', phonetic: '/ˈɪnkʌm tæks/', meaning: 'Thuế thu nhập', quiz: { options: ['Lương thực nhận', 'Thuế thu nhập', 'Lương cơ bản', 'Phiếu lương'], correct: 1 } },
      { word: 'Net pay',  phonetic: '/net peɪ/', meaning: 'Lương thực nhận', quiz: { options: ['Phiếu lương', 'Lương cơ bản', 'Lương thực nhận', 'Thuế thu nhập'], correct: 2 } },
      { word: 'Base salary', phonetic: '/beɪs ˈsæləri/', meaning: 'Lương cơ bản', quiz: { options: ['Lương cơ bản', 'Lương thực nhận', 'Thuế thu nhập', 'Phiếu lương'], correct: 0 } },
      { word: 'Detail',   phonetic: '/ˈdiːteɪl/', meaning: 'Chi tiết',   quiz: { options: ['Chi tiết', 'Lương cơ bản', 'Thuế thu nhập', 'Phiếu lương'], correct: 0 } },
    ],
    reading: {
      title: 'Reading a Payslip',
      passage: 'Trang receives her payslip and checks the details carefully. It shows her base salary, income tax, and final net pay. She keeps a copy for her own records every month.',
      quiz: [
        { q: 'Trang kiểm tra gì trong phiếu lương?', options: ['Các chi tiết lương', 'Lịch làm việc', 'Danh sách khách hàng', 'Email cũ'], correct: 0 },
        { q: 'Trang giữ lại gì hàng tháng?', options: ['Bản sao phiếu lương', 'Hóa đơn ăn trưa', 'Vé xe buýt', 'Danh thiếp'], correct: 0 },
      ],
    },
    listening: [
      'Let me check my payslip.',
      'This shows my base salary.',
      'My net pay is after income tax.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn kiểm tra phiếu lương hàng tháng.',
      minWords: 15,
      phrases: ['I check my payslip', 'My base salary is', 'My net pay is', 'I keep a copy every month'],
      sentenceBuilder: [
        { scrambled: 'She / (check) / her payslip / carefully', answer: 'She checks her payslip carefully' },
        { scrambled: 'He / (keep) / a copy / every month', answer: 'He keeps a copy every month' },
      ],
    },
  },
  { // Day 67
    vocab: [
      { word: 'Health checkup', phonetic: '/helθ ˈtʃekʌp/', meaning: 'Khám sức khỏe', quiz: { options: ['Khám sức khỏe', 'Miễn phí', 'Hàng năm', 'Sức khỏe'], correct: 0 } },
      { word: 'Free',     phonetic: '/friː/', meaning: 'Miễn phí',     quiz: { options: ['Hàng năm', 'Sức khỏe', 'Miễn phí', 'Khám sức khỏe'], correct: 2 } },
      { word: 'Annual',   phonetic: '/ˈænjuəl/', meaning: 'Hàng năm',   quiz: { options: ['Miễn phí', 'Hàng năm', 'Khám sức khỏe', 'Sức khỏe'], correct: 1 } },
      { word: 'Health',   phonetic: '/helθ/', meaning: 'Sức khỏe',      quiz: { options: ['Sức khỏe', 'Khám sức khỏe', 'Miễn phí', 'Hàng năm'], correct: 0 } },
      { word: 'Care about', phonetic: '/keər əˈbaʊt/', meaning: 'Quan tâm đến', quiz: { options: ['Khám sức khỏe', 'Miễn phí', 'Quan tâm đến', 'Hàng năm'], correct: 2 } },
    ],
    reading: {
      title: 'Annual Health Checkup',
      passage: 'The company offers a free annual health checkup for all employees. Ngoc goes for her checkup this week to make sure her health is good. She feels the company really cares about its staff.',
      quiz: [
        { q: 'Công ty cung cấp phúc lợi gì mỗi năm?', options: ['Khám sức khỏe miễn phí', 'Chuyến du lịch', 'Xe hơi', 'Nhà ở'], correct: 0 },
        { q: 'Ngọc cảm nhận điều gì về công ty?', options: ['Công ty quan tâm đến nhân viên', 'Công ty không quan tâm', 'Công ty chỉ quan tâm lợi nhuận', 'Không có cảm nhận gì'], correct: 0 },
      ],
    },
    listening: [
      'We have a free annual health checkup.',
      'I go for my checkup this week.',
      'The company cares about our health.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về phúc lợi khám sức khỏe hàng năm ở công ty bạn.',
      minWords: 15,
      phrases: ['We have a free health checkup', 'I go for my checkup', 'The company cares about', 'My health is good'],
      sentenceBuilder: [
        { scrambled: 'The company / (offer) / a free checkup / every year', answer: 'The company offers a free checkup every year' },
        { scrambled: 'She / (go) / for her checkup / this week', answer: 'She goes for her checkup this week' },
      ],
    },
  },
  { // Day 68
    vocab: [
      { word: 'Promotion', phonetic: '/prəˈməʊʃn/', meaning: 'Thăng chức', quiz: { options: ['Thăng chức', 'Cơ hội', 'Cống hiến', 'Xứng đáng'], correct: 0 } },
      { word: 'Opportunity', phonetic: '/ˌɒpərˈtjuːnəti/', meaning: 'Cơ hội', quiz: { options: ['Cống hiến', 'Cơ hội', 'Xứng đáng', 'Thăng chức'], correct: 1 } },
      { word: 'Contribute', phonetic: '/kənˈtrɪbjuːt/', meaning: 'Cống hiến, đóng góp', quiz: { options: ['Cống hiến, đóng góp', 'Cơ hội', 'Xứng đáng', 'Thăng chức'], correct: 0 } },
      { word: 'Deserve',  phonetic: '/dɪˈzɜːrv/', meaning: 'Xứng đáng', quiz: { options: ['Cơ hội', 'Thăng chức', 'Xứng đáng', 'Cống hiến'], correct: 2 } },
      { word: 'Advance',  phonetic: '/ədˈvæns/', meaning: 'Tiến bộ, thăng tiến', quiz: { options: ['Tiến bộ, thăng tiến', 'Cơ hội', 'Xứng đáng', 'Cống hiến'], correct: 0 } },
    ],
    reading: {
      title: 'A Chance for Promotion',
      passage: 'Phong contributes a lot to the team this year, so he deserves a promotion. His manager gives him the opportunity to advance to a higher position. Phong feels proud of his hard work.',
      quiz: [
        { q: 'Vì sao Phong xứng đáng được thăng chức?', options: ['Anh ấy cống hiến nhiều', 'Anh ấy làm việc lâu năm nhất', 'Anh ấy là bạn của sếp', 'Anh ấy xin nhiều lần'], correct: 0 },
        { q: 'Quản lý cho Phong điều gì?', options: ['Cơ hội thăng tiến', 'Tiền thưởng', 'Ngày nghỉ thêm', 'Chỉ lời khen'], correct: 0 },
      ],
    },
    listening: [
      'I deserve a promotion this year.',
      'This is a great opportunity for me.',
      'I want to advance in my career.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cơ hội thăng tiến trong công việc của bạn.',
      minWords: 15,
      phrases: ['I contribute a lot to', 'I deserve a promotion', 'This is a good opportunity', 'I want to advance'],
      sentenceBuilder: [
        { scrambled: 'He / (contribute) / a lot / this year', answer: 'He contributes a lot this year' },
        { scrambled: 'She / (deserve) / a promotion / now', answer: 'She deserves a promotion now' },
      ],
    },
  },
  // ---------- WEEK: Suc khoe noi lam viec (Day 69-73) ----------
  { // Day 69
    vocab: [
      { word: 'Stress',   phonetic: '/stres/', meaning: 'Căng thẳng',   quiz: { options: ['Căng thẳng', 'Kiệt sức', 'Nghỉ ngơi', 'Cân bằng'], correct: 0 } },
      { word: 'Tired',    phonetic: '/ˈtaɪərd/', meaning: 'Mệt, kiệt sức', quiz: { options: ['Cân bằng', 'Mệt, kiệt sức', 'Nghỉ ngơi', 'Căng thẳng'], correct: 1 } },
      { word: 'Rest',     phonetic: '/rest/', meaning: 'Nghỉ ngơi',     quiz: { options: ['Nghỉ ngơi', 'Căng thẳng', 'Cân bằng', 'Mệt, kiệt sức'], correct: 0 } },
      { word: 'Balance',  phonetic: '/ˈbæləns/', meaning: 'Cân bằng',   quiz: { options: ['Mệt, kiệt sức', 'Nghỉ ngơi', 'Cân bằng', 'Căng thẳng'], correct: 2 } },
      { word: 'Manage stress', phonetic: '/ˈmænɪdʒ stres/', meaning: 'Kiểm soát căng thẳng', quiz: { options: ['Kiểm soát căng thẳng', 'Nghỉ ngơi', 'Cân bằng', 'Mệt, kiệt sức'], correct: 0 } },
    ],
    reading: {
      title: 'Managing Work Stress',
      passage: 'Linh feels stress after a busy week at work. She decides to rest more and find a better balance between work and life. Learning to manage stress helps her feel less tired every day.',
      quiz: [
        { q: 'Linh cảm thấy thế nào sau một tuần bận rộn?', options: ['Căng thẳng', 'Vui vẻ', 'Bình thường', 'Hạnh phúc'], correct: 0 },
        { q: 'Linh quyết định làm gì?', options: ['Nghỉ ngơi nhiều hơn', 'Làm việc nhiều hơn', 'Nghỉ việc', 'Không làm gì'], correct: 0 },
      ],
    },
    listening: [
      'I feel a lot of stress today.',
      'I need to rest more.',
      'I try to find a good work-life balance.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn kiểm soát căng thẳng trong công việc.',
      minWords: 15,
      phrases: ['I feel stress when', 'I need to rest', 'I try to find balance', 'I manage stress by'],
      sentenceBuilder: [
        { scrambled: 'She / (feel) / stress / after work', answer: 'She feels stress after work' },
        { scrambled: 'He / (try) / to find / a good balance', answer: 'He tries to find a good balance' },
      ],
    },
  },
  { // Day 70
    vocab: [
      { word: 'Exercise', phonetic: '/ˈeksərsaɪz/', meaning: 'Tập thể dục', quiz: { options: ['Tập thể dục', 'Cầu thang', 'Nước lọc', 'Ngồi lâu'], correct: 0 } },
      { word: 'Stairs',   phonetic: '/steərz/', meaning: 'Cầu thang',   quiz: { options: ['Nước lọc', 'Cầu thang', 'Tập thể dục', 'Ngồi lâu'], correct: 1 } },
      { word: 'Water',    phonetic: '/ˈwɔːtər/', meaning: 'Nước lọc',   quiz: { options: ['Cầu thang', 'Tập thể dục', 'Nước lọc', 'Ngồi lâu'], correct: 2 } },
      { word: 'Sit too long', phonetic: '/sɪt tuː lɒŋ/', meaning: 'Ngồi quá lâu', quiz: { options: ['Tập thể dục', 'Nước lọc', 'Cầu thang', 'Ngồi quá lâu'], correct: 3 } },
      { word: 'Stretch',  phonetic: '/stretʃ/', meaning: 'Giãn cơ, vươn vai', quiz: { options: ['Giãn cơ, vươn vai', 'Nước lọc', 'Cầu thang', 'Tập thể dục'], correct: 0 } },
    ],
    reading: {
      title: 'Staying Healthy at Work',
      passage: 'Nam does not like to sit too long at his desk. Every hour, he stands up to stretch and drinks a glass of water. He also uses the stairs instead of the elevator for some light exercise.',
      quiz: [
        { q: 'Nam làm gì mỗi giờ?', options: ['Đứng dậy giãn cơ', 'Ăn vặt', 'Gọi điện thoại', 'Kiểm tra email'], correct: 0 },
        { q: 'Nam dùng gì thay vì thang máy?', options: ['Cầu thang bộ', 'Xe đẩy', 'Thang cuốn', 'Không di chuyển'], correct: 0 },
      ],
    },
    listening: [
      'I try not to sit too long.',
      'I stretch every hour.',
      'I take the stairs for exercise.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về thói quen giữ sức khỏe của bạn ở văn phòng.',
      minWords: 15,
      phrases: ['I try not to sit too long', 'I stretch every hour', 'I drink enough water', 'I take the stairs'],
      sentenceBuilder: [
        { scrambled: 'He / (stand up) / to stretch / every hour', answer: 'He stands up to stretch every hour' },
        { scrambled: 'She / (drink) / a glass of water / often', answer: 'She drinks a glass of water often' },
      ],
    },
  },
  { // Day 71
    vocab: [
      { word: 'Eyesight', phonetic: '/ˈaɪsaɪt/', meaning: 'Thị lực',    quiz: { options: ['Thị lực', 'Nghỉ mắt', 'Ánh sáng', 'Nhức đầu'], correct: 0 } },
      { word: 'Eye rest', phonetic: '/aɪ rest/', meaning: 'Nghỉ mắt',   quiz: { options: ['Ánh sáng', 'Nghỉ mắt', 'Thị lực', 'Nhức đầu'], correct: 1 } },
      { word: 'Light',    phonetic: '/laɪt/', meaning: 'Ánh sáng',      quiz: { options: ['Nghỉ mắt', 'Thị lực', 'Ánh sáng', 'Nhức đầu'], correct: 2 } },
      { word: 'Headache', phonetic: '/ˈhedeɪk/', meaning: 'Nhức đầu',   quiz: { options: ['Thị lực', 'Ánh sáng', 'Nghỉ mắt', 'Nhức đầu'], correct: 3 } },
      { word: 'Screen time', phonetic: '/skriːn taɪm/', meaning: 'Thời gian nhìn màn hình', quiz: { options: ['Thời gian nhìn màn hình', 'Nghỉ mắt', 'Ánh sáng', 'Nhức đầu'], correct: 0 } },
    ],
    reading: {
      title: 'Protecting Your Eyes',
      passage: 'Huy spends a lot of screen time looking at his computer, so he takes an eye rest every 30 minutes. He also adjusts the light in his room to protect his eyesight and avoid headaches.',
      quiz: [
        { q: 'Huy làm gì mỗi 30 phút?', options: ['Nghỉ mắt', 'Uống nước', 'Đi vệ sinh', 'Ăn nhẹ'], correct: 0 },
        { q: 'Huy điều chỉnh gì để bảo vệ thị lực?', options: ['Ánh sáng phòng', 'Độ cao ghế', 'Nhiệt độ phòng', 'Âm lượng loa'], correct: 0 },
      ],
    },
    listening: [
      'I need an eye rest.',
      'The light in this room is too dim.',
      'I have a slight headache today.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn bảo vệ mắt khi làm việc nhiều với máy tính.',
      minWords: 15,
      phrases: ['I take an eye rest', 'I adjust the light', 'I protect my eyesight', 'I avoid headaches by'],
      sentenceBuilder: [
        { scrambled: 'He / (take) / an eye rest / every 30 minutes', answer: 'He takes an eye rest every 30 minutes' },
        { scrambled: 'She / (adjust) / the light / in her room', answer: 'She adjusts the light in her room' },
      ],
    },
  },
  { // Day 72
    vocab: [
      { word: 'Healthy snack', phonetic: '/ˈhelθi snæk/', meaning: 'Đồ ăn vặt lành mạnh', quiz: { options: ['Đồ ăn vặt lành mạnh', 'Đồ uống có đường', 'Trái cây', 'Bữa ăn cân bằng'], correct: 0 } },
      { word: 'Sugary drink', phonetic: '/ˈʃʊɡəri drɪŋk/', meaning: 'Đồ uống có đường', quiz: { options: ['Trái cây', 'Đồ uống có đường', 'Bữa ăn cân bằng', 'Đồ ăn vặt lành mạnh'], correct: 1 } },
      { word: 'Fruit',    phonetic: '/fruːt/', meaning: 'Trái cây',      quiz: { options: ['Đồ uống có đường', 'Đồ ăn vặt lành mạnh', 'Trái cây', 'Bữa ăn cân bằng'], correct: 2 } },
      { word: 'Balanced meal', phonetic: '/ˈbælənst miːl/', meaning: 'Bữa ăn cân bằng', quiz: { options: ['Bữa ăn cân bằng', 'Trái cây', 'Đồ uống có đường', 'Đồ ăn vặt lành mạnh'], correct: 0 } },
      { word: 'Avoid',    phonetic: '/əˈvɔɪd/', meaning: 'Tránh',       quiz: { options: ['Tránh', 'Bữa ăn cân bằng', 'Trái cây', 'Đồ uống có đường'], correct: 0 } },
    ],
    reading: {
      title: 'Eating Well at Work',
      passage: 'Mai brings fruit and healthy snacks to the office instead of sugary drinks. She tries to eat a balanced meal at lunch and avoid too much fast food. This helps her stay energetic all day.',
      quiz: [
        { q: 'Mai mang gì đến công ty?', options: ['Trái cây và đồ ăn vặt lành mạnh', 'Đồ uống có đường', 'Bánh kẹo ngọt', 'Thức ăn nhanh'], correct: 0 },
        { q: 'Mai tránh điều gì?', options: ['Ăn quá nhiều thức ăn nhanh', 'Uống nước', 'Ăn trái cây', 'Nghỉ trưa'], correct: 0 },
      ],
    },
    listening: [
      'I bring fruit to the office.',
      'I try to eat a balanced meal.',
      'I avoid sugary drinks.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về thói quen ăn uống lành mạnh của bạn ở nơi làm việc.',
      minWords: 15,
      phrases: ['I bring healthy snacks', 'I try to eat a balanced meal', 'I avoid sugary drinks', 'I eat fruit every day'],
      sentenceBuilder: [
        { scrambled: 'She / (bring) / fruit / to the office', answer: 'She brings fruit to the office' },
        { scrambled: 'He / (avoid) / sugary drinks / at work', answer: 'He avoids sugary drinks at work' },
      ],
    },
  },
  { // Day 73
    vocab: [
      { word: 'Sleep',    phonetic: '/sliːp/', meaning: 'Giấc ngủ',     quiz: { options: ['Giấc ngủ', 'Năng lượng', 'Sảng khoái', 'Đi ngủ sớm'], correct: 0 } },
      { word: 'Energy',   phonetic: '/ˈenərdʒi/', meaning: 'Năng lượng', quiz: { options: ['Sảng khoái', 'Năng lượng', 'Giấc ngủ', 'Đi ngủ sớm'], correct: 1 } },
      { word: 'Refreshed', phonetic: '/rɪˈfreʃt/', meaning: 'Sảng khoái', quiz: { options: ['Giấc ngủ', 'Năng lượng', 'Sảng khoái', 'Đi ngủ sớm'], correct: 2 } },
      { word: 'Go to bed early', phonetic: '/ɡəʊ tuː bed ˈɜːrli/', meaning: 'Đi ngủ sớm', quiz: { options: ['Đi ngủ sớm', 'Giấc ngủ', 'Năng lượng', 'Sảng khoái'], correct: 0 } },
      { word: 'Enough',   phonetic: '/ɪˈnʌf/', meaning: 'Đủ',           quiz: { options: ['Đủ', 'Đi ngủ sớm', 'Sảng khoái', 'Năng lượng'], correct: 0 } },
    ],
    reading: {
      title: 'Getting Enough Sleep',
      passage: 'Duc goes to bed early to get enough sleep every night. He wakes up feeling refreshed and full of energy for work. Good sleep helps him focus better during the day.',
      quiz: [
        { q: 'Đức làm gì để có giấc ngủ đủ?', options: ['Đi ngủ sớm', 'Uống cà phê', 'Ngủ trưa dài', 'Thức khuya làm việc'], correct: 0 },
        { q: 'Giấc ngủ tốt giúp Đức điều gì?', options: ['Tập trung tốt hơn', 'Ăn nhiều hơn', 'Mệt hơn', 'Chậm chạp hơn'], correct: 0 },
      ],
    },
    listening: [
      'I try to go to bed early.',
      'I feel refreshed this morning.',
      'I need enough sleep every night.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về thói quen ngủ của bạn và ảnh hưởng đến công việc.',
      minWords: 15,
      phrases: ['I go to bed early', 'I get enough sleep', 'I feel refreshed', 'Good sleep helps me focus'],
      sentenceBuilder: [
        { scrambled: 'He / (go) / to bed early / every night', answer: 'He goes to bed early every night' },
        { scrambled: 'She / (feel) / refreshed / every morning', answer: 'She feels refreshed every morning' },
      ],
    },
  },
  // ---------- WEEK: Team building (Day 74-78) ----------
  { // Day 74
    vocab: [
      { word: 'Activity', phonetic: '/ækˈtɪvəti/', meaning: 'Hoạt động', quiz: { options: ['Hoạt động', 'Trò chơi', 'Đội (nhóm nhỏ)', 'Chiến thắng'], correct: 0 } },
      { word: 'Game',     phonetic: '/ɡeɪm/', meaning: 'Trò chơi',       quiz: { options: ['Đội (nhóm nhỏ)', 'Trò chơi', 'Chiến thắng', 'Hoạt động'], correct: 1 } },
      { word: 'Group',    phonetic: '/ɡruːp/', meaning: 'Đội (nhóm nhỏ)', quiz: { options: ['Trò chơi', 'Chiến thắng', 'Đội (nhóm nhỏ)', 'Hoạt động'], correct: 2 } },
      { word: 'Win',      phonetic: '/wɪn/', meaning: 'Chiến thắng',     quiz: { options: ['Hoạt động', 'Đội (nhóm nhỏ)', 'Trò chơi', 'Chiến thắng'], correct: 3 } },
      { word: 'Cooperate', phonetic: '/kəʊˈɒpəreɪt/', meaning: 'Hợp tác', quiz: { options: ['Hợp tác', 'Trò chơi', 'Đội (nhóm nhỏ)', 'Chiến thắng'], correct: 0 } },
    ],
    reading: {
      title: 'A Team Building Activity',
      passage: 'The company organizes a team building activity with fun games. Each group has to cooperate well to win the challenge. Everyone laughs and enjoys the day together.',
      quiz: [
        { q: 'Công ty tổ chức sự kiện gì?', options: ['Hoạt động team building', 'Họp thường niên', 'Đào tạo kỹ năng', 'Khám sức khỏe'], correct: 0 },
        { q: 'Mỗi nhóm cần làm gì để chiến thắng?', options: ['Hợp tác tốt', 'Làm việc một mình', 'Cạnh tranh gay gắt', 'Không tham gia'], correct: 0 },
      ],
    },
    listening: [
      'Let\'s join the team building activity.',
      'Our group needs to cooperate well.',
      'Which team will win the game?',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một hoạt động team building bạn đã tham gia.',
      minWords: 15,
      phrases: ['We join a team building activity', 'Our group cooperates well', 'We try to win the game', 'Everyone enjoys the day'],
      sentenceBuilder: [
        { scrambled: 'The company / (organize) / a team building activity', answer: 'The company organizes a team building activity' },
        { scrambled: 'Each group / (cooperate) / to win', answer: 'Each group cooperates to win' },
      ],
    },
  },
  { // Day 75
    vocab: [
      { word: 'Trust',    phonetic: '/trʌst/', meaning: 'Tin tưởng',    quiz: { options: ['Tin tưởng', 'Hỗ trợ', 'Xây dựng', 'Gắn kết'], correct: 0 } },
      { word: 'Support',  phonetic: '/səˈpɔːrt/', meaning: 'Hỗ trợ',    quiz: { options: ['Xây dựng', 'Hỗ trợ', 'Gắn kết', 'Tin tưởng'], correct: 1 } },
      { word: 'Build',    phonetic: '/bɪld/', meaning: 'Xây dựng',       quiz: { options: ['Hỗ trợ', 'Gắn kết', 'Xây dựng', 'Tin tưởng'], correct: 2 } },
      { word: 'Bond',     phonetic: '/bɒnd/', meaning: 'Gắn kết',       quiz: { options: ['Tin tưởng', 'Xây dựng', 'Hỗ trợ', 'Gắn kết'], correct: 3 } },
      { word: 'Teamwork', phonetic: '/ˈtiːmwɜːrk/', meaning: 'Tinh thần đồng đội', quiz: { options: ['Tinh thần đồng đội', 'Xây dựng', 'Gắn kết', 'Hỗ trợ'], correct: 0 } },
    ],
    reading: {
      title: 'Building Trust in the Team',
      passage: 'Trang believes that trust is important for good teamwork. She always tries to support her colleagues and build a strong bond with them. This helps the whole team work better together.',
      quiz: [
        { q: 'Trang nghĩ điều gì quan trọng cho tinh thần đồng đội?', options: ['Sự tin tưởng', 'Tiền lương cao', 'Giờ làm việc ít', 'Văn phòng đẹp'], correct: 0 },
        { q: 'Trang làm gì với đồng nghiệp?', options: ['Hỗ trợ và xây dựng gắn kết', 'Cạnh tranh với họ', 'Tránh mặt họ', 'Chỉ làm việc riêng'], correct: 0 },
      ],
    },
    listening: [
      'Trust is important for teamwork.',
      'I try to support my colleagues.',
      'We build a strong bond together.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về tinh thần đồng đội và sự tin tưởng trong nhóm của bạn.',
      minWords: 15,
      phrases: ['Trust is important for', 'I support my colleagues', 'We build a strong bond', 'Our teamwork is'],
      sentenceBuilder: [
        { scrambled: 'She / (support) / her colleagues / every day', answer: 'She supports her colleagues every day' },
        { scrambled: 'They / (build) / a strong bond / together', answer: 'They build a strong bond together' },
      ],
    },
  },
  { // Day 76
    vocab: [
      { word: 'Outing',   phonetic: '/ˈaʊtɪŋ/', meaning: 'Chuyến đi chơi', quiz: { options: ['Chuyến đi chơi', 'Vui vẻ', 'Chụp ảnh nhóm', 'Kỷ niệm'], correct: 0 } },
      { word: 'Fun',      phonetic: '/fʌn/', meaning: 'Vui vẻ',         quiz: { options: ['Chụp ảnh nhóm', 'Vui vẻ', 'Kỷ niệm', 'Chuyến đi chơi'], correct: 1 } },
      { word: 'Group photo', phonetic: '/ɡruːp ˈfəʊtəʊ/', meaning: 'Chụp ảnh nhóm', quiz: { options: ['Vui vẻ', 'Kỷ niệm', 'Chụp ảnh nhóm', 'Chuyến đi chơi'], correct: 2 } },
      { word: 'Memory',   phonetic: '/ˈmeməri/', meaning: 'Kỷ niệm',    quiz: { options: ['Chuyến đi chơi', 'Chụp ảnh nhóm', 'Vui vẻ', 'Kỷ niệm'], correct: 3 } },
      { word: 'Enjoy',    phonetic: '/ɪnˈdʒɔɪ/', meaning: 'Tận hưởng',   quiz: { options: ['Tận hưởng', 'Vui vẻ', 'Chụp ảnh nhóm', 'Kỷ niệm'], correct: 0 } },
    ],
    reading: {
      title: 'A Company Outing',
      passage: 'Once a year, the company organizes a fun outing to the beach. Everyone enjoys the trip and takes a group photo to remember the day. It creates good memories for the whole team.',
      quiz: [
        { q: 'Công ty tổ chức chuyến đi chơi bao lâu một lần?', options: ['Mỗi năm một lần', 'Mỗi tháng', 'Mỗi tuần', 'Không bao giờ'], correct: 0 },
        { q: 'Mọi người làm gì để ghi nhớ chuyến đi?', options: ['Chụp ảnh nhóm', 'Viết nhật ký', 'Quay video dài', 'Không làm gì'], correct: 0 },
      ],
    },
    listening: [
      'We have a fun outing every year.',
      'Let\'s take a group photo!',
      'This trip creates good memories.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một chuyến đi chơi cùng công ty mà bạn thích.',
      minWords: 15,
      phrases: ['We have a company outing', 'Everyone enjoys the trip', 'We take a group photo', 'It creates good memories'],
      sentenceBuilder: [
        { scrambled: 'The company / (organize) / a fun outing / every year', answer: 'The company organizes a fun outing every year' },
        { scrambled: 'They / (take) / a group photo / together', answer: 'They take a group photo together' },
      ],
    },
  },
  { // Day 77
    vocab: [
      { word: 'Volunteer', phonetic: '/ˌvɒlənˈtɪər/', meaning: 'Tình nguyện viên', quiz: { options: ['Tình nguyện viên', 'Cộng đồng', 'Giúp đỡ', 'Đóng góp (từ thiện)'], correct: 0 } },
      { word: 'Community', phonetic: '/kəˈmjuːnəti/', meaning: 'Cộng đồng', quiz: { options: ['Giúp đỡ', 'Cộng đồng', 'Đóng góp (từ thiện)', 'Tình nguyện viên'], correct: 1 } },
      { word: 'Help',     phonetic: '/help/', meaning: 'Giúp đỡ',       quiz: { options: ['Cộng đồng', 'Đóng góp (từ thiện)', 'Giúp đỡ', 'Tình nguyện viên'], correct: 2 } },
      { word: 'Donate',   phonetic: '/dəʊˈneɪt/', meaning: 'Đóng góp (từ thiện)', quiz: { options: ['Tình nguyện viên', 'Giúp đỡ', 'Cộng đồng', 'Đóng góp (từ thiện)'], correct: 3 } },
      { word: 'Meaningful', phonetic: '/ˈmiːnɪŋfl/', meaning: 'Ý nghĩa', quiz: { options: ['Ý nghĩa', 'Giúp đỡ', 'Cộng đồng', 'Tình nguyện viên'], correct: 0 } },
    ],
    reading: {
      title: 'A Volunteer Day',
      passage: 'The team spends a day as volunteers helping a local community. Everyone donates a little money and time to help children in need. Huy feels this is a meaningful team activity.',
      quiz: [
        { q: 'Đội nhóm dành một ngày làm gì?', options: ['Làm tình nguyện viên', 'Nghỉ ngơi ở nhà', 'Đi mua sắm', 'Xem phim'], correct: 0 },
        { q: 'Mọi người đóng góp gì?', options: ['Tiền và thời gian', 'Chỉ tiền', 'Chỉ thời gian', 'Không đóng góp gì'], correct: 0 },
      ],
    },
    listening: [
      'We volunteer for the community today.',
      'Everyone donates a little time and money.',
      'This is a meaningful activity for our team.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một hoạt động tình nguyện của công ty bạn.',
      minWords: 15,
      phrases: ['We volunteer for the community', 'We donate time and money', 'This activity is meaningful', 'We help children in need'],
      sentenceBuilder: [
        { scrambled: 'The team / (spend) / a day / volunteering', answer: 'The team spends a day volunteering' },
        { scrambled: 'He / (feel) / this is / meaningful', answer: 'He feels this is meaningful' },
      ],
    },
  },
  { // Day 78
    vocab: [
      { word: 'Icebreaker', phonetic: '/ˈaɪsbreɪkər/', meaning: 'Trò chơi làm quen', quiz: { options: ['Trò chơi làm quen', 'Vòng tròn', 'Chia sẻ câu chuyện', 'Cười'], correct: 0 } },
      { word: 'Circle',   phonetic: '/ˈsɜːrkl/', meaning: 'Vòng tròn',   quiz: { options: ['Chia sẻ câu chuyện', 'Vòng tròn', 'Cười', 'Trò chơi làm quen'], correct: 1 } },
      { word: 'Tell a story', phonetic: '/tel ə ˈstɔːri/', meaning: 'Chia sẻ câu chuyện', quiz: { options: ['Vòng tròn', 'Cười', 'Chia sẻ câu chuyện', 'Trò chơi làm quen'], correct: 2 } },
      { word: 'Laugh',    phonetic: '/læf/', meaning: 'Cười',           quiz: { options: ['Trò chơi làm quen', 'Vòng tròn', 'Chia sẻ câu chuyện', 'Cười'], correct: 3 } },
      { word: 'Comfortable', phonetic: '/ˈkʌmftəbl/', meaning: 'Thoải mái', quiz: { options: ['Thoải mái', 'Vòng tròn', 'Cười', 'Chia sẻ câu chuyện'], correct: 0 } },
    ],
    reading: {
      title: 'Breaking the Ice',
      passage: 'Before the meeting, the team sits in a circle to play an icebreaker game. Everyone tells a story about their weekend and laughs together. This makes new members feel more comfortable.',
      quiz: [
        { q: 'Đội nhóm ngồi theo hình gì?', options: ['Vòng tròn', 'Hàng dài', 'Chữ U', 'Ngẫu nhiên'], correct: 0 },
        { q: 'Trò chơi làm quen giúp ích gì cho thành viên mới?', options: ['Cảm thấy thoải mái hơn', 'Học được kỹ năng mới', 'Kiếm thêm tiền', 'Nghỉ sớm hơn'], correct: 0 },
      ],
    },
    listening: [
      'Let\'s play an icebreaker game.',
      'We sit in a circle and tell a story.',
      'Everyone laughs and feels comfortable.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về một trò chơi làm quen bạn đã chơi cùng đồng nghiệp.',
      minWords: 15,
      phrases: ['We play an icebreaker game', 'We sit in a circle', 'Everyone tells a story', 'We feel more comfortable'],
      sentenceBuilder: [
        { scrambled: 'The team / (sit) / in a circle / together', answer: 'The team sits in a circle together' },
        { scrambled: 'Everyone / (tell) / a story / about their weekend', answer: 'Everyone tells a story about their weekend' },
      ],
    },
  },
  // ---------- WEEK: Danh gia cuoi tuan (Day 79-83) ----------
  { // Day 79
    vocab: [
      { word: 'Summary',  phonetic: '/ˈsʌməri/', meaning: 'Tóm tắt',    quiz: { options: ['Tóm tắt', 'Hoàn thành', 'Còn dang dở', 'Ưu tiên'], correct: 0 } },
      { word: 'Complete', phonetic: '/kəmˈpliːt/', meaning: 'Hoàn thành', quiz: { options: ['Còn dang dở', 'Hoàn thành', 'Ưu tiên', 'Tóm tắt'], correct: 1 } },
      { word: 'Unfinished', phonetic: '/ʌnˈfɪnɪʃt/', meaning: 'Còn dang dở', quiz: { options: ['Hoàn thành', 'Ưu tiên', 'Còn dang dở', 'Tóm tắt'], correct: 2 } },
      { word: 'Priority', phonetic: '/praɪˈɒrəti/', meaning: 'Ưu tiên', quiz: { options: ['Tóm tắt', 'Còn dang dở', 'Hoàn thành', 'Ưu tiên'], correct: 3 } },
      { word: 'Wrap up',  phonetic: '/ræp ʌp/', meaning: 'Kết thúc (công việc)', quiz: { options: ['Kết thúc (công việc)', 'Hoàn thành', 'Còn dang dở', 'Ưu tiên'], correct: 0 } },
    ],
    reading: {
      title: 'End of Week Summary',
      passage: 'Every Friday, Linh writes a short summary of her work. She lists what tasks are complete and which ones are still unfinished. Then she sets her priorities to wrap up the week smoothly.',
      quiz: [
        { q: 'Linh viết gì vào mỗi thứ Sáu?', options: ['Tóm tắt công việc', 'Đơn xin nghỉ', 'Email cho khách hàng', 'Bảng lương'], correct: 0 },
        { q: 'Linh liệt kê những gì trong bản tóm tắt?', options: ['Việc hoàn thành và chưa hoàn thành', 'Chỉ việc hoàn thành', 'Chỉ việc chưa làm', 'Danh sách đồng nghiệp'], correct: 0 },
      ],
    },
    listening: [
      'I write a summary every Friday.',
      'This task is complete now.',
      'I need to set my priorities.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu tóm tắt công việc bạn đã hoàn thành trong tuần này.',
      minWords: 15,
      phrases: ['I write a summary of', 'This task is complete', 'This one is still unfinished', 'My priority is'],
      sentenceBuilder: [
        { scrambled: 'She / (write) / a summary / every Friday', answer: 'She writes a summary every Friday' },
        { scrambled: 'He / (set) / his priorities / for next week', answer: 'He sets his priorities for next week' },
      ],
    },
  },
  { // Day 80
    vocab: [
      { word: 'Achievement', phonetic: '/əˈtʃiːvmənt/', meaning: 'Thành tích', quiz: { options: ['Thành tích', 'Thử thách', 'Bài học', 'Kế hoạch'], correct: 0 } },
      { word: 'Challenge', phonetic: '/ˈtʃælɪndʒ/', meaning: 'Thử thách', quiz: { options: ['Bài học', 'Thử thách', 'Kế hoạch', 'Thành tích'], correct: 1 } },
      { word: 'Lesson',   phonetic: '/ˈlesn/', meaning: 'Bài học',      quiz: { options: ['Thử thách', 'Kế hoạch', 'Bài học', 'Thành tích'], correct: 2 } },
      { word: 'Plan',     phonetic: '/plæn/', meaning: 'Kế hoạch',      quiz: { options: ['Thành tích', 'Bài học', 'Thử thách', 'Kế hoạch'], correct: 3 } },
      { word: 'Reflect',  phonetic: '/rɪˈflekt/', meaning: 'Nhìn lại, suy ngẫm', quiz: { options: ['Nhìn lại, suy ngẫm', 'Thử thách', 'Bài học', 'Kế hoạch'], correct: 0 } },
    ],
    reading: {
      title: 'Reflecting on the Week',
      passage: 'At the end of the week, Nam reflects on his achievements and challenges. He learns a good lesson from a difficult project. Then he makes a plan for the following week.',
      quiz: [
        { q: 'Nam làm gì cuối tuần?', options: ['Nhìn lại thành tích và thử thách', 'Đi du lịch', 'Nghỉ việc', 'Không làm gì'], correct: 0 },
        { q: 'Nam học được gì từ dự án khó?', options: ['Một bài học tốt', 'Không học được gì', 'Cách nghỉ việc', 'Cách trốn việc'], correct: 0 },
      ],
    },
    listening: [
      'Let\'s reflect on this week.',
      'I learned a good lesson from this.',
      'I have a plan for next week.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu nhìn lại thành tích và bài học của tuần này.',
      minWords: 15,
      phrases: ['I reflect on this week', 'My achievement is', 'I learned a lesson from', 'My plan for next week is'],
      sentenceBuilder: [
        { scrambled: 'He / (reflect) / on his achievements / every week', answer: 'He reflects on his achievements every week' },
        { scrambled: 'She / (make) / a plan / for next week', answer: 'She makes a plan for next week' },
      ],
    },
  },
  { // Day 81
    vocab: [
      { word: 'Productive', phonetic: '/prəˈdʌktɪv/', meaning: 'Năng suất, hiệu quả', quiz: { options: ['Năng suất, hiệu quả', 'Trì hoãn', 'Tập trung', 'Xao nhãng'], correct: 0 } },
      { word: 'Procrastinate', phonetic: '/prəˈkræstɪneɪt/', meaning: 'Trì hoãn', quiz: { options: ['Tập trung', 'Trì hoãn', 'Xao nhãng', 'Năng suất, hiệu quả'], correct: 1 } },
      { word: 'Focus',    phonetic: '/ˈfəʊkəs/', meaning: 'Tập trung',   quiz: { options: ['Trì hoãn', 'Xao nhãng', 'Tập trung', 'Năng suất, hiệu quả'], correct: 2 } },
      { word: 'Distracted', phonetic: '/dɪˈstræktɪd/', meaning: 'Bị xao nhãng', quiz: { options: ['Năng suất, hiệu quả', 'Tập trung', 'Trì hoãn', 'Bị xao nhãng'], correct: 3 } },
      { word: 'Manage time', phonetic: '/ˈmænɪdʒ taɪm/', meaning: 'Quản lý thời gian', quiz: { options: ['Quản lý thời gian', 'Tập trung', 'Trì hoãn', 'Bị xao nhãng'], correct: 0 } },
    ],
    reading: {
      title: 'Being Productive',
      passage: 'Hoa wants to be more productive this week. She sometimes gets distracted by her phone and tends to procrastinate small tasks. Now she tries to focus better and manage her time well.',
      quiz: [
        { q: 'Điều gì khiến Hoa bị xao nhãng?', options: ['Điện thoại', 'Đồng nghiệp', 'Tiếng ồn', 'Ánh sáng'], correct: 0 },
        { q: 'Hoa cố gắng làm gì?', options: ['Tập trung và quản lý thời gian tốt hơn', 'Nghỉ việc', 'Ngủ nhiều hơn', 'Làm việc chậm hơn'], correct: 0 },
      ],
    },
    listening: [
      'I want to be more productive.',
      'I sometimes procrastinate small tasks.',
      'I try to focus and manage my time.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn cải thiện năng suất làm việc.',
      minWords: 15,
      phrases: ['I want to be more productive', 'I try not to procrastinate', 'I focus better when', 'I manage my time by'],
      sentenceBuilder: [
        { scrambled: 'She / (try) / to focus / better', answer: 'She tries to focus better' },
        { scrambled: 'He / (manage) / his time / well', answer: 'He manages his time well' },
      ],
    },
  },
  { // Day 82
    vocab: [
      { word: 'Highlight', phonetic: '/ˈhaɪlaɪt/', meaning: 'Điểm nổi bật', quiz: { options: ['Điểm nổi bật', 'Trở ngại', 'Chú thích', 'Cải thiện'], correct: 0 } },
      { word: 'Obstacle', phonetic: '/ˈɒbstəkl/', meaning: 'Trở ngại',   quiz: { options: ['Chú thích', 'Trở ngại', 'Cải thiện', 'Điểm nổi bật'], correct: 1 } },
      { word: 'Note down', phonetic: '/nəʊt daʊn/', meaning: 'Ghi chú lại', quiz: { options: ['Trở ngại', 'Cải thiện', 'Ghi chú lại', 'Điểm nổi bật'], correct: 2 } },
      { word: 'Improve on', phonetic: '/ɪmˈpruːv ɒn/', meaning: 'Cải thiện thêm', quiz: { options: ['Điểm nổi bật', 'Trở ngại', 'Ghi chú lại', 'Cải thiện thêm'], correct: 3 } },
      { word: 'Overall',  phonetic: '/ˌəʊvərˈɔːl/', meaning: 'Nhìn chung', quiz: { options: ['Nhìn chung', 'Trở ngại', 'Ghi chú lại', 'Điểm nổi bật'], correct: 0 } },
    ],
    reading: {
      title: 'A Weekly Report',
      passage: 'Phong writes a weekly report with the highlights of his work. He also notes down any obstacle he faced during the week. Overall, he feels there is still room to improve on his time management.',
      quiz: [
        { q: 'Phong viết cái gì hàng tuần?', options: ['Báo cáo tuần', 'Đơn xin nghỉ', 'Thư cảm ơn', 'Danh sách khách hàng'], correct: 0 },
        { q: 'Phong ghi chú lại điều gì?', options: ['Trở ngại gặp phải', 'Lịch nghỉ phép', 'Số điện thoại đồng nghiệp', 'Món ăn yêu thích'], correct: 0 },
      ],
    },
    listening: [
      'Here are the highlights of my week.',
      'I faced an obstacle this week.',
      'Overall, I need to improve on time management.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về điểm nổi bật và trở ngại trong tuần làm việc của bạn.',
      minWords: 15,
      phrases: ['The highlight of my week is', 'I faced an obstacle when', 'I note down', 'Overall, I feel'],
      sentenceBuilder: [
        { scrambled: 'He / (write) / a weekly report / every Friday', answer: 'He writes a weekly report every Friday' },
        { scrambled: 'She / (note down) / any obstacle / she faces', answer: 'She notes down any obstacle she faces' },
      ],
    },
  },
  { // Day 83
    vocab: [
      { word: 'Next step', phonetic: '/nekst step/', meaning: 'Bước tiếp theo', quiz: { options: ['Bước tiếp theo', 'Cải thiện', 'Đạt được', 'Đặt mục tiêu'], correct: 0 } },
      { word: 'Progress on', phonetic: '/ˈprəʊɡres ɒn/', meaning: 'Tiến bộ về', quiz: { options: ['Đạt được', 'Tiến bộ về', 'Đặt mục tiêu', 'Bước tiếp theo'], correct: 1 } },
      { word: 'Achieve',  phonetic: '/əˈtʃiːv/', meaning: 'Đạt được',    quiz: { options: ['Bước tiếp theo', 'Đặt mục tiêu', 'Đạt được', 'Tiến bộ về'], correct: 2 } },
      { word: 'Set a goal', phonetic: '/set ə ɡəʊl/', meaning: 'Đặt mục tiêu', quiz: { options: ['Tiến bộ về', 'Đạt được', 'Bước tiếp theo', 'Đặt mục tiêu'], correct: 3 } },
      { word: 'Look forward to', phonetic: '/lʊk ˈfɔːrwərd tuː/', meaning: 'Mong chờ',  quiz: { options: ['Mong chờ', 'Đạt được', 'Bước tiếp theo', 'Tiến bộ về'], correct: 0 } },
    ],
    reading: {
      title: 'Planning the Next Step',
      passage: 'Ngoc is proud of the progress she made on her project this week. She sets a new goal to achieve by next Friday. She looks forward to taking the next step in her work.',
      quiz: [
        { q: 'Ngọc tự hào về điều gì?', options: ['Tiến bộ trong dự án tuần này', 'Kỳ nghỉ sắp tới', 'Bữa trưa hôm nay', 'Đồng nghiệp mới'], correct: 0 },
        { q: 'Ngọc mong chờ điều gì?', options: ['Bước tiếp theo trong công việc', 'Ngày nghỉ lễ', 'Chuyến công tác', 'Kỳ lương mới'], correct: 0 },
      ],
    },
    listening: [
      'I made good progress this week.',
      'I set a new goal for next Friday.',
      'I look forward to the next step.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về mục tiêu và bước tiếp theo trong công việc của bạn.',
      minWords: 15,
      phrases: ['I made progress on', 'I set a new goal', 'I want to achieve', 'I look forward to'],
      sentenceBuilder: [
        { scrambled: 'She / (set) / a new goal / for next week', answer: 'She sets a new goal for next week' },
        { scrambled: 'He / (look forward to) / the next step', answer: 'He looks forward to the next step' },
      ],
    },
  },
  // ---------- WEEK: Ky nang may tinh co ban (Day 84-90) ----------
  { // Day 84
    vocab: [
      { word: 'Spreadsheet', phonetic: '/ˈspredʃiːt/', meaning: 'Bảng tính', quiz: { options: ['Bảng tính', 'Công thức', 'Cột', 'Hàng'], correct: 0 } },
      { word: 'Formula',  phonetic: '/ˈfɔːrmjələ/', meaning: 'Công thức', quiz: { options: ['Cột', 'Công thức', 'Hàng', 'Bảng tính'], correct: 1 } },
      { word: 'Column',   phonetic: '/ˈkɒləm/', meaning: 'Cột',          quiz: { options: ['Công thức', 'Hàng', 'Cột', 'Bảng tính'], correct: 2 } },
      { word: 'Row',      phonetic: '/rəʊ/', meaning: 'Hàng',            quiz: { options: ['Bảng tính', 'Cột', 'Công thức', 'Hàng'], correct: 3 } },
      { word: 'Enter data', phonetic: '/ˈentər ˈdeɪtə/', meaning: 'Nhập dữ liệu', quiz: { options: ['Nhập dữ liệu', 'Cột', 'Hàng', 'Công thức'], correct: 0 } },
    ],
    reading: {
      title: 'Working with Spreadsheets',
      passage: 'Tuan enters data into a spreadsheet every day. He uses a simple formula to add numbers in each column. When he adds a new row, the total updates automatically.',
      quiz: [
        { q: 'Tuấn làm gì mỗi ngày?', options: ['Nhập dữ liệu vào bảng tính', 'Gửi email', 'In tài liệu', 'Gọi điện khách hàng'], correct: 0 },
        { q: 'Điều gì xảy ra khi Tuấn thêm một hàng mới?', options: ['Tổng số tự cập nhật', 'Bảng tính bị xóa', 'Máy tính bị treo', 'Không có gì thay đổi'], correct: 0 },
      ],
    },
    listening: [
      'I enter data into the spreadsheet.',
      'This formula adds the numbers.',
      'I need to add a new row.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn sử dụng bảng tính trong công việc.',
      minWords: 15,
      phrases: ['I enter data into', 'I use a formula to', 'I add a new column', 'I add a new row'],
      sentenceBuilder: [
        { scrambled: 'He / (enter) / data / every day', answer: 'He enters data every day' },
        { scrambled: 'She / (use) / a formula / to add numbers', answer: 'She uses a formula to add numbers' },
      ],
    },
  },
  { // Day 85
    vocab: [
      { word: 'Slide',    phonetic: '/slaɪd/', meaning: 'Trang chiếu (slide)', quiz: { options: ['Trang chiếu (slide)', 'Bài thuyết trình', 'Hình nền', 'Phông chữ'], correct: 0 } },
      { word: 'Presentation', phonetic: '/ˌpreznˈteɪʃn/', meaning: 'Bài thuyết trình', quiz: { options: ['Hình nền', 'Bài thuyết trình', 'Phông chữ', 'Trang chiếu (slide)'], correct: 1 } },
      { word: 'Background', phonetic: '/ˈbækɡraʊnd/', meaning: 'Hình nền', quiz: { options: ['Bài thuyết trình', 'Phông chữ', 'Hình nền', 'Trang chiếu (slide)'], correct: 2 } },
      { word: 'Font',     phonetic: '/fɒnt/', meaning: 'Phông chữ',      quiz: { options: ['Trang chiếu (slide)', 'Hình nền', 'Bài thuyết trình', 'Phông chữ'], correct: 3 } },
      { word: 'Design',   phonetic: '/dɪˈzaɪn/', meaning: 'Thiết kế',    quiz: { options: ['Thiết kế', 'Hình nền', 'Phông chữ', 'Trang chiếu (slide)'], correct: 0 } },
    ],
    reading: {
      title: 'Preparing a Presentation',
      passage: 'Mai designs a simple presentation for the team meeting. She picks a clean background and a clear font for each slide. She keeps the design simple so everyone can read it easily.',
      quiz: [
        { q: 'Mai chuẩn bị gì cho cuộc họp?', options: ['Bài thuyết trình', 'Bảng tính', 'Hợp đồng', 'Danh thiếp'], correct: 0 },
        { q: 'Mai chọn thiết kế như thế nào?', options: ['Đơn giản và dễ đọc', 'Nhiều màu sắc rực rỡ', 'Chữ nhỏ khó đọc', 'Không có hình ảnh'], correct: 0 },
      ],
    },
    listening: [
      'I am designing a presentation.',
      'This slide needs a clearer font.',
      'I like a simple background.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn chuẩn bị một bài thuyết trình đơn giản.',
      minWords: 15,
      phrases: ['I design a presentation for', 'I pick a clean background', 'I use a clear font', 'I keep the design simple'],
      sentenceBuilder: [
        { scrambled: 'She / (design) / a simple presentation', answer: 'She designs a simple presentation' },
        { scrambled: 'He / (pick) / a clear font / for the slide', answer: 'He picks a clear font for the slide' },
      ],
    },
  },
  { // Day 86
    vocab: [
      { word: 'Type',     phonetic: '/taɪp/', meaning: 'Gõ (chữ)',       quiz: { options: ['Gõ (chữ)', 'Sao chép', 'Dán', 'Cắt'], correct: 0 } },
      { word: 'Copy',     phonetic: '/ˈkɒpi/', meaning: 'Sao chép',      quiz: { options: ['Dán', 'Sao chép', 'Cắt', 'Gõ (chữ)'], correct: 1 } },
      { word: 'Paste',    phonetic: '/peɪst/', meaning: 'Dán',           quiz: { options: ['Sao chép', 'Cắt', 'Dán', 'Gõ (chữ)'], correct: 2 } },
      { word: 'Cut',      phonetic: '/kʌt/', meaning: 'Cắt',            quiz: { options: ['Gõ (chữ)', 'Dán', 'Sao chép', 'Cắt'], correct: 3 } },
      { word: 'Highlight text', phonetic: '/ˈhaɪlaɪt tekst/', meaning: 'Bôi đen văn bản', quiz: { options: ['Bôi đen văn bản', 'Sao chép', 'Dán', 'Cắt'], correct: 0 } },
    ],
    reading: {
      title: 'Basic Typing Skills',
      passage: 'Duc types his report quickly using the keyboard. He highlights text, then copies and pastes it into another document. Sometimes he cuts a sentence to move it to a different place.',
      quiz: [
        { q: 'Đức làm gì trước khi sao chép văn bản?', options: ['Bôi đen văn bản', 'In tài liệu', 'Lưu tệp', 'Gửi email'], correct: 0 },
        { q: 'Đức dùng thao tác nào để di chuyển câu?', options: ['Cắt', 'Xóa', 'Gõ lại', 'In ra'], correct: 0 },
      ],
    },
    listening: [
      'I type my report quickly.',
      'Please copy and paste this text.',
      'I need to cut this sentence.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về các thao tác cơ bản khi soạn thảo văn bản trên máy tính.',
      minWords: 15,
      phrases: ['I type my report', 'I copy and paste', 'I highlight the text', 'I cut this sentence'],
      sentenceBuilder: [
        { scrambled: 'He / (type) / his report / quickly', answer: 'He types his report quickly' },
        { scrambled: 'She / (copy) / and / (paste) / the text', answer: 'She copies and pastes the text' },
      ],
    },
  },
  { // Day 87
    vocab: [
      { word: 'Shortcut', phonetic: '/ˈʃɔːrtkʌt/', meaning: 'Phím tắt', quiz: { options: ['Phím tắt', 'Nhấp chuột', 'Cuộn (trang)', 'Phóng to'], correct: 0 } },
      { word: 'Click',    phonetic: '/klɪk/', meaning: 'Nhấp chuột',    quiz: { options: ['Cuộn (trang)', 'Nhấp chuột', 'Phóng to', 'Phím tắt'], correct: 1 } },
      { word: 'Scroll',   phonetic: '/skrəʊl/', meaning: 'Cuộn (trang)', quiz: { options: ['Nhấp chuột', 'Phóng to', 'Cuộn (trang)', 'Phím tắt'], correct: 2 } },
      { word: 'Zoom in',  phonetic: '/zuːm ɪn/', meaning: 'Phóng to',   quiz: { options: ['Phím tắt', 'Cuộn (trang)', 'Nhấp chuột', 'Phóng to'], correct: 3 } },
      { word: 'Zoom out', phonetic: '/zuːm aʊt/', meaning: 'Thu nhỏ',   quiz: { options: ['Thu nhỏ', 'Nhấp chuột', 'Phím tắt', 'Cuộn (trang)'], correct: 0 } },
    ],
    reading: {
      title: 'Useful Keyboard Shortcuts',
      passage: 'Trang learns a few keyboard shortcuts to save time. Instead of using the mouse to click every button, she can zoom in or zoom out with just a shortcut. She also scrolls through pages faster now.',
      quiz: [
        { q: 'Trang học gì để tiết kiệm thời gian?', options: ['Phím tắt', 'Ngôn ngữ mới', 'Phần mềm mới', 'Cách gõ nhanh hơn'], correct: 0 },
        { q: 'Trang có thể làm gì nhanh hơn nhờ phím tắt?', options: ['Phóng to, thu nhỏ và cuộn trang', 'Gửi email', 'In tài liệu', 'Lưu tệp'], correct: 0 },
      ],
    },
    listening: [
      'I learn a few keyboard shortcuts.',
      'You can zoom in with this shortcut.',
      'I scroll through the page quickly.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về các phím tắt bạn thường dùng khi làm việc trên máy tính.',
      minWords: 15,
      phrases: ['I use a keyboard shortcut to', 'I zoom in to see', 'I scroll through the page', 'This saves me time'],
      sentenceBuilder: [
        { scrambled: 'She / (learn) / a few shortcuts / to save time', answer: 'She learns a few shortcuts to save time' },
        { scrambled: 'He / (scroll) / through the page / quickly', answer: 'He scrolls through the page quickly' },
      ],
    },
  },
  { // Day 88
    vocab: [
      { word: 'Tab',      phonetic: '/tæb/', meaning: 'Thẻ (trình duyệt)', quiz: { options: ['Thẻ (trình duyệt)', 'Cửa sổ', 'Trình duyệt', 'Đóng lại'], correct: 0 } },
      { word: 'Window',   phonetic: '/ˈwɪndəʊ/', meaning: 'Cửa sổ (chương trình)', quiz: { options: ['Trình duyệt', 'Cửa sổ (chương trình)', 'Đóng lại', 'Thẻ (trình duyệt)'], correct: 1 } },
      { word: 'Browser',  phonetic: '/ˈbraʊzər/', meaning: 'Trình duyệt', quiz: { options: ['Cửa sổ (chương trình)', 'Đóng lại', 'Trình duyệt', 'Thẻ (trình duyệt)'], correct: 2 } },
      { word: 'Close',    phonetic: '/kləʊz/', meaning: 'Đóng lại',      quiz: { options: ['Thẻ (trình duyệt)', 'Trình duyệt', 'Cửa sổ (chương trình)', 'Đóng lại'], correct: 3 } },
      { word: 'Open a new tab', phonetic: '/ˈəʊpən ə njuː tæb/', meaning: 'Mở thẻ mới', quiz: { options: ['Mở thẻ mới', 'Trình duyệt', 'Cửa sổ (chương trình)', 'Đóng lại'], correct: 0 } },
    ],
    reading: {
      title: 'Browsing the Internet',
      passage: 'Linh opens a new tab in her browser to check the company website. She has too many windows open, so she closes the ones she does not need. This helps her computer run faster.',
      quiz: [
        { q: 'Linh mở gì để kiểm tra website công ty?', options: ['Một thẻ mới trong trình duyệt', 'Một tài liệu mới', 'Một ứng dụng mới', 'Một email mới'], correct: 0 },
        { q: 'Vì sao Linh đóng bớt cửa sổ?', options: ['Để máy tính chạy nhanh hơn', 'Vì hết pin', 'Vì hết bộ nhớ', 'Vì hết giờ làm'], correct: 0 },
      ],
    },
    listening: [
      'I open a new tab.',
      'I have too many windows open.',
      'I close the ones I don\'t need.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn sử dụng trình duyệt web trong công việc.',
      minWords: 15,
      phrases: ['I open a new tab', 'I close windows I don\'t need', 'I use a browser to', 'This helps my computer run faster'],
      sentenceBuilder: [
        { scrambled: 'She / (open) / a new tab / in her browser', answer: 'She opens a new tab in her browser' },
        { scrambled: 'He / (close) / windows / he does not need', answer: 'He closes windows he does not need' },
      ],
    },
  },
  { // Day 89
    vocab: [
      { word: 'Search',   phonetic: '/sɜːrtʃ/', meaning: 'Tìm kiếm',    quiz: { options: ['Tìm kiếm', 'Từ khóa', 'Trang web', 'Nhấp vào liên kết'], correct: 0 } },
      { word: 'Keyword',  phonetic: '/ˈkiːwɜːrd/', meaning: 'Từ khóa',  quiz: { options: ['Trang web', 'Từ khóa', 'Nhấp vào liên kết', 'Tìm kiếm'], correct: 1 } },
      { word: 'Website',  phonetic: '/ˈwebsaɪt/', meaning: 'Trang web', quiz: { options: ['Từ khóa', 'Nhấp vào liên kết', 'Trang web', 'Tìm kiếm'], correct: 2 } },
      { word: 'Click a link', phonetic: '/klɪk ə lɪŋk/', meaning: 'Nhấp vào liên kết', quiz: { options: ['Tìm kiếm', 'Trang web', 'Từ khóa', 'Nhấp vào liên kết'], correct: 3 } },
      { word: 'Reliable', phonetic: '/rɪˈlaɪəbl/', meaning: 'Đáng tin cậy', quiz: { options: ['Đáng tin cậy', 'Trang web', 'Từ khóa', 'Tìm kiếm'], correct: 0 } },
    ],
    reading: {
      title: 'Searching for Information',
      passage: 'Huy types a keyword to search for information online. He looks at the results carefully and only clicks a link from a reliable website. This helps him avoid wrong information.',
      quiz: [
        { q: 'Huy gõ gì để tìm kiếm thông tin?', options: ['Từ khóa', 'Địa chỉ email', 'Số điện thoại', 'Tên công ty'], correct: 0 },
        { q: 'Huy chỉ nhấp vào liên kết từ đâu?', options: ['Website đáng tin cậy', 'Bất kỳ website nào', 'Quảng cáo', 'Mạng xã hội'], correct: 0 },
      ],
    },
    listening: [
      'I type a keyword to search.',
      'I check the results carefully.',
      'I only click links from reliable websites.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu về cách bạn tìm kiếm thông tin đáng tin cậy trên mạng.',
      minWords: 15,
      phrases: ['I type a keyword to search', 'I check the results', 'I click a link from', 'I trust reliable websites'],
      sentenceBuilder: [
        { scrambled: 'He / (type) / a keyword / to search', answer: 'He types a keyword to search' },
        { scrambled: 'She / (click) / a link / from a reliable website', answer: 'She clicks a link from a reliable website' },
      ],
    },
  },
  { // Day 90
    vocab: [
      { word: 'Skill set', phonetic: '/skɪl set/', meaning: 'Bộ kỹ năng', quiz: { options: ['Bộ kỹ năng', 'Tự tin', 'Thành thạo', 'Tiếp tục học'], correct: 0 } },
      { word: 'Confident', phonetic: '/ˈkɒnfɪdənt/', meaning: 'Tự tin',  quiz: { options: ['Thành thạo', 'Tự tin', 'Tiếp tục học', 'Bộ kỹ năng'], correct: 1 } },
      { word: 'Skilled',  phonetic: '/skɪld/', meaning: 'Thành thạo',    quiz: { options: ['Tự tin', 'Tiếp tục học', 'Thành thạo', 'Bộ kỹ năng'], correct: 2 } },
      { word: 'Keep learning', phonetic: '/kiːp ˈlɜːrnɪŋ/', meaning: 'Tiếp tục học', quiz: { options: ['Bộ kỹ năng', 'Thành thạo', 'Tự tin', 'Tiếp tục học'], correct: 3 } },
      { word: 'Proud',    phonetic: '/praʊd/', meaning: 'Tự hào',       quiz: { options: ['Tự hào', 'Thành thạo', 'Tự tin', 'Bộ kỹ năng'], correct: 0 } },
    ],
    reading: {
      title: 'My Computer Skill Set',
      passage: 'After 90 days of learning, Ngoc feels more skilled and confident with basic computer tasks. She is proud of her new skill set and plans to keep learning every day. She believes small steps lead to big progress.',
      quiz: [
        { q: 'Sau 90 ngày, Ngọc cảm thấy thế nào?', options: ['Thành thạo và tự tin hơn', 'Chán nản', 'Không thay đổi gì', 'Muốn nghỉ việc'], correct: 0 },
        { q: 'Ngọc dự định làm gì tiếp theo?', options: ['Tiếp tục học mỗi ngày', 'Dừng học tiếng Anh', 'Đổi công việc khác', 'Không học nữa'], correct: 0 },
      ],
    },
    listening: [
      'I feel more confident now.',
      'I am proud of my new skill set.',
      'I will keep learning every day.',
    ],
    writing: {
      prompt: 'Viết 3-5 câu nhìn lại hành trình học tiếng Anh công sở của bạn sau 90 ngày.',
      minWords: 15,
      phrases: ['I feel more confident', 'I am proud of', 'I will keep learning', 'My skill set has improved'],
      sentenceBuilder: [
        { scrambled: 'She / (feel) / more confident / now', answer: 'She feels more confident now' },
        { scrambled: 'He / (keep) / learning / every day', answer: 'He keeps learning every day' },
      ],
    },
  },
      ],
    },
    intermediate: {
      badge: 'B1 - B2',
      days: [
        { // Day 1
          vocab: [
            { word: 'Deadline',   phonetic: '/ˈdedlaɪn/',    meaning: 'Hạn chót',        quiz: { options: ['Phản hồi, góp ý', 'Hạn chót', 'Đàm phán', 'Khách hàng'], correct: 1 } },
            { word: 'Negotiate',  phonetic: '/nɪˈɡoʊʃieɪt/', meaning: 'Đàm phán',        quiz: { options: ['Ưu tiên', 'Khách hàng', 'Đàm phán', 'Hạn chót'], correct: 2 } },
            { word: 'Feedback',   phonetic: '/ˈfiːdbæk/',    meaning: 'Phản hồi, góp ý', quiz: { options: ['Phản hồi, góp ý', 'Ưu tiên', 'Khách hàng', 'Đàm phán'], correct: 0 } },
            { word: 'Prioritize', phonetic: '/praɪˈɒrɪtaɪz/',meaning: 'Ưu tiên',         quiz: { options: ['Hạn chót', 'Ưu tiên', 'Phản hồi, góp ý', 'Khách hàng'], correct: 1 } },
            { word: 'Client',     phonetic: '/ˈklaɪənt/',    meaning: 'Khách hàng',      quiz: { options: ['Đàm phán', 'Hạn chót', 'Khách hàng', 'Ưu tiên'], correct: 2 } },
          ],
          reading: {
            title: 'Handling a Tight Deadline',
            passage: 'Minh received feedback from his manager about the client proposal. The deadline is Friday, so he needs to prioritize the most important sections first. He plans to negotiate a short extension if the design team cannot finish in time.',
            quiz: [
              { q: 'Minh nhận được gì từ quản lý?', options: ['Một hợp đồng mới', 'Phản hồi về đề xuất', 'Một cuộc họp gấp', 'Một email từ khách hàng'], correct: 1 },
              { q: 'Minh dự định làm gì nếu đội thiết kế không kịp?', options: ['Huỷ dự án', 'Đàm phán gia hạn', 'Tự làm hết', 'Báo cáo cấp trên'], correct: 1 },
            ],
          },
          listening: [
            'Could we push the deadline to next Monday?',
            'I really appreciate your feedback on this.',
            'Let\'s prioritize the client-facing tasks first.',
            'I\'d like to negotiate a better timeline.',
          ],
          writing: {
            prompt: 'Viết một email ngắn (tiếng Anh) xin gia hạn deadline cho quản lý của bạn, giải thích lý do ngắn gọn.',
            minWords: 30,
            phrases: ['I would like to request', 'Could we extend the deadline to', 'Thank you for your feedback on', 'I need to prioritize'],
            sentenceBuilder: [
              { scrambled: 'He / (give) / feedback / on the proposal / yesterday', answer: 'He gave feedback on the proposal yesterday' },
              { scrambled: 'We / need / to / (prioritize) / this task', answer: 'We need to prioritize this task' },
            ],
          },
        },
        { // Day 2
          vocab: [
            { word: 'Presentation', phonetic: '/ˌprezənˈteɪʃn/', meaning: 'Bài thuyết trình', quiz: { options: ['Sự phản đối', 'Bài thuyết trình', 'Thuyết phục', 'Xác nhận'], correct: 1 } },
            { word: 'Objection',    phonetic: '/əbˈdʒekʃn/',     meaning: 'Sự phản đối',      quiz: { options: ['Sự phản đối', 'Khung thời gian', 'Xác nhận', 'Thuyết phục'], correct: 0 } },
            { word: 'Persuade',     phonetic: '/pərˈsweɪd/',     meaning: 'Thuyết phục',      quiz: { options: ['Xác nhận', 'Sự phản đối', 'Thuyết phục', 'Khung thời gian'], correct: 2 } },
            { word: 'Timeline',     phonetic: '/ˈtaɪmlaɪn/',     meaning: 'Khung thời gian',  quiz: { options: ['Khung thời gian', 'Bài thuyết trình', 'Xác nhận', 'Sự phản đối'], correct: 0 } },
            { word: 'Confirm',      phonetic: '/kənˈfɜːrm/',     meaning: 'Xác nhận',         quiz: { options: ['Thuyết phục', 'Xác nhận', 'Sự phản đối', 'Bài thuyết trình'], correct: 1 } },
          ],
          reading: {
            title: 'Handling Client Objections',
            passage: 'During the presentation, the client raised an objection about the timeline. Minh tried to persuade them by confirming a revised schedule with extra resources.',
            quiz: [
              { q: 'Khách hàng phản đối điều gì?', options: ['Giá cả', 'Khung thời gian', 'Chất lượng', 'Đội ngũ'], correct: 1 },
              { q: 'Minh làm gì để thuyết phục khách hàng?', options: ['Giảm giá', 'Xác nhận lịch trình mới kèm nguồn lực', 'Huỷ dự án', 'Im lặng'], correct: 1 },
            ],
          },
          listening: [
            'Could you confirm the timeline by Friday?',
            'I understand your objection, let me explain.',
            'We need to persuade the client to accept this offer.',
            'The presentation went well overall.',
          ],
          writing: {
            prompt: 'Viết một email ngắn phản hồi một objection (phản đối) của khách hàng về timeline dự án.',
            minWords: 30,
            phrases: ['I understand your concern about', 'Let me confirm', 'We would like to propose', 'To address this objection'],
            sentenceBuilder: [
              { scrambled: 'The client / (raise) / an objection / during the meeting', answer: 'The client raised an objection during the meeting' },
              { scrambled: 'We / (confirm) / the new timeline / this morning', answer: 'We confirmed the new timeline this morning' },
            ],
          },
        },
        { // Day 3
          vocab: [
            { word: 'Achievement', phonetic: '/əˈtʃiːvmənt/', meaning: 'Thành tựu',     quiz: { options: ['Thành tựu', 'Cải thiện', 'Mục tiêu', 'Điểm mạnh'], correct: 0 } },
            { word: 'Improve',     phonetic: '/ɪmˈpruːv/',   meaning: 'Cải thiện',     quiz: { options: ['Đánh giá', 'Cải thiện', 'Thành tựu', 'Mục tiêu'], correct: 1 } },
            { word: 'Target',      phonetic: '/ˈtɑːrɡɪt/',   meaning: 'Mục tiêu',      quiz: { options: ['Mục tiêu', 'Điểm mạnh', 'Đánh giá', 'Cải thiện'], correct: 0 } },
            { word: 'Evaluate',    phonetic: '/ɪˈvæljueɪt/', meaning: 'Đánh giá',      quiz: { options: ['Thành tựu', 'Mục tiêu', 'Đánh giá', 'Điểm mạnh'], correct: 2 } },
            { word: 'Strength',    phonetic: '/streŋθ/',     meaning: 'Điểm mạnh',     quiz: { options: ['Điểm mạnh', 'Cải thiện', 'Mục tiêu', 'Đánh giá'], correct: 0 } },
          ],
          reading: {
            title: 'Quarterly Performance Review',
            passage: 'At the end of the quarter, managers evaluate each employee\'s achievements and areas to improve. Linh exceeded her sales target and identified communication as her key strength.',
            quiz: [
              { q: 'Quản lý làm gì cuối quý?', options: ['Sa thải nhân viên', 'Đánh giá thành tựu và điểm cần cải thiện', 'Tăng lương cho tất cả', 'Đóng cửa phòng ban'], correct: 1 },
              { q: 'Linh xác định điểm mạnh của mình là gì?', options: ['Quản lý thời gian', 'Giao tiếp', 'Bán hàng', 'Viết báo cáo'], correct: 1 },
            ],
          },
          listening: [
            'Let\'s evaluate your performance this quarter.',
            'You exceeded your target, well done.',
            'I want to improve my time management.',
            'Communication is one of your strengths.',
          ],
          writing: {
            prompt: 'Viết đoạn văn ngắn tự đánh giá thành tích công việc của bạn trong quý vừa qua.',
            minWords: 30,
            phrases: ['I achieved', 'One area I need to improve is', 'My target this quarter was', 'My key strength is'],
            sentenceBuilder: [
              { scrambled: 'She / (exceed) / her target / last quarter', answer: 'She exceeded her target last quarter' },
              { scrambled: 'We / need / to / (improve) / our communication', answer: 'We need to improve our communication' },
            ],
          },
        },

  { // Day 4 - Quản lý dự án 1/5
    vocab: [
      { word: 'Milestone',  phonetic: '/ˈmaɪlstoʊn/',  meaning: 'Cột mốc quan trọng', quiz: { options: ['Cột mốc quan trọng', 'Nguồn lực', 'Phạm vi', 'Rủi ro'], correct: 0 } },
      { word: 'Scope',      phonetic: '/skoʊp/',       meaning: 'Phạm vi công việc',  quiz: { options: ['Rủi ro', 'Phạm vi công việc', 'Cột mốc quan trọng', 'Nguồn lực'], correct: 1 } },
      { word: 'Resource',   phonetic: '/ˈriːsɔːrs/',   meaning: 'Nguồn lực',          quiz: { options: ['Nguồn lực', 'Phạm vi công việc', 'Bên liên quan', 'Cột mốc quan trọng'], correct: 0 } },
      { word: 'Stakeholder',phonetic: '/ˈsteɪkhoʊldər/',meaning: 'Bên liên quan',     quiz: { options: ['Cột mốc quan trọng', 'Bên liên quan', 'Nguồn lực', 'Phạm vi công việc'], correct: 1 } },
      { word: 'Delay',      phonetic: '/dɪˈleɪ/',      meaning: 'Sự chậm trễ',        quiz: { options: ['Sự chậm trễ', 'Cột mốc quan trọng', 'Bên liên quan', 'Phạm vi công việc'], correct: 0 } },
    ],
    reading: {
      title: 'Kicking Off a New Project',
      passage: 'Quan is leading a new software project and just finished defining its scope with the team. He has identified the key stakeholders who need weekly updates and set the first milestone for two weeks from now. If any resource shortage causes a delay, he plans to inform everyone immediately instead of waiting.',
      quiz: [
        { q: 'Quân vừa hoàn thành việc gì?', options: ['Xác định phạm vi dự án', 'Tuyển thêm nhân viên', 'Ký hợp đồng mới', 'Đóng dự án'], correct: 0 },
        { q: 'Quân sẽ làm gì nếu thiếu nguồn lực gây chậm trễ?', options: ['Giấu thông tin', 'Thông báo ngay cho mọi người', 'Tự giải quyết một mình', 'Huỷ dự án'], correct: 1 },
      ],
    },
    listening: [
      'We have reached the first milestone ahead of schedule.',
      'Please keep the project scope as we agreed.',
      'Do we have enough resources for this task?',
      'I need to update the stakeholders about the delay.',
    ],
    writing: {
      prompt: 'Viết một email ngắn thông báo cho các stakeholder về một milestone vừa hoàn thành trong dự án.',
      minWords: 30,
      phrases: ['I am pleased to inform you that', 'We have reached the milestone of', 'Regarding the project scope', 'Due to a resource shortage'],
      sentenceBuilder: [
        { scrambled: 'We / (reach) / the first milestone / last week', answer: 'We reached the first milestone last week' },
        { scrambled: 'The stakeholders / (need) / an update / on the delay', answer: 'The stakeholders need an update on the delay' },
      ],
    },
  },
  { // Day 5 - Quản lý dự án 2/5
    vocab: [
      { word: 'Allocate',   phonetic: '/ˈæləkeɪt/',   meaning: 'Phân bổ',            quiz: { options: ['Phân bổ', 'Phụ thuộc', 'Bàn giao', 'Phạm vi vượt quá'], correct: 0 } },
      { word: 'Dependency', phonetic: '/dɪˈpendənsi/', meaning: 'Sự phụ thuộc',       quiz: { options: ['Bàn giao', 'Phân bổ', 'Sự phụ thuộc', 'Phạm vi vượt quá'], correct: 2 } },
      { word: 'Handover',   phonetic: '/ˈhændoʊvər/',  meaning: 'Bàn giao',           quiz: { options: ['Bàn giao', 'Sự phụ thuộc', 'Phân bổ', 'Phạm vi vượt quá'], correct: 0 } },
      { word: 'Scope creep',phonetic: '/skoʊp kriːp/', meaning: 'Phạm vi vượt quá dự kiến', quiz: { options: ['Sự phụ thuộc', 'Phạm vi vượt quá dự kiến', 'Bàn giao', 'Phân bổ'], correct: 1 } },
      { word: 'Bottleneck', phonetic: '/ˈbɒtlnek/',    meaning: 'Điểm nghẽn',         quiz: { options: ['Điểm nghẽn', 'Bàn giao', 'Phân bổ', 'Sự phụ thuộc'], correct: 0 } },
    ],
    reading: {
      title: 'Avoiding Project Delays',
      passage: 'Thao noticed a bottleneck in the testing phase because the QA team depends on a dependency from another department that has not been resolved. She has allocated two extra developers to help, but she is worried about scope creep if the client keeps adding new requests. The handover to the support team is scheduled for next month.',
      quiz: [
        { q: 'Thảo nhận thấy vấn đề gì trong giai đoạn kiểm thử?', options: ['Điểm nghẽn do phụ thuộc chưa giải quyết', 'Thiếu ngân sách', 'Khách hàng huỷ hợp đồng', 'Nhân viên nghỉ việc'], correct: 0 },
        { q: 'Thảo lo lắng điều gì nếu khách hàng liên tục thêm yêu cầu?', options: ['Bàn giao trễ', 'Phạm vi vượt quá dự kiến', 'Mất khách hàng', 'Giảm ngân sách'], correct: 1 },
      ],
    },
    listening: [
      'We need to allocate more resources to this team.',
      'This dependency is blocking our progress.',
      'The handover will happen next Friday.',
      'Watch out for scope creep on this project.',
    ],
    writing: {
      prompt: 'Viết một đoạn tin nhắn báo cáo cho quản lý về một bottleneck bạn đang gặp trong công việc và cách bạn định giải quyết.',
      minWords: 30,
      phrases: ['We are facing a bottleneck in', 'This task depends on', 'I have allocated', 'To avoid scope creep'],
      sentenceBuilder: [
        { scrambled: 'She / (allocate) / two developers / to the project', answer: 'She allocated two developers to the project' },
        { scrambled: 'The handover / (happen) / next month', answer: 'The handover happens next month' },
      ],
    },
  },
  { // Day 6 - Quản lý dự án 3/5
    vocab: [
      { word: 'Deliverable', phonetic: '/dɪˈlɪvərəbl/', meaning: 'Sản phẩm bàn giao', quiz: { options: ['Sản phẩm bàn giao', 'Tiến độ', 'Ngân sách dự án', 'Rủi ro dự án'], correct: 0 } },
      { word: 'Progress',    phonetic: '/ˈprɒɡres/',    meaning: 'Tiến độ',           quiz: { options: ['Rủi ro dự án', 'Sản phẩm bàn giao', 'Tiến độ', 'Ngân sách dự án'], correct: 2 } },
      { word: 'Budget',      phonetic: '/ˈbʌdʒɪt/',     meaning: 'Ngân sách dự án',   quiz: { options: ['Ngân sách dự án', 'Tiến độ', 'Rủi ro dự án', 'Sản phẩm bàn giao'], correct: 0 } },
      { word: 'Risk',        phonetic: '/rɪsk/',        meaning: 'Rủi ro dự án',      quiz: { options: ['Sản phẩm bàn giao', 'Rủi ro dự án', 'Tiến độ', 'Ngân sách dự án'], correct: 1 } },
      { word: 'On track',    phonetic: '/ɒn træk/',     meaning: 'Đúng tiến độ',      quiz: { options: ['Đúng tiến độ', 'Ngân sách dự án', 'Sản phẩm bàn giao', 'Rủi ro dự án'], correct: 0 } },
    ],
    reading: {
      title: 'Weekly Project Status Meeting',
      passage: 'During the weekly meeting, Dat reported that the project is on track and the first deliverable will be ready by Wednesday. He mentioned that the budget is slightly over what was planned, mainly due to unexpected risks in the supply chain. The team agreed to review progress again next Monday.',
      quiz: [
        { q: 'Đạt báo cáo điều gì về dự án?', options: ['Dự án đang đúng tiến độ', 'Dự án bị huỷ', 'Dự án chậm 1 tháng', 'Dự án hết ngân sách'], correct: 0 },
        { q: 'Vì sao ngân sách vượt kế hoạch một chút?', options: ['Do tăng lương nhân viên', 'Do rủi ro trong chuỗi cung ứng', 'Do khách hàng phạt tiền', 'Do đổi phần mềm'], correct: 1 },
      ],
    },
    listening: [
      'The first deliverable is ready for review.',
      'We are still on track for the deadline.',
      'The budget went slightly over this month.',
      'Let\'s discuss the risks before moving forward.',
    ],
    writing: {
      prompt: 'Viết một đoạn báo cáo ngắn (tiếng Anh) cập nhật tiến độ dự án cho sếp, nêu rõ deliverable và có đang on track hay không.',
      minWords: 30,
      phrases: ['I am pleased to report that', 'The project is currently on track', 'Our next deliverable is', 'Regarding the budget'],
      sentenceBuilder: [
        { scrambled: 'The project / (be) / on track / this week', answer: 'The project is on track this week' },
        { scrambled: 'The deliverable / (be) / ready / by Wednesday', answer: 'The deliverable will be ready by Wednesday' },
      ],
    },
  },
  { // Day 7 - Quản lý dự án 4/5
    vocab: [
      { word: 'Kickoff',    phonetic: '/ˈkɪkɒf/',     meaning: 'Buổi khởi động dự án', quiz: { options: ['Buổi khởi động dự án', 'Bản tóm tắt', 'Người phê duyệt', 'Sửa đổi'], correct: 0 } },
      { word: 'Approver',   phonetic: '/əˈpruːvər/',  meaning: 'Người phê duyệt',       quiz: { options: ['Sửa đổi', 'Người phê duyệt', 'Buổi khởi động dự án', 'Bản tóm tắt'], correct: 1 } },
      { word: 'Revision',   phonetic: '/rɪˈvɪʒn/',    meaning: 'Sửa đổi',               quiz: { options: ['Sửa đổi', 'Bản tóm tắt', 'Buổi khởi động dự án', 'Người phê duyệt'], correct: 0 } },
      { word: 'Brief',      phonetic: '/briːf/',      meaning: 'Bản tóm tắt yêu cầu',   quiz: { options: ['Người phê duyệt', 'Sửa đổi', 'Bản tóm tắt yêu cầu', 'Buổi khởi động dự án'], correct: 2 } },
      { word: 'Finalize',   phonetic: '/ˈfaɪnəlaɪz/', meaning: 'Hoàn tất, chốt lại',    quiz: { options: ['Hoàn tất, chốt lại', 'Người phê duyệt', 'Sửa đổi', 'Bản tóm tắt yêu cầu'], correct: 0 } },
    ],
    reading: {
      title: 'Preparing for the Project Kickoff',
      passage: 'Before the kickoff meeting, Vy prepared a clear brief so everyone understands the goals. She sent it to the approver for one last check, expecting only minor revisions. Once the brief is finalized, the whole team can start working with confidence.',
      quiz: [
        { q: 'Vy chuẩn bị gì trước buổi kickoff?', options: ['Một bản brief rõ ràng', 'Một bài hát mở đầu', 'Một bản hợp đồng', 'Một video giới thiệu'], correct: 0 },
        { q: 'Vy gửi brief cho ai kiểm tra lần cuối?', options: ['Khách hàng', 'Người phê duyệt', 'Đối tác', 'Nhà cung cấp'], correct: 1 },
      ],
    },
    listening: [
      'The kickoff meeting is scheduled for Monday.',
      'We are waiting for the approver\'s sign-off.',
      'Please make these small revisions to the brief.',
      'Let\'s finalize the plan before we start.',
    ],
    writing: {
      prompt: 'Viết một email mời đồng nghiệp tham dự buổi kickoff dự án mới, kèm yêu cầu họ đọc trước bản brief.',
      minWords: 30,
      phrases: ['I would like to invite you to', 'Please review the brief before', 'We are waiting for approval from', 'Once this is finalized'],
      sentenceBuilder: [
        { scrambled: 'She / (send) / the brief / to the approver', answer: 'She sent the brief to the approver' },
        { scrambled: 'The plan / (need) / to / (be) / finalized / soon', answer: 'The plan needs to be finalized soon' },
      ],
    },
  },
  { // Day 8 - Quản lý dự án 5/5
    vocab: [
      { word: 'Wrap up',      phonetic: '/ræp ʌp/',       meaning: 'Kết thúc, tổng kết', quiz: { options: ['Kết thúc, tổng kết', 'Rút kinh nghiệm', 'Thành công', 'Bàn giao cuối cùng'], correct: 0 } },
      { word: 'Lessons learned', phonetic: '/ˈlesənz lɜːrnd/', meaning: 'Bài học rút kinh nghiệm', quiz: { options: ['Thành công', 'Bài học rút kinh nghiệm', 'Kết thúc, tổng kết', 'Bàn giao cuối cùng'], correct: 1 } },
      { word: 'Success',      phonetic: '/səkˈses/',      meaning: 'Thành công',         quiz: { options: ['Thành công', 'Bài học rút kinh nghiệm', 'Bàn giao cuối cùng', 'Kết thúc, tổng kết'], correct: 0 } },
      { word: 'Closure',      phonetic: '/ˈkloʊʒər/',     meaning: 'Bàn giao/đóng dự án cuối cùng', quiz: { options: ['Kết thúc, tổng kết', 'Thành công', 'Bài học rút kinh nghiệm', 'Bàn giao/đóng dự án cuối cùng'], correct: 3 } },
      { word: 'Celebrate',    phonetic: '/ˈselɪbreɪt/',   meaning: 'Ăn mừng',            quiz: { options: ['Ăn mừng', 'Bàn giao/đóng dự án cuối cùng', 'Thành công', 'Bài học rút kinh nghiệm'], correct: 0 } },
    ],
    reading: {
      title: 'Closing the Project',
      passage: 'After six months of hard work, Hung and his team are ready to wrap up the project. They held a meeting to discuss lessons learned so future projects can avoid the same mistakes. Everyone agreed it was a success, and Hung suggested they celebrate before the official closure next week.',
      quiz: [
        { q: 'Nhóm của Hùng họp để làm gì?', options: ['Thảo luận bài học rút kinh nghiệm', 'Sa thải nhân viên', 'Ký hợp đồng mới', 'Đàm phán lương'], correct: 0 },
        { q: 'Hùng đề xuất điều gì trước khi đóng dự án chính thức?', options: ['Kéo dài dự án', 'Ăn mừng cùng nhau', 'Bắt đầu dự án mới ngay', 'Sa thải một số người'], correct: 1 },
      ],
    },
    listening: [
      'Let\'s wrap up this project by Friday.',
      'What are the key lessons learned here?',
      'This project was a real success.',
      'We should celebrate before the closure meeting.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn tổng kết dự án đã hoàn thành, nêu 1-2 lessons learned quan trọng.',
      minWords: 30,
      phrases: ['We are ready to wrap up', 'One key lesson learned is', 'This project was a success because', 'Let\'s celebrate this achievement'],
      sentenceBuilder: [
        { scrambled: 'The team / (discuss) / lessons learned / after the project', answer: 'The team discussed lessons learned after the project' },
        { scrambled: 'They / (agree) / it / (be) / a success', answer: 'They agreed it was a success' },
      ],
    },
  },
  { // Day 9 - Xử lý khủng hoảng 1/5
    vocab: [
      { word: 'Crisis',    phonetic: '/ˈkraɪsɪs/',    meaning: 'Khủng hoảng',      quiz: { options: ['Khủng hoảng', 'Sự cố', 'Leo thang', 'Ứng phó'], correct: 0 } },
      { word: 'Incident',  phonetic: '/ˈɪnsɪdənt/',   meaning: 'Sự cố',            quiz: { options: ['Ứng phó', 'Sự cố', 'Khủng hoảng', 'Leo thang'], correct: 1 } },
      { word: 'Escalate',  phonetic: '/ˈeskəleɪt/',   meaning: 'Leo thang, báo cáo lên cấp cao', quiz: { options: ['Leo thang, báo cáo lên cấp cao', 'Sự cố', 'Khủng hoảng', 'Ứng phó'], correct: 0 } },
      { word: 'Respond',   phonetic: '/rɪˈspɒnd/',    meaning: 'Ứng phó, phản hồi', quiz: { options: ['Sự cố', 'Khủng hoảng', 'Ứng phó, phản hồi', 'Leo thang'], correct: 2 } },
      { word: 'Contain',   phonetic: '/kənˈteɪn/',    meaning: 'Kiểm soát, khoanh vùng', quiz: { options: ['Kiểm soát, khoanh vùng', 'Sự cố', 'Leo thang', 'Ứng phó'], correct: 0 } },
    ],
    reading: {
      title: 'Responding to a System Crisis',
      passage: 'Early this morning, an incident with the payment system quickly turned into a full crisis when thousands of customers could not check out. Yen decided to escalate the issue to senior management right away. The IT team worked fast to contain the problem before they could respond with a permanent fix.',
      quiz: [
        { q: 'Sự cố ban đầu liên quan đến hệ thống nào?', options: ['Hệ thống thanh toán', 'Hệ thống email', 'Hệ thống lương', 'Hệ thống kho'], correct: 0 },
        { q: 'Yến quyết định làm gì đầu tiên?', options: ['Giấu thông tin', 'Escalate lên quản lý cấp cao', 'Tắt hệ thống hoàn toàn', 'Gọi cho khách hàng'], correct: 1 },
      ],
    },
    listening: [
      'We have a crisis with the payment system.',
      'This incident needs to be escalated immediately.',
      'How should we respond to this situation?',
      'The team managed to contain the damage quickly.',
    ],
    writing: {
      prompt: 'Viết một tin nhắn khẩn cấp (tiếng Anh) báo cáo một incident cho quản lý và đề xuất cách respond.',
      minWords: 30,
      phrases: ['We are currently facing a crisis', 'This incident needs to be escalated', 'We are working to contain', 'Our proposed response is'],
      sentenceBuilder: [
        { scrambled: 'She / (decide) / to / escalate / the issue', answer: 'She decided to escalate the issue' },
        { scrambled: 'The team / (contain) / the problem / quickly', answer: 'The team contained the problem quickly' },
      ],
    },
  },
  { // Day 10 - Xử lý khủng hoảng 2/5
    vocab: [
      { word: 'Root cause',   phonetic: '/ruːt kɔːz/',   meaning: 'Nguyên nhân gốc rễ', quiz: { options: ['Nguyên nhân gốc rễ', 'Khôi phục', 'Tác động', 'Thông cáo'], correct: 0 } },
      { word: 'Recover',      phonetic: '/rɪˈkʌvər/',    meaning: 'Khôi phục',          quiz: { options: ['Tác động', 'Khôi phục', 'Nguyên nhân gốc rễ', 'Thông cáo'], correct: 1 } },
      { word: 'Impact',       phonetic: '/ˈɪmpækt/',     meaning: 'Tác động',           quiz: { options: ['Tác động', 'Khôi phục', 'Thông cáo', 'Nguyên nhân gốc rễ'], correct: 0 } },
      { word: 'Statement',    phonetic: '/ˈsteɪtmənt/',  meaning: 'Thông cáo, tuyên bố', quiz: { options: ['Nguyên nhân gốc rễ', 'Tác động', 'Thông cáo, tuyên bố', 'Khôi phục'], correct: 2 } },
      { word: 'Reassure',     phonetic: '/ˌriːəˈʃʊr/',   meaning: 'Trấn an',            quiz: { options: ['Trấn an', 'Tác động', 'Nguyên nhân gốc rễ', 'Khôi phục'], correct: 0 } },
    ],
    reading: {
      title: 'After the Crisis: Recovery',
      passage: 'Once the system was stable again, Son\'s team began looking for the root cause of the failure. They released a public statement to reassure customers that the impact was limited. Within two days, all services had fully recovered.',
      quiz: [
        { q: 'Nhóm của Sơn làm gì sau khi hệ thống ổn định?', options: ['Tìm nguyên nhân gốc rễ', 'Sa thải nhân viên IT', 'Đóng cửa công ty', 'Tăng giá dịch vụ'], correct: 0 },
        { q: 'Mục đích của thông cáo công khai là gì?', options: ['Quảng cáo sản phẩm mới', 'Trấn an khách hàng', 'Xin lỗi nhà đầu tư', 'Thông báo tuyển dụng'], correct: 1 },
      ],
    },
    listening: [
      'We found the root cause of the outage.',
      'All services have fully recovered now.',
      'The impact on customers was minimal.',
      'This statement will reassure our clients.',
    ],
    writing: {
      prompt: 'Viết một đoạn thông cáo ngắn (tiếng Anh) gửi khách hàng để trấn an sau một sự cố, nêu root cause và tình trạng recover.',
      minWords: 30,
      phrases: ['We have identified the root cause', 'We would like to reassure you that', 'The impact was limited to', 'Our systems have fully recovered'],
      sentenceBuilder: [
        { scrambled: 'The team / (find) / the root cause / this morning', answer: 'The team found the root cause this morning' },
        { scrambled: 'All services / (recover) / within two days', answer: 'All services recovered within two days' },
      ],
    },
  },
  { // Day 11 - Xử lý khủng hoảng 3/5
    vocab: [
      { word: 'Backup plan',  phonetic: '/ˈbækʌp plæn/', meaning: 'Kế hoạch dự phòng', quiz: { options: ['Kế hoạch dự phòng', 'Khẩn cấp', 'Giao thức', 'Cảnh báo'], correct: 0 } },
      { word: 'Emergency',    phonetic: '/ɪˈmɜːrdʒənsi/',meaning: 'Khẩn cấp',         quiz: { options: ['Giao thức', 'Khẩn cấp', 'Kế hoạch dự phòng', 'Cảnh báo'], correct: 1 } },
      { word: 'Protocol',     phonetic: '/ˈproʊtəkɒl/',  meaning: 'Giao thức, quy trình', quiz: { options: ['Giao thức, quy trình', 'Khẩn cấp', 'Cảnh báo', 'Kế hoạch dự phòng'], correct: 0 } },
      { word: 'Alert',        phonetic: '/əˈlɜːrt/',     meaning: 'Cảnh báo',          quiz: { options: ['Kế hoạch dự phòng', 'Giao thức, quy trình', 'Cảnh báo', 'Khẩn cấp'], correct: 2 } },
      { word: 'Mitigate',     phonetic: '/ˈmɪtɪɡeɪt/',   meaning: 'Giảm thiểu',        quiz: { options: ['Giảm thiểu', 'Cảnh báo', 'Khẩn cấp', 'Giao thức, quy trình'], correct: 0 } },
    ],
    reading: {
      title: 'Building an Emergency Protocol',
      passage: 'After the last outage, Ha\'s department created a clear emergency protocol so everyone knows what to do next time. Now every alert automatically triggers a backup plan within minutes. This new process helps mitigate risks before they become serious.',
      quiz: [
        { q: 'Phòng của Hà tạo ra thứ gì sau sự cố trước đó?', options: ['Một giao thức khẩn cấp rõ ràng', 'Một sản phẩm mới', 'Một hợp đồng bảo hiểm', 'Một chiến dịch quảng cáo'], correct: 0 },
        { q: 'Điều gì xảy ra tự động khi có cảnh báo?', options: ['Kích hoạt kế hoạch dự phòng', 'Sa thải nhân viên', 'Tắt toàn bộ hệ thống', 'Gửi email cho khách hàng'], correct: 0 },
      ],
    },
    listening: [
      'Do we have a backup plan for this situation?',
      'This is an emergency, please act fast.',
      'Follow the protocol step by step.',
      'This alert needs immediate attention.',
    ],
    writing: {
      prompt: 'Viết hướng dẫn ngắn (tiếng Anh) về protocol cần làm khi có emergency alert tại nơi làm việc.',
      minWords: 30,
      phrases: ['In case of emergency', 'Please follow this protocol', 'Our backup plan is to', 'This will help mitigate the risk'],
      sentenceBuilder: [
        { scrambled: 'Every alert / (trigger) / a backup plan', answer: 'Every alert triggers a backup plan' },
        { scrambled: 'This process / (help) / mitigate / risks', answer: 'This process helps mitigate risks' },
      ],
    },
  },
  { // Day 12 - Xử lý khủng hoảng 4/5
    vocab: [
      { word: 'Damage control', phonetic: '/ˈdæmɪdʒ kənˌtroʊl/', meaning: 'Kiểm soát thiệt hại', quiz: { options: ['Kiểm soát thiệt hại', 'Uy tín', 'Minh bạch', 'Trách nhiệm'], correct: 0 } },
      { word: 'Reputation',     phonetic: '/ˌrepjuˈteɪʃn/',      meaning: 'Uy tín, danh tiếng',   quiz: { options: ['Trách nhiệm', 'Uy tín, danh tiếng', 'Kiểm soát thiệt hại', 'Minh bạch'], correct: 1 } },
      { word: 'Transparency',   phonetic: '/trænsˈpærənsi/',     meaning: 'Sự minh bạch',         quiz: { options: ['Sự minh bạch', 'Uy tín, danh tiếng', 'Trách nhiệm', 'Kiểm soát thiệt hại'], correct: 0 } },
      { word: 'Accountability', phonetic: '/əˌkaʊntəˈbɪləti/',   meaning: 'Trách nhiệm giải trình', quiz: { options: ['Kiểm soát thiệt hại', 'Sự minh bạch', 'Trách nhiệm giải trình', 'Uy tín, danh tiếng'], correct: 2 } },
      { word: 'Apologize',      phonetic: '/əˈpɒlədʒaɪz/',       meaning: 'Xin lỗi',              quiz: { options: ['Xin lỗi', 'Trách nhiệm giải trình', 'Sự minh bạch', 'Kiểm soát thiệt hại'], correct: 0 } },
    ],
    reading: {
      title: 'Managing the Company Reputation',
      passage: 'When the mistake became public, the company had to focus on damage control quickly. Their CEO chose to apologize publicly and promised full transparency about what went wrong. This decision, based on accountability rather than excuses, actually helped protect the company\'s reputation.',
      quiz: [
        { q: 'Công ty phải tập trung vào việc gì khi lỗi bị công khai?', options: ['Kiểm soát thiệt hại', 'Tăng giá sản phẩm', 'Sa thải toàn bộ nhân viên', 'Đóng cửa công ty'], correct: 0 },
        { q: 'CEO đã làm gì để bảo vệ uy tín công ty?', options: ['Im lặng không phản hồi', 'Xin lỗi công khai và minh bạch', 'Đổ lỗi cho nhân viên', 'Chuyển văn phòng'], correct: 1 },
      ],
    },
    listening: [
      'We need to focus on damage control now.',
      'This could hurt our reputation badly.',
      'Transparency is important during a crisis.',
      'The CEO decided to apologize publicly.',
    ],
    writing: {
      prompt: 'Viết một lời xin lỗi công khai ngắn (tiếng Anh) thay mặt công ty sau một sai sót, thể hiện transparency và accountability.',
      minWords: 30,
      phrases: ['We sincerely apologize for', 'We are committed to full transparency', 'We take full accountability for', 'We understand the impact on our reputation'],
      sentenceBuilder: [
        { scrambled: 'The CEO / (apologize) / publicly / yesterday', answer: 'The CEO apologized publicly yesterday' },
        { scrambled: 'Transparency / (help) / protect / the reputation', answer: 'Transparency helps protect the reputation' },
      ],
    },
  },
  { // Day 13 - Xử lý khủng hoảng 5/5
    vocab: [
      { word: 'Resolve',      phonetic: '/rɪˈzɒlv/',      meaning: 'Giải quyết',       quiz: { options: ['Giải quyết', 'Rút kinh nghiệm', 'Ổn định', 'Khôi phục niềm tin'], correct: 0 } },
      { word: 'Debrief',      phonetic: '/ˌdiːˈbriːf/',   meaning: 'Buổi rút kinh nghiệm', quiz: { options: ['Ổn định', 'Buổi rút kinh nghiệm', 'Giải quyết', 'Khôi phục niềm tin'], correct: 1 } },
      { word: 'Stabilize',    phonetic: '/ˈsteɪbəlaɪz/',  meaning: 'Ổn định lại',       quiz: { options: ['Ổn định lại', 'Buổi rút kinh nghiệm', 'Khôi phục niềm tin', 'Giải quyết'], correct: 0 } },
      { word: 'Rebuild trust',phonetic: '/riːˈbɪld trʌst/',meaning: 'Khôi phục niềm tin', quiz: { options: ['Giải quyết', 'Ổn định lại', 'Buổi rút kinh nghiệm', 'Khôi phục niềm tin'], correct: 3 } },
      { word: 'Follow-up',    phonetic: '/ˈfɒloʊ ʌp/',    meaning: 'Theo dõi tiếp theo', quiz: { options: ['Theo dõi tiếp theo', 'Ổn định lại', 'Giải quyết', 'Buổi rút kinh nghiệm'], correct: 0 } },
    ],
    reading: {
      title: 'Moving Forward After a Crisis',
      passage: 'Once the situation was resolved and the system had stabilized, Minh\'s team held a debrief to review what happened. They agreed to send a follow-up message to customers every week until trust was fully rebuilt. Everyone felt more confident knowing the crisis was truly behind them.',
      quiz: [
        { q: 'Nhóm của Minh làm gì sau khi tình huống được giải quyết?', options: ['Tổ chức debrief', 'Nghỉ phép dài ngày', 'Thay đổi toàn bộ hệ thống', 'Sa thải quản lý'], correct: 0 },
        { q: 'Họ gửi gì cho khách hàng mỗi tuần?', options: ['Quà tặng', 'Tin nhắn follow-up', 'Hóa đơn mới', 'Bảng lương'], correct: 1 },
      ],
    },
    listening: [
      'The issue has finally been resolved.',
      'Let\'s hold a debrief tomorrow morning.',
      'The system has stabilized overnight.',
      'We need to rebuild trust with our customers.',
    ],
    writing: {
      prompt: 'Viết một email follow-up ngắn (tiếng Anh) gửi khách hàng sau khủng hoảng đã resolve, nhằm rebuild trust.',
      minWords: 30,
      phrases: ['We are happy to confirm this issue has been resolved', 'As a follow-up to our previous message', 'We are committed to rebuilding your trust', 'Our systems have stabilized'],
      sentenceBuilder: [
        { scrambled: 'The team / (hold) / a debrief / after the crisis', answer: 'The team held a debrief after the crisis' },
        { scrambled: 'They / (need) / to / rebuild / trust / with customers', answer: 'They need to rebuild trust with customers' },
      ],
    },
  },
  { // Day 14 - Đàm phán hợp đồng 1/5
    vocab: [
      { word: 'Contract',   phonetic: '/ˈkɒntrækt/',   meaning: 'Hợp đồng',         quiz: { options: ['Hợp đồng', 'Điều khoản', 'Bản nháp', 'Chữ ký'], correct: 0 } },
      { word: 'Clause',     phonetic: '/klɔːz/',       meaning: 'Điều khoản',       quiz: { options: ['Bản nháp', 'Điều khoản', 'Hợp đồng', 'Chữ ký'], correct: 1 } },
      { word: 'Draft',      phonetic: '/drɑːft/',      meaning: 'Bản nháp',         quiz: { options: ['Bản nháp', 'Điều khoản', 'Chữ ký', 'Hợp đồng'], correct: 0 } },
      { word: 'Signature',  phonetic: '/ˈsɪɡnətʃər/',  meaning: 'Chữ ký',           quiz: { options: ['Hợp đồng', 'Bản nháp', 'Điều khoản', 'Chữ ký'], correct: 3 } },
      { word: 'Terms',      phonetic: '/tɜːrmz/',      meaning: 'Điều kiện, điều khoản chung', quiz: { options: ['Điều kiện, điều khoản chung', 'Chữ ký', 'Bản nháp', 'Hợp đồng'], correct: 0 } },
    ],
    reading: {
      title: 'Reviewing a Business Contract',
      passage: 'Before signing, Lan carefully reviewed every clause in the draft contract to make sure the terms were fair to both sides. She asked the lawyer to clarify one confusing clause about payment schedules. Once everything was clear, she was ready to add her signature.',
      quiz: [
        { q: 'Lan làm gì trước khi ký hợp đồng?', options: ['Xem lại từng điều khoản trong bản nháp', 'Ký ngay lập tức', 'Huỷ hợp đồng', 'Gọi cho khách hàng'], correct: 0 },
        { q: 'Lan nhờ luật sư làm rõ điều gì?', options: ['Một điều khoản về lịch thanh toán', 'Giá sản phẩm', 'Ngày giao hàng', 'Tên công ty'], correct: 0 },
      ],
    },
    listening: [
      'Please review this contract before signing.',
      'This clause needs to be clarified.',
      'Can you send me the latest draft?',
      'These terms look fair to both parties.',
    ],
    writing: {
      prompt: 'Viết một email ngắn (tiếng Anh) yêu cầu đối tác làm rõ một clause trong bản draft hợp đồng trước khi ký.',
      minWords: 30,
      phrases: ['Could you please clarify this clause', 'We have reviewed the draft contract', 'These terms need further discussion', 'We are ready to add our signature'],
      sentenceBuilder: [
        { scrambled: 'She / (review) / every clause / carefully', answer: 'She reviewed every clause carefully' },
        { scrambled: 'The terms / (be) / fair / to both sides', answer: 'The terms were fair to both sides' },
      ],
    },
  },
  { // Day 15 - Đàm phán hợp đồng 2/5
    vocab: [
      { word: 'Bargain',     phonetic: '/ˈbɑːrɡɪn/',    meaning: 'Mặc cả, thương lượng', quiz: { options: ['Mặc cả, thương lượng', 'Nhượng bộ', 'Đối tác', 'Có lợi cho cả đôi bên'], correct: 0 } },
      { word: 'Concession',  phonetic: '/kənˈseʃn/',    meaning: 'Sự nhượng bộ',         quiz: { options: ['Đối tác', 'Sự nhượng bộ', 'Mặc cả, thương lượng', 'Có lợi cho cả đôi bên'], correct: 1 } },
      { word: 'Counterpart', phonetic: '/ˈkaʊntərpɑːrt/',meaning: 'Đối tác đàm phán',     quiz: { options: ['Đối tác đàm phán', 'Sự nhượng bộ', 'Có lợi cho cả đôi bên', 'Mặc cả, thương lượng'], correct: 0 } },
      { word: 'Win-win',     phonetic: '/wɪn wɪn/',     meaning: 'Đôi bên cùng có lợi', quiz: { options: ['Mặc cả, thương lượng', 'Đối tác đàm phán', 'Sự nhượng bộ', 'Đôi bên cùng có lợi'], correct: 3 } },
      { word: 'Leverage',    phonetic: '/ˈliːvərɪdʒ/',  meaning: 'Lợi thế đàm phán',    quiz: { options: ['Lợi thế đàm phán', 'Đối tác đàm phán', 'Sự nhượng bộ', 'Đôi bên cùng có lợi'], correct: 0 } },
    ],
    reading: {
      title: 'Finding a Win-Win Deal',
      passage: 'During the meeting, Dat tried to bargain for a lower price, but his counterpart would not move without something in return. Dat offered a small concession on the delivery time, which gave him more leverage in the discussion. In the end, both sides reached a win-win agreement.',
      quiz: [
        { q: 'Đạt cố gắng làm gì trong cuộc họp?', options: ['Mặc cả để giảm giá', 'Huỷ hợp đồng', 'Trì hoãn cuộc họp', 'Tăng giá sản phẩm'], correct: 0 },
        { q: 'Đạt nhượng bộ về điều gì?', options: ['Thời gian giao hàng', 'Chất lượng sản phẩm', 'Số lượng đặt hàng', 'Địa điểm giao hàng'], correct: 0 },
      ],
    },
    listening: [
      'Let\'s try to bargain for a better price.',
      'We can offer a small concession here.',
      'My counterpart was very difficult to negotiate with.',
      'We are looking for a win-win solution.',
    ],
    writing: {
      prompt: 'Viết một đoạn hội thoại/email ngắn (tiếng Anh) đề xuất một concession để đạt được thỏa thuận win-win với đối tác.',
      minWords: 30,
      phrases: ['We would like to propose a concession', 'This could be a win-win solution', 'Our counterpart suggested that', 'This gives us more leverage'],
      sentenceBuilder: [
        { scrambled: 'He / (offer) / a small concession / on delivery time', answer: 'He offered a small concession on delivery time' },
        { scrambled: 'Both sides / (reach) / a win-win agreement', answer: 'Both sides reached a win-win agreement' },
      ],
    },
  },
  { // Day 16 - Đàm phán hợp đồng 3/5
    vocab: [
      { word: 'Renew',       phonetic: '/rɪˈnjuː/',      meaning: 'Gia hạn hợp đồng', quiz: { options: ['Gia hạn hợp đồng', 'Vi phạm', 'Hết hạn', 'Bồi thường'], correct: 0 } },
      { word: 'Breach',      phonetic: '/briːtʃ/',       meaning: 'Vi phạm hợp đồng', quiz: { options: ['Hết hạn', 'Vi phạm hợp đồng', 'Gia hạn hợp đồng', 'Bồi thường'], correct: 1 } },
      { word: 'Expire',      phonetic: '/ɪkˈspaɪər/',    meaning: 'Hết hạn',          quiz: { options: ['Hết hạn', 'Vi phạm hợp đồng', 'Bồi thường', 'Gia hạn hợp đồng'], correct: 0 } },
      { word: 'Compensation',phonetic: '/ˌkɒmpenˈseɪʃn/',meaning: 'Bồi thường',      quiz: { options: ['Gia hạn hợp đồng', 'Hết hạn', 'Vi phạm hợp đồng', 'Bồi thường'], correct: 3 } },
      { word: 'Obligation',  phonetic: '/ˌɒblɪˈɡeɪʃn/',  meaning: 'Nghĩa vụ',        quiz: { options: ['Nghĩa vụ', 'Hết hạn', 'Bồi thường', 'Vi phạm hợp đồng'], correct: 0 } },
    ],
    reading: {
      title: 'Handling a Contract Breach',
      passage: 'The supplier failed to meet its obligation to deliver on time, which is considered a breach of contract. Before the agreement expires next month, both companies must discuss compensation for the delay. Hung hopes they can still renew the partnership after this issue is resolved.',
      quiz: [
        { q: 'Nhà cung cấp vi phạm điều gì?', options: ['Nghĩa vụ giao hàng đúng hạn', 'Điều khoản bảo mật', 'Chính sách giá', 'Quy định chất lượng'], correct: 0 },
        { q: 'Hùng hy vọng điều gì sau khi vấn đề được giải quyết?', options: ['Gia hạn hợp tác', 'Huỷ hợp đồng vĩnh viễn', 'Kiện ra tòa', 'Đổi nhà cung cấp khác'], correct: 0 },
      ],
    },
    listening: [
      'This is clearly a breach of contract.',
      'The agreement will expire next month.',
      'We are requesting compensation for the delay.',
      'They failed to meet their obligation.',
    ],
    writing: {
      prompt: 'Viết một email chính thức (tiếng Anh) thông báo cho đối tác về việc họ đã breach hợp đồng và yêu cầu compensation.',
      minWords: 30,
      phrases: ['We regret to inform you of a breach of contract', 'We are requesting compensation for', 'The contract will expire on', 'We hope to renew our partnership'],
      sentenceBuilder: [
        { scrambled: 'The supplier / (fail) / to meet / its obligation', answer: 'The supplier failed to meet its obligation' },
        { scrambled: 'The agreement / (expire) / next month', answer: 'The agreement expires next month' },
      ],
    },
  },
  { // Day 17 - Đàm phán hợp đồng 4/5
    vocab: [
      { word: 'Proposal',    phonetic: '/prəˈpoʊzl/',   meaning: 'Bản đề xuất',       quiz: { options: ['Bản đề xuất', 'Đối tác kinh doanh', 'Thỏa thuận', 'Cam kết'], correct: 0 } },
      { word: 'Partner',     phonetic: '/ˈpɑːrtnər/',   meaning: 'Đối tác kinh doanh', quiz: { options: ['Cam kết', 'Đối tác kinh doanh', 'Bản đề xuất', 'Thỏa thuận'], correct: 1 } },
      { word: 'Agreement',   phonetic: '/əˈɡriːmənt/',  meaning: 'Thỏa thuận',        quiz: { options: ['Thỏa thuận', 'Bản đề xuất', 'Cam kết', 'Đối tác kinh doanh'], correct: 0 } },
      { word: 'Commitment',  phonetic: '/kəˈmɪtmənt/',  meaning: 'Cam kết',           quiz: { options: ['Đối tác kinh doanh', 'Thỏa thuận', 'Bản đề xuất', 'Cam kết'], correct: 3 } },
      { word: 'Mutual',      phonetic: '/ˈmjuːtʃuəl/',  meaning: 'Song phương, chung', quiz: { options: ['Song phương, chung', 'Cam kết', 'Bản đề xuất', 'Thỏa thuận'], correct: 0 } },
    ],
    reading: {
      title: 'Building a Business Partnership',
      passage: 'Thao sent a detailed proposal to a potential partner in Singapore, hoping to reach a mutual agreement on distribution rights. Both sides showed strong commitment during the calls, which made Thao confident. If the partner accepts the proposal, they will sign the agreement next week.',
      quiz: [
        { q: 'Thảo gửi bản đề xuất cho ai?', options: ['Một đối tác tiềm năng ở Singapore', 'Một nhân viên mới', 'Một nhà đầu tư ở Việt Nam', 'Một khách hàng cũ'], correct: 0 },
        { q: 'Cả hai bên thể hiện điều gì trong các cuộc gọi?', options: ['Sự nghi ngờ', 'Cam kết mạnh mẽ', 'Sự thờ ơ', 'Sự tức giận'], correct: 1 },
      ],
    },
    listening: [
      'We have sent the proposal to our partner.',
      'Let\'s aim for a mutual agreement.',
      'This shows strong commitment from both sides.',
      'The partner agreed to sign next week.',
    ],
    writing: {
      prompt: 'Viết một email gửi partner (tiếng Anh) trình bày một proposal hợp tác kinh doanh mới.',
      minWords: 30,
      phrases: ['We would like to propose a partnership', 'We are looking for a mutual agreement', 'We are fully committed to', 'We hope to sign the agreement soon'],
      sentenceBuilder: [
        { scrambled: 'She / (send) / a detailed proposal / to the partner', answer: 'She sent a detailed proposal to the partner' },
        { scrambled: 'Both sides / (show) / strong commitment', answer: 'Both sides showed strong commitment' },
      ],
    },
  },
  { // Day 18 - Đàm phán hợp đồng 5/5
    vocab: [
      { word: 'Finalize deal', phonetic: '/ˈfaɪnəlaɪz diːl/', meaning: 'Chốt thương vụ', quiz: { options: ['Chốt thương vụ', 'Điều khoản pháp lý', 'Thẩm định', 'Ràng buộc'], correct: 0 } },
      { word: 'Legal terms',   phonetic: '/ˈliːɡl tɜːrmz/',   meaning: 'Điều khoản pháp lý', quiz: { options: ['Ràng buộc', 'Điều khoản pháp lý', 'Chốt thương vụ', 'Thẩm định'], correct: 1 } },
      { word: 'Due diligence', phonetic: '/djuː ˈdɪlɪdʒəns/', meaning: 'Thẩm định kỹ lưỡng', quiz: { options: ['Thẩm định kỹ lưỡng', 'Ràng buộc', 'Chốt thương vụ', 'Điều khoản pháp lý'], correct: 0 } },
      { word: 'Binding',       phonetic: '/ˈbaɪndɪŋ/',        meaning: 'Có tính ràng buộc', quiz: { options: ['Chốt thương vụ', 'Thẩm định kỹ lưỡng', 'Có tính ràng buộc', 'Điều khoản pháp lý'], correct: 2 } },
      { word: 'Sign off',      phonetic: '/saɪn ɒf/',         meaning: 'Ký phê duyệt cuối cùng', quiz: { options: ['Có tính ràng buộc', 'Chốt thương vụ', 'Điều khoản pháp lý', 'Ký phê duyệt cuối cùng'], correct: 3 } },
    ],
    reading: {
      title: 'Closing a Business Deal',
      passage: 'After weeks of discussion, both companies were finally ready to finalize the deal. The legal team completed due diligence to make sure everything followed proper legal terms. Once the CEO signed off, the agreement became legally binding for both parties.',
      quiz: [
        { q: 'Đội pháp lý hoàn thành công việc gì trước khi chốt thương vụ?', options: ['Thẩm định kỹ lưỡng', 'Thiết kế logo mới', 'Đào tạo nhân viên', 'Kiểm tra kho hàng'], correct: 0 },
        { q: 'Điều gì khiến thỏa thuận trở nên ràng buộc pháp lý?', options: ['CEO ký phê duyệt', 'Gửi email xác nhận', 'Họp báo công bố', 'Đăng ký nhãn hiệu'], correct: 0 },
      ],
    },
    listening: [
      'We are finally ready to finalize the deal.',
      'Please review the legal terms carefully.',
      'Due diligence usually takes a few weeks.',
      'Once we sign off, the deal is binding.',
    ],
    writing: {
      prompt: 'Viết một email thông báo (tiếng Anh) rằng công ty đã finalize deal sau khi hoàn tất due diligence.',
      minWords: 30,
      phrases: ['We are pleased to finalize the deal', 'Due diligence has been completed', 'Please review the legal terms', 'Once signed off, this will be binding'],
      sentenceBuilder: [
        { scrambled: 'The legal team / (complete) / due diligence / last week', answer: 'The legal team completed due diligence last week' },
        { scrambled: 'The agreement / (become) / legally binding', answer: 'The agreement became legally binding' },
      ],
    },
  },
  { // Day 19 - Xây dựng nhóm 1/5
    vocab: [
      { word: 'Teamwork',     phonetic: '/ˈtiːmwɜːrk/',   meaning: 'Làm việc nhóm',   quiz: { options: ['Làm việc nhóm', 'Sự tin tưởng', 'Gắn kết', 'Cộng tác'], correct: 0 } },
      { word: 'Trust',        phonetic: '/trʌst/',        meaning: 'Sự tin tưởng',    quiz: { options: ['Gắn kết', 'Sự tin tưởng', 'Làm việc nhóm', 'Cộng tác'], correct: 1 } },
      { word: 'Bond',         phonetic: '/bɒnd/',         meaning: 'Sự gắn kết',      quiz: { options: ['Sự gắn kết', 'Sự tin tưởng', 'Cộng tác', 'Làm việc nhóm'], correct: 0 } },
      { word: 'Collaborate',  phonetic: '/kəˈlæbəreɪt/',  meaning: 'Cộng tác',        quiz: { options: ['Làm việc nhóm', 'Sự gắn kết', 'Sự tin tưởng', 'Cộng tác'], correct: 3 } },
      { word: 'Morale',       phonetic: '/məˈrɑːl/',      meaning: 'Tinh thần làm việc', quiz: { options: ['Tinh thần làm việc', 'Sự gắn kết', 'Cộng tác', 'Sự tin tưởng'], correct: 0 } },
    ],
    reading: {
      title: 'Strengthening Team Bonds',
      passage: 'Since the new project began, Vy has noticed that teamwork between departments has improved a lot. She organized a small outing to help everyone bond outside of work, which boosted morale. When people trust each other, they naturally collaborate more effectively.',
      quiz: [
        { q: 'Vy nhận thấy điều gì cải thiện từ khi dự án mới bắt đầu?', options: ['Làm việc nhóm giữa các phòng ban', 'Doanh thu công ty', 'Số lượng khách hàng', 'Giá cổ phiếu'], correct: 0 },
        { q: 'Vy tổ chức gì để giúp mọi người gắn kết?', options: ['Một chuyến đi chơi nhỏ', 'Một khóa đào tạo', 'Một buổi họp dài', 'Một kỳ nghỉ phép'], correct: 0 },
      ],
    },
    listening: [
      'Teamwork has really improved this quarter.',
      'We need to build more trust within the team.',
      'This activity helps the team bond.',
      'Good morale leads to better collaboration.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) đề xuất một hoạt động team building để cải thiện teamwork và morale.',
      minWords: 30,
      phrases: ['I would like to propose a team activity', 'This will help build trust', 'Our team needs to bond more', 'This can boost morale'],
      sentenceBuilder: [
        { scrambled: 'She / (organize) / a small outing / for the team', answer: 'She organized a small outing for the team' },
        { scrambled: 'People / (collaborate) / more / when they trust each other', answer: 'People collaborate more when they trust each other' },
      ],
    },
  },
  { // Day 20 - Xây dựng nhóm 2/5
    vocab: [
      { word: 'Diversity',   phonetic: '/daɪˈvɜːrsəti/', meaning: 'Sự đa dạng',       quiz: { options: ['Sự đa dạng', 'Hòa nhập', 'Đóng góp', 'Khuyến khích'], correct: 0 } },
      { word: 'Inclusion',   phonetic: '/ɪnˈkluːʒn/',    meaning: 'Sự hòa nhập',      quiz: { options: ['Đóng góp', 'Sự hòa nhập', 'Sự đa dạng', 'Khuyến khích'], correct: 1 } },
      { word: 'Contribute',  phonetic: '/kənˈtrɪbjuːt/', meaning: 'Đóng góp',         quiz: { options: ['Đóng góp', 'Sự hòa nhập', 'Khuyến khích', 'Sự đa dạng'], correct: 0 } },
      { word: 'Encourage',   phonetic: '/ɪnˈkʌrɪdʒ/',    meaning: 'Khuyến khích',     quiz: { options: ['Sự đa dạng', 'Đóng góp', 'Sự hòa nhập', 'Khuyến khích'], correct: 3 } },
      { word: 'Perspective', phonetic: '/pərˈspektɪv/',  meaning: 'Góc nhìn, quan điểm', quiz: { options: ['Góc nhìn, quan điểm', 'Đóng góp', 'Khuyến khích', 'Sự hòa nhập'], correct: 0 } },
    ],
    reading: {
      title: 'Valuing Diversity in the Team',
      passage: 'Minh\'s team includes people from different backgrounds, and he believes this diversity brings fresh perspectives. He always encourages quieter members to contribute their ideas during meetings. This culture of inclusion has made the whole team more creative.',
      quiz: [
        { q: 'Minh tin rằng sự đa dạng mang lại điều gì?', options: ['Góc nhìn mới mẻ', 'Nhiều chi phí hơn', 'Nhiều xung đột hơn', 'Ít hiệu quả hơn'], correct: 0 },
        { q: 'Minh thường khuyến khích ai đóng góp ý kiến?', options: ['Thành viên ít nói', 'Chỉ cấp quản lý', 'Chỉ khách hàng', 'Chỉ nhân viên mới'], correct: 0 },
      ],
    },
    listening: [
      'We value diversity within our team.',
      'Inclusion makes everyone feel welcome.',
      'Please contribute your ideas in the meeting.',
      'I encourage everyone to share their perspective.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) khuyến khích đồng nghiệp contribute ý kiến của họ, nhấn mạnh giá trị của diversity và inclusion.',
      minWords: 30,
      phrases: ['We value diversity in our team', 'Everyone is encouraged to contribute', 'Your perspective matters to us', 'We aim to create a culture of inclusion'],
      sentenceBuilder: [
        { scrambled: 'He / (encourage) / quieter members / to contribute', answer: 'He encourages quieter members to contribute' },
        { scrambled: 'Diversity / (bring) / fresh perspectives / to the team', answer: 'Diversity brings fresh perspectives to the team' },
      ],
    },
  },
  { // Day 21 - Xây dựng nhóm 3/5
    vocab: [
      { word: 'Delegate',     phonetic: '/ˈdelɪɡeɪt/',   meaning: 'Giao việc, ủy quyền', quiz: { options: ['Giao việc, ủy quyền', 'Trách nhiệm giải trình', 'Hỗ trợ', 'Vai trò'], correct: 0 } },
      { word: 'Ownership',    phonetic: '/ˈoʊnərʃɪp/',   meaning: 'Trách nhiệm giải trình', quiz: { options: ['Hỗ trợ', 'Trách nhiệm giải trình', 'Giao việc, ủy quyền', 'Vai trò'], correct: 1 } },
      { word: 'Support',      phonetic: '/səˈpɔːrt/',    meaning: 'Hỗ trợ',            quiz: { options: ['Hỗ trợ', 'Vai trò', 'Trách nhiệm giải trình', 'Giao việc, ủy quyền'], correct: 0 } },
      { word: 'Role',         phonetic: '/roʊl/',        meaning: 'Vai trò',           quiz: { options: ['Giao việc, ủy quyền', 'Hỗ trợ', 'Vai trò', 'Trách nhiệm giải trình'], correct: 2 } },
      { word: 'Empower',      phonetic: '/ɪmˈpaʊər/',    meaning: 'Trao quyền',        quiz: { options: ['Trao quyền', 'Vai trò', 'Hỗ trợ', 'Giao việc, ủy quyền'], correct: 0 } },
    ],
    reading: {
      title: 'Delegating Tasks Effectively',
      passage: 'Instead of doing everything himself, Quan learned to delegate tasks based on each person\'s role and strengths. He empowers his team members to take full ownership of their work, but he still offers support whenever they need it. This approach has made the whole team more confident.',
      quiz: [
        { q: 'Quân học được điều gì thay vì tự làm mọi việc?', options: ['Giao việc cho người khác', 'Làm việc một mình', 'Sa thải nhân viên yếu', 'Thuê thêm quản lý'], correct: 0 },
        { q: 'Quân vẫn làm gì khi nhóm cần?', options: ['Cung cấp hỗ trợ', 'Rút lại quyền hạn', 'Phạt nhân viên', 'Giao thêm việc'], correct: 0 },
      ],
    },
    listening: [
      'I need to delegate this task to someone.',
      'Take ownership of your project.',
      'Let me know if you need any support.',
      'Everyone has a clear role on this team.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) giao việc (delegate) cho một đồng nghiệp, nêu rõ role và cam kết support họ.',
      minWords: 30,
      phrases: ['I would like to delegate this task to you', 'Please take ownership of', 'I am here to support you with', 'Your role in this project is'],
      sentenceBuilder: [
        { scrambled: 'He / (empower) / his team / to take ownership', answer: 'He empowers his team to take ownership' },
        { scrambled: 'She / (offer) / support / whenever needed', answer: 'She offers support whenever needed' },
      ],
    },
  },
  { // Day 22 - Xây dựng nhóm 4/5
    vocab: [
      { word: 'Recognition',  phonetic: '/ˌrekəɡˈnɪʃn/', meaning: 'Sự công nhận',     quiz: { options: ['Sự công nhận', 'Động lực', 'Cống hiến', 'Tôn trọng'], correct: 0 } },
      { word: 'Motivation',   phonetic: '/ˌmoʊtɪˈveɪʃn/',meaning: 'Động lực',         quiz: { options: ['Cống hiến', 'Động lực', 'Sự công nhận', 'Tôn trọng'], correct: 1 } },
      { word: 'Dedication',   phonetic: '/ˌdedɪˈkeɪʃn/', meaning: 'Sự cống hiến',     quiz: { options: ['Sự cống hiến', 'Động lực', 'Tôn trọng', 'Sự công nhận'], correct: 0 } },
      { word: 'Respect',      phonetic: '/rɪˈspekt/',    meaning: 'Sự tôn trọng',     quiz: { options: ['Sự công nhận', 'Sự cống hiến', 'Động lực', 'Sự tôn trọng'], correct: 3 } },
      { word: 'Appreciate',   phonetic: '/əˈpriːʃieɪt/', meaning: 'Trân trọng',       quiz: { options: ['Trân trọng', 'Sự cống hiến', 'Động lực', 'Sự công nhận'], correct: 0 } },
    ],
    reading: {
      title: 'Recognizing Team Effort',
      passage: 'Ha always makes sure to give public recognition to team members who show real dedication. She believes that when people feel appreciated and respected, their motivation naturally increases. Last month, she thanked the whole team personally for their hard work on a difficult project.',
      quiz: [
        { q: 'Hà luôn đảm bảo làm gì cho những người cống hiến?', options: ['Công nhận công khai', 'Giảm lương', 'Giao thêm việc', 'Chuyển bộ phận'], correct: 0 },
        { q: 'Hà tin điều gì làm tăng động lực?', options: ['Cảm thấy được trân trọng và tôn trọng', 'Làm việc nhiều giờ hơn', 'Nhận thêm lương', 'Được thăng chức ngay'], correct: 0 },
      ],
    },
    listening: [
      'She gave public recognition to the team.',
      'This kind of dedication deserves praise.',
      'I really respect your hard work.',
      'We truly appreciate everything you did.',
    ],
    writing: {
      prompt: 'Viết một tin nhắn ngắn (tiếng Anh) recognition, cảm ơn một đồng nghiệp vì dedication của họ trong dự án.',
      minWords: 30,
      phrases: ['I want to give you recognition for', 'Your dedication really stood out', 'I truly appreciate your effort', 'You deserve our respect for'],
      sentenceBuilder: [
        { scrambled: 'She / (give) / public recognition / to the team', answer: 'She gave public recognition to the team' },
        { scrambled: 'Motivation / (increase) / when people / feel appreciated', answer: 'Motivation increases when people feel appreciated' },
      ],
    },
  },
  { // Day 23 - Xây dựng nhóm 5/5
    vocab: [
      { word: 'Synergy',      phonetic: '/ˈsɪnərdʒi/',    meaning: 'Hiệu quả cộng hưởng', quiz: { options: ['Hiệu quả cộng hưởng', 'Gắn kết đội nhóm', 'Hiệu suất chung', 'Xây dựng'], correct: 0 } },
      { word: 'Cohesion',     phonetic: '/koʊˈhiːʒn/',    meaning: 'Sự gắn kết đội nhóm', quiz: { options: ['Hiệu suất chung', 'Sự gắn kết đội nhóm', 'Hiệu quả cộng hưởng', 'Xây dựng'], correct: 1 } },
      { word: 'Performance',  phonetic: '/pərˈfɔːrməns/', meaning: 'Hiệu suất chung',    quiz: { options: ['Hiệu suất chung', 'Sự gắn kết đội nhóm', 'Xây dựng', 'Hiệu quả cộng hưởng'], correct: 0 } },
      { word: 'Foster',       phonetic: '/ˈfɒstər/',      meaning: 'Xây dựng, nuôi dưỡng', quiz: { options: ['Hiệu quả cộng hưởng', 'Sự gắn kết đội nhóm', 'Xây dựng, nuôi dưỡng', 'Hiệu suất chung'], correct: 2 } },
      { word: 'Unite',        phonetic: '/juˈnaɪt/',      meaning: 'Đoàn kết',          quiz: { options: ['Đoàn kết', 'Hiệu suất chung', 'Xây dựng, nuôi dưỡng', 'Sự gắn kết đội nhóm'], correct: 0 } },
    ],
    reading: {
      title: 'Creating True Team Synergy',
      passage: 'After months of working together, Son\'s team finally achieved real synergy, where combined efforts produced better results than working alone. He worked hard to foster cohesion by encouraging open communication. A shared goal united everyone and improved overall performance.',
      quiz: [
        { q: 'Điều gì mà nhóm của Sơn cuối cùng đạt được?', options: ['Sự cộng hưởng thực sự', 'Doanh thu kỷ lục', 'Giải thưởng công ty', 'Hợp đồng lớn'], correct: 0 },
        { q: 'Điều gì đã đoàn kết mọi người trong nhóm?', options: ['Một mục tiêu chung', 'Một kỳ nghỉ dài', 'Một cuộc thi', 'Một khoản thưởng'], correct: 0 },
      ],
    },
    listening: [
      'This team has real synergy now.',
      'We need to build stronger cohesion.',
      'Team performance has improved a lot.',
      'A shared goal can unite everyone.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả cách bạn sẽ foster cohesion và tạo synergy trong nhóm của mình.',
      minWords: 30,
      phrases: ['To foster stronger cohesion, we will', 'This creates real synergy within the team', 'Our shared goal is to', 'Team performance has clearly improved'],
      sentenceBuilder: [
        { scrambled: 'The team / (achieve) / real synergy / after months', answer: 'The team achieved real synergy after months' },
        { scrambled: 'A shared goal / (unite) / everyone / on the team', answer: 'A shared goal united everyone on the team' },
      ],
    },
  },
  { // Day 24 - Báo cáo tài chính cơ bản 1/5
    vocab: [
      { word: 'Revenue',    phonetic: '/ˈrevənuː/',    meaning: 'Doanh thu',      quiz: { options: ['Doanh thu', 'Chi phí', 'Lợi nhuận', 'Ngân sách'], correct: 0 } },
      { word: 'Expense',    phonetic: '/ɪkˈspens/',    meaning: 'Chi phí',        quiz: { options: ['Lợi nhuận', 'Chi phí', 'Doanh thu', 'Ngân sách'], correct: 1 } },
      { word: 'Profit',     phonetic: '/ˈprɒfɪt/',     meaning: 'Lợi nhuận',      quiz: { options: ['Lợi nhuận', 'Doanh thu', 'Ngân sách', 'Chi phí'], correct: 0 } },
      { word: 'Forecast',   phonetic: '/ˈfɔːrkæst/',   meaning: 'Dự báo',         quiz: { options: ['Doanh thu', 'Chi phí', 'Lợi nhuận', 'Dự báo'], correct: 3 } },
      { word: 'Quarter',    phonetic: '/ˈkwɔːrtər/',   meaning: 'Quý (3 tháng)',  quiz: { options: ['Quý (3 tháng)', 'Chi phí', 'Doanh thu', 'Dự báo'], correct: 0 } },
    ],
    reading: {
      title: 'Reviewing Quarterly Numbers',
      passage: 'This quarter, the company\'s revenue grew by fifteen percent, but expenses also increased due to new hires. Despite the higher costs, overall profit still improved compared to last year. The finance team updated their forecast to reflect these positive trends.',
      quiz: [
        { q: 'Doanh thu công ty quý này tăng bao nhiêu?', options: ['15%', '5%', '50%', '150%'], correct: 0 },
        { q: 'Vì sao chi phí cũng tăng?', options: ['Do tuyển thêm nhân viên mới', 'Do giảm giá sản phẩm', 'Do mất khách hàng', 'Do đóng cửa chi nhánh'], correct: 0 },
      ],
    },
    listening: [
      'Our revenue grew fifteen percent this quarter.',
      'Expenses increased due to new hires.',
      'Overall profit still improved this year.',
      'We updated our forecast for next quarter.',
    ],
    writing: {
      prompt: 'Viết một đoạn báo cáo ngắn (tiếng Anh) tóm tắt revenue, expense và profit của công ty trong quý vừa qua.',
      minWords: 30,
      phrases: ['Our revenue this quarter was', 'Expenses increased due to', 'Overall profit improved by', 'Our forecast for next quarter is'],
      sentenceBuilder: [
        { scrambled: 'Revenue / (grow) / by fifteen percent / this quarter', answer: 'Revenue grew by fifteen percent this quarter' },
        { scrambled: 'The team / (update) / the forecast / yesterday', answer: 'The team updated the forecast yesterday' },
      ],
    },
  },
  { // Day 25 - Báo cáo tài chính cơ bản 2/5
    vocab: [
      { word: 'Invoice',    phonetic: '/ˈɪnvɔɪs/',    meaning: 'Hóa đơn',         quiz: { options: ['Hóa đơn', 'Ngân sách', 'Dòng tiền', 'Thanh toán'], correct: 0 } },
      { word: 'Budget plan',phonetic: '/ˈbʌdʒɪt plæn/',meaning: 'Kế hoạch ngân sách', quiz: { options: ['Dòng tiền', 'Kế hoạch ngân sách', 'Hóa đơn', 'Thanh toán'], correct: 1 } },
      { word: 'Cash flow',  phonetic: '/kæʃ floʊ/',   meaning: 'Dòng tiền',        quiz: { options: ['Dòng tiền', 'Kế hoạch ngân sách', 'Thanh toán', 'Hóa đơn'], correct: 0 } },
      { word: 'Payment',    phonetic: '/ˈpeɪmənt/',   meaning: 'Thanh toán',       quiz: { options: ['Hóa đơn', 'Dòng tiền', 'Kế hoạch ngân sách', 'Thanh toán'], correct: 3 } },
      { word: 'Overdue',    phonetic: '/ˌoʊvərˈduː/', meaning: 'Quá hạn',          quiz: { options: ['Quá hạn', 'Dòng tiền', 'Hóa đơn', 'Thanh toán'], correct: 0 } },
    ],
    reading: {
      title: 'Managing Cash Flow',
      passage: 'Yen noticed that several client invoices were overdue, which affected the company\'s cash flow. She reminded the accounting team to follow the budget plan closely this month. Once the overdue payments are received, cash flow should return to normal.',
      quiz: [
        { q: 'Yến nhận thấy vấn đề gì với các hóa đơn khách hàng?', options: ['Chúng bị quá hạn', 'Chúng bị sai số tiền', 'Chúng bị mất', 'Chúng bị trùng lặp'], correct: 0 },
        { q: 'Yến nhắc nhở đội kế toán làm gì?', options: ['Tuân thủ kế hoạch ngân sách', 'Sa thải nhân viên', 'Tăng giá sản phẩm', 'Đóng tài khoản ngân hàng'], correct: 0 },
      ],
    },
    listening: [
      'This invoice is now three weeks overdue.',
      'We need to follow the budget plan closely.',
      'Cash flow has been tight this month.',
      'The payment should arrive by Friday.',
    ],
    writing: {
      prompt: 'Viết một email nhắc nhở khách hàng (tiếng Anh) về một invoice bị overdue, đề nghị họ payment sớm.',
      minWords: 30,
      phrases: ['This invoice is now overdue', 'We kindly ask you to make the payment', 'This is affecting our cash flow', 'Please follow the agreed budget plan'],
      sentenceBuilder: [
        { scrambled: 'Several invoices / (be) / overdue / this month', answer: 'Several invoices were overdue this month' },
        { scrambled: 'Cash flow / (return) / to normal / soon', answer: 'Cash flow will return to normal soon' },
      ],
    },
  },
  { // Day 26 - Báo cáo tài chính cơ bản 3/5
    vocab: [
      { word: 'Asset',       phonetic: '/ˈæset/',      meaning: 'Tài sản',         quiz: { options: ['Tài sản', 'Khoản nợ', 'Đầu tư', 'Cổ phần'], correct: 0 } },
      { word: 'Liability',   phonetic: '/ˌlaɪəˈbɪləti/',meaning: 'Khoản nợ',      quiz: { options: ['Đầu tư', 'Khoản nợ', 'Tài sản', 'Cổ phần'], correct: 1 } },
      { word: 'Investment',  phonetic: '/ɪnˈvestmənt/',meaning: 'Sự đầu tư',      quiz: { options: ['Sự đầu tư', 'Khoản nợ', 'Cổ phần', 'Tài sản'], correct: 0 } },
      { word: 'Shareholder', phonetic: '/ˈʃeərhoʊldər/',meaning: 'Cổ đông',       quiz: { options: ['Tài sản', 'Sự đầu tư', 'Khoản nợ', 'Cổ đông'], correct: 3 } },
      { word: 'Return',      phonetic: '/rɪˈtɜːrn/',   meaning: 'Lợi nhuận đầu tư', quiz: { options: ['Lợi nhuận đầu tư', 'Khoản nợ', 'Tài sản', 'Cổ đông'], correct: 0 } },
    ],
    reading: {
      title: 'Presenting to Shareholders',
      passage: 'Dat prepared a report showing the company\'s total assets and liabilities for the shareholders meeting. He highlighted a new investment in technology that should bring strong returns within two years. The shareholders seemed pleased with the overall financial health of the company.',
      quiz: [
        { q: 'Đạt chuẩn bị báo cáo gì cho cuộc họp cổ đông?', options: ['Tổng tài sản và khoản nợ', 'Danh sách nhân viên', 'Kế hoạch marketing', 'Bảng lương công ty'], correct: 0 },
        { q: 'Khoản đầu tư mới được kỳ vọng mang lại gì?', options: ['Lợi nhuận mạnh trong 2 năm', 'Giảm chi phí ngay lập tức', 'Tăng số lượng nhân viên', 'Mở rộng văn phòng'], correct: 0 },
      ],
    },
    listening: [
      'Our total assets increased this year.',
      'We need to reduce our liabilities.',
      'This investment should bring strong returns.',
      'The shareholders were pleased with the report.',
    ],
    writing: {
      prompt: 'Viết một đoạn tóm tắt (tiếng Anh) cho shareholder về assets, liability và expected return của một khoản đầu tư mới.',
      minWords: 30,
      phrases: ['Our total assets currently stand at', 'We aim to reduce our liabilities', 'This investment is expected to return', 'Shareholders will be updated regularly'],
      sentenceBuilder: [
        { scrambled: 'He / (prepare) / a report / for the shareholders', answer: 'He prepared a report for the shareholders' },
        { scrambled: 'This investment / (bring) / strong returns / soon', answer: 'This investment will bring strong returns soon' },
      ],
    },
  },
  { // Day 27 - Báo cáo tài chính cơ bản 4/5
    vocab: [
      { word: 'Audit',       phonetic: '/ˈɔːdɪt/',      meaning: 'Kiểm toán',       quiz: { options: ['Kiểm toán', 'Sai lệch', 'Tuân thủ', 'Cắt giảm'], correct: 0 } },
      { word: 'Discrepancy', phonetic: '/dɪˈskrepənsi/', meaning: 'Sự sai lệch',     quiz: { options: ['Tuân thủ', 'Sự sai lệch', 'Kiểm toán', 'Cắt giảm'], correct: 1 } },
      { word: 'Compliance',  phonetic: '/kəmˈplaɪəns/',  meaning: 'Sự tuân thủ',     quiz: { options: ['Sự tuân thủ', 'Sự sai lệch', 'Cắt giảm', 'Kiểm toán'], correct: 0 } },
      { word: 'Cut costs',   phonetic: '/kʌt kɒsts/',    meaning: 'Cắt giảm chi phí', quiz: { options: ['Kiểm toán', 'Sự sai lệch', 'Sự tuân thủ', 'Cắt giảm chi phí'], correct: 3 } },
      { word: 'Reconcile',   phonetic: '/ˈrekənsaɪl/',   meaning: 'Đối chiếu, cân đối', quiz: { options: ['Đối chiếu, cân đối', 'Sự sai lệch', 'Kiểm toán', 'Sự tuân thủ'], correct: 0 } },
    ],
    reading: {
      title: 'Preparing for the Annual Audit',
      passage: 'Before the annual audit, Lan\'s team worked to reconcile every account and fix any discrepancy they found. They also reviewed all documents for compliance with new regulations. Management asked the finance department to cut costs slightly while still passing the audit smoothly.',
      quiz: [
        { q: 'Nhóm của Lan làm gì trước cuộc kiểm toán hàng năm?', options: ['Đối chiếu và sửa sai lệch trong tài khoản', 'Sa thải nhân viên kế toán', 'Tăng lương cho toàn bộ nhân viên', 'Mở chi nhánh mới'], correct: 0 },
        { q: 'Ban lãnh đạo yêu cầu phòng tài chính làm gì?', options: ['Cắt giảm chi phí một chút', 'Tăng gấp đôi ngân sách', 'Đóng cửa phòng tài chính', 'Thuê thêm kiểm toán viên'], correct: 0 },
      ],
    },
    listening: [
      'The annual audit starts next week.',
      'We found a small discrepancy in the report.',
      'This document is not fully in compliance.',
      'We need to cut costs this quarter.',
    ],
    writing: {
      prompt: 'Viết một email nội bộ (tiếng Anh) thông báo team cần reconcile số liệu và chuẩn bị cho audit sắp tới.',
      minWords: 30,
      phrases: ['We need to prepare for the upcoming audit', 'Please reconcile all accounts by', 'We found a discrepancy in', 'This must be in full compliance with'],
      sentenceBuilder: [
        { scrambled: 'The team / (reconcile) / every account / before the audit', answer: 'The team reconciled every account before the audit' },
        { scrambled: 'Management / (ask) / the department / to cut costs', answer: 'Management asked the department to cut costs' },
      ],
    },
  },
  { // Day 28 - Báo cáo tài chính cơ bản 5/5
    vocab: [
      { word: 'Spreadsheet', phonetic: '/ˈspredʃiːt/',  meaning: 'Bảng tính',       quiz: { options: ['Bảng tính', 'Sự chênh lệch', 'Ước tính', 'Số liệu'], correct: 0 } },
      { word: 'Variance',    phonetic: '/ˈveəriəns/',   meaning: 'Sự chênh lệch',   quiz: { options: ['Ước tính', 'Sự chênh lệch', 'Bảng tính', 'Số liệu'], correct: 1 } },
      { word: 'Estimate',    phonetic: '/ˈestɪmeɪt/',   meaning: 'Ước tính',        quiz: { options: ['Ước tính', 'Bảng tính', 'Số liệu', 'Sự chênh lệch'], correct: 0 } },
      { word: 'Figure',      phonetic: '/ˈfɪɡjər/',     meaning: 'Số liệu',         quiz: { options: ['Sự chênh lệch', 'Ước tính', 'Bảng tính', 'Số liệu'], correct: 3 } },
      { word: 'Breakdown',   phonetic: '/ˈbreɪkdaʊn/',  meaning: 'Bảng phân tích chi tiết', quiz: { options: ['Bảng phân tích chi tiết', 'Số liệu', 'Ước tính', 'Bảng tính'], correct: 0 } },
    ],
    reading: {
      title: 'Preparing the Financial Spreadsheet',
      passage: 'Hung spent the morning updating the spreadsheet with the latest figures from each department. He noticed a small variance between the estimate and the actual numbers. To explain it clearly, he created a detailed breakdown for the finance director.',
      quiz: [
        { q: 'Hùng dành buổi sáng để làm gì?', options: ['Cập nhật bảng tính với số liệu mới nhất', 'Họp với khách hàng', 'Viết email tuyển dụng', 'Chuẩn bị bài thuyết trình marketing'], correct: 0 },
        { q: 'Hùng tạo gì để giải thích sự chênh lệch?', options: ['Một bảng phân tích chi tiết', 'Một video hướng dẫn', 'Một hợp đồng mới', 'Một bài báo'], correct: 0 },
      ],
    },
    listening: [
      'Please update the spreadsheet with new figures.',
      'There is a small variance in the numbers.',
      'This is just an estimate, not the final figure.',
      'Let me show you a detailed breakdown.',
    ],
    writing: {
      prompt: 'Viết một email ngắn (tiếng Anh) gửi kèm bảng breakdown số liệu, giải thích một variance nhỏ giữa estimate và actual figure.',
      minWords: 30,
      phrases: ['Please find attached the spreadsheet with', 'There is a small variance between', 'Here is a detailed breakdown of', 'The estimate was close to the actual figure'],
      sentenceBuilder: [
        { scrambled: 'He / (update) / the spreadsheet / this morning', answer: 'He updated the spreadsheet this morning' },
        { scrambled: 'He / (notice) / a small variance / in the numbers', answer: 'He noticed a small variance in the numbers' },
      ],
    },
  },
  { // Day 29 - Marketing & Sales 1/5
    vocab: [
      { word: 'Campaign',    phonetic: '/kæmˈpeɪn/',    meaning: 'Chiến dịch',       quiz: { options: ['Chiến dịch', 'Đối tượng mục tiêu', 'Thương hiệu', 'Nhận diện'], correct: 0 } },
      { word: 'Target audience', phonetic: '/ˈtɑːrɡɪt ˈɔːdiəns/', meaning: 'Đối tượng mục tiêu', quiz: { options: ['Thương hiệu', 'Đối tượng mục tiêu', 'Chiến dịch', 'Nhận diện'], correct: 1 } },
      { word: 'Brand',       phonetic: '/brænd/',       meaning: 'Thương hiệu',      quiz: { options: ['Thương hiệu', 'Đối tượng mục tiêu', 'Nhận diện', 'Chiến dịch'], correct: 0 } },
      { word: 'Awareness',   phonetic: '/əˈweərnəs/',   meaning: 'Sự nhận diện, nhận biết', quiz: { options: ['Chiến dịch', 'Thương hiệu', 'Đối tượng mục tiêu', 'Sự nhận diện, nhận biết'], correct: 3 } },
      { word: 'Launch',      phonetic: '/lɔːntʃ/',      meaning: 'Ra mắt',           quiz: { options: ['Ra mắt', 'Đối tượng mục tiêu', 'Thương hiệu', 'Sự nhận diện, nhận biết'], correct: 0 } },
    ],
    reading: {
      title: 'Launching a New Marketing Campaign',
      passage: 'Thao\'s team is preparing to launch a marketing campaign aimed at a younger target audience. They want to increase brand awareness through social media rather than traditional advertising. If the campaign performs well, they plan to expand it to other cities next quarter.',
      quiz: [
        { q: 'Nhóm của Thảo chuẩn bị làm gì?', options: ['Ra mắt một chiến dịch marketing', 'Đóng cửa văn phòng', 'Sa thải nhân viên marketing', 'Thay đổi tên công ty'], correct: 0 },
        { q: 'Họ muốn tăng điều gì thông qua mạng xã hội?', options: ['Nhận diện thương hiệu', 'Số lượng nhân viên', 'Lợi nhuận ngay lập tức', 'Giá cổ phiếu'], correct: 0 },
      ],
    },
    listening: [
      'We are launching a new campaign next week.',
      'Our target audience is mostly young professionals.',
      'This will help build our brand.',
      'Brand awareness has grown steadily this year.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) giới thiệu một marketing campaign mới, nêu rõ target audience và mục tiêu tăng brand awareness.',
      minWords: 30,
      phrases: ['We are excited to launch a new campaign', 'Our target audience is', 'This campaign aims to increase brand awareness', 'We plan to expand this to'],
      sentenceBuilder: [
        { scrambled: 'The team / (prepare) / to launch / a new campaign', answer: 'The team is preparing to launch a new campaign' },
        { scrambled: 'They / (want) / to increase / brand awareness', answer: 'They want to increase brand awareness' },
      ],
    },
  },
  { // Day 30 - Marketing & Sales 2/5
    vocab: [
      { word: 'Conversion',  phonetic: '/kənˈvɜːrʒn/',  meaning: 'Tỷ lệ chuyển đổi', quiz: { options: ['Tỷ lệ chuyển đổi', 'Khách hàng tiềm năng', 'Kênh bán hàng', 'Doanh số'], correct: 0 } },
      { word: 'Lead',        phonetic: '/liːd/',        meaning: 'Khách hàng tiềm năng', quiz: { options: ['Kênh bán hàng', 'Khách hàng tiềm năng', 'Tỷ lệ chuyển đổi', 'Doanh số'], correct: 1 } },
      { word: 'Pipeline',    phonetic: '/ˈpaɪplaɪn/',   meaning: 'Kênh/quy trình bán hàng', quiz: { options: ['Kênh/quy trình bán hàng', 'Khách hàng tiềm năng', 'Doanh số', 'Tỷ lệ chuyển đổi'], correct: 0 } },
      { word: 'Sales figures', phonetic: '/seɪlz ˈfɪɡjərz/', meaning: 'Doanh số',   quiz: { options: ['Tỷ lệ chuyển đổi', 'Kênh/quy trình bán hàng', 'Khách hàng tiềm năng', 'Doanh số'], correct: 3 } },
      { word: 'Close a deal',phonetic: '/kloʊz ə diːl/',meaning: 'Chốt đơn hàng',   quiz: { options: ['Chốt đơn hàng', 'Doanh số', 'Kênh/quy trình bán hàng', 'Khách hàng tiềm năng'], correct: 0 } },
    ],
    reading: {
      title: 'Improving the Sales Pipeline',
      passage: 'Son reviewed the sales pipeline and noticed that many leads were dropping off before the conversion stage. He trained his team on better follow-up techniques to close a deal faster. Within one month, the sales figures had already improved noticeably.',
      quiz: [
        { q: 'Sơn nhận thấy vấn đề gì trong pipeline bán hàng?', options: ['Nhiều lead rơi rớt trước giai đoạn chuyển đổi', 'Doanh số quá cao', 'Khách hàng phàn nàn nhiều', 'Sản phẩm bị lỗi'], correct: 0 },
        { q: 'Sơn đào tạo nhóm về điều gì?', options: ['Kỹ thuật follow-up tốt hơn', 'Cách viết CV', 'Kỹ năng thiết kế', 'Quản lý ngân sách'], correct: 0 },
      ],
    },
    listening: [
      'We have several new leads this week.',
      'Our conversion rate needs improvement.',
      'The sales pipeline looks healthy.',
      'She managed to close the deal today.',
    ],
    writing: {
      prompt: 'Viết một email nội bộ (tiếng Anh) cập nhật tình hình sales pipeline, số lead và kế hoạch cải thiện conversion.',
      minWords: 30,
      phrases: ['Our sales pipeline currently includes', 'We have generated several new leads', 'Our conversion rate is', 'We aim to close the deal by'],
      sentenceBuilder: [
        { scrambled: 'He / (train) / his team / on follow-up techniques', answer: 'He trained his team on follow-up techniques' },
        { scrambled: 'Sales figures / (improve) / within one month', answer: 'Sales figures improved within one month' },
      ],
    },
  },
  { // Day 31 - Marketing & Sales 3/5
    vocab: [
      { word: 'Discount',    phonetic: '/ˈdɪskaʊnt/',   meaning: 'Giảm giá',        quiz: { options: ['Giảm giá', 'Khuyến mãi', 'Thị phần', 'Cạnh tranh'], correct: 0 } },
      { word: 'Promotion',   phonetic: '/prəˈmoʊʃn/',   meaning: 'Chương trình khuyến mãi', quiz: { options: ['Cạnh tranh', 'Chương trình khuyến mãi', 'Giảm giá', 'Thị phần'], correct: 1 } },
      { word: 'Market share',phonetic: '/ˈmɑːrkɪt ʃeər/',meaning: 'Thị phần',        quiz: { options: ['Thị phần', 'Chương trình khuyến mãi', 'Cạnh tranh', 'Giảm giá'], correct: 0 } },
      { word: 'Competitor',  phonetic: '/kəmˈpetɪtər/', meaning: 'Đối thủ cạnh tranh', quiz: { options: ['Giảm giá', 'Thị phần', 'Chương trình khuyến mãi', 'Đối thủ cạnh tranh'], correct: 3 } },
      { word: 'Demand',      phonetic: '/dɪˈmænd/',     meaning: 'Nhu cầu',         quiz: { options: ['Nhu cầu', 'Đối thủ cạnh tranh', 'Thị phần', 'Giảm giá'], correct: 0 } },
    ],
    reading: {
      title: 'Responding to a Competitor\'s Promotion',
      passage: 'When a major competitor launched a big discount promotion, Minh\'s company noticed a small drop in demand. To protect their market share, they created their own limited-time promotion. Within weeks, customer demand had returned to normal levels.',
      quiz: [
        { q: 'Điều gì xảy ra khi đối thủ tung khuyến mãi lớn?', options: ['Nhu cầu giảm nhẹ', 'Doanh thu tăng vọt', 'Công ty phá sản', 'Nhân viên nghỉ việc'], correct: 0 },
        { q: 'Công ty Minh làm gì để bảo vệ thị phần?', options: ['Tạo chương trình khuyến mãi riêng', 'Đóng cửa cửa hàng', 'Tăng giá sản phẩm', 'Sa thải đội sales'], correct: 0 },
      ],
    },
    listening: [
      'Our competitor just launched a big discount.',
      'We need to protect our market share.',
      'This promotion should boost demand.',
      'Customer demand returned to normal levels.',
    ],
    writing: {
      prompt: 'Viết một đề xuất ngắn (tiếng Anh) về một promotion để cạnh tranh với competitor và bảo vệ market share.',
      minWords: 30,
      phrases: ['Our competitor recently launched a discount', 'We propose a new promotion to', 'This will help protect our market share', 'We expect demand to increase'],
      sentenceBuilder: [
        { scrambled: 'The competitor / (launch) / a big discount / promotion', answer: 'The competitor launched a big discount promotion' },
        { scrambled: 'Customer demand / (return) / to normal / within weeks', answer: 'Customer demand returned to normal within weeks' },
      ],
    },
  },
  { // Day 32 - Marketing & Sales 4/5
    vocab: [
      { word: 'Customer insight', phonetic: '/ˈkʌstəmər ˈɪnsaɪt/', meaning: 'Thông tin chuyên sâu về khách hàng', quiz: { options: ['Thông tin chuyên sâu về khách hàng', 'Khảo sát', 'Xu hướng', 'Phân khúc'], correct: 0 } },
      { word: 'Survey',      phonetic: '/ˈsɜːrveɪ/',    meaning: 'Khảo sát',        quiz: { options: ['Xu hướng', 'Khảo sát', 'Thông tin chuyên sâu về khách hàng', 'Phân khúc'], correct: 1 } },
      { word: 'Trend',       phonetic: '/trend/',       meaning: 'Xu hướng',        quiz: { options: ['Xu hướng', 'Khảo sát', 'Phân khúc', 'Thông tin chuyên sâu về khách hàng'], correct: 0 } },
      { word: 'Segment',     phonetic: '/ˈseɡmənt/',    meaning: 'Phân khúc',       quiz: { options: ['Khảo sát', 'Phân khúc', 'Xu hướng', 'Thông tin chuyên sâu về khách hàng'], correct: 1 } },
      { word: 'Engagement',  phonetic: '/ɪnˈɡeɪdʒmənt/',meaning: 'Sự tương tác',    quiz: { options: ['Sự tương tác', 'Phân khúc', 'Khảo sát', 'Xu hướng'], correct: 0 } },
    ],
    reading: {
      title: 'Understanding Customer Insights',
      passage: 'Yen sent out a survey to better understand customer insight across different market segments. The results showed a clear trend toward mobile shopping among younger customers. She used this data to improve engagement on the company\'s app.',
      quiz: [
        { q: 'Yến gửi khảo sát để làm gì?', options: ['Hiểu rõ hơn về khách hàng theo phân khúc', 'Tuyển nhân viên mới', 'Đánh giá đối thủ', 'Kiểm tra ngân sách'], correct: 0 },
        { q: 'Kết quả khảo sát cho thấy xu hướng gì?', options: ['Mua sắm qua di động ở người trẻ', 'Giảm nhu cầu mua sắm', 'Tăng giá sản phẩm', 'Khách hàng chuyển sang đối thủ'], correct: 0 },
      ],
    },
    listening: [
      'This survey gave us great customer insight.',
      'There is a clear trend toward mobile shopping.',
      'We should focus on this customer segment.',
      'Engagement on our app has increased.',
    ],
    writing: {
      prompt: 'Viết một đoạn tóm tắt (tiếng Anh) kết quả một customer survey, nêu trend và segment nổi bật.',
      minWords: 30,
      phrases: ['Our recent survey revealed that', 'We noticed a clear trend toward', 'This customer segment prefers', 'Engagement has increased significantly'],
      sentenceBuilder: [
        { scrambled: 'She / (send) / a survey / to customers', answer: 'She sent a survey to customers' },
        { scrambled: 'The results / (show) / a clear trend', answer: 'The results showed a clear trend' },
      ],
    },
  },
  { // Day 33 - Marketing & Sales 5/5
    vocab: [
      { word: 'ROI',         phonetic: '/ɑːr oʊ aɪ/',   meaning: 'Tỷ suất lợi nhuận đầu tư', quiz: { options: ['Tỷ suất lợi nhuận đầu tư', 'Ngân sách quảng cáo', 'Phân bổ kênh', 'Đo lường hiệu quả'], correct: 0 } },
      { word: 'Ad spend',    phonetic: '/æd spend/',    meaning: 'Ngân sách quảng cáo', quiz: { options: ['Đo lường hiệu quả', 'Ngân sách quảng cáo', 'Tỷ suất lợi nhuận đầu tư', 'Phân bổ kênh'], correct: 1 } },
      { word: 'Channel',     phonetic: '/ˈtʃænl/',      meaning: 'Kênh (truyền thông)', quiz: { options: ['Kênh (truyền thông)', 'Ngân sách quảng cáo', 'Đo lường hiệu quả', 'Tỷ suất lợi nhuận đầu tư'], correct: 0 } },
      { word: 'Measure',     phonetic: '/ˈmeʒər/',      meaning: 'Đo lường',        quiz: { options: ['Ngân sách quảng cáo', 'Kênh (truyền thông)', 'Đo lường', 'Tỷ suất lợi nhuận đầu tư'], correct: 2 } },
      { word: 'Optimize',    phonetic: '/ˈɒptɪmaɪz/',   meaning: 'Tối ưu hóa',      quiz: { options: ['Tối ưu hóa', 'Đo lường', 'Ngân sách quảng cáo', 'Kênh (truyền thông)'], correct: 0 } },
    ],
    reading: {
      title: 'Measuring Marketing ROI',
      passage: 'At the end of the campaign, Dat had to measure the ROI across every channel they used. He found that social media gave a much higher return than print ads for the same ad spend. Based on this data, he plans to optimize the budget for next quarter.',
      quiz: [
        { q: 'Đạt phải làm gì vào cuối chiến dịch?', options: ['Đo lường ROI theo từng kênh', 'Sa thải nhân viên marketing', 'Đóng chiến dịch ngay', 'Viết báo cáo tuyển dụng'], correct: 0 },
        { q: 'Kênh nào cho lợi nhuận cao hơn với cùng ngân sách?', options: ['Mạng xã hội', 'Quảng cáo in ấn', 'Truyền hình', 'Radio'], correct: 0 },
      ],
    },
    listening: [
      'We need to measure the ROI of this campaign.',
      'Our ad spend was higher than expected.',
      'Social media is our best-performing channel.',
      'Let\'s optimize the budget for next time.',
    ],
    writing: {
      prompt: 'Viết một báo cáo ngắn (tiếng Anh) về ROI của một chiến dịch marketing, so sánh các channel và đề xuất optimize ngân sách.',
      minWords: 30,
      phrases: ['We measured the ROI across all channels', 'Our ad spend for this campaign was', 'This channel gave the highest return', 'We plan to optimize the budget by'],
      sentenceBuilder: [
        { scrambled: 'He / (measure) / the ROI / across every channel', answer: 'He measured the ROI across every channel' },
        { scrambled: 'He / (plan) / to / optimize / the budget', answer: 'He plans to optimize the budget' },
      ],
    },
  },
  { // Day 34 - Tuyển dụng & phỏng vấn 1/5
    vocab: [
      { word: 'Candidate',   phonetic: '/ˈkændɪdət/',   meaning: 'Ứng viên',        quiz: { options: ['Ứng viên', 'Vị trí tuyển dụng', 'Sơ yếu lý lịch', 'Kỹ năng'], correct: 0 } },
      { word: 'Vacancy',     phonetic: '/ˈveɪkənsi/',   meaning: 'Vị trí tuyển dụng còn trống', quiz: { options: ['Sơ yếu lý lịch', 'Vị trí tuyển dụng còn trống', 'Ứng viên', 'Kỹ năng'], correct: 1 } },
      { word: 'Resume',      phonetic: '/ˈrezjumeɪ/',   meaning: 'Sơ yếu lý lịch',  quiz: { options: ['Sơ yếu lý lịch', 'Vị trí tuyển dụng còn trống', 'Kỹ năng', 'Ứng viên'], correct: 0 } },
      { word: 'Qualification',phonetic: '/ˌkwɒlɪfɪˈkeɪʃn/',meaning: 'Bằng cấp, trình độ', quiz: { options: ['Ứng viên', 'Sơ yếu lý lịch', 'Bằng cấp, trình độ', 'Vị trí tuyển dụng còn trống'], correct: 2 } },
      { word: 'Shortlist',   phonetic: '/ˈʃɔːrtlɪst/',  meaning: 'Danh sách rút gọn', quiz: { options: ['Danh sách rút gọn', 'Bằng cấp, trình độ', 'Sơ yếu lý lịch', 'Ứng viên'], correct: 0 } },
    ],
    reading: {
      title: 'Screening Job Candidates',
      passage: 'HR received over two hundred resumes for the marketing vacancy this month. Vy carefully checked each candidate\'s qualifications before creating a shortlist of ten people. She will schedule interviews with the shortlisted candidates next week.',
      quiz: [
        { q: 'HR nhận được bao nhiêu resume cho vị trí marketing?', options: ['Hơn 200', 'Chỉ 10', 'Khoảng 50', 'Hơn 1000'], correct: 0 },
        { q: 'Vy tạo danh sách rút gọn gồm bao nhiêu người?', options: ['10 người', '5 người', '20 người', '2 người'], correct: 0 },
      ],
    },
    listening: [
      'We received many resumes for this vacancy.',
      'This candidate has strong qualifications.',
      'We need to create a shortlist soon.',
      'Interviews will be scheduled next week.',
    ],
    writing: {
      prompt: 'Viết một email nội bộ (tiếng Anh) thông báo về vacancy mới và yêu cầu đồng nghiệp đề xuất candidate phù hợp.',
      minWords: 30,
      phrases: ['We have an open vacancy for', 'Please recommend a candidate with', 'The required qualifications are', 'We will create a shortlist by'],
      sentenceBuilder: [
        { scrambled: 'HR / (receive) / two hundred resumes / this month', answer: 'HR received two hundred resumes this month' },
        { scrambled: 'She / (create) / a shortlist / of ten people', answer: 'She created a shortlist of ten people' },
      ],
    },
  },
  { // Day 35 - Tuyển dụng & phỏng vấn 2/5
    vocab: [
      { word: 'Interviewer', phonetic: '/ˈɪntərvjuːər/', meaning: 'Người phỏng vấn', quiz: { options: ['Người phỏng vấn', 'Câu hỏi tình huống', 'Lời mời làm việc', 'Ấn tượng đầu tiên'], correct: 0 } },
      { word: 'Job offer',   phonetic: '/dʒɒb ˈɒfər/',   meaning: 'Lời mời làm việc', quiz: { options: ['Câu hỏi tình huống', 'Lời mời làm việc', 'Người phỏng vấn', 'Ấn tượng đầu tiên'], correct: 1 } },
      { word: 'Behavioral question', phonetic: '/bɪˈheɪviərəl ˈkwestʃən/', meaning: 'Câu hỏi tình huống', quiz: { options: ['Câu hỏi tình huống', 'Lời mời làm việc', 'Ấn tượng đầu tiên', 'Người phỏng vấn'], correct: 0 },
      },
      { word: 'First impression', phonetic: '/fɜːrst ɪmˈpreʃn/', meaning: 'Ấn tượng đầu tiên', quiz: { options: ['Người phỏng vấn', 'Câu hỏi tình huống', 'Lời mời làm việc', 'Ấn tượng đầu tiên'], correct: 3 } },
      { word: 'Nervous',     phonetic: '/ˈnɜːrvəs/',     meaning: 'Lo lắng, hồi hộp', quiz: { options: ['Lo lắng, hồi hộp', 'Lời mời làm việc', 'Người phỏng vấn', 'Câu hỏi tình huống'], correct: 0 } },
    ],
    reading: {
      title: 'Preparing for a Job Interview',
      passage: 'Hung felt a little nervous before meeting the interviewer, so he practiced answering common behavioral questions the night before. He knew that making a good first impression was important. A week later, he was thrilled to receive a job offer from the company.',
      quiz: [
        { q: 'Hùng cảm thấy như thế nào trước khi gặp interviewer?', options: ['Hơi lo lắng', 'Rất tự tin', 'Buồn ngủ', 'Tức giận'], correct: 0 },
        { q: 'Hùng nhận được gì một tuần sau đó?', options: ['Một lời mời làm việc', 'Một lời từ chối', 'Một cuộc phỏng vấn khác', 'Một khóa đào tạo miễn phí'], correct: 0 },
      ],
    },
    listening: [
      'The interviewer asked a tricky behavioral question.',
      'I felt nervous before the interview.',
      'First impressions really matter in interviews.',
      'She received a job offer the next week.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) chuẩn bị trả lời một behavioral question thường gặp trong phỏng vấn xin việc.',
      minWords: 30,
      phrases: ['A common behavioral question is', 'I try to make a good first impression by', 'I felt nervous but prepared for', 'I was excited to receive a job offer'],
      sentenceBuilder: [
        { scrambled: 'He / (practice) / behavioral questions / the night before', answer: 'He practiced behavioral questions the night before' },
        { scrambled: 'She / (receive) / a job offer / last week', answer: 'She received a job offer last week' },
      ],
    },
  },
  { // Day 36 - Tuyển dụng & phỏng vấn 3/5
    vocab: [
      { word: 'Onboarding',  phonetic: '/ˈɒnbɔːrdɪŋ/',   meaning: 'Quá trình hòa nhập nhân viên mới', quiz: { options: ['Quá trình hòa nhập nhân viên mới', 'Thử việc', 'Chính sách phúc lợi', 'Vị trí công việc'], correct: 0 } },
      { word: 'Probation',   phonetic: '/proʊˈbeɪʃn/',   meaning: 'Thời gian thử việc', quiz: { options: ['Chính sách phúc lợi', 'Thời gian thử việc', 'Quá trình hòa nhập nhân viên mới', 'Vị trí công việc'], correct: 1 } },
      { word: 'Benefits',    phonetic: '/ˈbenɪfɪts/',    meaning: 'Phúc lợi',        quiz: { options: ['Phúc lợi', 'Thời gian thử việc', 'Vị trí công việc', 'Quá trình hòa nhập nhân viên mới'], correct: 0 } },
      { word: 'Position',    phonetic: '/pəˈzɪʃn/',      meaning: 'Vị trí công việc', quiz: { options: ['Quá trình hòa nhập nhân viên mới', 'Phúc lợi', 'Thời gian thử việc', 'Vị trí công việc'], correct: 3 } },
      { word: 'Orientation', phonetic: '/ˌɔːriənˈteɪʃn/',meaning: 'Buổi định hướng', quiz: { options: ['Buổi định hướng', 'Vị trí công việc', 'Phúc lợi', 'Thời gian thử việc'], correct: 0 } },
    ],
    reading: {
      title: 'Welcoming a New Employee',
      passage: 'On her first day, Lan attended an orientation session that explained the company\'s benefits and policies. Her onboarding plan included meeting each team member during her three-month probation. She felt confident about her new position after such a warm welcome.',
      quiz: [
        { q: 'Lan tham dự buổi gì vào ngày đầu tiên?', options: ['Buổi định hướng', 'Buổi phỏng vấn', 'Buổi đánh giá', 'Buổi tổng kết năm'], correct: 0 },
        { q: 'Kế hoạch onboarding của Lan bao gồm điều gì?', options: ['Gặp từng thành viên trong nhóm', 'Làm việc một mình', 'Đi công tác ngay', 'Nghỉ phép dài ngày'], correct: 0 },
      ],
    },
    listening: [
      'The orientation session starts at nine.',
      'Your probation period is three months.',
      'Let me explain our employee benefits.',
      'Onboarding usually takes about two weeks.',
    ],
    writing: {
      prompt: 'Viết một email chào mừng (tiếng Anh) nhân viên mới, giới thiệu về onboarding plan, benefits và probation.',
      minWords: 30,
      phrases: ['Welcome to the team! Your onboarding plan includes', 'During your probation period, you will', 'Our benefits package includes', 'Please join us for the orientation'],
      sentenceBuilder: [
        { scrambled: 'She / (attend) / an orientation session / on her first day', answer: 'She attended an orientation session on her first day' },
        { scrambled: 'Her probation period / (last) / three months', answer: 'Her probation period lasted three months' },
      ],
    },
  },
  { // Day 37 - Tuyển dụng & phỏng vấn 4/5
    vocab: [
      { word: 'Recruiter',   phonetic: '/rɪˈkruːtər/',   meaning: 'Người tuyển dụng', quiz: { options: ['Người tuyển dụng', 'Kỹ năng mềm', 'Giới thiệu', 'Kinh nghiệm làm việc'], correct: 0 } },
      { word: 'Soft skills', phonetic: '/sɒft skɪlz/',   meaning: 'Kỹ năng mềm',      quiz: { options: ['Kinh nghiệm làm việc', 'Kỹ năng mềm', 'Người tuyển dụng', 'Giới thiệu'], correct: 1 } },
      { word: 'Referral',    phonetic: '/rɪˈfɜːrəl/',    meaning: 'Sự giới thiệu (từ người quen)', quiz: { options: ['Giới thiệu (từ người quen)', 'Kỹ năng mềm', 'Kinh nghiệm làm việc', 'Người tuyển dụng'], correct: 0 } },
      { word: 'Work experience', phonetic: '/wɜːrk ɪkˈspɪəriəns/', meaning: 'Kinh nghiệm làm việc', quiz: { options: ['Người tuyển dụng', 'Giới thiệu (từ người quen)', 'Kỹ năng mềm', 'Kinh nghiệm làm việc'], correct: 3 } },
      { word: 'Screening',   phonetic: '/ˈskriːnɪŋ/',    meaning: 'Sàng lọc',        quiz: { options: ['Sàng lọc', 'Kinh nghiệm làm việc', 'Người tuyển dụng', 'Giới thiệu (từ người quen)'], correct: 0 } },
    ],
    reading: {
      title: 'How Recruiters Choose Candidates',
      passage: 'A recruiter explained that soft skills often matter as much as work experience during screening. Many companies also value a referral from a trusted employee. Quan realized he should highlight his communication skills, not just his technical background.',
      quiz: [
        { q: 'Người tuyển dụng cho biết điều gì cũng quan trọng như kinh nghiệm làm việc?', options: ['Kỹ năng mềm', 'Ngoại hình', 'Tuổi tác', 'Nơi ở'], correct: 0 },
        { q: 'Quân nhận ra nên làm nổi bật điều gì?', options: ['Kỹ năng giao tiếp', 'Chỉ bằng cấp', 'Chỉ kinh nghiệm kỹ thuật', 'Sở thích cá nhân'], correct: 0 },
      ],
    },
    listening: [
      'The recruiter called me this morning.',
      'Soft skills are important in this role.',
      'We got a referral from a current employee.',
      'Screening usually takes about a week.',
    ],
    writing: {
      prompt: 'Viết một đoạn tự giới thiệu ngắn (tiếng Anh) cho recruiter, nhấn mạnh soft skills và work experience của bạn.',
      minWords: 30,
      phrases: ['I would like to highlight my soft skills', 'My work experience includes', 'I was referred by', 'I look forward to the screening process'],
      sentenceBuilder: [
        { scrambled: 'The recruiter / (explain) / that soft skills matter', answer: 'The recruiter explained that soft skills matter' },
        { scrambled: 'He / (realize) / he / should / highlight / his communication skills', answer: 'He realized he should highlight his communication skills' },
      ],
    },
  },
  { // Day 38 - Tuyển dụng & phỏng vấn 5/5
    vocab: [
      { word: 'Turnover',    phonetic: '/ˈtɜːrnoʊvər/',  meaning: 'Tỷ lệ nghỉ việc', quiz: { options: ['Tỷ lệ nghỉ việc', 'Giữ chân nhân viên', 'Lộ trình sự nghiệp', 'Đánh giá thử việc'], correct: 0 } },
      { word: 'Retention',   phonetic: '/rɪˈtenʃn/',     meaning: 'Sự giữ chân nhân viên', quiz: { options: ['Lộ trình sự nghiệp', 'Sự giữ chân nhân viên', 'Tỷ lệ nghỉ việc', 'Đánh giá thử việc'], correct: 1 } },
      { word: 'Career path', phonetic: '/kəˈrɪər pæθ/',  meaning: 'Lộ trình sự nghiệp', quiz: { options: ['Lộ trình sự nghiệp', 'Tỷ lệ nghỉ việc', 'Đánh giá thử việc', 'Sự giữ chân nhân viên'], correct: 0 } },
      { word: 'Assessment',  phonetic: '/əˈsesmənt/',    meaning: 'Đánh giá',        quiz: { options: ['Sự giữ chân nhân viên', 'Lộ trình sự nghiệp', 'Đánh giá', 'Tỷ lệ nghỉ việc'], correct: 2 } },
      { word: 'Promote',     phonetic: '/prəˈmoʊt/',     meaning: 'Thăng chức',      quiz: { options: ['Thăng chức', 'Đánh giá', 'Lộ trình sự nghiệp', 'Tỷ lệ nghỉ việc'], correct: 0 } },
    ],
    reading: {
      title: 'Improving Employee Retention',
      passage: 'The HR director was worried about the high turnover rate in the sales department this year. To improve retention, she introduced clear career paths and regular assessments for every employee. Two top performers were promoted within just six months.',
      quiz: [
        { q: 'Giám đốc HR lo lắng về điều gì?', options: ['Tỷ lệ nghỉ việc cao ở phòng sales', 'Doanh thu giảm', 'Chi phí văn phòng tăng', 'Khách hàng phàn nàn'], correct: 0 },
        { q: 'Cô giới thiệu gì để cải thiện retention?', options: ['Lộ trình sự nghiệp rõ ràng và đánh giá định kỳ', 'Cắt giảm lương', 'Tăng giờ làm việc', 'Giảm phúc lợi'], correct: 0 },
      ],
    },
    listening: [
      'Turnover has been high this year.',
      'We need to improve employee retention.',
      'What does your career path look like?',
      'She was promoted after her assessment.',
    ],
    writing: {
      prompt: 'Viết một đề xuất ngắn (tiếng Anh) cho ban giám đốc về cách cải thiện retention và giảm turnover trong phòng ban.',
      minWords: 30,
      phrases: ['Turnover in our department has increased', 'We propose improving retention by', 'We should offer a clearer career path', 'Regular assessments can help identify'],
      sentenceBuilder: [
        { scrambled: 'She / (introduce) / clear career paths / for employees', answer: 'She introduced clear career paths for employees' },
        { scrambled: 'Two top performers / (be) / promoted / within six months', answer: 'Two top performers were promoted within six months' },
      ],
    },
  },
  { // Day 39 - Networking sự kiện 1/5
    vocab: [
      { word: 'Networking',  phonetic: '/ˈnetwɜːrkɪŋ/',  meaning: 'Kết nối, xây dựng quan hệ', quiz: { options: ['Kết nối, xây dựng quan hệ', 'Danh thiếp', 'Sự kiện', 'Cuộc trò chuyện phiếm'], correct: 0 } },
      { word: 'Business card',phonetic: '/ˈbɪznəs kɑːrd/',meaning: 'Danh thiếp',      quiz: { options: ['Sự kiện', 'Danh thiếp', 'Kết nối, xây dựng quan hệ', 'Cuộc trò chuyện phiếm'], correct: 1 } },
      { word: 'Conference',  phonetic: '/ˈkɒnfərəns/',   meaning: 'Hội nghị, sự kiện', quiz: { options: ['Hội nghị, sự kiện', 'Danh thiếp', 'Cuộc trò chuyện phiếm', 'Kết nối, xây dựng quan hệ'], correct: 0 } },
      { word: 'Small talk',  phonetic: '/smɔːl tɔːk/',   meaning: 'Cuộc trò chuyện phiếm', quiz: { options: ['Kết nối, xây dựng quan hệ', 'Hội nghị, sự kiện', 'Danh thiếp', 'Cuộc trò chuyện phiếm'], correct: 3 } },
      { word: 'Introduce',   phonetic: '/ˌɪntrəˈduːs/',  meaning: 'Giới thiệu',      quiz: { options: ['Giới thiệu', 'Cuộc trò chuyện phiếm', 'Hội nghị, sự kiện', 'Danh thiếp'], correct: 0 } },
    ],
    reading: {
      title: 'Making the Most of a Conference',
      passage: 'At the industry conference, Vy focused on networking instead of just attending sessions. She started with some small talk before exchanging business cards with new contacts. By the end of the day, she had introduced herself to more than twenty people.',
      quiz: [
        { q: 'Vy tập trung vào điều gì tại hội nghị?', options: ['Networking', 'Chỉ nghe thuyết trình', 'Mua sắm', 'Nghỉ ngơi'], correct: 0 },
        { q: 'Vy bắt đầu cuộc trò chuyện bằng cách nào?', options: ['Trò chuyện phiếm', 'Hỏi về lương', 'Nói về chính trị', 'Im lặng'], correct: 0 },
      ],
    },
    listening: [
      'Networking is important at conferences.',
      'Here is my business card.',
      'This conference has over five hundred attendees.',
      'Let\'s start with a bit of small talk.',
    ],
    writing: {
      prompt: 'Viết một đoạn tự giới thiệu ngắn (tiếng Anh) để dùng khi networking tại một conference, kèm small talk mở đầu.',
      minWords: 30,
      phrases: ['Hi, let me introduce myself', 'I really enjoy networking at events like this', 'Here is my business card', 'What brings you to this conference'],
      sentenceBuilder: [
        { scrambled: 'She / (exchange) / business cards / with new contacts', answer: 'She exchanged business cards with new contacts' },
        { scrambled: 'She / (introduce) / herself / to twenty people', answer: 'She introduced herself to twenty people' },
      ],
    },
  },
  { // Day 40 - Networking sự kiện 2/5
    vocab: [
      { word: 'Connection',  phonetic: '/kəˈnekʃn/',     meaning: 'Mối quan hệ',      quiz: { options: ['Mối quan hệ', 'Người liên hệ', 'Cơ hội', 'Theo dõi sau sự kiện'], correct: 0 } },
      { word: 'Contact',     phonetic: '/ˈkɒntækt/',     meaning: 'Người liên hệ',    quiz: { options: ['Cơ hội', 'Người liên hệ', 'Mối quan hệ', 'Theo dõi sau sự kiện'], correct: 1 } },
      { word: 'Opportunity', phonetic: '/ˌɒpərˈtjuːnəti/',meaning: 'Cơ hội',          quiz: { options: ['Cơ hội', 'Người liên hệ', 'Theo dõi sau sự kiện', 'Mối quan hệ'], correct: 0 } },
      { word: 'Follow up',   phonetic: '/ˈfɒloʊ ʌp/',    meaning: 'Theo dõi, liên hệ lại sau', quiz: { options: ['Mối quan hệ', 'Cơ hội', 'Người liên hệ', 'Theo dõi, liên hệ lại sau'], correct: 3 } },
      { word: 'Mutual friend',phonetic: '/ˈmjuːtʃuəl frend/',meaning: 'Bạn chung',    quiz: { options: ['Bạn chung', 'Người liên hệ', 'Cơ hội', 'Mối quan hệ'], correct: 0 } },
    ],
    reading: {
      title: 'Following Up After the Event',
      passage: 'After the networking event, Son made sure to follow up with each new contact within two days. He mentioned a mutual friend to strengthen the connection with one potential partner. This simple habit has opened many new opportunities for his career.',
      quiz: [
        { q: 'Sơn đảm bảo làm gì sau sự kiện networking?', options: ['Follow up trong vòng 2 ngày', 'Quên hết mọi người', 'Chỉ liên hệ sau 1 tháng', 'Gửi quà cho tất cả'], correct: 0 },
        { q: 'Sơn nhắc đến điều gì để củng cố mối quan hệ?', options: ['Một người bạn chung', 'Một công ty đối thủ', 'Một khoản đầu tư', 'Một dự án cũ'], correct: 0 },
      ],
    },
    listening: [
      'I will follow up with you next week.',
      'We have a mutual friend in common.',
      'This connection could be a great opportunity.',
      'Let me save your contact information.',
    ],
    writing: {
      prompt: 'Viết một email follow up ngắn (tiếng Anh) sau khi gặp một contact mới tại sự kiện networking.',
      minWords: 30,
      phrases: ['It was great meeting you at', 'I wanted to follow up on our conversation', 'I believe this could be a great opportunity', 'I heard we have a mutual friend'],
      sentenceBuilder: [
        { scrambled: 'He / (follow up) / with each contact / within two days', answer: 'He followed up with each contact within two days' },
        { scrambled: 'This habit / (open) / many new opportunities', answer: 'This habit opened many new opportunities' },
      ],
    },
  },
  { // Day 41 - Networking sự kiện 3/5
    vocab: [
      { word: 'Elevator pitch', phonetic: '/ˈelɪveɪtər pɪtʃ/', meaning: 'Bài giới thiệu ngắn gọn', quiz: { options: ['Bài giới thiệu ngắn gọn', 'Danh sách khách mời', 'Chủ đề chính', 'Người tổ chức'], correct: 0 } },
      { word: 'Guest list', phonetic: '/ɡest lɪst/',  meaning: 'Danh sách khách mời', quiz: { options: ['Chủ đề chính', 'Danh sách khách mời', 'Bài giới thiệu ngắn gọn', 'Người tổ chức'], correct: 1 } },
      { word: 'Keynote',    phonetic: '/ˈkiːnoʊt/',   meaning: 'Chủ đề, bài phát biểu chính', quiz: { options: ['Chủ đề, bài phát biểu chính', 'Danh sách khách mời', 'Người tổ chức', 'Bài giới thiệu ngắn gọn'], correct: 0 } },
      { word: 'Organizer',  phonetic: '/ˈɔːrɡənaɪzər/',meaning: 'Người tổ chức',    quiz: { options: ['Bài giới thiệu ngắn gọn', 'Chủ đề, bài phát biểu chính', 'Danh sách khách mời', 'Người tổ chức'], correct: 3 } },
      { word: 'Attendee',   phonetic: '/əˌtenˈdiː/',  meaning: 'Người tham dự',    quiz: { options: ['Người tham dự', 'Người tổ chức', 'Chủ đề, bài phát biểu chính', 'Danh sách khách mời'], correct: 0 } },
    ],
    reading: {
      title: 'Preparing for a Business Event',
      passage: 'Before the event, Dat practiced his elevator pitch so he could introduce his startup in under a minute. As one of the organizers, he also reviewed the guest list to identify important attendees. The keynote speaker\'s talk about innovation inspired everyone in the room.',
      quiz: [
        { q: 'Đạt luyện tập điều gì trước sự kiện?', options: ['Bài giới thiệu ngắn gọn (elevator pitch)', 'Bài hát chủ đề', 'Một bài thơ', 'Một điệu nhảy'], correct: 0 },
        { q: 'Đạt xem lại danh sách khách mời để làm gì?', options: ['Xác định người tham dự quan trọng', 'Đếm số ghế', 'In thẻ tên', 'Đặt đồ ăn'], correct: 0 },
      ],
    },
    listening: [
      'Can you give me your elevator pitch?',
      'The guest list has over one hundred names.',
      'The keynote speaker was excellent.',
      'The organizer welcomed all the attendees.',
    ],
    writing: {
      prompt: 'Viết elevator pitch ngắn (tiếng Anh) giới thiệu bản thân hoặc công ty bạn trong dưới 1 phút.',
      minWords: 30,
      phrases: ['Let me give you my elevator pitch', 'I am one of the organizers of', 'The keynote this year is about', 'We expect many attendees at'],
      sentenceBuilder: [
        { scrambled: 'He / (practice) / his elevator pitch / before the event', answer: 'He practiced his elevator pitch before the event' },
        { scrambled: 'The keynote speaker / (inspire) / everyone / in the room', answer: 'The keynote speaker inspired everyone in the room' },
      ],
    },
  },
  { // Day 42 - Networking sự kiện 4/5
    vocab: [
      { word: 'Icebreaker', phonetic: '/ˈaɪsbreɪkər/',  meaning: 'Câu mở đầu, hoạt động phá băng', quiz: { options: ['Câu mở đầu, hoạt động phá băng', 'Danh tiếng ngành', 'Chuyên môn', 'Kết nối lại'], correct: 0 } },
      { word: 'Industry reputation', phonetic: '/ˈɪndəstri ˌrepjuˈteɪʃn/', meaning: 'Danh tiếng trong ngành', quiz: { options: ['Chuyên môn', 'Danh tiếng trong ngành', 'Câu mở đầu, hoạt động phá băng', 'Kết nối lại'], correct: 1 } },
      { word: 'Expertise',  phonetic: '/ˌekspɜːrˈtiːz/',meaning: 'Chuyên môn',       quiz: { options: ['Chuyên môn', 'Danh tiếng trong ngành', 'Kết nối lại', 'Câu mở đầu, hoạt động phá băng'], correct: 0 } },
      { word: 'Reconnect',  phonetic: '/ˌriːkəˈnekt/',  meaning: 'Kết nối lại',      quiz: { options: ['Câu mở đầu, hoạt động phá băng', 'Kết nối lại', 'Chuyên môn', 'Danh tiếng trong ngành'], correct: 1 } },
      { word: 'Approachable',phonetic: '/əˈproʊtʃəbl/', meaning: 'Dễ gần, dễ tiếp cận', quiz: { options: ['Dễ gần, dễ tiếp cận', 'Chuyên môn', 'Kết nối lại', 'Danh tiếng trong ngành'], correct: 0 } },
    ],
    reading: {
      title: 'Reconnecting with Old Contacts',
      passage: 'Ha used a simple icebreaker to reconnect with a former colleague she had not seen in years. He now had strong industry reputation thanks to his expertise in data analysis. She found him surprisingly approachable, and they agreed to grab coffee the following week.',
      quiz: [
        { q: 'Hà dùng gì để kết nối lại với đồng nghiệp cũ?', options: ['Một câu mở đầu đơn giản', 'Một món quà đắt tiền', 'Một cuộc gọi chính thức', 'Một lá thư trang trọng'], correct: 0 },
        { q: 'Hà nhận thấy anh ấy như thế nào?', options: ['Dễ gần', 'Khó tính', 'Bận rộn', 'Lạnh lùng'], correct: 0 },
      ],
    },
    listening: [
      'That is a great icebreaker for events.',
      'He has a strong industry reputation.',
      'Her expertise in data analysis is impressive.',
      'It was nice to reconnect with you again.',
    ],
    writing: {
      prompt: 'Viết một tin nhắn ngắn (tiếng Anh) để reconnect với một người quen cũ trong ngành, dùng một icebreaker tự nhiên.',
      minWords: 30,
      phrases: ['It has been a while since we last talked', 'I wanted to reconnect with you', 'I have heard great things about your expertise', 'You have built a strong reputation in'],
      sentenceBuilder: [
        { scrambled: 'She / (use) / a simple icebreaker / to reconnect', answer: 'She used a simple icebreaker to reconnect' },
        { scrambled: 'She / (find) / him / surprisingly approachable', answer: 'She found him surprisingly approachable' },
      ],
    },
  },
  { // Day 43 - Networking sự kiện 5/5
    vocab: [
      { word: 'Referral network', phonetic: '/rɪˈfɜːrəl ˈnetwɜːrk/', meaning: 'Mạng lưới giới thiệu', quiz: { options: ['Mạng lưới giới thiệu', 'Trao đổi danh thiếp', 'Cơ hội hợp tác', 'Xây dựng quan hệ lâu dài'], correct: 0 } },
      { word: 'Exchange contacts', phonetic: '/ɪksˈtʃeɪndʒ ˈkɒntækts/', meaning: 'Trao đổi thông tin liên hệ', quiz: { options: ['Cơ hội hợp tác', 'Trao đổi thông tin liên hệ', 'Mạng lưới giới thiệu', 'Xây dựng quan hệ lâu dài'], correct: 1 } },
      { word: 'Collaboration opportunity', phonetic: '/kəˌlæbəˈreɪʃn ˌɒpərˈtjuːnəti/', meaning: 'Cơ hội hợp tác', quiz: { options: ['Mạng lưới giới thiệu', 'Xây dựng quan hệ lâu dài', 'Cơ hội hợp tác', 'Trao đổi thông tin liên hệ'], correct: 2 } },
      { word: 'Long-term relationship', phonetic: '/lɒŋ tɜːrm rɪˈleɪʃnʃɪp/', meaning: 'Mối quan hệ lâu dài', quiz: { options: ['Mối quan hệ lâu dài', 'Trao đổi thông tin liên hệ', 'Mạng lưới giới thiệu', 'Cơ hội hợp tác'], correct: 0 } },
      { word: 'Genuine',    phonetic: '/ˈdʒenjuɪn/',    meaning: 'Chân thành',       quiz: { options: ['Chân thành', 'Mối quan hệ lâu dài', 'Cơ hội hợp tác', 'Mạng lưới giới thiệu'], correct: 0 } },
    ],
    reading: {
      title: 'Building a Genuine Referral Network',
      passage: 'Minh believes a strong referral network grows from genuine relationships, not just exchanging contacts quickly. After the event, he spotted a real collaboration opportunity with another company in the same industry. He plans to nurture this into a long-term relationship rather than a one-time deal.',
      quiz: [
        { q: 'Minh tin rằng mạng lưới giới thiệu mạnh xuất phát từ đâu?', options: ['Mối quan hệ chân thành', 'Trao đổi danh thiếp nhanh', 'Quảng cáo trả phí', 'May mắn'], correct: 0 },
        { q: 'Minh phát hiện điều gì sau sự kiện?', options: ['Một cơ hội hợp tác thực sự', 'Một đối thủ mới', 'Một khách hàng khó tính', 'Một lỗi trong sản phẩm'], correct: 0 },
      ],
    },
    listening: [
      'Our referral network keeps growing every year.',
      'We exchanged contacts after the meeting.',
      'This could be a real collaboration opportunity.',
      'We value long-term relationships over quick deals.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả một collaboration opportunity bạn muốn xây dựng thành long-term relationship.',
      minWords: 30,
      phrases: ['I see a great collaboration opportunity here', 'I would like to build a long-term relationship', 'Our referral network can help both of us', 'I believe in genuine connections'],
      sentenceBuilder: [
        { scrambled: 'He / (spot) / a real collaboration opportunity', answer: 'He spotted a real collaboration opportunity' },
        { scrambled: 'He / (plan) / to nurture / a long-term relationship', answer: 'He plans to nurture a long-term relationship' },
      ],
    },
  },
  { // Day 44 - Quản lý thời gian 1/5
    vocab: [
      { word: 'Schedule',    phonetic: '/ˈskedʒuːl/',   meaning: 'Lịch trình',      quiz: { options: ['Lịch trình', 'Đa nhiệm', 'Sự xao nhãng', 'Trì hoãn'], correct: 0 } },
      { word: 'Multitask',   phonetic: '/ˈmʌltitæsk/',  meaning: 'Đa nhiệm',         quiz: { options: ['Sự xao nhãng', 'Đa nhiệm', 'Lịch trình', 'Trì hoãn'], correct: 1 } },
      { word: 'Distraction', phonetic: '/dɪˈstrækʃn/',  meaning: 'Sự xao nhãng',     quiz: { options: ['Sự xao nhãng', 'Trì hoãn', 'Đa nhiệm', 'Lịch trình'], correct: 0 } },
      { word: 'Procrastinate',phonetic: '/proʊˈkræstɪneɪt/',meaning: 'Trì hoãn',    quiz: { options: ['Lịch trình', 'Sự xao nhãng', 'Đa nhiệm', 'Trì hoãn'], correct: 3 } },
      { word: 'Efficient',   phonetic: '/ɪˈfɪʃnt/',     meaning: 'Hiệu quả',         quiz: { options: ['Hiệu quả', 'Trì hoãn', 'Sự xao nhãng', 'Lịch trình'], correct: 0 } },
    ],
    reading: {
      title: 'Managing a Busy Schedule',
      passage: 'Thao realized she tends to procrastinate whenever her schedule feels overwhelming. Instead of trying to multitask on everything at once, she now removes distractions and focuses on one task at a time. This simple change has made her much more efficient at work.',
      quiz: [
        { q: 'Thảo nhận ra mình có xu hướng làm gì khi lịch trình quá tải?', options: ['Trì hoãn', 'Làm việc chăm chỉ hơn', 'Nghỉ việc', 'Xin nghỉ phép'], correct: 0 },
        { q: 'Thảo làm gì thay vì đa nhiệm mọi thứ cùng lúc?', options: ['Loại bỏ xao nhãng và tập trung từng việc', 'Làm việc muộn hơn', 'Nhờ đồng nghiệp làm giúp', 'Bỏ qua công việc khó'], correct: 0 },
      ],
    },
    listening: [
      'My schedule is packed this week.',
      'I try not to multitask too much.',
      'Please remove any distractions before we start.',
      'I used to procrastinate a lot.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả cách bạn tổ chức schedule và tránh procrastinate trong công việc.',
      minWords: 30,
      phrases: ['My schedule this week includes', 'I try to avoid multitasking by', 'I remove distractions when I need to focus', 'I used to procrastinate, but now'],
      sentenceBuilder: [
        { scrambled: 'She / (remove) / distractions / to focus better', answer: 'She removed distractions to focus better' },
        { scrambled: 'This change / (make) / her / more efficient', answer: 'This change made her more efficient' },
      ],
    },
  },
  { // Day 45 - Quản lý thời gian 2/5
    vocab: [
      { word: 'Time management', phonetic: '/taɪm ˈmænɪdʒmənt/', meaning: 'Quản lý thời gian', quiz: { options: ['Quản lý thời gian', 'Khối thời gian', 'Danh sách việc cần làm', 'Hiệu suất'], correct: 0 } },
      { word: 'Time block',      phonetic: '/taɪm blɒk/',        meaning: 'Khối thời gian',    quiz: { options: ['Danh sách việc cần làm', 'Khối thời gian', 'Quản lý thời gian', 'Hiệu suất'], correct: 1 } },
      { word: 'To-do list',      phonetic: '/tuː duː lɪst/',     meaning: 'Danh sách việc cần làm', quiz: { options: ['Danh sách việc cần làm', 'Khối thời gian', 'Hiệu suất', 'Quản lý thời gian'], correct: 0 } },
      { word: 'Productivity',    phonetic: '/ˌproʊdʌkˈtɪvəti/', meaning: 'Hiệu suất, năng suất', quiz: { options: ['Quản lý thời gian', 'Danh sách việc cần làm', 'Khối thời gian', 'Hiệu suất, năng suất'], correct: 3 } },
      { word: 'Interruption',    phonetic: '/ˌɪntəˈrʌpʃn/',     meaning: 'Sự gián đoạn',      quiz: { options: ['Sự gián đoạn', 'Hiệu suất, năng suất', 'Danh sách việc cần làm', 'Khối thời gian'], correct: 0 } },
    ],
    reading: {
      title: 'A Better Approach to Time Management',
      passage: 'Yen improved her time management by creating a daily to-do list and organizing her day into time blocks. She noticed that constant interruption from messages was hurting her productivity. Now she checks messages only during specific time blocks instead of all day.',
      quiz: [
        { q: 'Yến cải thiện quản lý thời gian bằng cách nào?', options: ['Tạo to-do list và chia time block', 'Làm việc thâu đêm', 'Bỏ hết công việc khó', 'Thuê trợ lý riêng'], correct: 0 },
        { q: 'Yến nhận thấy điều gì ảnh hưởng đến năng suất?', options: ['Sự gián đoạn liên tục từ tin nhắn', 'Thiếu ngủ', 'Văn phòng ồn ào', 'Máy tính chậm'], correct: 0 },
      ],
    },
    listening: [
      'Good time management is essential at work.',
      'I organize my day into time blocks.',
      'Let me check my to-do list first.',
      'Interruptions really hurt my productivity.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) chia sẻ mẹo time management, dùng to-do list và time block để tăng productivity.',
      minWords: 30,
      phrases: ['I improved my time management by', 'I organize my tasks into time blocks', 'My to-do list helps me stay focused', 'Reducing interruptions boosts my productivity'],
      sentenceBuilder: [
        { scrambled: 'She / (create) / a daily to-do list', answer: 'She created a daily to-do list' },
        { scrambled: 'Interruptions / (hurt) / her productivity', answer: 'Interruptions hurt her productivity' },
      ],
    },
  },
  { // Day 46 - Quản lý thời gian 3/5
    vocab: [
      { word: 'Urgent',      phonetic: '/ˈɜːrdʒənt/',   meaning: 'Khẩn cấp',        quiz: { options: ['Khẩn cấp', 'Quan trọng', 'Không cấp bách', 'Trì hoãn công việc'], correct: 0 } },
      { word: 'Important',   phonetic: '/ɪmˈpɔːrtnt/',  meaning: 'Quan trọng',      quiz: { options: ['Không cấp bách', 'Quan trọng', 'Khẩn cấp', 'Trì hoãn công việc'], correct: 1 } },
      { word: 'Postpone',    phonetic: '/poʊstˈpoʊn/',  meaning: 'Trì hoãn công việc', quiz: { options: ['Trì hoãn công việc', 'Quan trọng', 'Khẩn cấp', 'Không cấp bách'], correct: 0 } },
      { word: 'Non-urgent',  phonetic: '/nɒn ˈɜːrdʒənt/',meaning: 'Không cấp bách', quiz: { options: ['Khẩn cấp', 'Trì hoãn công việc', 'Không cấp bách', 'Quan trọng'], correct: 2 } },
      { word: 'Rank',        phonetic: '/ræŋk/',        meaning: 'Xếp hạng, sắp xếp thứ tự', quiz: { options: ['Xếp hạng, sắp xếp thứ tự', 'Khẩn cấp', 'Quan trọng', 'Không cấp bách'], correct: 0 } },
    ],
    reading: {
      title: 'Urgent vs Important Tasks',
      passage: 'Dat learned to rank his tasks by separating what is urgent from what is truly important. He now postpones non-urgent emails until later in the day so he can focus on important projects first. This method has made his mornings much more productive.',
      quiz: [
        { q: 'Đạt học được cách làm gì với công việc của mình?', options: ['Xếp hạng theo khẩn cấp và quan trọng', 'Làm mọi thứ cùng lúc', 'Giao hết cho người khác', 'Bỏ qua công việc khó'], correct: 0 },
        { q: 'Đạt trì hoãn việc gì đến cuối ngày?', options: ['Email không cấp bách', 'Họp quan trọng', 'Gặp khách hàng', 'Báo cáo tài chính'], correct: 0 },
      ],
    },
    listening: [
      'This task is urgent, please handle it now.',
      'That project is important but not urgent.',
      'I will postpone this until tomorrow.',
      'Let\'s rank our tasks by priority.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) phân loại công việc của bạn theo urgent và important, giải thích cái gì bạn postpone.',
      minWords: 30,
      phrases: ['This task is both urgent and important', 'I usually postpone tasks that are', 'I try to rank my tasks every morning', 'Non-urgent emails can wait until later'],
      sentenceBuilder: [
        { scrambled: 'He / (learn) / to rank / his tasks', answer: 'He learned to rank his tasks' },
        { scrambled: 'He / (postpone) / non-urgent emails / until later', answer: 'He postpones non-urgent emails until later' },
      ],
    },
  },
  { // Day 47 - Quản lý thời gian 4/5
    vocab: [
      { word: 'Overwhelmed', phonetic: '/ˌoʊvərˈwelmd/', meaning: 'Bị quá tải, choáng ngợp', quiz: { options: ['Bị quá tải, choáng ngợp', 'Cân bằng', 'Nghỉ giải lao', 'Kiệt sức'], correct: 0 } },
      { word: 'Balance',     phonetic: '/ˈbæləns/',      meaning: 'Sự cân bằng',      quiz: { options: ['Kiệt sức', 'Sự cân bằng', 'Bị quá tải, choáng ngợp', 'Nghỉ giải lao'], correct: 1 } },
      { word: 'Break',       phonetic: '/breɪk/',        meaning: 'Nghỉ giải lao',    quiz: { options: ['Nghỉ giải lao', 'Sự cân bằng', 'Kiệt sức', 'Bị quá tải, choáng ngợp'], correct: 0 } },
      { word: 'Burnout',     phonetic: '/ˈbɜːrnaʊt/',    meaning: 'Kiệt sức vì công việc', quiz: { options: ['Bị quá tải, choáng ngợp', 'Nghỉ giải lao', 'Sự cân bằng', 'Kiệt sức vì công việc'], correct: 3 } },
      { word: 'Recharge',    phonetic: '/riːˈtʃɑːrdʒ/',  meaning: 'Nạp lại năng lượng', quiz: { options: ['Nạp lại năng lượng', 'Kiệt sức vì công việc', 'Bị quá tải, choáng ngợp', 'Sự cân bằng'], correct: 0 } },
    ],
    reading: {
      title: 'Avoiding Burnout at Work',
      passage: 'Hung felt overwhelmed after working long hours for three straight weeks. His manager encouraged him to take short breaks to recharge and find a better balance between work and rest. By listening to this advice early, Hung avoided a serious burnout.',
      quiz: [
        { q: 'Hùng cảm thấy thế nào sau ba tuần làm việc liên tục?', options: ['Quá tải', 'Rất vui vẻ', 'Bình thường', 'Chán nản vì ít việc'], correct: 0 },
        { q: 'Quản lý khuyến khích Hùng làm gì?', options: ['Nghỉ giải lao ngắn để nạp năng lượng', 'Làm việc nhiều hơn', 'Nghỉ việc luôn', 'Chuyển phòng ban'], correct: 0 },
      ],
    },
    listening: [
      'I feel a bit overwhelmed this week.',
      'We need a better work-life balance.',
      'Let\'s take a short break.',
      'Burnout is a serious issue at work.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) chia sẻ cách bạn tránh burnout, giữ balance và recharge sau giờ làm.',
      minWords: 30,
      phrases: ['I sometimes feel overwhelmed when', 'I try to maintain a good balance by', 'Taking short breaks helps me recharge', 'To avoid burnout, I always'],
      sentenceBuilder: [
        { scrambled: 'He / (feel) / overwhelmed / after three weeks', answer: 'He felt overwhelmed after three weeks' },
        { scrambled: 'He / (avoid) / a serious burnout / by resting', answer: 'He avoided a serious burnout by resting' },
      ],
    },
  },
  { // Day 48 - Quản lý thời gian 5/5
    vocab: [
      { word: 'Deadline pressure', phonetic: '/ˈdedlaɪn ˈpreʃər/', meaning: 'Áp lực deadline', quiz: { options: ['Áp lực deadline', 'Hiệu quả về mặt thời gian', 'Thời gian đệm', 'Lên kế hoạch trước'], correct: 0 } },
      { word: 'Time-efficient', phonetic: '/taɪm ɪˈfɪʃnt/', meaning: 'Hiệu quả về mặt thời gian', quiz: { options: ['Thời gian đệm', 'Hiệu quả về mặt thời gian', 'Áp lực deadline', 'Lên kế hoạch trước'], correct: 1 } },
      { word: 'Buffer time',   phonetic: '/ˈbʌfər taɪm/', meaning: 'Thời gian đệm/dự phòng', quiz: { options: ['Áp lực deadline', 'Thời gian đệm/dự phòng', 'Hiệu quả về mặt thời gian', 'Lên kế hoạch trước'], correct: 1 } },
      { word: 'Plan ahead',    phonetic: '/plæn əˈhed/',  meaning: 'Lên kế hoạch trước', quiz: { options: ['Lên kế hoạch trước', 'Áp lực deadline', 'Thời gian đệm/dự phòng', 'Hiệu quả về mặt thời gian'], correct: 0 } },
      { word: 'Consistency',   phonetic: '/kənˈsɪstənsi/',meaning: 'Sự nhất quán, đều đặn', quiz: { options: ['Sự nhất quán, đều đặn', 'Lên kế hoạch trước', 'Áp lực deadline', 'Thời gian đệm/dự phòng'], correct: 0 } },
    ],
    reading: {
      title: 'Planning Ahead to Reduce Pressure',
      passage: 'Lan used to feel constant deadline pressure until she started to plan ahead every Monday morning. She always adds buffer time to each task in case something unexpected happens. Her time-efficient habits and consistency have made her one of the most reliable people on the team.',
      quiz: [
        { q: 'Lan bắt đầu làm gì mỗi sáng thứ Hai?', options: ['Lên kế hoạch trước', 'Ngủ nướng', 'Họp cả ngày', 'Trả lời email cá nhân'], correct: 0 },
        { q: 'Lan luôn thêm gì vào mỗi công việc?', options: ['Thời gian đệm', 'Thêm nhân sự', 'Thêm ngân sách', 'Thêm cuộc họp'], correct: 0 },
      ],
    },
    listening: [
      'Deadline pressure can affect our work quality.',
      'I try to be time-efficient every day.',
      'Always add some buffer time to your plan.',
      'Planning ahead reduces stress significantly.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) chia sẻ cách bạn plan ahead và thêm buffer time để giảm deadline pressure.',
      minWords: 30,
      phrases: ['I try to plan ahead every week', 'Adding buffer time helps me handle', 'Deadline pressure is easier to manage when', 'Consistency is the key to success'],
      sentenceBuilder: [
        { scrambled: 'She / (start) / to plan ahead / every Monday', answer: 'She started to plan ahead every Monday' },
        { scrambled: 'She / (add) / buffer time / to each task', answer: 'She adds buffer time to each task' },
      ],
    },
  },
  { // Day 49 - Xử lý xung đột 1/5
    vocab: [
      { word: 'Conflict',    phonetic: '/ˈkɒnflɪkt/',   meaning: 'Xung đột',        quiz: { options: ['Xung đột', 'Bất đồng', 'Thỏa hiệp', 'Trung gian hòa giải'], correct: 0 } },
      { word: 'Disagreement',phonetic: '/ˌdɪsəˈɡriːmənt/',meaning: 'Sự bất đồng',    quiz: { options: ['Thỏa hiệp', 'Sự bất đồng', 'Xung đột', 'Trung gian hòa giải'], correct: 1 } },
      { word: 'Compromise',  phonetic: '/ˈkɒmprəmaɪz/', meaning: 'Sự thỏa hiệp',    quiz: { options: ['Sự thỏa hiệp', 'Sự bất đồng', 'Trung gian hòa giải', 'Xung đột'], correct: 0 } },
      { word: 'Mediate',     phonetic: '/ˈmiːdieɪt/',   meaning: 'Làm trung gian hòa giải', quiz: { options: ['Xung đột', 'Sự bất đồng', 'Sự thỏa hiệp', 'Làm trung gian hòa giải'], correct: 3 } },
      { word: 'Tension',     phonetic: '/ˈtenʃn/',      meaning: 'Sự căng thẳng',   quiz: { options: ['Sự căng thẳng', 'Sự thỏa hiệp', 'Làm trung gian hòa giải', 'Sự bất đồng'], correct: 0 } },
    ],
    reading: {
      title: 'Handling a Team Conflict',
      passage: 'A conflict arose between two team members over how to split the project workload. Their manager stepped in to mediate before the tension affected the whole team. After an honest conversation, they reached a compromise that resolved the disagreement fairly.',
      quiz: [
        { q: 'Xung đột giữa hai thành viên xảy ra vì điều gì?', options: ['Cách chia khối lượng công việc', 'Tranh cãi về lương', 'Bất đồng về giờ giấc', 'Mâu thuẫn cá nhân'], correct: 0 },
        { q: 'Quản lý làm gì trước khi căng thẳng ảnh hưởng cả nhóm?', options: ['Làm trung gian hòa giải', 'Sa thải cả hai', 'Phớt lờ vấn đề', 'Chuyển cả hai sang phòng khác'], correct: 0 },
      ],
    },
    listening: [
      'There is a conflict between two team members.',
      'We had a small disagreement yesterday.',
      'Let\'s find a compromise that works for everyone.',
      'The tension in the room was obvious.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả cách bạn mediate một conflict giữa hai đồng nghiệp để đạt được compromise.',
      minWords: 30,
      phrases: ['A conflict arose between', 'I tried to mediate the situation by', 'We eventually reached a compromise', 'The tension has now been resolved'],
      sentenceBuilder: [
        { scrambled: 'The manager / (step in) / to mediate / the conflict', answer: 'The manager stepped in to mediate the conflict' },
        { scrambled: 'They / (reach) / a compromise / after talking', answer: 'They reached a compromise after talking' },
      ],
    },
  },
  { // Day 50 - Xử lý xung đột 2/5
    vocab: [
      { word: 'Misunderstanding', phonetic: '/ˌmɪsʌndərˈstændɪŋ/', meaning: 'Sự hiểu lầm', quiz: { options: ['Sự hiểu lầm', 'Giải quyết', 'Lắng nghe chủ động', 'Xin lỗi'], correct: 0 } },
      { word: 'Resolve issue',    phonetic: '/rɪˈzɒlv ˈɪʃuː/',    meaning: 'Giải quyết vấn đề', quiz: { options: ['Lắng nghe chủ động', 'Giải quyết vấn đề', 'Sự hiểu lầm', 'Xin lỗi'], correct: 1 } },
      { word: 'Active listening',  phonetic: '/ˈæktɪv ˈlɪsnɪŋ/', meaning: 'Lắng nghe chủ động', quiz: { options: ['Sự hiểu lầm', 'Giải quyết vấn đề', 'Xin lỗi', 'Lắng nghe chủ động'], correct: 3 } },
      { word: 'Apology',          phonetic: '/əˈpɒlədʒi/',       meaning: 'Lời xin lỗi',       quiz: { options: ['Lời xin lỗi', 'Lắng nghe chủ động', 'Sự hiểu lầm', 'Giải quyết vấn đề'], correct: 0 } },
      { word: 'Common ground',    phonetic: '/ˈkɒmən ɡraʊnd/',   meaning: 'Điểm chung',        quiz: { options: ['Sự hiểu lầm', 'Điểm chung', 'Lắng nghe chủ động', 'Lời xin lỗi'], correct: 1 } },
    ],
    reading: {
      title: 'Clearing Up a Misunderstanding',
      passage: 'A small misunderstanding about the report format caused unnecessary stress between Vy and her colleague. By practicing active listening, Vy understood the real problem and offered a sincere apology. They found common ground quickly, which helped resolve the issue before it grew bigger.',
      quiz: [
        { q: 'Sự hiểu lầm giữa Vy và đồng nghiệp là về điều gì?', options: ['Định dạng báo cáo', 'Thời gian nghỉ trưa', 'Chỗ ngồi trong văn phòng', 'Mức lương'], correct: 0 },
        { q: 'Vy làm gì để hiểu vấn đề thật sự?', options: ['Lắng nghe chủ động', 'Im lặng bỏ đi', 'Nhờ sếp can thiệp', 'Viết email tức giận'], correct: 0 },
      ],
    },
    listening: [
      'This was just a small misunderstanding.',
      'Let\'s resolve this issue quickly.',
      'Active listening can prevent many conflicts.',
      'She offered a sincere apology.',
    ],
    writing: {
      prompt: 'Viết một email ngắn (tiếng Anh) làm rõ một misunderstanding với đồng nghiệp, thể hiện active listening và tìm common ground.',
      minWords: 30,
      phrases: ['I believe this was just a misunderstanding', 'I want to resolve this issue together', 'Thank you for listening to my side', 'I think we can find common ground'],
      sentenceBuilder: [
        { scrambled: 'She / (offer) / a sincere apology / to her colleague', answer: 'She offered a sincere apology to her colleague' },
        { scrambled: 'They / (find) / common ground / quickly', answer: 'They found common ground quickly' },
      ],
    },
  },
  { // Day 51 - Xử lý xung đột 3/5
    vocab: [
      { word: 'Defensive',   phonetic: '/dɪˈfensɪv/',   meaning: 'Phòng thủ, tự vệ', quiz: { options: ['Phòng thủ, tự vệ', 'Bình tĩnh', 'Nhận lỗi', 'Chỉ trích'], correct: 0 } },
      { word: 'Stay calm',   phonetic: '/steɪ kɑːm/',   meaning: 'Giữ bình tĩnh',    quiz: { options: ['Chỉ trích', 'Giữ bình tĩnh', 'Phòng thủ, tự vệ', 'Nhận lỗi'], correct: 1 } },
      { word: 'Acknowledge fault', phonetic: '/əkˈnɒlɪdʒ fɔːlt/', meaning: 'Nhận lỗi', quiz: { options: ['Phòng thủ, tự vệ', 'Giữ bình tĩnh', 'Nhận lỗi', 'Chỉ trích'], correct: 2 } },
      { word: 'Criticize',   phonetic: '/ˈkrɪtɪsaɪz/',  meaning: 'Chỉ trích',        quiz: { options: ['Chỉ trích', 'Nhận lỗi', 'Giữ bình tĩnh', 'Phòng thủ, tự vệ'], correct: 0 } },
      { word: 'De-escalate', phonetic: '/diː ˈeskəleɪt/',meaning: 'Hạ nhiệt tình huống', quiz: { options: ['Hạ nhiệt tình huống', 'Chỉ trích', 'Nhận lỗi', 'Giữ bình tĩnh'], correct: 0 } },
    ],
    reading: {
      title: 'Staying Calm During Disagreements',
      passage: 'When a client started to criticize the delivery delay harshly, Quan tried hard to stay calm instead of becoming defensive. He decided to acknowledge fault where the company was responsible, which helped de-escalate the situation quickly. The client appreciated his honest and calm response.',
      quiz: [
        { q: 'Quân cố gắng làm gì khi khách hàng chỉ trích gay gắt?', options: ['Giữ bình tĩnh', 'Cãi lại ngay', 'Cúp máy', 'Chuyển cuộc gọi cho người khác'], correct: 0 },
        { q: 'Quân quyết định làm gì để hạ nhiệt tình huống?', options: ['Nhận lỗi phần công ty chịu trách nhiệm', 'Đổ lỗi cho khách hàng', 'Im lặng không trả lời', 'Hứa giảm giá ngay lập tức'], correct: 0 },
      ],
    },
    listening: [
      'Please try to stay calm during this call.',
      'There is no need to be defensive here.',
      'We should acknowledge our fault honestly.',
      'This will help de-escalate the situation.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả cách bạn stay calm và de-escalate khi khách hàng criticize công ty.',
      minWords: 30,
      phrases: ['I try to stay calm when', 'There is no need to become defensive', 'We are happy to acknowledge our fault', 'This helps de-escalate the situation'],
      sentenceBuilder: [
        { scrambled: 'He / (try) / to stay calm / instead of being defensive', answer: 'He tried to stay calm instead of being defensive' },
        { scrambled: 'This / (help) / de-escalate / the situation', answer: 'This helped de-escalate the situation' },
      ],
    },
  },
  { // Day 52 - Xử lý xung đột 4/5
    vocab: [
      { word: 'Perspective-taking', phonetic: '/pərˈspektɪv ˈteɪkɪŋ/', meaning: 'Đặt mình vào vị trí người khác', quiz: { options: ['Đặt mình vào vị trí người khác', 'Giải pháp trung lập', 'Ranh giới rõ ràng', 'Tôn trọng lẫn nhau'], correct: 0 } },
      { word: 'Neutral solution',  phonetic: '/ˈnuːtrəl səˈluːʃn/', meaning: 'Giải pháp trung lập', quiz: { options: ['Ranh giới rõ ràng', 'Giải pháp trung lập', 'Đặt mình vào vị trí người khác', 'Tôn trọng lẫn nhau'], correct: 1 } },
      { word: 'Set boundaries',    phonetic: '/set ˈbaʊndriz/',      meaning: 'Đặt ranh giới rõ ràng', quiz: { options: ['Đặt ranh giới rõ ràng', 'Giải pháp trung lập', 'Tôn trọng lẫn nhau', 'Đặt mình vào vị trí người khác'], correct: 0 } },
      { word: 'Mutual respect',    phonetic: '/ˈmjuːtʃuəl rɪˈspekt/', meaning: 'Sự tôn trọng lẫn nhau', quiz: { options: ['Ranh giới rõ ràng', 'Đặt mình vào vị trí người khác', 'Giải pháp trung lập', 'Sự tôn trọng lẫn nhau'], correct: 3 } },
      { word: 'Constructive',      phonetic: '/kənˈstrʌktɪv/',      meaning: 'Mang tính xây dựng', quiz: { options: ['Mang tính xây dựng', 'Sự tôn trọng lẫn nhau', 'Ranh giới rõ ràng', 'Giải pháp trung lập'], correct: 0 } },
    ],
    reading: {
      title: 'Turning Conflict into Constructive Dialogue',
      passage: 'Son practiced perspective-taking to better understand why his coworker disagreed with the new process. Instead of picking sides, he proposed a neutral solution that satisfied both people. He also learned to set boundaries so future disagreements could stay constructive and based on mutual respect.',
      quiz: [
        { q: 'Sơn thực hành điều gì để hiểu đồng nghiệp?', options: ['Đặt mình vào vị trí người khác', 'Phớt lờ ý kiến của họ', 'Nhờ sếp quyết định', 'Ghi âm cuộc trò chuyện'], correct: 0 },
        { q: 'Sơn đề xuất loại giải pháp nào?', options: ['Giải pháp trung lập', 'Giải pháp thiên vị', 'Không giải pháp nào', 'Giải pháp tốn kém'], correct: 0 },
      ],
    },
    listening: [
      'Try perspective-taking before you respond.',
      'We should look for a neutral solution.',
      'It is healthy to set clear boundaries.',
      'This conversation was based on mutual respect.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả cách bạn dùng perspective-taking để tìm neutral solution mang tính constructive.',
      minWords: 30,
      phrases: ['Perspective-taking helped me understand', 'We found a neutral solution by', 'It is important to set clear boundaries', 'Our discussion was constructive and based on mutual respect'],
      sentenceBuilder: [
        { scrambled: 'He / (propose) / a neutral solution / for both people', answer: 'He proposed a neutral solution for both people' },
        { scrambled: 'He / (learn) / to set boundaries / at work', answer: 'He learned to set boundaries at work' },
      ],
    },
  },
  { // Day 53 - Xử lý xung đột 5/5
    vocab: [
      { word: 'Grudge',      phonetic: '/ɡrʌdʒ/',      meaning: 'Sự thù hằn, ác cảm', quiz: { options: ['Sự thù hằn, ác cảm', 'Hòa giải', 'Bước tiếp', 'Xây dựng lại niềm tin'], correct: 0 } },
      { word: 'Make peace',  phonetic: '/meɪk piːs/', meaning: 'Làm hòa',          quiz: { options: ['Bước tiếp', 'Làm hòa', 'Sự thù hằn, ác cảm', 'Xây dựng lại niềm tin'], correct: 1 } },
      { word: 'Move on',     phonetic: '/muːv ɒn/',    meaning: 'Bước tiếp, cho qua chuyện cũ', quiz: { options: ['Sự thù hằn, ác cảm', 'Hòa giải', 'Bước tiếp, cho qua chuyện cũ', 'Xây dựng lại niềm tin'], correct: 2 } },
      { word: 'Restore trust',phonetic: '/rɪˈstɔːr trʌst/',meaning: 'Xây dựng lại niềm tin', quiz: { options: ['Xây dựng lại niềm tin', 'Sự thù hằn, ác cảm', 'Bước tiếp, cho qua chuyện cũ', 'Hòa giải'], correct: 0 } },
      { word: 'Forgive',     phonetic: '/fərˈɡɪv/',    meaning: 'Tha thứ',           quiz: { options: ['Tha thứ', 'Xây dựng lại niềm tin', 'Hòa giải', 'Sự thù hằn, ác cảm'], correct: 0 } },
    ],
    reading: {
      title: 'Letting Go of Workplace Grudges',
      passage: 'After a heated argument last month, Ha decided not to hold a grudge against her teammate. They agreed to make peace over coffee and talk honestly about what happened. Choosing to forgive and move on helped restore trust between them much faster than expected.',
      quiz: [
        { q: 'Hà quyết định không làm gì sau cuộc tranh cãi?', options: ['Giữ ác cảm với đồng nghiệp', 'Nghỉ việc ngay', 'Báo cáo lên sếp', 'Chuyển nhóm khác'], correct: 0 },
        { q: 'Việc chọn tha thứ và bước tiếp giúp điều gì?', options: ['Xây dựng lại niềm tin nhanh hơn', 'Làm mọi thứ tệ hơn', 'Gây thêm hiểu lầm', 'Không có tác dụng gì'], correct: 0 },
      ],
    },
    listening: [
      'I try not to hold a grudge at work.',
      'Let\'s make peace and talk things through.',
      'It is time to move on from this.',
      'We need to restore trust between the teams.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) về cách bạn chọn forgive và move on sau một xung đột, để restore trust với đồng nghiệp.',
      minWords: 30,
      phrases: ['I chose not to hold a grudge', 'We agreed to make peace by', 'It was time to move on from', 'This helped restore trust between us'],
      sentenceBuilder: [
        { scrambled: 'They / (agree) / to make peace / over coffee', answer: 'They agreed to make peace over coffee' },
        { scrambled: 'Forgiving / (help) / restore trust / faster', answer: 'Forgiving helped restore trust faster' },
      ],
    },
  },
  { // Day 54 - Chăm sóc khách hàng 1/5
    vocab: [
      { word: 'Customer service', phonetic: '/ˈkʌstəmər ˈsɜːrvɪs/', meaning: 'Dịch vụ khách hàng', quiz: { options: ['Dịch vụ khách hàng', 'Sự hài lòng', 'Khiếu nại', 'Giải quyết vấn đề'], correct: 0 } },
      { word: 'Satisfaction',     phonetic: '/ˌsætɪsˈfækʃn/',       meaning: 'Sự hài lòng',       quiz: { options: ['Khiếu nại', 'Sự hài lòng', 'Dịch vụ khách hàng', 'Giải quyết vấn đề'], correct: 1 } },
      { word: 'Complaint',        phonetic: '/kəmˈpleɪnt/',         meaning: 'Lời khiếu nại',     quiz: { options: ['Lời khiếu nại', 'Sự hài lòng', 'Giải quyết vấn đề', 'Dịch vụ khách hàng'], correct: 0 } },
      { word: 'Troubleshoot',     phonetic: '/ˈtrʌblʃuːt/',        meaning: 'Khắc phục sự cố',  quiz: { options: ['Dịch vụ khách hàng', 'Lời khiếu nại', 'Sự hài lòng', 'Khắc phục sự cố'], correct: 3 } },
      { word: 'Patient',          phonetic: '/ˈpeɪʃnt/',           meaning: 'Kiên nhẫn',         quiz: { options: ['Kiên nhẫn', 'Khắc phục sự cố', 'Lời khiếu nại', 'Sự hài lòng'], correct: 0 } },
    ],
    reading: {
      title: 'Handling a Customer Complaint',
      passage: 'A customer called in with a complaint about a late delivery, sounding quite frustrated. Dat remained patient while he helped troubleshoot the issue step by step. Good customer service like this often turns a complaint into long-term satisfaction.',
      quiz: [
        { q: 'Khách hàng gọi đến vì lý do gì?', options: ['Khiếu nại về giao hàng trễ', 'Hỏi giá sản phẩm mới', 'Đăng ký thành viên', 'Yêu cầu hoàn tiền ngay'], correct: 0 },
        { q: 'Đạt giữ thái độ như thế nào khi xử lý?', options: ['Kiên nhẫn', 'Nóng nảy', 'Thờ ơ', 'Vội vàng'], correct: 0 },
      ],
    },
    listening: [
      'Our customer service team is available 24/7.',
      'Customer satisfaction is our top priority.',
      'We received a complaint this morning.',
      'Let\'s troubleshoot this issue together.',
    ],
    writing: {
      prompt: 'Viết một email trả lời (tiếng Anh) một customer complaint, thể hiện sự patient và cam kết troubleshoot vấn đề.',
      minWords: 30,
      phrases: ['Thank you for bringing this complaint to our attention', 'We understand your frustration and will troubleshoot', 'Customer satisfaction is very important to us', 'We appreciate your patience while we resolve this'],
      sentenceBuilder: [
        { scrambled: 'He / (remain) / patient / while helping the customer', answer: 'He remained patient while helping the customer' },
        { scrambled: 'Good customer service / (turn) / complaints / into satisfaction', answer: 'Good customer service turns complaints into satisfaction' },
      ],
    },
  },
  { // Day 55 - Chăm sóc khách hàng 2/5
    vocab: [
      { word: 'Refund',      phonetic: '/ˈriːfʌnd/',    meaning: 'Hoàn tiền',        quiz: { options: ['Hoàn tiền', 'Đổi trả', 'Cam kết chất lượng', 'Bảo hành'], correct: 0 } },
      { word: 'Exchange',    phonetic: '/ɪksˈtʃeɪndʒ/', meaning: 'Đổi trả',          quiz: { options: ['Cam kết chất lượng', 'Đổi trả', 'Hoàn tiền', 'Bảo hành'], correct: 1 } },
      { word: 'Warranty',    phonetic: '/ˈwɒrənti/',    meaning: 'Bảo hành',         quiz: { options: ['Bảo hành', 'Đổi trả', 'Cam kết chất lượng', 'Hoàn tiền'], correct: 0 } },
      { word: 'Guarantee',   phonetic: '/ˌɡærənˈtiː/',  meaning: 'Cam kết, bảo đảm',  quiz: { options: ['Hoàn tiền', 'Bảo hành', 'Đổi trả', 'Cam kết, bảo đảm'], correct: 3 } },
      { word: 'Policy',      phonetic: '/ˈpɒləsi/',     meaning: 'Chính sách',       quiz: { options: ['Chính sách', 'Cam kết, bảo đảm', 'Bảo hành', 'Đổi trả'], correct: 0 } },
    ],
    reading: {
      title: 'Explaining Store Policies',
      passage: 'A customer asked whether she could get a refund or an exchange for a damaged item. Vy explained the store\'s warranty policy clearly and offered a full guarantee on replacement products. The customer left feeling confident about the company\'s commitment to quality.',
      quiz: [
        { q: 'Khách hàng hỏi về điều gì?', options: ['Hoàn tiền hoặc đổi trả', 'Giảm giá thêm', 'Giao hàng nhanh', 'Sản phẩm mới'], correct: 0 },
        { q: 'Vy giải thích rõ ràng điều gì?', options: ['Chính sách bảo hành', 'Chính sách lương', 'Chính sách tuyển dụng', 'Chính sách nghỉ phép'], correct: 0 },
      ],
    },
    listening: [
      'Can I get a refund for this item?',
      'We also offer an exchange option.',
      'This product comes with a one-year warranty.',
      'We guarantee full satisfaction with our policy.',
    ],
    writing: {
      prompt: 'Viết một đoạn giải thích (tiếng Anh) về refund, exchange và warranty policy của công ty cho khách hàng.',
      minWords: 30,
      phrases: ['We offer a full refund if', 'You are welcome to request an exchange', 'This product comes with a warranty of', 'Our policy guarantees'],
      sentenceBuilder: [
        { scrambled: 'She / (explain) / the warranty policy / clearly', answer: 'She explained the warranty policy clearly' },
        { scrambled: 'The customer / (leave) / feeling confident', answer: 'The customer left feeling confident' },
      ],
    },
  },
  { // Day 56 - Chăm sóc khách hàng 3/5
    vocab: [
      { word: 'Loyalty',      phonetic: '/ˈlɔɪəlti/',   meaning: 'Lòng trung thành',  quiz: { options: ['Lòng trung thành', 'Trải nghiệm', 'Cá nhân hóa', 'Vượt mong đợi'], correct: 0 } },
      { word: 'Experience',   phonetic: '/ɪkˈspɪəriəns/',meaning: 'Trải nghiệm',      quiz: { options: ['Cá nhân hóa', 'Trải nghiệm', 'Lòng trung thành', 'Vượt mong đợi'], correct: 1 } },
      { word: 'Personalize',  phonetic: '/ˈpɜːrsənəlaɪz/',meaning: 'Cá nhân hóa',     quiz: { options: ['Cá nhân hóa', 'Trải nghiệm', 'Vượt mong đợi', 'Lòng trung thành'], correct: 0 } },
      { word: 'Exceed expectations', phonetic: '/ɪkˈsiːd ˌekspekˈteɪʃnz/', meaning: 'Vượt mong đợi', quiz: { options: ['Lòng trung thành', 'Cá nhân hóa', 'Trải nghiệm', 'Vượt mong đợi'], correct: 3 } },
      { word: 'Feedback loop', phonetic: '/ˈfiːdbæk luːp/',meaning: 'Vòng phản hồi', quiz: { options: ['Vòng phản hồi', 'Vượt mong đợi', 'Trải nghiệm', 'Cá nhân hóa'], correct: 0 } },
    ],
    reading: {
      title: 'Building Customer Loyalty',
      passage: 'Minh\'s team focuses on personalizing every customer experience to build stronger loyalty over time. They created a feedback loop where customer comments directly shape new features. This approach has helped the company consistently exceed expectations.',
      quiz: [
        { q: 'Nhóm của Minh tập trung vào việc gì?', options: ['Cá nhân hóa trải nghiệm khách hàng', 'Giảm giá liên tục', 'Tăng số lượng nhân viên', 'Mở rộng văn phòng'], correct: 0 },
        { q: 'Vòng phản hồi giúp gì cho công ty?', options: ['Định hình tính năng mới', 'Giảm chi phí quảng cáo', 'Tăng lương nhân viên', 'Giảm số lượng khách hàng'], correct: 0 },
      ],
    },
    listening: [
      'Customer loyalty is built over time.',
      'We want every experience to feel personal.',
      'We try to personalize each interaction.',
      'Our goal is to exceed expectations.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả cách công ty bạn personalize customer experience để xây dựng loyalty.',
      minWords: 30,
      phrases: ['We aim to personalize every customer experience', 'Building loyalty starts with', 'Our feedback loop helps us', 'We always try to exceed expectations'],
      sentenceBuilder: [
        { scrambled: 'The team / (focus) / on personalizing / customer experience', answer: 'The team focuses on personalizing customer experience' },
        { scrambled: 'This approach / (help) / exceed / expectations', answer: 'This approach helps exceed expectations' },
      ],
    },
  },
  { // Day 57 - Chăm sóc khách hàng 4/5
    vocab: [
      { word: 'Escalation',   phonetic: '/ˌeskəˈleɪʃn/', meaning: 'Sự leo thang (khiếu nại)', quiz: { options: ['Sự leo thang (khiếu nại)', 'Giải quyết ngay lần đầu', 'Khách hàng khó tính', 'Xin lỗi chân thành'], correct: 0 } },
      { word: 'First-call resolution', phonetic: '/fɜːrst kɔːl ˌrezəˈluːʃn/', meaning: 'Giải quyết ngay lần liên hệ đầu', quiz: { options: ['Khách hàng khó tính', 'Giải quyết ngay lần liên hệ đầu', 'Sự leo thang (khiếu nại)', 'Xin lỗi chân thành'], correct: 1 } },
      { word: 'Difficult customer', phonetic: '/ˈdɪfɪkəlt ˈkʌstəmər/', meaning: 'Khách hàng khó tính', quiz: { options: ['Khách hàng khó tính', 'Giải quyết ngay lần liên hệ đầu', 'Xin lỗi chân thành', 'Sự leo thang (khiếu nại)'], correct: 0 } },
      { word: 'Sincere apology', phonetic: '/sɪnˈsɪər əˈpɒlədʒi/', meaning: 'Lời xin lỗi chân thành', quiz: { options: ['Sự leo thang (khiếu nại)', 'Khách hàng khó tính', 'Giải quyết ngay lần liên hệ đầu', 'Lời xin lỗi chân thành'], correct: 3 } },
      { word: 'Calm down',    phonetic: '/kɑːm daʊn/',  meaning: 'Bình tĩnh lại',   quiz: { options: ['Bình tĩnh lại', 'Xin lỗi chân thành', 'Khách hàng khó tính', 'Sự leo thang (khiếu nại)'], correct: 0 } },
    ],
    reading: {
      title: 'Handling a Difficult Customer',
      passage: 'Yen dealt with a difficult customer who demanded to speak with a manager right away. She helped him calm down with a sincere apology before achieving first-call resolution without any escalation. Her manager later praised her for solving the issue so smoothly.',
      quiz: [
        { q: 'Khách hàng khó tính yêu cầu điều gì?', options: ['Gặp quản lý ngay', 'Hoàn tiền gấp đôi', 'Đóng cửa cửa hàng', 'Sa thải nhân viên'], correct: 0 },
        { q: 'Yến đạt được điều gì mà không cần leo thang?', options: ['Giải quyết ngay lần liên hệ đầu', 'Chuyển cuộc gọi cho đồng nghiệp', 'Hứa hẹn không rõ ràng', 'Từ chối hỗ trợ'], correct: 0 },
      ],
    },
    listening: [
      'This is a difficult customer, please be patient.',
      'We aim for first-call resolution whenever possible.',
      'Let\'s try to avoid any further escalation.',
      'A sincere apology can calm the situation down.',
    ],
    writing: {
      prompt: 'Viết một đoạn hội thoại/email ngắn (tiếng Anh) xử lý một difficult customer, dùng sincere apology để đạt first-call resolution.',
      minWords: 30,
      phrases: ['We sincerely apologize for the inconvenience', 'We would like to resolve this on the first call', 'We understand this has been frustrating', 'Let us help calm things down'],
      sentenceBuilder: [
        { scrambled: 'She / (help) / him / calm down / with an apology', answer: 'She helped him calm down with an apology' },
        { scrambled: 'She / (achieve) / first-call resolution / without escalation', answer: 'She achieved first-call resolution without escalation' },
      ],
    },
  },
  { // Day 58 - Chăm sóc khách hàng 5/5
    vocab: [
      { word: 'Retention rate', phonetic: '/rɪˈtenʃn reɪt/', meaning: 'Tỷ lệ giữ chân khách hàng', quiz: { options: ['Tỷ lệ giữ chân khách hàng', 'Vòng đời khách hàng', 'Khách hàng thân thiết', 'Đánh giá trực tuyến'], correct: 0 } },
      { word: 'Customer lifecycle', phonetic: '/ˈkʌstəmər ˈlaɪfsaɪkl/', meaning: 'Vòng đời khách hàng', quiz: { options: ['Khách hàng thân thiết', 'Vòng đời khách hàng', 'Tỷ lệ giữ chân khách hàng', 'Đánh giá trực tuyến'], correct: 1 } },
      { word: 'Loyal customer',  phonetic: '/ˈlɔɪəl ˈkʌstəmər/', meaning: 'Khách hàng thân thiết', quiz: { options: ['Vòng đời khách hàng', 'Khách hàng thân thiết', 'Đánh giá trực tuyến', 'Tỷ lệ giữ chân khách hàng'], correct: 1 } },
      { word: 'Online review',   phonetic: '/ˈɒnlaɪn rɪˈvjuː/', meaning: 'Đánh giá trực tuyến', quiz: { options: ['Tỷ lệ giữ chân khách hàng', 'Khách hàng thân thiết', 'Vòng đời khách hàng', 'Đánh giá trực tuyến'], correct: 3 } },
      { word: 'Word of mouth',   phonetic: '/wɜːrd əv maʊθ/', meaning: 'Truyền miệng',       quiz: { options: ['Truyền miệng', 'Đánh giá trực tuyến', 'Khách hàng thân thiết', 'Vòng đời khách hàng'], correct: 0 } },
    ],
    reading: {
      title: 'Turning Customers into Advocates',
      passage: 'Hung studied the entire customer lifecycle to find ways to improve the retention rate at each stage. He noticed that loyal customers often leave positive online reviews and spread word of mouth to their friends. This natural promotion has become one of the company\'s most valuable marketing tools.',
      quiz: [
        { q: 'Hùng nghiên cứu điều gì để cải thiện tỷ lệ giữ chân?', options: ['Toàn bộ vòng đời khách hàng', 'Bảng lương nhân viên', 'Báo cáo tài chính', 'Chiến lược tuyển dụng'], correct: 0 },
        { q: 'Khách hàng thân thiết thường làm gì?', options: ['Để lại đánh giá tích cực và truyền miệng', 'Ngừng mua hàng', 'Chuyển sang đối thủ', 'Phàn nàn liên tục'], correct: 0 },
      ],
    },
    listening: [
      'Our retention rate improved this year.',
      'We track the entire customer lifecycle.',
      'Loyal customers are our biggest asset.',
      'Word of mouth brings us many new customers.',
    ],
    writing: {
      prompt: 'Viết một đoạn báo cáo ngắn (tiếng Anh) về retention rate và cách loyal customer giúp qua word of mouth và online review.',
      minWords: 30,
      phrases: ['Our retention rate has improved because', 'We value our loyal customers greatly', 'Positive online reviews help us grow', 'Word of mouth remains a powerful tool'],
      sentenceBuilder: [
        { scrambled: 'He / (study) / the customer lifecycle / carefully', answer: 'He studied the customer lifecycle carefully' },
        { scrambled: 'Loyal customers / (leave) / positive online reviews', answer: 'Loyal customers leave positive online reviews' },
      ],
    },
  },
  { // Day 59 - Chuyển đổi số 1/5
    vocab: [
      { word: 'Digital transformation', phonetic: '/ˈdɪdʒɪtl ˌtrænsfərˈmeɪʃn/', meaning: 'Chuyển đổi số', quiz: { options: ['Chuyển đổi số', 'Tự động hóa', 'Nền tảng', 'Nâng cấp hệ thống'], correct: 0 } },
      { word: 'Automation',   phonetic: '/ˌɔːtəˈmeɪʃn/', meaning: 'Tự động hóa',    quiz: { options: ['Nền tảng', 'Tự động hóa', 'Chuyển đổi số', 'Nâng cấp hệ thống'], correct: 1 } },
      { word: 'Platform',     phonetic: '/ˈplætfɔːrm/', meaning: 'Nền tảng',        quiz: { options: ['Nền tảng', 'Tự động hóa', 'Nâng cấp hệ thống', 'Chuyển đổi số'], correct: 0 } },
      { word: 'Upgrade',      phonetic: '/ʌpˈɡreɪd/',  meaning: 'Nâng cấp hệ thống', quiz: { options: ['Chuyển đổi số', 'Nền tảng', 'Tự động hóa', 'Nâng cấp hệ thống'], correct: 3 } },
      { word: 'Legacy system',phonetic: '/ˈleɡəsi ˈsɪstəm/', meaning: 'Hệ thống cũ, lỗi thời', quiz: { options: ['Hệ thống cũ, lỗi thời', 'Nâng cấp hệ thống', 'Nền tảng', 'Tự động hóa'], correct: 0 } },
    ],
    reading: {
      title: 'Starting the Digital Transformation Journey',
      passage: 'The company began its digital transformation by replacing an outdated legacy system with a modern cloud platform. Automation reduced manual paperwork significantly across every department. Employees needed a full week of training to adjust to the upgrade smoothly.',
      quiz: [
        { q: 'Công ty bắt đầu chuyển đổi số bằng cách nào?', options: ['Thay thế hệ thống cũ bằng nền tảng đám mây', 'Sa thải nhân viên IT', 'Đóng cửa văn phòng', 'Mua thêm máy in'], correct: 0 },
        { q: 'Nhân viên cần bao lâu để làm quen với việc nâng cấp?', options: ['Một tuần', 'Một ngày', 'Một năm', 'Một tháng'], correct: 0 },
      ],
    },
    listening: [
      'Digital transformation is a top priority this year.',
      'Automation has reduced our manual work.',
      'We moved everything to a new platform.',
      'This legacy system needs an upgrade.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả quá trình digital transformation tại công ty bạn, từ legacy system đến platform mới.',
      minWords: 30,
      phrases: ['Our digital transformation began with', 'Automation has helped us reduce', 'We upgraded from an old legacy system to', 'The new platform makes work easier'],
      sentenceBuilder: [
        { scrambled: 'The company / (replace) / the legacy system / last year', answer: 'The company replaced the legacy system last year' },
        { scrambled: 'Automation / (reduce) / manual paperwork / significantly', answer: 'Automation reduced manual paperwork significantly' },
      ],
    },
  },
  { // Day 60 - Chuyển đổi số 2/5
    vocab: [
      { word: 'Cloud computing', phonetic: '/klaʊd kəmˈpjuːtɪŋ/', meaning: 'Điện toán đám mây', quiz: { options: ['Điện toán đám mây', 'An ninh mạng', 'Rò rỉ dữ liệu', 'Sao lưu dữ liệu'], correct: 0 } },
      { word: 'Cybersecurity',  phonetic: '/ˈsaɪbərsɪˌkjʊərəti/', meaning: 'An ninh mạng', quiz: { options: ['Rò rỉ dữ liệu', 'An ninh mạng', 'Điện toán đám mây', 'Sao lưu dữ liệu'], correct: 1 } },
      { word: 'Data breach',    phonetic: '/ˈdeɪtə briːtʃ/', meaning: 'Rò rỉ dữ liệu', quiz: { options: ['Rò rỉ dữ liệu', 'An ninh mạng', 'Sao lưu dữ liệu', 'Điện toán đám mây'], correct: 0 } },
      { word: 'Backup',         phonetic: '/ˈbækʌp/', meaning: 'Sao lưu dữ liệu',  quiz: { options: ['Điện toán đám mây', 'Rò rỉ dữ liệu', 'An ninh mạng', 'Sao lưu dữ liệu'], correct: 3 } },
      { word: 'Encrypt',        phonetic: '/ɪnˈkrɪpt/', meaning: 'Mã hóa',        quiz: { options: ['Mã hóa', 'Sao lưu dữ liệu', 'Rò rỉ dữ liệu', 'An ninh mạng'], correct: 0 } },
    ],
    reading: {
      title: 'Protecting Company Data',
      passage: 'After moving to cloud computing, Dat\'s company invested heavily in cybersecurity to prevent any future data breach. All sensitive files are now encrypted and backed up daily. This proactive approach gave clients much more confidence in the company\'s data protection.',
      quiz: [
        { q: 'Công ty của Đạt đầu tư mạnh vào điều gì sau khi chuyển sang cloud?', options: ['An ninh mạng', 'Quảng cáo', 'Tuyển dụng', 'Bất động sản'], correct: 0 },
        { q: 'Tất cả file nhạy cảm giờ được xử lý như thế nào?', options: ['Mã hóa và sao lưu hàng ngày', 'Xóa bỏ hoàn toàn', 'In ra giấy', 'Gửi qua email công khai'], correct: 0 },
      ],
    },
    listening: [
      'We moved to cloud computing last year.',
      'Cybersecurity is a top concern for us.',
      'A data breach could damage our reputation.',
      'All files are encrypted and backed up daily.',
    ],
    writing: {
      prompt: 'Viết một đoạn thông báo nội bộ (tiếng Anh) về chính sách cybersecurity mới, nhấn mạnh backup và encrypt dữ liệu.',
      minWords: 30,
      phrases: ['We have strengthened our cybersecurity policy', 'All data must be encrypted before', 'Please back up your files regularly', 'This helps prevent any data breach'],
      sentenceBuilder: [
        { scrambled: 'The company / (invest) / heavily / in cybersecurity', answer: 'The company invested heavily in cybersecurity' },
        { scrambled: 'All files / (be) / encrypted / and backed up daily', answer: 'All files are encrypted and backed up daily' },
      ],
    },
  },
  { // Day 61 - Chuyển đổi số 3/5
    vocab: [
      { word: 'Artificial intelligence', phonetic: '/ˌɑːrtɪˈfɪʃl ɪnˈtelɪdʒəns/', meaning: 'Trí tuệ nhân tạo', quiz: { options: ['Trí tuệ nhân tạo', 'Phân tích dữ liệu', 'Chatbot', 'Hiệu quả'], correct: 0 } },
      { word: 'Data analytics', phonetic: '/ˈdeɪtə ænəˈlɪtɪks/', meaning: 'Phân tích dữ liệu', quiz: { options: ['Chatbot', 'Phân tích dữ liệu', 'Trí tuệ nhân tạo', 'Hiệu quả'], correct: 1 } },
      { word: 'Chatbot',        phonetic: '/ˈtʃætbɒt/', meaning: 'Chatbot (trợ lý ảo)', quiz: { options: ['Chatbot (trợ lý ảo)', 'Phân tích dữ liệu', 'Hiệu quả', 'Trí tuệ nhân tạo'], correct: 0 } },
      { word: 'Streamline',     phonetic: '/ˈstriːmlaɪn/', meaning: 'Tinh gọn, đơn giản hóa', quiz: { options: ['Trí tuệ nhân tạo', 'Chatbot (trợ lý ảo)', 'Tinh gọn, đơn giản hóa', 'Phân tích dữ liệu'], correct: 2 } },
      { word: 'Insightful',     phonetic: '/ˈɪnsaɪtfl/', meaning: 'Sâu sắc, nhiều thông tin hữu ích', quiz: { options: ['Sâu sắc, nhiều thông tin hữu ích', 'Chatbot (trợ lý ảo)', 'Tinh gọn, đơn giản hóa', 'Trí tuệ nhân tạo'], correct: 0 } },
    ],
    reading: {
      title: 'Using AI to Streamline Support',
      passage: 'Lan\'s company introduced a chatbot powered by artificial intelligence to handle simple customer questions. This helped streamline the support process and freed up staff for more complex cases. Data analytics from the chatbot also gave the team insightful ideas about common customer concerns.',
      quiz: [
        { q: 'Công ty của Lan giới thiệu chatbot để làm gì?', options: ['Xử lý câu hỏi đơn giản của khách hàng', 'Thay thế toàn bộ nhân viên', 'Quản lý tài chính', 'Tuyển dụng nhân sự'], correct: 0 },
        { q: 'Phân tích dữ liệu từ chatbot mang lại điều gì?', options: ['Thông tin sâu sắc về mối quan tâm của khách hàng', 'Doanh thu tăng ngay lập tức', 'Giảm giá sản phẩm', 'Ít khách hàng hơn'], correct: 0 },
      ],
    },
    listening: [
      'Our new chatbot uses artificial intelligence.',
      'Data analytics helps us understand customers better.',
      'This chatbot handles simple questions well.',
      'We streamlined the entire support process.',
    ],
    writing: {
      prompt: 'Viết một đoạn giới thiệu ngắn (tiếng Anh) về một chatbot mới dùng artificial intelligence để streamline công việc.',
      minWords: 30,
      phrases: ['We introduced a new chatbot powered by', 'This helps streamline our support process', 'Data analytics gives us insightful information about', 'Artificial intelligence has changed the way we work'],
      sentenceBuilder: [
        { scrambled: 'The company / (introduce) / a chatbot / last month', answer: 'The company introduced a chatbot last month' },
        { scrambled: 'This / (help) / streamline / the support process', answer: 'This helped streamline the support process' },
      ],
    },
  },
  { // Day 62 - Chuyển đổi số 4/5
    vocab: [
      { word: 'Digital literacy', phonetic: '/ˈdɪdʒɪtl ˈlɪtərəsi/', meaning: 'Năng lực số', quiz: { options: ['Năng lực số', 'Áp dụng công nghệ', 'Số hóa', 'Kháng cự thay đổi'], correct: 0 } },
      { word: 'Adopt technology', phonetic: '/əˈdɒpt tekˈnɒlədʒi/', meaning: 'Áp dụng công nghệ', quiz: { options: ['Số hóa', 'Áp dụng công nghệ', 'Năng lực số', 'Kháng cự thay đổi'], correct: 1 } },
      { word: 'Digitize',       phonetic: '/ˈdɪdʒɪtaɪz/', meaning: 'Số hóa',        quiz: { options: ['Số hóa', 'Áp dụng công nghệ', 'Kháng cự thay đổi', 'Năng lực số'], correct: 0 } },
      { word: 'Resistance to change', phonetic: '/rɪˈzɪstəns tuː tʃeɪndʒ/', meaning: 'Sự kháng cự thay đổi', quiz: { options: ['Năng lực số', 'Số hóa', 'Áp dụng công nghệ', 'Sự kháng cự thay đổi'], correct: 3 } },
      { word: 'User-friendly',  phonetic: '/ˈjuːzər ˈfrendli/', meaning: 'Dễ sử dụng', quiz: { options: ['Dễ sử dụng', 'Sự kháng cự thay đổi', 'Số hóa', 'Áp dụng công nghệ'], correct: 0 } },
    ],
    reading: {
      title: 'Overcoming Resistance to New Technology',
      passage: 'When the company decided to digitize all paper records, some older employees showed resistance to change. To help, Vy organized workshops to improve everyone\'s digital literacy step by step. Choosing a user-friendly system made it much easier for the whole team to adopt technology confidently.',
      quiz: [
        { q: 'Một số nhân viên lớn tuổi phản ứng thế nào khi số hóa hồ sơ?', options: ['Kháng cự thay đổi', 'Rất hào hứng', 'Không quan tâm', 'Yêu cầu tăng lương'], correct: 0 },
        { q: 'Vy tổ chức gì để giúp cải thiện năng lực số?', options: ['Các buổi workshop', 'Một kỳ nghỉ', 'Một cuộc thi', 'Một buổi tiệc'], correct: 0 },
      ],
    },
    listening: [
      'Digital literacy is important for everyone now.',
      'It took time for the team to adopt this technology.',
      'We are digitizing all our paper records.',
      'Some employees showed resistance to change at first.',
    ],
    writing: {
      prompt: 'Viết một đoạn kế hoạch ngắn (tiếng Anh) giúp đồng nghiệp cải thiện digital literacy và giảm resistance to change.',
      minWords: 30,
      phrases: ['We plan to improve digital literacy through', 'Some employees showed resistance to change at first', 'We chose a user-friendly system to help', 'This made it easier to adopt technology'],
      sentenceBuilder: [
        { scrambled: 'She / (organize) / workshops / to improve digital literacy', answer: 'She organized workshops to improve digital literacy' },
        { scrambled: 'The system / (be) / user-friendly / for everyone', answer: 'The system was user-friendly for everyone' },
      ],
    },
  },
  { // Day 63 - Chuyển đổi số 5/5
    vocab: [
      { word: 'Innovation',    phonetic: '/ˌɪnəˈveɪʃn/', meaning: 'Sự đổi mới, sáng tạo', quiz: { options: ['Sự đổi mới, sáng tạo', 'Phá vỡ thị trường', 'Khả năng mở rộng', 'Thích nghi'], correct: 0 } },
      { word: 'Disrupt',       phonetic: '/dɪsˈrʌpt/', meaning: 'Phá vỡ, làm đảo lộn', quiz: { options: ['Khả năng mở rộng', 'Phá vỡ, làm đảo lộn', 'Sự đổi mới, sáng tạo', 'Thích nghi'], correct: 1 } },
      { word: 'Scalable',      phonetic: '/ˈskeɪləbl/', meaning: 'Có khả năng mở rộng', quiz: { options: ['Có khả năng mở rộng', 'Phá vỡ, làm đảo lộn', 'Thích nghi', 'Sự đổi mới, sáng tạo'], correct: 0 } },
      { word: 'Adapt',         phonetic: '/əˈdæpt/', meaning: 'Thích nghi',       quiz: { options: ['Sự đổi mới, sáng tạo', 'Có khả năng mở rộng', 'Phá vỡ, làm đảo lộn', 'Thích nghi'], correct: 3 } },
      { word: 'Competitive edge', phonetic: '/kəmˈpetətɪv edʒ/', meaning: 'Lợi thế cạnh tranh', quiz: { options: ['Lợi thế cạnh tranh', 'Thích nghi', 'Có khả năng mở rộng', 'Phá vỡ, làm đảo lộn'], correct: 0 } },
    ],
    reading: {
      title: 'Staying Ahead Through Innovation',
      passage: 'Son believes that continuous innovation is the only way to stay ahead when new startups disrupt the market every year. His team built a scalable solution that can adapt quickly to changing customer needs. This flexibility gives the company a real competitive edge.',
      quiz: [
        { q: 'Sơn tin rằng điều gì giúp công ty đi trước?', options: ['Sự đổi mới liên tục', 'Giữ nguyên mọi thứ', 'Giảm giá liên tục', 'Sa thải nhân viên'], correct: 0 },
        { q: 'Giải pháp của nhóm Sơn có đặc điểm gì?', options: ['Có khả năng mở rộng và thích nghi nhanh', 'Rất tốn kém', 'Chỉ dùng được một lần', 'Khó sử dụng'], correct: 0 },
      ],
    },
    listening: [
      'Innovation keeps us ahead of competitors.',
      'New startups disrupt the market every year.',
      'We built a scalable solution for growth.',
      'This gives us a real competitive edge.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) trình bày cách công ty bạn dùng innovation để tạo competitive edge trong thị trường bị disrupt.',
      minWords: 30,
      phrases: ['Continuous innovation helps us stay ahead', 'New startups continue to disrupt the market', 'We built a scalable solution that can', 'This gives us a real competitive edge'],
      sentenceBuilder: [
        { scrambled: 'His team / (build) / a scalable solution', answer: 'His team built a scalable solution' },
        { scrambled: 'This flexibility / (give) / the company / a competitive edge', answer: 'This flexibility gives the company a competitive edge' },
      ],
    },
  },
  { // Day 64 - Làm việc từ xa 1/5
    vocab: [
      { word: 'Remote work',   phonetic: '/rɪˈmoʊt wɜːrk/', meaning: 'Làm việc từ xa', quiz: { options: ['Làm việc từ xa', 'Họp trực tuyến', 'Múi giờ', 'Kết nối internet'], correct: 0 } },
      { word: 'Video call',    phonetic: '/ˈvɪdioʊ kɔːl/', meaning: 'Cuộc gọi video', quiz: { options: ['Múi giờ', 'Cuộc gọi video', 'Làm việc từ xa', 'Kết nối internet'], correct: 1 } },
      { word: 'Time zone',     phonetic: '/taɪm zoʊn/', meaning: 'Múi giờ',         quiz: { options: ['Múi giờ', 'Cuộc gọi video', 'Kết nối internet', 'Làm việc từ xa'], correct: 0 } },
      { word: 'Connectivity',  phonetic: '/ˌkɒnekˈtɪvəti/', meaning: 'Kết nối internet', quiz: { options: ['Làm việc từ xa', 'Múi giờ', 'Cuộc gọi video', 'Kết nối internet'], correct: 3 } },
      { word: 'Home office',   phonetic: '/hoʊm ˈɒfɪs/', meaning: 'Văn phòng tại nhà', quiz: { options: ['Văn phòng tại nhà', 'Kết nối internet', 'Múi giờ', 'Cuộc gọi video'], correct: 0 } },
    ],
    reading: {
      title: 'Adjusting to Remote Work',
      passage: 'Since switching to remote work, Ha has set up a proper home office to stay focused during the day. She schedules video calls carefully because her clients are in different time zones. Reliable connectivity has become one of the most important tools for her daily routine.',
      quiz: [
        { q: 'Hà đã làm gì kể từ khi chuyển sang làm việc từ xa?', options: ['Thiết lập văn phòng tại nhà', 'Nghỉ việc luôn', 'Chuyển đến thành phố khác', 'Mua thêm máy tính mới'], correct: 0 },
        { q: 'Vì sao Hà phải lên lịch cuộc gọi video cẩn thận?', options: ['Khách hàng ở các múi giờ khác nhau', 'Cô ấy quá bận rộn', 'Mạng internet yếu', 'Công ty yêu cầu vậy'], correct: 0 },
      ],
    },
    listening: [
      'Remote work has become the new normal.',
      'Let\'s schedule a video call for tomorrow.',
      'What time zone are you in?',
      'I set up a small home office last month.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả cách bạn tổ chức home office và quản lý video call qua các time zone khác nhau.',
      minWords: 30,
      phrases: ['Since I started remote work, I have', 'I set up my home office to', 'We need to schedule this video call around', 'Good connectivity is essential for'],
      sentenceBuilder: [
        { scrambled: 'She / (set up) / a proper home office', answer: 'She set up a proper home office' },
        { scrambled: 'Her clients / (be) / in different time zones', answer: 'Her clients are in different time zones' },
      ],
    },
  },
  { // Day 65 - Làm việc từ xa 2/5
    vocab: [
      { word: 'Async communication', phonetic: '/eɪˈsɪŋk kəˌmjuːnɪˈkeɪʃn/', meaning: 'Giao tiếp không đồng bộ', quiz: { options: ['Giao tiếp không đồng bộ', 'Sự cô lập', 'Sự linh hoạt', 'Kỷ luật tự giác'], correct: 0 } },
      { word: 'Isolation',    phonetic: '/ˌaɪsəˈleɪʃn/', meaning: 'Sự cô lập',        quiz: { options: ['Sự linh hoạt', 'Sự cô lập', 'Giao tiếp không đồng bộ', 'Kỷ luật tự giác'], correct: 1 } },
      { word: 'Flexibility',  phonetic: '/ˌfleksəˈbɪləti/', meaning: 'Sự linh hoạt', quiz: { options: ['Sự linh hoạt', 'Sự cô lập', 'Kỷ luật tự giác', 'Giao tiếp không đồng bộ'], correct: 0 } },
      { word: 'Self-discipline', phonetic: '/self ˈdɪsəplɪn/', meaning: 'Kỷ luật tự giác', quiz: { options: ['Giao tiếp không đồng bộ', 'Sự linh hoạt', 'Sự cô lập', 'Kỷ luật tự giác'], correct: 3 } },
      { word: 'Check-in',     phonetic: '/tʃek ɪn/', meaning: 'Điểm danh, cập nhật ngắn', quiz: { options: ['Điểm danh, cập nhật ngắn', 'Kỷ luật tự giác', 'Sự linh hoạt', 'Sự cô lập'], correct: 0 } },
    ],
    reading: {
      title: 'Staying Connected While Working Remotely',
      passage: 'Minh appreciates the flexibility of remote work, but he sometimes feels isolation without his usual office chats. His team now relies more on async communication through shared documents instead of constant meetings. A quick daily check-in still helps everyone feel connected despite the distance.',
      quiz: [
        { q: 'Minh cảm nhận điều gì khi làm việc từ xa?', options: ['Sự cô lập đôi lúc', 'Luôn vui vẻ', 'Ít áp lực hơn hẳn', 'Không có gì thay đổi'], correct: 0 },
        { q: 'Nhóm của Minh giờ đây phụ thuộc nhiều hơn vào điều gì?', options: ['Giao tiếp không đồng bộ', 'Họp mặt trực tiếp hàng ngày', 'Gọi điện thoại liên tục', 'Gửi thư tay'], correct: 0 },
      ],
    },
    listening: [
      'I really appreciate the flexibility of remote work.',
      'Sometimes I feel isolation working from home.',
      'We rely on async communication a lot now.',
      'Self-discipline is essential when working remotely.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) chia sẻ cách bạn duy trì self-discipline và tránh isolation khi làm remote work.',
      minWords: 30,
      phrases: ['I really appreciate the flexibility of remote work', 'To avoid isolation, I always', 'Async communication helps our team', 'A quick daily check-in keeps us connected'],
      sentenceBuilder: [
        { scrambled: 'He / (feel) / isolation / without office chats', answer: 'He feels isolation without office chats' },
        { scrambled: 'A daily check-in / (help) / everyone / feel connected', answer: 'A daily check-in helps everyone feel connected' },
      ],
    },
  },
  { // Day 66 - Làm việc từ xa 3/5
    vocab: [
      { word: 'Virtual meeting', phonetic: '/ˈvɜːrtʃuəl ˈmiːtɪŋ/', meaning: 'Cuộc họp trực tuyến', quiz: { options: ['Cuộc họp trực tuyến', 'Chia sẻ màn hình', 'Tắt tiếng', 'Băng thông internet'], correct: 0 } },
      { word: 'Screen share',   phonetic: '/skriːn ʃeər/', meaning: 'Chia sẻ màn hình', quiz: { options: ['Tắt tiếng', 'Chia sẻ màn hình', 'Cuộc họp trực tuyến', 'Băng thông internet'], correct: 1 } },
      { word: 'Mute',           phonetic: '/mjuːt/', meaning: 'Tắt tiếng',         quiz: { options: ['Chia sẻ màn hình', 'Cuộc họp trực tuyến', 'Tắt tiếng', 'Băng thông internet'], correct: 2 } },
      { word: 'Bandwidth',      phonetic: '/ˈbændwɪdθ/', meaning: 'Băng thông internet', quiz: { options: ['Cuộc họp trực tuyến', 'Chia sẻ màn hình', 'Tắt tiếng', 'Băng thông internet'], correct: 3 } },
      { word: 'Reschedule',     phonetic: '/riːˈskedʒuːl/', meaning: 'Dời lịch',   quiz: { options: ['Dời lịch', 'Băng thông internet', 'Chia sẻ màn hình', 'Tắt tiếng'], correct: 0 } },
    ],
    reading: {
      title: 'Running an Effective Virtual Meeting',
      passage: 'Before starting the virtual meeting, Quan reminded everyone to mute their microphones to avoid background noise. He used screen share to present the slides clearly to the whole team. When his bandwidth suddenly dropped, they had to reschedule the last part of the discussion.',
      quiz: [
        { q: 'Quân nhắc mọi người làm gì trước khi họp?', options: ['Tắt tiếng micro', 'Bật camera', 'Tắt máy tính', 'Rời khỏi phòng'], correct: 0 },
        { q: 'Điều gì khiến họ phải dời lịch phần cuối buổi họp?', options: ['Băng thông internet giảm đột ngột', 'Hết thời gian phòng họp', 'Mất điện toàn công ty', 'Có việc khẩn cấp khác'], correct: 0 },
      ],
    },
    listening: [
      'Please mute yourself during the virtual meeting.',
      'Can you screen share your slides?',
      'My bandwidth is a bit slow today.',
      'Let\'s reschedule this meeting for tomorrow.',
    ],
    writing: {
      prompt: 'Viết một email ngắn (tiếng Anh) mời đồng nghiệp tham gia virtual meeting, kèm hướng dẫn mute và screen share.',
      minWords: 30,
      phrases: ['Please join our virtual meeting at', 'Kindly mute your microphone when not speaking', 'I will screen share the presentation', 'Please let me know if we need to reschedule'],
      sentenceBuilder: [
        { scrambled: 'He / (remind) / everyone / to mute their microphones', answer: 'He reminded everyone to mute their microphones' },
        { scrambled: 'They / (have to) / reschedule / the discussion', answer: 'They had to reschedule the discussion' },
      ],
    },
  },
  { // Day 67 - Làm việc từ xa 4/5
    vocab: [
      { word: 'Work-life balance', phonetic: '/wɜːrk laɪf ˈbæləns/', meaning: 'Cân bằng công việc và cuộc sống', quiz: { options: ['Cân bằng công việc và cuộc sống', 'Giờ làm việc linh hoạt', 'Ranh giới rõ ràng', 'Cô lập xã hội'], correct: 0 } },
      { word: 'Flexible hours', phonetic: '/ˈfleksəbl aʊərz/', meaning: 'Giờ làm việc linh hoạt', quiz: { options: ['Ranh giới rõ ràng', 'Giờ làm việc linh hoạt', 'Cân bằng công việc và cuộc sống', 'Cô lập xã hội'], correct: 1 } },
      { word: 'Clear boundaries', phonetic: '/klɪər ˈbaʊndriz/', meaning: 'Ranh giới rõ ràng', quiz: { options: ['Ranh giới rõ ràng', 'Giờ làm việc linh hoạt', 'Cô lập xã hội', 'Cân bằng công việc và cuộc sống'], correct: 0 } },
      { word: 'Social isolation', phonetic: '/ˈsoʊʃl ˌaɪsəˈleɪʃn/', meaning: 'Sự cô lập xã hội', quiz: { options: ['Cân bằng công việc và cuộc sống', 'Ranh giới rõ ràng', 'Giờ làm việc linh hoạt', 'Sự cô lập xã hội'], correct: 3 } },
      { word: 'Log off',       phonetic: '/lɒɡ ɒf/', meaning: 'Đăng xuất, kết thúc ca làm', quiz: { options: ['Đăng xuất, kết thúc ca làm', 'Sự cô lập xã hội', 'Ranh giới rõ ràng', 'Giờ làm việc linh hoạt'], correct: 0 } },
    ],
    reading: {
      title: 'Maintaining Work-Life Balance Remotely',
      passage: 'Thao enjoys the flexible hours of remote work, but she had to set clear boundaries to protect her personal time. She makes sure to log off at six every evening to avoid burnout. To fight social isolation, she also joins a weekly video call with friends after work.',
      quiz: [
        { q: 'Thảo phải làm gì để bảo vệ thời gian cá nhân?', options: ['Đặt ranh giới rõ ràng', 'Làm việc thâu đêm', 'Bỏ hết bạn bè', 'Nghỉ việc'], correct: 0 },
        { q: 'Thảo làm gì để chống lại sự cô lập xã hội?', options: ['Tham gia video call với bạn bè hàng tuần', 'Ở nhà một mình', 'Ngừng làm việc', 'Chuyển việc mới'], correct: 0 },
      ],
    },
    listening: [
      'I really enjoy having flexible hours.',
      'It is important to set clear boundaries.',
      'Social isolation can be a real challenge.',
      'I always log off by six in the evening.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) chia sẻ cách bạn giữ work-life balance, đặt clear boundaries và tránh social isolation.',
      minWords: 30,
      phrases: ['I enjoy the flexible hours of remote work', 'I always try to set clear boundaries', 'To fight social isolation, I', 'I make sure to log off by'],
      sentenceBuilder: [
        { scrambled: 'She / (set) / clear boundaries / to protect her time', answer: 'She set clear boundaries to protect her time' },
        { scrambled: 'She / (log off) / at six / every evening', answer: 'She logs off at six every evening' },
      ],
    },
  },
  { // Day 68 - Làm việc từ xa 5/5
    vocab: [
      { word: 'Hybrid model',  phonetic: '/ˈhaɪbrɪd ˈmɒdl/', meaning: 'Mô hình làm việc kết hợp', quiz: { options: ['Mô hình làm việc kết hợp', 'Không gian làm việc chung', 'Ứng dụng làm việc nhóm', 'Xây dựng đội nhóm từ xa'], correct: 0 } },
      { word: 'Co-working space',phonetic: '/koʊ ˈwɜːrkɪŋ speɪs/', meaning: 'Không gian làm việc chung', quiz: { options: ['Ứng dụng làm việc nhóm', 'Không gian làm việc chung', 'Mô hình làm việc kết hợp', 'Xây dựng đội nhóm từ xa'], correct: 1 } },
      { word: 'Collaboration tool', phonetic: '/kəˌlæbəˈreɪʃn tuːl/', meaning: 'Công cụ cộng tác', quiz: { options: ['Mô hình làm việc kết hợp', 'Xây dựng đội nhóm từ xa', 'Không gian làm việc chung', 'Công cụ cộng tác'], correct: 3 } },
      { word: 'Virtual team building', phonetic: '/ˈvɜːrtʃuəl tiːm ˈbɪldɪŋ/', meaning: 'Xây dựng đội nhóm trực tuyến', quiz: { options: ['Công cụ cộng tác', 'Không gian làm việc chung', 'Xây dựng đội nhóm trực tuyến', 'Mô hình làm việc kết hợp'], correct: 2 } },
      { word: 'In-person',      phonetic: '/ɪn ˈpɜːrsən/', meaning: 'Trực tiếp, gặp mặt', quiz: { options: ['Trực tiếp, gặp mặt', 'Công cụ cộng tác', 'Mô hình làm việc kết hợp', 'Không gian làm việc chung'], correct: 0 } },
    ],
    reading: {
      title: 'Adopting a Hybrid Work Model',
      passage: 'The company switched to a hybrid model, allowing employees to work from a co-working space or the office depending on their needs. New collaboration tools made it easier to work together no matter where people were. Occasionally, the team still organizes virtual team building activities alongside in-person gatherings.',
      quiz: [
        { q: 'Công ty chuyển sang mô hình gì?', options: ['Mô hình làm việc kết hợp', 'Chỉ làm việc tại nhà', 'Chỉ làm việc tại văn phòng', 'Không có mô hình cố định'], correct: 0 },
        { q: 'Điều gì giúp mọi người làm việc cùng nhau dễ dàng hơn?', options: ['Công cụ cộng tác mới', 'Giảm giờ làm', 'Tăng lương', 'Bỏ họp hoàn toàn'], correct: 0 },
      ],
    },
    listening: [
      'We adopted a hybrid model this year.',
      'I sometimes work from a co-working space.',
      'These collaboration tools save us a lot of time.',
      'We still enjoy some in-person gatherings.',
    ],
    writing: {
      prompt: 'Viết một đoạn thông báo ngắn (tiếng Anh) về việc công ty áp dụng hybrid model, dùng collaboration tool và tổ chức virtual team building.',
      minWords: 30,
      phrases: ['We are adopting a hybrid model starting', 'Employees can choose a co-working space or', 'Our new collaboration tools include', 'We will continue virtual team building activities'],
      sentenceBuilder: [
        { scrambled: 'The company / (switch) / to a hybrid model', answer: 'The company switched to a hybrid model' },
        { scrambled: 'The team / (organize) / virtual team building / activities', answer: 'The team organizes virtual team building activities' },
      ],
    },
  },
  { // Day 69 - Đào tạo nhân viên mới 1/5
    vocab: [
      { word: 'Trainee',      phonetic: '/treɪˈniː/',    meaning: 'Học viên, người được đào tạo', quiz: { options: ['Học viên, người được đào tạo', 'Người hướng dẫn', 'Tài liệu đào tạo', 'Kỹ năng'], correct: 0 } },
      { word: 'Mentor',       phonetic: '/ˈmentɔːr/',    meaning: 'Người hướng dẫn, cố vấn', quiz: { options: ['Tài liệu đào tạo', 'Người hướng dẫn, cố vấn', 'Học viên, người được đào tạo', 'Kỹ năng'], correct: 1 } },
      { word: 'Manual',       phonetic: '/ˈmænjuəl/',    meaning: 'Tài liệu hướng dẫn', quiz: { options: ['Tài liệu hướng dẫn', 'Người hướng dẫn, cố vấn', 'Kỹ năng', 'Học viên, người được đào tạo'], correct: 0 } },
      { word: 'Skill set',    phonetic: '/skɪl set/',    meaning: 'Bộ kỹ năng',       quiz: { options: ['Học viên, người được đào tạo', 'Tài liệu hướng dẫn', 'Người hướng dẫn, cố vấn', 'Bộ kỹ năng'], correct: 3 } },
      { word: 'Guidance',     phonetic: '/ˈɡaɪdns/',     meaning: 'Sự hướng dẫn, chỉ dẫn', quiz: { options: ['Sự hướng dẫn, chỉ dẫn', 'Bộ kỹ năng', 'Tài liệu hướng dẫn', 'Người hướng dẫn, cố vấn'], correct: 0 } },
    ],
    reading: {
      title: 'Setting Up a Mentorship Program',
      passage: 'Every new trainee at Yen\'s company is paired with an experienced mentor during their first month. The training manual covers the basic skill set needed for each role, but real guidance comes from daily conversations with the mentor. This program has made new employees feel supported from day one.',
      quiz: [
        { q: 'Mỗi trainee mới được ghép cặp với ai?', options: ['Một mentor giàu kinh nghiệm', 'Một khách hàng lớn', 'Một đối tác bên ngoài', 'Một nhà đầu tư'], correct: 0 },
        { q: 'Sự hướng dẫn thực sự đến từ đâu?', options: ['Cuộc trò chuyện hàng ngày với mentor', 'Chỉ từ tài liệu hướng dẫn', 'Chỉ từ video đào tạo', 'Không có nguồn nào cả'], correct: 0 },
      ],
    },
    listening: [
      'Every trainee gets a personal mentor.',
      'Please read the training manual carefully.',
      'This role requires a specific skill set.',
      'I really appreciate your guidance.',
    ],
    writing: {
      prompt: 'Viết một email chào mừng (tiếng Anh) một trainee mới, giới thiệu mentor của họ và training manual cần đọc.',
      minWords: 30,
      phrases: ['Welcome to the team! You will be paired with a mentor', 'Please review the training manual carefully', 'This role requires the following skill set', 'Do not hesitate to ask for guidance'],
      sentenceBuilder: [
        { scrambled: 'Every trainee / (be) / paired / with a mentor', answer: 'Every trainee is paired with a mentor' },
        { scrambled: 'This program / (make) / employees / feel supported', answer: 'This program makes employees feel supported' },
      ],
    },
  },
  { // Day 70 - Đào tạo nhân viên mới 2/5
    vocab: [
      { word: 'Hands-on training', phonetic: '/hændz ɒn ˈtreɪnɪŋ/', meaning: 'Đào tạo thực hành', quiz: { options: ['Đào tạo thực hành', 'Chứng chỉ', 'Đường cong học tập', 'Đánh giá năng lực'], correct: 0 } },
      { word: 'Certification',phonetic: '/ˌsɜːrtɪfɪˈkeɪʃn/', meaning: 'Chứng chỉ',   quiz: { options: ['Đường cong học tập', 'Chứng chỉ', 'Đào tạo thực hành', 'Đánh giá năng lực'], correct: 1 } },
      { word: 'Learning curve',phonetic: '/ˈlɜːrnɪŋ kɜːrv/', meaning: 'Đường cong học tập', quiz: { options: ['Đường cong học tập', 'Chứng chỉ', 'Đánh giá năng lực', 'Đào tạo thực hành'], correct: 0 } },
      { word: 'Competency check',phonetic: '/ˈkɒmpɪtənsi tʃek/', meaning: 'Đánh giá năng lực', quiz: { options: ['Đào tạo thực hành', 'Đường cong học tập', 'Chứng chỉ', 'Đánh giá năng lực'], correct: 3 } },
      { word: 'Hands-off',     phonetic: '/hændz ɒf/', meaning: 'Tự lập, không cần giám sát', quiz: { options: ['Tự lập, không cần giám sát', 'Chứng chỉ', 'Đường cong học tập', 'Đào tạo thực hành'], correct: 0 } },
    ],
    reading: {
      title: 'From Training to Independence',
      passage: 'Dat\'s hands-on training took two full weeks, since the learning curve for the new software was quite steep. After finishing a competency check, he received an official certification for the role. Only then did his manager feel comfortable letting him work hands-off without close supervision.',
      quiz: [
        { q: 'Đào tạo thực hành của Đạt kéo dài bao lâu?', options: ['Hai tuần', 'Một ngày', 'Một năm', 'Sáu tháng'], correct: 0 },
        { q: 'Đạt nhận được gì sau khi hoàn thành đánh giá năng lực?', options: ['Chứng chỉ chính thức', 'Một khoản thưởng lớn', 'Một kỳ nghỉ', 'Một chức vụ mới'], correct: 0 },
      ],
    },
    listening: [
      'Hands-on training really helps beginners.',
      'The learning curve for this tool is steep.',
      'You need to pass a competency check first.',
      'She received her certification last week.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả quá trình hands-on training của bạn, từ learning curve đến competency check.',
      minWords: 30,
      phrases: ['My hands-on training took about', 'The learning curve was quite steep at first', 'I passed a competency check before', 'I received my certification for the role'],
      sentenceBuilder: [
        { scrambled: 'His hands-on training / (take) / two full weeks', answer: 'His hands-on training took two full weeks' },
        { scrambled: 'He / (receive) / an official certification / for the role', answer: 'He received an official certification for the role' },
      ],
    },
  },
  { // Day 71 - Đào tạo nhân viên mới 3/5
    vocab: [
      { word: 'Shadow someone', phonetic: '/ˈʃædoʊ ˈsʌmwʌn/', meaning: 'Theo sát, quan sát học hỏi', quiz: { options: ['Theo sát, quan sát học hỏi', 'Kỹ năng thực hành', 'Nhật ký học tập', 'Đào tạo nội bộ'], correct: 0 } },
      { word: 'Practical skills', phonetic: '/ˈpræktɪkl skɪlz/', meaning: 'Kỹ năng thực hành', quiz: { options: ['Nhật ký học tập', 'Kỹ năng thực hành', 'Theo sát, quan sát học hỏi', 'Đào tạo nội bộ'], correct: 1 } },
      { word: 'Learning journal', phonetic: '/ˈlɜːrnɪŋ ˈdʒɜːrnl/', meaning: 'Nhật ký học tập', quiz: { options: ['Kỹ năng thực hành', 'Đào tạo nội bộ', 'Theo sát, quan sát học hỏi', 'Nhật ký học tập'], correct: 3 } },
      { word: 'In-house training', phonetic: '/ɪn haʊs ˈtreɪnɪŋ/', meaning: 'Đào tạo nội bộ', quiz: { options: ['Nhật ký học tập', 'Đào tạo nội bộ', 'Kỹ năng thực hành', 'Theo sát, quan sát học hỏi'], correct: 1 } },
      { word: 'Feedback session', phonetic: '/ˈfiːdbæk ˈseʃn/', meaning: 'Buổi phản hồi', quiz: { options: ['Buổi phản hồi', 'Đào tạo nội bộ', 'Nhật ký học tập', 'Kỹ năng thực hành'], correct: 0 } },
    ],
    reading: {
      title: 'Learning by Shadowing a Colleague',
      passage: 'For her first two weeks, Vy was asked to shadow a senior colleague to build practical skills quickly. She kept a learning journal to note down useful tips from the in-house training sessions. Weekly feedback sessions helped her understand what she was doing well and where she still needed practice.',
      quiz: [
        { q: 'Vy được yêu cầu làm gì trong hai tuần đầu?', options: ['Theo sát một đồng nghiệp cấp cao', 'Làm việc một mình hoàn toàn', 'Nghỉ phép', 'Đi công tác nước ngoài'], correct: 0 },
        { q: 'Vy ghi chú lại điều gì trong nhật ký học tập?', options: ['Các mẹo hữu ích từ đào tạo nội bộ', 'Lịch làm việc hàng ngày', 'Danh sách khách hàng', 'Kế hoạch nghỉ phép'], correct: 0 },
      ],
    },
    listening: [
      'You will shadow a senior colleague this week.',
      'This role requires strong practical skills.',
      'I keep a learning journal every day.',
      'Our feedback session is scheduled for Friday.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả trải nghiệm shadow một đồng nghiệp và ghi learning journal trong đào tạo.',
      minWords: 30,
      phrases: ['I was asked to shadow a senior colleague', 'This helped me build practical skills quickly', 'I keep a learning journal to track', 'Our feedback sessions happen every week'],
      sentenceBuilder: [
        { scrambled: 'She / (be) / asked / to shadow a colleague', answer: 'She was asked to shadow a colleague' },
        { scrambled: 'She / (keep) / a learning journal / every day', answer: 'She keeps a learning journal every day' },
      ],
    },
  },
  { // Day 72 - Đào tạo nhân viên mới 4/5
    vocab: [
      { word: 'Induction',    phonetic: '/ɪnˈdʌkʃn/',    meaning: 'Buổi giới thiệu, định hướng', quiz: { options: ['Buổi giới thiệu, định hướng', 'Danh sách kiểm tra', 'Vai trò và trách nhiệm', 'Khả năng thích ứng'], correct: 0 } },
      { word: 'Checklist',    phonetic: '/ˈtʃeklɪst/',   meaning: 'Danh sách kiểm tra', quiz: { options: ['Vai trò và trách nhiệm', 'Danh sách kiểm tra', 'Buổi giới thiệu, định hướng', 'Khả năng thích ứng'], correct: 1 } },
      { word: 'Roles and responsibilities', phonetic: '/roʊlz ənd rɪˌspɒnsəˈbɪlətiz/', meaning: 'Vai trò và trách nhiệm', quiz: { options: ['Buổi giới thiệu, định hướng', 'Khả năng thích ứng', 'Danh sách kiểm tra', 'Vai trò và trách nhiệm'], correct: 3 } },
      { word: 'Adaptability',  phonetic: '/əˌdæptəˈbɪləti/', meaning: 'Khả năng thích ứng', quiz: { options: ['Khả năng thích ứng', 'Danh sách kiểm tra', 'Vai trò và trách nhiệm', 'Buổi giới thiệu, định hướng'], correct: 0 } },
      { word: 'Familiarize',   phonetic: '/fəˈmɪliəraɪz/', meaning: 'Làm quen với',   quiz: { options: ['Vai trò và trách nhiệm', 'Khả năng thích ứng', 'Danh sách kiểm tra', 'Làm quen với'], correct: 3 } },
    ],
    reading: {
      title: 'Clarifying Roles from Day One',
      passage: 'During the induction session, Son was given a checklist to help him familiarize himself with the company\'s tools. His manager clearly explained his roles and responsibilities so there would be no confusion later. Son\'s adaptability made it easy for him to fit into the new environment quickly.',
      quiz: [
        { q: 'Sơn nhận được gì trong buổi induction?', options: ['Một danh sách kiểm tra', 'Một khoản thưởng', 'Một chiếc laptop mới', 'Một thẻ thành viên'], correct: 0 },
        { q: 'Điều gì giúp Sơn nhanh chóng hòa nhập môi trường mới?', options: ['Khả năng thích ứng của anh ấy', 'Anh ấy đã làm việc ở đây trước đó', 'Anh ấy không cần làm gì cả', 'Công ty không có quy trình'], correct: 0 },
      ],
    },
    listening: [
      'Your induction session starts at nine tomorrow.',
      'Here is a checklist to help you get started.',
      'Let\'s go over your roles and responsibilities.',
      'His adaptability really impressed the team.',
    ],
    writing: {
      prompt: 'Viết một email ngắn (tiếng Anh) gửi checklist cho nhân viên mới trong buổi induction, làm rõ roles and responsibilities.',
      minWords: 30,
      phrases: ['Welcome! Here is your induction checklist', 'Please familiarize yourself with', 'Your roles and responsibilities include', 'We appreciate your adaptability during this transition'],
      sentenceBuilder: [
        { scrambled: 'He / (be) / given / a checklist / during induction', answer: 'He was given a checklist during induction' },
        { scrambled: 'His adaptability / (make) / it easy / to fit in', answer: 'His adaptability made it easy to fit in' },
      ],
    },
  },
  { // Day 73 - Đào tạo nhân viên mới 5/5
    vocab: [
      { word: 'Knowledge transfer', phonetic: '/ˈnɒlɪdʒ ˈtrænsfɜːr/', meaning: 'Chuyển giao kiến thức', quiz: { options: ['Chuyển giao kiến thức', 'Đường dẫn học tập', 'Chứng minh năng lực', 'Sự tự tin'], correct: 0 } },
      { word: 'Learning path',      phonetic: '/ˈlɜːrnɪŋ pæθ/', meaning: 'Lộ trình học tập', quiz: { options: ['Chứng minh năng lực', 'Lộ trình học tập', 'Chuyển giao kiến thức', 'Sự tự tin'], correct: 1 } },
      { word: 'Demonstrate ability', phonetic: '/ˈdemənstreɪt əˈbɪləti/', meaning: 'Chứng minh năng lực', quiz: { options: ['Chuyển giao kiến thức', 'Lộ trình học tập', 'Chứng minh năng lực', 'Sự tự tin'], correct: 2 } },
      { word: 'Confidence',         phonetic: '/ˈkɒnfɪdəns/', meaning: 'Sự tự tin', quiz: { options: ['Sự tự tin', 'Chứng minh năng lực', 'Chuyển giao kiến thức', 'Lộ trình học tập'], correct: 0 } },
      { word: 'Graduate from training', phonetic: '/ˈɡrædʒueɪt frɒm ˈtreɪnɪŋ/', meaning: 'Hoàn thành khóa đào tạo', quiz: { options: ['Lộ trình học tập', 'Sự tự tin', 'Chuyển giao kiến thức', 'Hoàn thành khóa đào tạo'], correct: 3 } },
    ],
    reading: {
      title: 'Completing the Training Journey',
      passage: 'Hung followed a clear learning path designed by HR, which made knowledge transfer from senior staff much smoother. By the final week, he could demonstrate ability in every core task without help. Feeling proud and full of confidence, he officially graduated from training.',
      quiz: [
        { q: 'Điều gì giúp việc chuyển giao kiến thức diễn ra suôn sẻ?', options: ['Lộ trình học tập rõ ràng', 'Không có kế hoạch nào cả', 'Làm việc một mình', 'Không có người hướng dẫn'], correct: 0 },
        { q: 'Vào tuần cuối, Hùng có thể làm gì?', options: ['Chứng minh năng lực ở mọi công việc cốt lõi', 'Chỉ làm được việc đơn giản', 'Không hoàn thành được gì', 'Cần giúp đỡ liên tục'], correct: 0 },
      ],
    },
    listening: [
      'Knowledge transfer is key to good training.',
      'Your learning path is designed just for you.',
      'You need to demonstrate ability in each task.',
      'He graduated from training with full confidence.',
    ],
    writing: {
      prompt: 'Viết một đoạn tổng kết ngắn (tiếng Anh) về việc hoàn thành khóa đào tạo, nêu learning path và cách bạn demonstrate ability.',
      minWords: 30,
      phrases: ['I followed a clear learning path designed by', 'Knowledge transfer from senior staff helped me', 'I was able to demonstrate ability in', 'I graduated from training with full confidence'],
      sentenceBuilder: [
        { scrambled: 'He / (follow) / a clear learning path', answer: 'He followed a clear learning path' },
        { scrambled: 'He / (graduate) / from training / with confidence', answer: 'He graduated from training with confidence' },
      ],
    },
  },
  { // Day 74 - Thương lượng lương 1/5
    vocab: [
      { word: 'Salary',       phonetic: '/ˈsæləri/',    meaning: 'Lương',           quiz: { options: ['Lương', 'Tăng lương', 'Thị trường lương', 'Xứng đáng'], correct: 0 } },
      { word: 'Raise',        phonetic: '/reɪz/',       meaning: 'Tăng lương',      quiz: { options: ['Thị trường lương', 'Tăng lương', 'Lương', 'Xứng đáng'], correct: 1 } },
      { word: 'Market rate',  phonetic: '/ˈmɑːrkɪt reɪt/', meaning: 'Mức lương thị trường', quiz: { options: ['Mức lương thị trường', 'Tăng lương', 'Xứng đáng', 'Lương'], correct: 0 } },
      { word: 'Deserve',      phonetic: '/dɪˈzɜːrv/',   meaning: 'Xứng đáng',       quiz: { options: ['Lương', 'Xứng đáng', 'Thị trường lương', 'Tăng lương'], correct: 1 } },
      { word: 'Justify',      phonetic: '/ˈdʒʌstɪfaɪ/', meaning: 'Chứng minh, biện minh', quiz: { options: ['Chứng minh, biện minh', 'Tăng lương', 'Lương', 'Thị trường lương'], correct: 0 } },
    ],
    reading: {
      title: 'Preparing to Ask for a Raise',
      passage: 'Before her performance review, Lan researched the market rate for her position to understand what she truly deserves. She prepared clear examples of her achievements to justify asking for a raise. Walking into the meeting with solid data made her salary discussion feel much less stressful.',
      quiz: [
        { q: 'Lan nghiên cứu điều gì trước buổi đánh giá?', options: ['Mức lương thị trường cho vị trí của cô', 'Lịch sử công ty', 'Đối thủ cạnh tranh', 'Chính sách nghỉ phép'], correct: 0 },
        { q: 'Lan chuẩn bị gì để biện minh cho việc tăng lương?', options: ['Ví dụ rõ ràng về thành tích', 'Một lá đơn xin nghỉ', 'Một bài thuyết trình dài', 'Không chuẩn bị gì cả'], correct: 0 },
      ],
    },
    listening: [
      'I would like to discuss my salary.',
      'I am hoping for a raise this year.',
      'I researched the market rate for my role.',
      'I believe I deserve this increase.',
    ],
    writing: {
      prompt: 'Viết một đoạn hội thoại/email ngắn (tiếng Anh) yêu cầu tăng lương, dẫn chứng market rate và justify bằng thành tích.',
      minWords: 30,
      phrases: ['I would like to discuss my salary', 'Based on the market rate, I believe', 'I feel I deserve a raise because', 'I would like to justify this request with'],
      sentenceBuilder: [
        { scrambled: 'She / (research) / the market rate / before the review', answer: 'She researched the market rate before the review' },
        { scrambled: 'She / (prepare) / examples / to justify a raise', answer: 'She prepared examples to justify a raise' },
      ],
    },
  },
  { // Day 75 - Thương lượng lương 2/5
    vocab: [
      { word: 'Counteroffer', phonetic: '/ˈkaʊntərˌɒfər/', meaning: 'Đề nghị phản hồi lại', quiz: { options: ['Đề nghị phản hồi lại', 'Gói lương thưởng', 'Ngân sách phòng ban', 'Lời mời làm việc cạnh tranh'], correct: 0 } },
      { word: 'Compensation package', phonetic: '/ˌkɒmpenˈseɪʃn ˈpækɪdʒ/', meaning: 'Gói lương thưởng', quiz: { options: ['Ngân sách phòng ban', 'Gói lương thưởng', 'Đề nghị phản hồi lại', 'Lời mời làm việc cạnh tranh'], correct: 1 } },
      { word: 'Department budget', phonetic: '/dɪˈpɑːrtmənt ˈbʌdʒɪt/', meaning: 'Ngân sách phòng ban', quiz: { options: ['Ngân sách phòng ban', 'Gói lương thưởng', 'Lời mời làm việc cạnh tranh', 'Đề nghị phản hồi lại'], correct: 0 } },
      { word: 'Competing offer', phonetic: '/kəmˈpiːtɪŋ ˈɒfər/', meaning: 'Lời mời làm việc cạnh tranh', quiz: { options: ['Đề nghị phản hồi lại', 'Ngân sách phòng ban', 'Gói lương thưởng', 'Lời mời làm việc cạnh tranh'], correct: 3 } },
      { word: 'Firm',          phonetic: '/fɜːrm/', meaning: 'Kiên định, chắc chắn', quiz: { options: ['Kiên định, chắc chắn', 'Lời mời làm việc cạnh tranh', 'Gói lương thưởng', 'Ngân sách phòng ban'], correct: 0 } },
    ],
    reading: {
      title: 'Negotiating the Final Offer',
      passage: 'When the manager offered a smaller raise than expected, Dat responded with a polite counteroffer supported by data. He mentioned that the department budget could allow for slightly more, while staying firm but respectful. In the end, the final compensation package was better than his original request.',
      quiz: [
        { q: 'Đạt phản ứng thế nào khi mức tăng lương thấp hơn kỳ vọng?', options: ['Đưa ra đề nghị phản hồi lịch sự', 'Nghỉ việc ngay lập tức', 'Im lặng chấp nhận', 'Tức giận bỏ đi'], correct: 0 },
        { q: 'Kết quả cuối cùng của gói lương thưởng như thế nào?', options: ['Tốt hơn yêu cầu ban đầu', 'Tệ hơn nhiều', 'Không thay đổi gì', 'Bị hủy hoàn toàn'], correct: 0 },
      ],
    },
    listening: [
      'I would like to make a counteroffer.',
      'Can you tell me more about the compensation package?',
      'Our department budget is limited this year.',
      'I have a competing offer from another company.',
    ],
    writing: {
      prompt: 'Viết một email ngắn (tiếng Anh) đưa ra một counteroffer về compensation package, giữ giọng điệu firm nhưng lịch sự.',
      minWords: 30,
      phrases: ['Thank you for the offer, however I would like to propose', 'Regarding the compensation package, I was hoping for', 'I understand the department budget may be limited', 'I remain firm but open to discussion'],
      sentenceBuilder: [
        { scrambled: 'He / (respond) / with a polite counteroffer', answer: 'He responded with a polite counteroffer' },
        { scrambled: 'The final compensation package / (be) / better / than expected', answer: 'The final compensation package was better than expected' },
      ],
    },
  },
  { // Day 76 - Thương lượng lương 3/5
    vocab: [
      { word: 'Career advancement', phonetic: '/kəˈrɪər ədˈvænsmənt/', meaning: 'Sự thăng tiến sự nghiệp', quiz: { options: ['Sự thăng tiến sự nghiệp', 'Đánh giá hiệu suất', 'Tiêu chuẩn', 'Xứng đáng được ghi nhận'], correct: 0 } },
      { word: 'Performance review', phonetic: '/pərˈfɔːrməns rɪˈvjuː/', meaning: 'Đánh giá hiệu suất', quiz: { options: ['Tiêu chuẩn', 'Đánh giá hiệu suất', 'Sự thăng tiến sự nghiệp', 'Xứng đáng được ghi nhận'], correct: 1 } },
      { word: 'Criteria',     phonetic: '/kraɪˈtɪəriə/', meaning: 'Tiêu chuẩn, tiêu chí', quiz: { options: ['Tiêu chuẩn, tiêu chí', 'Đánh giá hiệu suất', 'Xứng đáng được ghi nhận', 'Sự thăng tiến sự nghiệp'], correct: 0 } },
      { word: 'Merit',        phonetic: '/ˈmerɪt/',    meaning: 'Sự xứng đáng, công trạng', quiz: { options: ['Sự thăng tiến sự nghiệp', 'Tiêu chuẩn, tiêu chí', 'Đánh giá hiệu suất', 'Sự xứng đáng, công trạng'], correct: 3 } },
      { word: 'Track record', phonetic: '/træk ˈrekɔːrd/', meaning: 'Thành tích đã đạt được', quiz: { options: ['Thành tích đã đạt được', 'Sự xứng đáng, công trạng', 'Tiêu chuẩn, tiêu chí', 'Sự thăng tiến sự nghiệp'], correct: 0 } },
    ],
    reading: {
      title: 'Discussing Career Advancement',
      passage: 'During her performance review, Yen asked her manager about the criteria required for career advancement. She highlighted her strong track record over the past year to show she was being considered on merit. Her manager promised to discuss her career advancement further with senior leadership.',
      quiz: [
        { q: 'Yến hỏi quản lý về điều gì trong buổi đánh giá?', options: ['Tiêu chuẩn để được thăng tiến', 'Lịch nghỉ phép', 'Chính sách bảo hiểm', 'Địa điểm làm việc mới'], correct: 0 },
        { q: 'Yến làm nổi bật điều gì để thể hiện sự xứng đáng?', options: ['Thành tích của cô trong năm qua', 'Số năm kinh nghiệm duy nhất', 'Mối quan hệ cá nhân', 'Bằng cấp học vấn'], correct: 0 },
      ],
    },
    listening: [
      'I would like to ask about career advancement.',
      'What are the criteria for this role?',
      'My track record speaks for itself.',
      'Career advancement here is based on merit.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) chuẩn bị thảo luận về career advancement trong performance review, nêu track record và criteria.',
      minWords: 30,
      phrases: ['During my performance review, I would like to discuss', 'I meet the criteria for career advancement because', 'My track record over the past year includes', 'I believe this is based on merit'],
      sentenceBuilder: [
        { scrambled: 'She / (ask) / about the criteria / for promotion', answer: 'She asked about the criteria for promotion' },
        { scrambled: 'She / (highlight) / her strong track record', answer: 'She highlighted her strong track record' },
      ],
    },
  },
  { // Day 77 - Thương lượng lương 4/5
    vocab: [
      { word: 'Bonus',        phonetic: '/ˈboʊnəs/',    meaning: 'Tiền thưởng',      quiz: { options: ['Tiền thưởng', 'Cổ phiếu thưởng', 'Điều khoản hợp đồng', 'Đàm phán lương'], correct: 0 } },
      { word: 'Stock options',phonetic: '/stɒk ˈɒpʃnz/', meaning: 'Quyền chọn mua cổ phiếu', quiz: { options: ['Điều khoản hợp đồng', 'Quyền chọn mua cổ phiếu', 'Tiền thưởng', 'Đàm phán lương'], correct: 1 } },
      { word: 'Contract terms',phonetic: '/ˈkɒntrækt tɜːrmz/', meaning: 'Điều khoản hợp đồng', quiz: { options: ['Điều khoản hợp đồng', 'Tiền thưởng', 'Đàm phán lương', 'Quyền chọn mua cổ phiếu'], correct: 0 } },
      { word: 'Salary negotiation', phonetic: '/ˈsæləri nɪˌɡoʊʃiˈeɪʃn/', meaning: 'Đàm phán lương', quiz: { options: ['Tiền thưởng', 'Điều khoản hợp đồng', 'Quyền chọn mua cổ phiếu', 'Đàm phán lương'], correct: 3 } },
      { word: 'Non-monetary benefit', phonetic: '/nɒn ˈmʌnətri ˈbenɪfɪt/', meaning: 'Phúc lợi phi tiền tệ', quiz: { options: ['Đàm phán lương', 'Phúc lợi phi tiền tệ', 'Tiền thưởng', 'Điều khoản hợp đồng'], correct: 1 } },
    ],
    reading: {
      title: 'Beyond Salary: Total Compensation',
      passage: 'During salary negotiation, Minh learned that total compensation includes more than just base pay. The company offered an annual bonus, stock options, and several non-monetary benefits like extra vacation days. Reviewing the full contract terms helped him make a much more informed decision.',
      quiz: [
        { q: 'Minh học được điều gì về tổng đãi ngộ?', options: ['Nó bao gồm nhiều hơn lương cơ bản', 'Nó chỉ có lương thôi', 'Nó không quan trọng', 'Nó chỉ áp dụng cho quản lý'], correct: 0 },
        { q: 'Điều gì giúp Minh đưa ra quyết định sáng suốt hơn?', options: ['Xem lại toàn bộ điều khoản hợp đồng', 'Hỏi ý kiến bạn bè', 'Bỏ qua mọi chi tiết', 'Ký ngay không đọc kỹ'], correct: 0 },
      ],
    },
    listening: [
      'Let\'s talk about your total compensation.',
      'The company offers stock options to employees.',
      'Please review the contract terms carefully.',
      'Non-monetary benefits matter too, like extra vacation.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) so sánh bonus, stock options và non-monetary benefit trong một offer công việc.',
      minWords: 30,
      phrases: ['Total compensation includes more than just salary', 'The offer includes an annual bonus of', 'I am also considering the stock options', 'Non-monetary benefits like extra vacation matter to me'],
      sentenceBuilder: [
        { scrambled: 'The company / (offer) / an annual bonus / and stock options', answer: 'The company offered an annual bonus and stock options' },
        { scrambled: 'He / (review) / the full contract terms / carefully', answer: 'He reviewed the full contract terms carefully' },
      ],
    },
  },
  { // Day 78 - Thương lượng lương 5/5
    vocab: [
      { word: 'Walk away',    phonetic: '/wɔːk əˈweɪ/', meaning: 'Từ bỏ, rút lui khỏi đàm phán', quiz: { options: ['Từ bỏ, rút lui khỏi đàm phán', 'Chấp nhận đề nghị', 'Khoảng lương mong muốn', 'Đàm phán thất bại'], correct: 0 } },
      { word: 'Accept an offer', phonetic: '/əkˈsept ən ˈɒfər/', meaning: 'Chấp nhận đề nghị', quiz: { options: ['Khoảng lương mong muốn', 'Chấp nhận đề nghị', 'Từ bỏ, rút lui khỏi đàm phán', 'Đàm phán thất bại'], correct: 1 } },
      { word: 'Salary range',  phonetic: '/ˈsæləri reɪndʒ/', meaning: 'Khoảng lương mong muốn', quiz: { options: ['Khoảng lương mong muốn', 'Chấp nhận đề nghị', 'Đàm phán thất bại', 'Từ bỏ, rút lui khỏi đàm phán'], correct: 0 } },
      { word: 'Deal breaker',  phonetic: '/diːl ˈbreɪkər/', meaning: 'Yếu tố khiến đàm phán thất bại', quiz: { options: ['Chấp nhận đề nghị', 'Khoảng lương mong muốn', 'Yếu tố khiến đàm phán thất bại', 'Từ bỏ, rút lui khỏi đàm phán'], correct: 2 } },
      { word: 'Grateful',      phonetic: '/ˈɡreɪtfl/', meaning: 'Biết ơn',        quiz: { options: ['Biết ơn', 'Yếu tố khiến đàm phán thất bại', 'Khoảng lương mong muốn', 'Chấp nhận đề nghị'], correct: 0 } },
    ],
    reading: {
      title: 'Knowing When to Accept or Walk Away',
      passage: 'Hung had a clear salary range in mind, and a lack of remote work options turned out to be a real deal breaker for him. When the final offer matched his expectations, he happily decided to accept the offer. He remained grateful throughout the process, even during the tougher moments of negotiation.',
      quiz: [
        { q: 'Điều gì trở thành deal breaker đối với Hùng?', options: ['Thiếu tùy chọn làm việc từ xa', 'Lương quá cao', 'Văn phòng quá đẹp', 'Đồng nghiệp thân thiện'], correct: 0 },
        { q: 'Hùng quyết định làm gì khi đề nghị cuối cùng phù hợp?', options: ['Chấp nhận đề nghị', 'Từ bỏ đàm phán', 'Yêu cầu thêm nữa', 'Trì hoãn quyết định'], correct: 0 },
      ],
    },
    listening: [
      'I know my salary range for this role.',
      'Remote work is a deal breaker for me.',
      'I am ready to accept the offer.',
      'I remained grateful throughout the negotiation.',
    ],
    writing: {
      prompt: 'Viết một email ngắn (tiếng Anh) accept an offer, nêu rõ salary range phù hợp và thể hiện sự grateful.',
      minWords: 30,
      phrases: ['I am happy to accept the offer', 'This matches my expected salary range', 'I want to express how grateful I am for', 'This was not a deal breaker for me'],
      sentenceBuilder: [
        { scrambled: 'He / (decide) / to accept / the offer', answer: 'He decided to accept the offer' },
        { scrambled: 'He / (remain) / grateful / throughout the process', answer: 'He remained grateful throughout the process' },
      ],
    },
  },
  { // Day 79 - Kỹ năng lãnh đạo cơ bản 1/5
    vocab: [
      { word: 'Leadership',   phonetic: '/ˈliːdərʃɪp/', meaning: 'Khả năng lãnh đạo', quiz: { options: ['Khả năng lãnh đạo', 'Tầm nhìn', 'Truyền cảm hứng', 'Ra quyết định'], correct: 0 } },
      { word: 'Vision',       phonetic: '/ˈvɪʒn/',      meaning: 'Tầm nhìn',          quiz: { options: ['Truyền cảm hứng', 'Tầm nhìn', 'Khả năng lãnh đạo', 'Ra quyết định'], correct: 1 } },
      { word: 'Inspire',      phonetic: '/ɪnˈspaɪər/',  meaning: 'Truyền cảm hứng',   quiz: { options: ['Truyền cảm hứng', 'Ra quyết định', 'Tầm nhìn', 'Khả năng lãnh đạo'], correct: 0 } },
      { word: 'Decision-making', phonetic: '/dɪˈsɪʒn ˈmeɪkɪŋ/', meaning: 'Sự ra quyết định', quiz: { options: ['Khả năng lãnh đạo', 'Truyền cảm hứng', 'Tầm nhìn', 'Sự ra quyết định'], correct: 3 } },
      { word: 'Lead by example', phonetic: '/liːd baɪ ɪɡˈzæmpl/', meaning: 'Lãnh đạo bằng cách làm gương', quiz: { options: ['Sự ra quyết định', 'Lãnh đạo bằng cách làm gương', 'Tầm nhìn', 'Truyền cảm hứng'], correct: 1 } },
    ],
    reading: {
      title: 'Learning to Lead by Example',
      passage: 'Since being promoted to team lead, Vy has focused on developing her leadership skills every day. She shares a clear vision with her team so everyone understands the bigger goal. By choosing to lead by example, she inspires people through her actions rather than just her words during decision-making.',
      quiz: [
        { q: 'Vy tập trung phát triển điều gì kể từ khi được thăng chức?', options: ['Kỹ năng lãnh đạo', 'Kỹ năng viết code', 'Kỹ năng thiết kế đồ họa', 'Kỹ năng kế toán'], correct: 0 },
        { q: 'Vy truyền cảm hứng cho mọi người bằng cách nào?', options: ['Lãnh đạo bằng cách làm gương', 'Ra lệnh nghiêm khắc', 'Không giao tiếp với ai', 'Chỉ gửi email'], correct: 0 },
      ],
    },
    listening: [
      'Good leadership starts with a clear vision.',
      'She always tries to inspire her team.',
      'Decision-making can be difficult under pressure.',
      'He leads by example every single day.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả cách bạn phát triển leadership, chia sẻ vision và lead by example.',
      minWords: 30,
      phrases: ['I have been developing my leadership skills by', 'I try to share a clear vision with my team', 'I aim to inspire others through my actions', 'Decision-making becomes easier when'],
      sentenceBuilder: [
        { scrambled: 'She / (share) / a clear vision / with her team', answer: 'She shares a clear vision with her team' },
        { scrambled: 'She / (inspire) / people / through her actions', answer: 'She inspires people through her actions' },
      ],
    },
  },
  { // Day 80 - Kỹ năng lãnh đạo cơ bản 2/5
    vocab: [
      { word: 'Sense of duty',  phonetic: '/sens əv ˈdjuːti/', meaning: 'Tinh thần trách nhiệm', quiz: { options: ['Tinh thần trách nhiệm', 'Trao quyền quyết định', 'Sự đồng cảm', 'Xây dựng đội ngũ'], correct: 0 } },
      { word: 'Empower others', phonetic: '/ɪmˈpaʊər ˈʌðərz/', meaning: 'Trao quyền cho người khác', quiz: { options: ['Sự đồng cảm', 'Trao quyền cho người khác', 'Tinh thần trách nhiệm', 'Xây dựng đội ngũ'], correct: 1 } },
      { word: 'Empathy',        phonetic: '/ˈempəθi/', meaning: 'Sự đồng cảm', quiz: { options: ['Xây dựng đội ngũ', 'Trao quyền cho người khác', 'Sự đồng cảm', 'Tinh thần trách nhiệm'], correct: 2 } },
      { word: 'Build a team',   phonetic: '/bɪld ə tiːm/', meaning: 'Xây dựng đội ngũ', quiz: { options: ['Tinh thần trách nhiệm', 'Sự đồng cảm', 'Trao quyền cho người khác', 'Xây dựng đội ngũ'], correct: 3 } },
      { word: 'Integrity',      phonetic: '/ɪnˈteɡrəti/', meaning: 'Sự chính trực', quiz: { options: ['Sự chính trực', 'Xây dựng đội ngũ', 'Sự đồng cảm', 'Trao quyền cho người khác'], correct: 0 } },
    ],
    reading: {
      title: 'Core Qualities of a Good Leader',
      passage: 'Son believes that integrity and a strong sense of duty are the foundation of good leadership. He tries to empower others by giving his team members real ownership of their projects. Combining empathy with a clear structure has helped him build a team that trusts him fully.',
      quiz: [
        { q: 'Sơn tin rằng điều gì là nền tảng của lãnh đạo tốt?', options: ['Sự chính trực và trách nhiệm', 'Chỉ cần quyền lực', 'Chỉ cần kinh nghiệm', 'Chỉ cần bằng cấp'], correct: 0 },
        { q: 'Sơn trao quyền cho người khác bằng cách nào?', options: ['Giao quyền sở hữu dự án thực sự', 'Kiểm soát mọi chi tiết nhỏ', 'Không giao việc cho ai', 'Chỉ giao việc dễ'], correct: 0 },
      ],
    },
    listening: [
      'Integrity is essential for any leader.',
      'I try to empower others whenever possible.',
      'Empathy makes a big difference in leadership.',
      'Building a team takes time and trust.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) về cách bạn thể hiện integrity, empathy và empower others khi build a team.',
      minWords: 30,
      phrases: ['I believe integrity is the foundation of leadership', 'I try to empower others by', 'Showing empathy helps me connect with my team', 'Building a team takes consistent effort'],
      sentenceBuilder: [
        { scrambled: 'He / (try) / to empower others / by giving ownership', answer: 'He tries to empower others by giving ownership' },
        { scrambled: 'Empathy / (help) / him / build a team / that trusts him', answer: 'Empathy helped him build a team that trusts him' },
      ],
    },
  },
  { // Day 81 - Kỹ năng lãnh đạo cơ bản 3/5
    vocab: [
      { word: 'Decisive',     phonetic: '/dɪˈsaɪsɪv/', meaning: 'Quyết đoán',       quiz: { options: ['Quyết đoán', 'Chịu trách nhiệm', 'Chấp nhận rủi ro', 'Sự tự tin'], correct: 0 } },
      { word: 'Take responsibility', phonetic: '/teɪk rɪˌspɒnsəˈbɪləti/', meaning: 'Chịu trách nhiệm', quiz: { options: ['Chấp nhận rủi ro', 'Chịu trách nhiệm', 'Quyết đoán', 'Sự tự tin'], correct: 1 } },
      { word: 'Take a risk',  phonetic: '/teɪk ə rɪsk/', meaning: 'Chấp nhận rủi ro', quiz: { options: ['Quyết đoán', 'Chịu trách nhiệm', 'Chấp nhận rủi ro', 'Sự tự tin'], correct: 2 } },
      { word: 'Self-assurance', phonetic: '/self əˈʃʊərəns/', meaning: 'Sự tự tin, tự chủ', quiz: { options: ['Chịu trách nhiệm', 'Chấp nhận rủi ro', 'Quyết đoán', 'Sự tự tin, tự chủ'], correct: 3 } },
      { word: 'Own a mistake', phonetic: '/oʊn ə mɪˈsteɪk/', meaning: 'Nhận lỗi của mình', quiz: { options: ['Sự tự tin, tự chủ', 'Nhận lỗi của mình', 'Chấp nhận rủi ro', 'Quyết đoán'], correct: 1 } },
    ],
    reading: {
      title: 'Being Decisive Under Pressure',
      passage: 'A good leader needs to be decisive even when the situation is uncertain, according to Thao. When a project failed last year, she chose to own the mistake instead of blaming her team. Her self-assurance and willingness to take a risk earned her deep respect from everyone around her.',
      quiz: [
        { q: 'Thảo tin một người lãnh đạo tốt cần điều gì?', options: ['Sự quyết đoán ngay cả khi không chắc chắn', 'Luôn chờ ý kiến người khác', 'Tránh mọi quyết định khó', 'Không bao giờ hành động'], correct: 0 },
        { q: 'Thảo làm gì khi dự án thất bại năm ngoái?', options: ['Nhận lỗi thay vì đổ lỗi cho nhóm', 'Sa thải cả nhóm', 'Từ chức ngay lập tức', 'Giấu nhẹm thông tin'], correct: 0 },
      ],
    },
    listening: [
      'A good leader must be decisive.',
      'She chose to own the mistake fully.',
      'Sometimes you have to take a risk.',
      'His self-assurance impressed the whole team.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) kể về một lần bạn phải decisive, take a risk và own a mistake trong công việc.',
      minWords: 30,
      phrases: ['I had to be decisive when', 'I decided to take a risk by', 'When the project failed, I chose to own the mistake', 'This experience helped build my self-assurance'],
      sentenceBuilder: [
        { scrambled: 'She / (choose) / to own the mistake / instead of blaming others', answer: 'She chose to own the mistake instead of blaming others' },
        { scrambled: 'Her willingness / to take a risk / (earn) / respect', answer: 'Her willingness to take a risk earned respect' },
      ],
    },
  },
  { // Day 82 - Kỹ năng lãnh đạo cơ bản 4/5
    vocab: [
      { word: 'Coach',        phonetic: '/koʊtʃ/',     meaning: 'Huấn luyện, cố vấn', quiz: { options: ['Huấn luyện, cố vấn', 'Xây dựng năng lực', 'Đưa ra phản hồi mang tính xây dựng', 'Ủy quyền'], correct: 0 } },
      { word: 'Build capacity', phonetic: '/bɪld kəˈpæsəti/', meaning: 'Xây dựng năng lực đội ngũ', quiz: { options: ['Đưa ra phản hồi mang tính xây dựng', 'Xây dựng năng lực đội ngũ', 'Huấn luyện, cố vấn', 'Ủy quyền'], correct: 1 } },
      { word: 'Constructive feedback', phonetic: '/kənˈstrʌktɪv ˈfiːdbæk/', meaning: 'Phản hồi mang tính xây dựng', quiz: { options: ['Huấn luyện, cố vấn', 'Ủy quyền', 'Xây dựng năng lực đội ngũ', 'Phản hồi mang tính xây dựng'], correct: 3 } },
      { word: 'Delegate authority', phonetic: '/ˈdelɪɡeɪt əˈθɒrəti/', meaning: 'Ủy quyền',   quiz: { options: ['Ủy quyền', 'Xây dựng năng lực đội ngũ', 'Phản hồi mang tính xây dựng', 'Huấn luyện, cố vấn'], correct: 0 } },
      { word: 'Growth mindset', phonetic: '/ɡroʊθ ˈmaɪndset/', meaning: 'Tư duy phát triển', quiz: { options: ['Ủy quyền', 'Phản hồi mang tính xây dựng', 'Huấn luyện, cố vấn', 'Tư duy phát triển'], correct: 3 } },
    ],
    reading: {
      title: 'Coaching Your Team to Grow',
      passage: 'Rather than simply giving orders, Dat prefers to coach his team members to help them build capacity over time. He always gives constructive feedback instead of harsh criticism after mistakes. By delegating authority and encouraging a growth mindset, his team has become far more independent.',
      quiz: [
        { q: 'Đạt thích làm gì thay vì chỉ ra lệnh?', options: ['Huấn luyện, cố vấn cho nhóm', 'Kiểm soát chặt chẽ mọi việc', 'Bỏ mặc nhóm tự xử lý', 'Chỉ trích công khai'], correct: 0 },
        { q: 'Đạt luôn đưa ra loại phản hồi nào?', options: ['Phản hồi mang tính xây dựng', 'Chỉ trích gay gắt', 'Không phản hồi gì', 'Phản hồi mơ hồ'], correct: 0 },
      ],
    },
    listening: [
      'I prefer to coach my team rather than just direct them.',
      'We are working to build capacity across the team.',
      'Please give me some constructive feedback.',
      'Delegating authority helps the team grow.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả cách bạn coach đội nhóm, đưa constructive feedback và delegate authority để build capacity.',
      minWords: 30,
      phrases: ['I prefer to coach my team rather than', 'I always give constructive feedback after', 'Delegating authority has helped my team', 'Encouraging a growth mindset is important because'],
      sentenceBuilder: [
        { scrambled: 'He / (prefer) / to coach / his team members', answer: 'He prefers to coach his team members' },
        { scrambled: 'His team / (become) / far more independent', answer: 'His team has become far more independent' },
      ],
    },
  },
  { // Day 83 - Kỹ năng lãnh đạo cơ bản 5/5
    vocab: [
      { word: 'Influence',    phonetic: '/ˈɪnfluəns/', meaning: 'Sức ảnh hưởng',    quiz: { options: ['Sức ảnh hưởng', 'Sự khiêm tốn', 'Trực giác', 'Truyền đạt tầm nhìn'], correct: 0 } },
      { word: 'Humility',     phonetic: '/hjuːˈmɪləti/', meaning: 'Sự khiêm tốn', quiz: { options: ['Trực giác', 'Sự khiêm tốn', 'Sức ảnh hưởng', 'Truyền đạt tầm nhìn'], correct: 1 } },
      { word: 'Intuition',    phonetic: '/ˌɪntjuˈɪʃn/', meaning: 'Trực giác',      quiz: { options: ['Sự khiêm tốn', 'Sức ảnh hưởng', 'Trực giác', 'Truyền đạt tầm nhìn'], correct: 2 } },
      { word: 'Communicate a vision', phonetic: '/kəˈmjuːnɪkeɪt ə ˈvɪʒn/', meaning: 'Truyền đạt tầm nhìn', quiz: { options: ['Sức ảnh hưởng', 'Trực giác', 'Sự khiêm tốn', 'Truyền đạt tầm nhìn'], correct: 3 } },
      { word: 'Role model',   phonetic: '/roʊl ˈmɒdl/', meaning: 'Tấm gương',      quiz: { options: ['Tấm gương', 'Truyền đạt tầm nhìn', 'Trực giác', 'Sức ảnh hưởng'], correct: 0 } },
    ],
    reading: {
      title: 'True Influence Comes with Humility',
      passage: 'Ha has learned that real influence often comes from humility rather than authority alone. She trusts her intuition when facing tough decisions, but she still asks her team for input. By consistently communicating a vision that everyone believes in, she has become a genuine role model for younger colleagues.',
      quiz: [
        { q: 'Hà học được rằng sức ảnh hưởng thực sự đến từ đâu?', options: ['Sự khiêm tốn', 'Chỉ từ chức vụ cao', 'Chỉ từ tiền bạc', 'Chỉ từ tuổi tác'], correct: 0 },
        { q: 'Hà trở thành gì đối với đồng nghiệp trẻ hơn?', options: ['Một tấm gương thực sự', 'Một đối thủ', 'Một người xa lạ', 'Một người khó gần'], correct: 0 },
      ],
    },
    listening: [
      'True influence often comes from humility.',
      'I trust my intuition in tough situations.',
      'She always communicates a clear vision.',
      'He has become a real role model for us.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả cách bạn xây dựng influence bằng humility, dùng intuition và trở thành role model.',
      minWords: 30,
      phrases: ['I believe real influence comes from', 'I trust my intuition when', 'I try to communicate a clear vision to', 'I hope to be a role model for'],
      sentenceBuilder: [
        { scrambled: 'She / (trust) / her intuition / when facing tough decisions', answer: 'She trusts her intuition when facing tough decisions' },
        { scrambled: 'She / (become) / a genuine role model / for colleagues', answer: 'She has become a genuine role model for colleagues' },
      ],
    },
  },
  { // Day 84 - Quản lý rủi ro 1/4
    vocab: [
      { word: 'Risk assessment', phonetic: '/rɪsk əˈsesmənt/', meaning: 'Đánh giá rủi ro', quiz: { options: ['Đánh giá rủi ro', 'Kế hoạch dự phòng', 'Xác suất', 'Giảm thiểu tác động'], correct: 0 } },
      { word: 'Contingency plan', phonetic: '/kənˈtɪndʒənsi plæn/', meaning: 'Kế hoạch dự phòng', quiz: { options: ['Xác suất', 'Kế hoạch dự phòng', 'Đánh giá rủi ro', 'Giảm thiểu tác động'], correct: 1 } },
      { word: 'Probability',   phonetic: '/ˌprɒbəˈbɪləti/', meaning: 'Xác suất',       quiz: { options: ['Kế hoạch dự phòng', 'Đánh giá rủi ro', 'Xác suất', 'Giảm thiểu tác động'], correct: 2 } },
      { word: 'Minimize impact', phonetic: '/ˈmɪnɪmaɪz ˈɪmpækt/', meaning: 'Giảm thiểu tác động', quiz: { options: ['Đánh giá rủi ro', 'Xác suất', 'Kế hoạch dự phòng', 'Giảm thiểu tác động'], correct: 3 } },
      { word: 'Vulnerable',    phonetic: '/ˈvʌlnərəbl/', meaning: 'Dễ bị tổn thương, rủi ro', quiz: { options: ['Dễ bị tổn thương, rủi ro', 'Giảm thiểu tác động', 'Xác suất', 'Kế hoạch dự phòng'], correct: 0 } },
    ],
    reading: {
      title: 'Conducting a Risk Assessment',
      passage: 'Before launching the new product, Quan\'s team performed a full risk assessment to identify where the project was most vulnerable. They calculated the probability of supply chain delays and created a contingency plan just in case. This preparation helped minimize impact when a minor issue actually occurred.',
      quiz: [
        { q: 'Nhóm của Quân làm gì trước khi ra mắt sản phẩm?', options: ['Đánh giá rủi ro toàn diện', 'Tổ chức tiệc ăn mừng', 'Sa thải nhân viên', 'Đóng cửa văn phòng'], correct: 0 },
        { q: 'Họ tạo ra gì để phòng trường hợp xấu?', options: ['Một kế hoạch dự phòng', 'Một hợp đồng bảo hiểm mới', 'Một quỹ lương hưu', 'Một chiến dịch quảng cáo'], correct: 0 },
      ],
    },
    listening: [
      'We conducted a full risk assessment.',
      'Do we have a contingency plan ready?',
      'What is the probability of this happening?',
      'This step helps minimize impact on the business.',
    ],
    writing: {
      prompt: 'Viết một báo cáo ngắn (tiếng Anh) về risk assessment cho một dự án, kèm contingency plan để minimize impact.',
      minWords: 30,
      phrases: ['We conducted a risk assessment for', 'The probability of this risk is', 'We have prepared a contingency plan in case', 'This will help minimize impact on'],
      sentenceBuilder: [
        { scrambled: 'The team / (perform) / a full risk assessment', answer: 'The team performed a full risk assessment' },
        { scrambled: 'They / (create) / a contingency plan / just in case', answer: 'They created a contingency plan just in case' },
      ],
    },
  },
  { // Day 85 - Quản lý rủi ro 2/4
    vocab: [
      { word: 'Threat',       phonetic: '/θret/',      meaning: 'Mối đe dọa',      quiz: { options: ['Mối đe dọa', 'Lỗ hổng', 'Giảm thiểu rủi ro', 'Giám sát'], correct: 0 } },
      { word: 'Vulnerability',phonetic: '/ˌvʌlnərəˈbɪləti/', meaning: 'Lỗ hổng, điểm yếu', quiz: { options: ['Giảm thiểu rủi ro', 'Lỗ hổng, điểm yếu', 'Mối đe dọa', 'Giám sát'], correct: 1 } },
      { word: 'Mitigation',   phonetic: '/ˌmɪtɪˈɡeɪʃn/', meaning: 'Sự giảm thiểu rủi ro', quiz: { options: ['Mối đe dọa', 'Lỗ hổng, điểm yếu', 'Sự giảm thiểu rủi ro', 'Giám sát'], correct: 2 } },
      { word: 'Monitor',      phonetic: '/ˈmɒnɪtər/',  meaning: 'Giám sát',        quiz: { options: ['Giám sát', 'Sự giảm thiểu rủi ro', 'Mối đe dọa', 'Lỗ hổng, điểm yếu'], correct: 0 } },
      { word: 'Exposure',     phonetic: '/ɪkˈspoʊʒər/', meaning: 'Mức độ phơi nhiễm rủi ro', quiz: { options: ['Lỗ hổng, điểm yếu', 'Giám sát', 'Mối đe dọa', 'Mức độ phơi nhiễm rủi ro'], correct: 3 } },
    ],
    reading: {
      title: 'Reducing Risk Exposure',
      passage: 'Yen\'s security team identified a serious threat linked to an old software vulnerability. They created a mitigation plan and now monitor the system daily to catch any new issues early. These steps have significantly reduced the company\'s overall exposure to cyber attacks.',
      quiz: [
        { q: 'Đội bảo mật của Yến phát hiện điều gì?', options: ['Một mối đe dọa liên quan đến lỗ hổng phần mềm', 'Một khách hàng mới', 'Một cơ hội đầu tư', 'Một chương trình khuyến mãi'], correct: 0 },
        { q: 'Họ làm gì hàng ngày để phát hiện vấn đề sớm?', options: ['Giám sát hệ thống', 'Họp toàn công ty', 'Gửi email cảnh báo khách hàng', 'Tắt hệ thống'], correct: 0 },
      ],
    },
    listening: [
      'We identified a serious security threat.',
      'This vulnerability needs to be fixed quickly.',
      'Our mitigation plan is already in place.',
      'We monitor the system every single day.',
    ],
    writing: {
      prompt: 'Viết một email nội bộ (tiếng Anh) cảnh báo về một threat và vulnerability, đề xuất kế hoạch mitigation.',
      minWords: 30,
      phrases: ['We have identified a potential threat related to', 'This vulnerability could expose us to', 'Our mitigation plan includes', 'We will continue to monitor the situation closely'],
      sentenceBuilder: [
        { scrambled: 'The team / (identify) / a serious threat', answer: 'The team identified a serious threat' },
        { scrambled: 'These steps / (reduce) / the company\'s exposure', answer: 'These steps reduced the company\'s exposure' },
      ],
    },
  },
  { // Day 86 - Quản lý rủi ro 3/4
    vocab: [
      { word: 'Insurance',    phonetic: '/ɪnˈʃʊərəns/', meaning: 'Bảo hiểm',        quiz: { options: ['Bảo hiểm', 'Trách nhiệm pháp lý', 'Kiểm soát nội bộ', 'Sự tuân thủ quy định'], correct: 0 } },
      { word: 'Legal exposure',    phonetic: '/ˈliːɡl ɪkˈspoʊʒər/', meaning: 'Trách nhiệm pháp lý', quiz: { options: ['Kiểm soát nội bộ', 'Trách nhiệm pháp lý', 'Bảo hiểm', 'Sự tuân thủ quy định'], correct: 1 } },
      { word: 'Internal control', phonetic: '/ɪnˈtɜːrnl kənˈtroʊl/', meaning: 'Kiểm soát nội bộ', quiz: { options: ['Bảo hiểm', 'Trách nhiệm pháp lý', 'Kiểm soát nội bộ', 'Sự tuân thủ quy định'], correct: 2 } },
      { word: 'Regulatory compliance', phonetic: '/ˈreɡjələtɔːri kəmˈplaɪəns/', meaning: 'Sự tuân thủ quy định', quiz: { options: ['Trách nhiệm pháp lý', 'Kiểm soát nội bộ', 'Bảo hiểm', 'Sự tuân thủ quy định'], correct: 3 } },
      { word: 'Safeguard',    phonetic: '/ˈseɪfɡɑːrd/', meaning: 'Biện pháp bảo vệ, bảo vệ', quiz: { options: ['Biện pháp bảo vệ, bảo vệ', 'Sự tuân thủ quy định', 'Trách nhiệm pháp lý', 'Kiểm soát nội bộ'], correct: 0 } },
    ],
    reading: {
      title: 'Protecting the Company from Legal Exposure',
      passage: 'To reduce potential legal exposure, Minh\'s company purchased additional insurance covering workplace accidents. They also strengthened internal controls to safeguard sensitive financial data. Regular checks for regulatory compliance ensure the business stays protected from unexpected legal trouble.',
      quiz: [
        { q: 'Công ty của Minh mua thêm gì để giảm trách nhiệm pháp lý?', options: ['Bảo hiểm cho tai nạn lao động', 'Thêm cổ phiếu', 'Bất động sản mới', 'Xe công ty'], correct: 0 },
        { q: 'Việc kiểm tra tuân thủ quy định thường xuyên giúp gì?', options: ['Bảo vệ công ty khỏi rắc rối pháp lý', 'Tăng doanh thu ngay lập tức', 'Giảm số lượng nhân viên', 'Mở rộng thị trường'], correct: 0 },
      ],
    },
    listening: [
      'We purchased additional insurance this year.',
      'This could create serious legal exposure for us.',
      'Our internal controls have been strengthened.',
      'Regulatory compliance is checked regularly.',
    ],
    writing: {
      prompt: 'Viết một đoạn báo cáo ngắn (tiếng Anh) về các biện pháp insurance, internal control để đảm bảo regulatory compliance.',
      minWords: 30,
      phrases: ['We have purchased additional insurance to cover', 'This helps reduce our legal exposure related to', 'Our internal controls include', 'We regularly check for regulatory compliance'],
      sentenceBuilder: [
        { scrambled: 'The company / (purchase) / additional insurance', answer: 'The company purchased additional insurance' },
        { scrambled: 'They / (strengthen) / internal controls / to safeguard data', answer: 'They strengthened internal controls to safeguard data' },
      ],
    },
  },
  { // Day 87 - Quản lý rủi ro 4/4
    vocab: [
      { word: 'Uncertainty',  phonetic: '/ʌnˈsɜːrtnti/', meaning: 'Sự bất định',    quiz: { options: ['Sự bất định', 'Kịch bản xấu nhất', 'Phòng ngừa', 'Khả năng phục hồi'], correct: 0 } },
      { word: 'Worst-case scenario', phonetic: '/wɜːrst keɪs səˈnɛəriəʊ/', meaning: 'Kịch bản xấu nhất', quiz: { options: ['Phòng ngừa', 'Kịch bản xấu nhất', 'Sự bất định', 'Khả năng phục hồi'], correct: 1 } },
      { word: 'Precaution',   phonetic: '/prɪˈkɔːʃn/', meaning: 'Biện pháp phòng ngừa', quiz: { options: ['Sự bất định', 'Kịch bản xấu nhất', 'Biện pháp phòng ngừa', 'Khả năng phục hồi'], correct: 2 } },
      { word: 'Resilience',   phonetic: '/rɪˈzɪliəns/', meaning: 'Khả năng phục hồi', quiz: { options: ['Kịch bản xấu nhất', 'Sự bất định', 'Biện pháp phòng ngừa', 'Khả năng phục hồi'], correct: 3 } },
      { word: 'Prepare for the worst', phonetic: '/prɪˈpeər fɔːr ðə wɜːrst/', meaning: 'Chuẩn bị cho tình huống xấu nhất', quiz: { options: ['Khả năng phục hồi', 'Biện pháp phòng ngừa', 'Sự bất định', 'Chuẩn bị cho tình huống xấu nhất'], correct: 3 } },
    ],
    reading: {
      title: 'Building Business Resilience',
      passage: 'Facing constant market uncertainty, Son\'s company decided to plan for the worst-case scenario rather than assume everything would go smoothly. They took several precautions, such as diversifying suppliers and building emergency cash reserves. This focus on resilience helped them survive a difficult year without major losses.',
      quiz: [
        { q: 'Công ty của Sơn quyết định làm gì khi đối mặt sự bất định?', options: ['Lập kế hoạch cho kịch bản xấu nhất', 'Bỏ qua mọi rủi ro', 'Ngừng kinh doanh', 'Sa thải toàn bộ nhân viên'], correct: 0 },
        { q: 'Họ thực hiện biện pháp phòng ngừa nào?', options: ['Đa dạng hóa nhà cung cấp và dự trữ tiền mặt', 'Vay thêm nợ', 'Bán toàn bộ tài sản', 'Đóng cửa chi nhánh'], correct: 0 },
      ],
    },
    listening: [
      'Market uncertainty has increased this year.',
      'We should prepare for the worst-case scenario.',
      'We took several precautions in advance.',
      'This has really tested our resilience.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả cách công ty bạn prepare for the worst và xây dựng resilience trước uncertainty.',
      minWords: 30,
      phrases: ['We are facing significant market uncertainty', 'We planned for the worst-case scenario by', 'We took several precautions, including', 'This has strengthened our overall resilience'],
      sentenceBuilder: [
        { scrambled: 'The company / (decide) / to plan / for the worst-case scenario', answer: 'The company decided to plan for the worst-case scenario' },
        { scrambled: 'This focus / on resilience / (help) / them survive', answer: 'This focus on resilience helped them survive' },
      ],
    },
  },
  { // Day 88 - Văn hóa công sở & email chuyên nghiệp 1/3
    vocab: [
      { word: 'Workplace culture', phonetic: '/ˈwɜːrkpleɪs ˈkʌltʃər/', meaning: 'Văn hóa công sở', quiz: { options: ['Văn hóa công sở', 'Trang trọng', 'Cấp bậc', 'Chuẩn mực'], correct: 0 } },
      { word: 'Formal',       phonetic: '/ˈfɔːrml/', meaning: 'Trang trọng',       quiz: { options: ['Cấp bậc', 'Trang trọng', 'Văn hóa công sở', 'Chuẩn mực'], correct: 1 } },
      { word: 'Hierarchy',    phonetic: '/ˈhaɪərɑːrki/', meaning: 'Hệ thống cấp bậc', quiz: { options: ['Chuẩn mực', 'Hệ thống cấp bậc', 'Trang trọng', 'Văn hóa công sở'], correct: 1 } },
      { word: 'Norm',         phonetic: '/nɔːrm/', meaning: 'Chuẩn mực',          quiz: { options: ['Văn hóa công sở', 'Trang trọng', 'Hệ thống cấp bậc', 'Chuẩn mực'], correct: 3 } },
      { word: 'Etiquette',    phonetic: '/ˈetɪket/', meaning: 'Phép lịch sự, quy tắc ứng xử', quiz: { options: ['Phép lịch sự, quy tắc ứng xử', 'Chuẩn mực', 'Trang trọng', 'Hệ thống cấp bậc'], correct: 0 } },
    ],
    reading: {
      title: 'Understanding Workplace Culture',
      passage: 'When Lan joined her new company, she noticed the workplace culture was more formal than her previous job. She quickly learned about the hierarchy and the unwritten norms around addressing senior colleagues. Following basic office etiquette helped her fit in smoothly during her first month.',
      quiz: [
        { q: 'Lan nhận thấy điều gì về văn hóa công sở mới?', options: ['Trang trọng hơn công ty cũ', 'Ít quy tắc hơn hẳn', 'Không có cấp bậc', 'Giống hệt công ty cũ'], correct: 0 },
        { q: 'Điều gì giúp Lan hòa nhập nhanh trong tháng đầu?', options: ['Tuân theo phép lịch sự văn phòng cơ bản', 'Phớt lờ mọi quy tắc', 'Làm việc một mình', 'Tránh giao tiếp với đồng nghiệp'], correct: 0 },
      ],
    },
    listening: [
      'Every company has its own workplace culture.',
      'This office feels quite formal.',
      'Understanding the hierarchy took some time.',
      'Office etiquette varies between companies.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) mô tả workplace culture ở công ty bạn, đề cập hierarchy và etiquette cần lưu ý.',
      minWords: 30,
      phrases: ['The workplace culture here is quite', 'I noticed the hierarchy is structured around', 'One important norm at this company is', 'Following proper etiquette really helps'],
      sentenceBuilder: [
        { scrambled: 'She / (notice) / the workplace culture / was more formal', answer: 'She noticed the workplace culture was more formal' },
        { scrambled: 'She / (learn) / about the hierarchy / quickly', answer: 'She learned about the hierarchy quickly' },
      ],
    },
  },
  { // Day 89 - Văn hóa công sở & email chuyên nghiệp 2/3
    vocab: [
      { word: 'CC (carbon copy)', phonetic: '/siː siː/', meaning: 'Gửi kèm (CC)', quiz: { options: ['Gửi kèm (CC)', 'Chủ đề email', 'Trân trọng', 'Đính kèm'], correct: 0 } },
      { word: 'Subject line',     phonetic: '/ˈsʌbdʒekt laɪn/', meaning: 'Chủ đề email', quiz: { options: ['Trân trọng', 'Chủ đề email', 'Gửi kèm (CC)', 'Đính kèm'], correct: 1 } },
      { word: 'Kind regards',     phonetic: '/kaɪnd rɪˈɡɑːrdz/', meaning: 'Trân trọng (kết thư)', quiz: { options: ['Chủ đề email', 'Đính kèm', 'Trân trọng (kết thư)', 'Gửi kèm (CC)'], correct: 2 } },
      { word: 'Attachment',       phonetic: '/əˈtætʃmənt/', meaning: 'Tệp đính kèm', quiz: { options: ['Gửi kèm (CC)', 'Trân trọng (kết thư)', 'Chủ đề email', 'Tệp đính kèm'], correct: 3 } },
      { word: 'Tone',             phonetic: '/toʊn/', meaning: 'Giọng điệu (văn viết)', quiz: { options: ['Giọng điệu (văn viết)', 'Tệp đính kèm', 'Chủ đề email', 'Trân trọng (kết thư)'], correct: 0 } },
    ],
    reading: {
      title: 'Writing a Professional Email',
      passage: 'Before sending an important email, Hung always double-checks the subject line to make it clear and specific. He carefully decides who to CC so the right people stay informed without unnecessary noise. He also pays attention to tone, making sure every message ends politely with "Kind regards" and includes the correct attachment.',
      quiz: [
        { q: 'Hùng luôn kiểm tra kỹ điều gì trước khi gửi email?', options: ['Chủ đề email', 'Địa chỉ IP', 'Thời gian gửi', 'Kích thước file'], correct: 0 },
        { q: 'Hùng chú ý điều gì trong cách viết email?', options: ['Giọng điệu', 'Font chữ', 'Màu sắc', 'Kích thước chữ'], correct: 0 },
      ],
    },
    listening: [
      'Please check the subject line before sending.',
      'I will CC my manager on this email.',
      'Don\'t forget to attach the file.',
      'She ended the email with "Kind regards".',
    ],
    writing: {
      prompt: 'Viết một email công việc chuyên nghiệp (tiếng Anh) hoàn chỉnh, có subject line rõ ràng, CC đúng người, tone lịch sự và kết bằng Kind regards.',
      minWords: 30,
      phrases: ['I am writing to inform you about', 'Please find the attachment for', 'I have CC\'d my manager for visibility', 'Kind regards,'],
      sentenceBuilder: [
        { scrambled: 'He / (double-check) / the subject line / carefully', answer: 'He double-checks the subject line carefully' },
        { scrambled: 'Every message / (end) / politely / with Kind regards', answer: 'Every message ends politely with Kind regards' },
      ],
    },
  },
  { // Day 90 - Văn hóa công sở & email chuyên nghiệp 3/3
    vocab: [
      { word: 'Professionalism', phonetic: '/prəˈfeʃənəlɪzəm/', meaning: 'Tính chuyên nghiệp', quiz: { options: ['Tính chuyên nghiệp', 'Sự đúng giờ', 'Trang phục công sở', 'Giữ bí mật thông tin'], correct: 0 } },
      { word: 'Punctuality',     phonetic: '/ˌpʌŋktʃuˈæləti/', meaning: 'Sự đúng giờ', quiz: { options: ['Trang phục công sở', 'Sự đúng giờ', 'Tính chuyên nghiệp', 'Giữ bí mật thông tin'], correct: 1 } },
      { word: 'Dress code',      phonetic: '/dres koʊd/', meaning: 'Quy định trang phục', quiz: { options: ['Giữ bí mật thông tin', 'Trang phục công sở', 'Sự đúng giờ', 'Quy định trang phục'], correct: 3 } },
      { word: 'Confidentiality', phonetic: '/ˌkɒnfɪˌdenʃiˈæləti/', meaning: 'Sự bảo mật thông tin', quiz: { options: ['Tính chuyên nghiệp', 'Quy định trang phục', 'Sự đúng giờ', 'Sự bảo mật thông tin'], correct: 3 } },
      { word: 'Reliable',        phonetic: '/rɪˈlaɪəbl/', meaning: 'Đáng tin cậy', quiz: { options: ['Đáng tin cậy', 'Sự bảo mật thông tin', 'Quy định trang phục', 'Sự đúng giờ'], correct: 0 } },
    ],
    reading: {
      title: 'The Value of Professionalism',
      passage: 'After three months at her new job, Vy has built a strong reputation for professionalism and punctuality, always arriving a few minutes early. She follows the company\'s dress code and understands the importance of confidentiality when handling client information. Her manager now describes her as one of the most reliable people on the team.',
      quiz: [
        { q: 'Vy xây dựng danh tiếng tốt về điều gì?', options: ['Tính chuyên nghiệp và sự đúng giờ', 'Kỹ năng nấu ăn', 'Khả năng ca hát', 'Kỹ năng lái xe'], correct: 0 },
        { q: 'Vy hiểu rõ tầm quan trọng của điều gì khi xử lý thông tin khách hàng?', options: ['Sự bảo mật thông tin', 'Tốc độ xử lý', 'Số lượng khách hàng', 'Giá dịch vụ'], correct: 0 },
      ],
    },
    listening: [
      'Professionalism matters in every interaction.',
      'Punctuality shows respect for others\' time.',
      'Please follow the company dress code.',
      'Confidentiality is essential when handling client data.',
    ],
    writing: {
      prompt: 'Viết một đoạn ngắn (tiếng Anh) tự đánh giá bản thân về professionalism, punctuality và confidentiality tại nơi làm việc.',
      minWords: 30,
      phrases: ['I take professionalism very seriously', 'Punctuality is something I always value', 'I follow the company dress code by', 'I understand the importance of confidentiality'],
      sentenceBuilder: [
        { scrambled: 'She / (build) / a strong reputation / for professionalism', answer: 'She built a strong reputation for professionalism' },
        { scrambled: 'Her manager / (describe) / her / as reliable', answer: 'Her manager describes her as reliable' },
      ],
    },
  },
      ],
    },
    advanced: {
      badge: 'C1+',
      days: [
        { // Day 1
          vocab: [
            { word: 'Leverage',    phonetic: '/ˈlevərɪdʒ/',     meaning: 'Tận dụng lợi thế',                 quiz: { options: ['Hiệu ứng cộng hưởng', 'Tận dụng lợi thế', 'Thoả hiệp', 'Bên liên quan'], correct: 1 } },
            { word: 'Synergy',     phonetic: '/ˈsɪnərdʒi/',     meaning: 'Hiệu ứng cộng hưởng',              quiz: { options: ['Bên liên quan', 'Hiệu ứng cộng hưởng', 'Leo thang, báo cáo lên cấp cao hơn', 'Thoả hiệp'], correct: 1 } },
            { word: 'Escalate',    phonetic: '/ˈeskəleɪt/',     meaning: 'Leo thang, báo cáo lên cấp cao hơn', quiz: { options: ['Leo thang, báo cáo lên cấp cao hơn', 'Tận dụng lợi thế', 'Thoả hiệp', 'Hiệu ứng cộng hưởng'], correct: 0 } },
            { word: 'Stakeholder', phonetic: '/ˈsteɪkhoʊldər/', meaning: 'Bên liên quan',                    quiz: { options: ['Thoả hiệp', 'Bên liên quan', 'Tận dụng lợi thế', 'Leo thang, báo cáo lên cấp cao hơn'], correct: 1 } },
            { word: 'Compromise',  phonetic: '/ˈkɒmprəmaɪz/',   meaning: 'Thoả hiệp',                        quiz: { options: ['Hiệu ứng cộng hưởng', 'Bên liên quan', 'Tận dụng lợi thế', 'Thoả hiệp'], correct: 3 } },
          ],
          reading: {
            title: 'Building Cross-Team Synergy',
            passage: 'To leverage the strengths of both teams, the director proposed a joint task force that would create real synergy between product and sales. Key stakeholders were invited to the kickoff, and any blocking issue would be escalated directly to leadership within 48 hours.',
            quiz: [
              { q: 'Mục đích của việc lập "joint task force" là gì?', options: ['Cắt giảm nhân sự', 'Tạo hiệu ứng cộng hưởng giữa các đội', 'Thay đổi sản phẩm', 'Tăng lương'], correct: 1 },
              { q: 'Vấn đề chặn tiến độ sẽ được xử lý như thế nào?', options: ['Bỏ qua', 'Escalate lên lãnh đạo trong 48h', 'Chờ họp tháng sau', 'Giao cho thực tập sinh'], correct: 1 },
            ],
          },
          listening: [
            'We need to leverage our existing client relationships.',
            'This partnership could create real synergy for both sides.',
            'I\'ll escalate this to senior leadership today.',
            'All key stakeholders must sign off before we proceed.',
          ],
          writing: {
            prompt: 'Viết một đoạn văn thuyết phục (tiếng Anh) đề xuất một sáng kiến hợp tác giữa hai phòng ban.',
            minWords: 50,
            phrases: ['In order to leverage', 'This creates strong synergy between', 'I would like to escalate', 'All key stakeholders should'],
            sentenceBuilder: [
              { scrambled: 'The company / (leverage) / its resources / to grow faster', answer: 'The company leverages its resources to grow faster' },
              { scrambled: 'They / (escalate) / the issue / to management / last week', answer: 'They escalated the issue to management last week' },
            ],
          },
        },
        { // Day 2
          vocab: [
            { word: 'Transition',  phonetic: '/trænˈzɪʃn/',   meaning: 'Sự chuyển đổi',        quiz: { options: ['Sự kháng cự', 'Sự chuyển đổi', 'Đồng bộ', 'Sáng kiến'], correct: 1 } },
            { word: 'Resistance',  phonetic: '/rɪˈzɪstəns/',  meaning: 'Sự kháng cự',          quiz: { options: ['Sự kháng cự', 'Đà phát triển', 'Sáng kiến', 'Đồng bộ'], correct: 0 } },
            { word: 'Align',       phonetic: '/əˈlaɪn/',      meaning: 'Đồng bộ, thống nhất',  quiz: { options: ['Sáng kiến', 'Sự chuyển đổi', 'Đồng bộ, thống nhất', 'Đà phát triển'], correct: 2 } },
            { word: 'Initiative',  phonetic: '/ɪˈnɪʃətɪv/',   meaning: 'Sáng kiến',            quiz: { options: ['Sáng kiến', 'Sự kháng cự', 'Đà phát triển', 'Sự chuyển đổi'], correct: 0 } },
            { word: 'Momentum',    phonetic: '/moʊˈmentəm/',  meaning: 'Đà phát triển',        quiz: { options: ['Đồng bộ', 'Sự chuyển đổi', 'Sự kháng cự', 'Đà phát triển'], correct: 3 } },
          ],
          reading: {
            title: 'Leading a Digital Transition',
            passage: 'The transition to a new system met some resistance from senior staff. To align the whole team, leadership launched an initiative that built momentum through early wins.',
            quiz: [
              { q: 'Ai phản ứng kháng cự với hệ thống mới?', options: ['Nhân viên mới', 'Nhân sự cấp cao', 'Khách hàng', 'Đối tác'], correct: 1 },
              { q: 'Sáng kiến của lãnh đạo tạo ra điều gì?', options: ['Đà phát triển qua các thắng lợi sớm', 'Thêm sự kháng cự', 'Chi phí phát sinh', 'Sự chậm trễ'], correct: 0 },
            ],
          },
          listening: [
            'We need to align our teams before the transition.',
            'There\'s some resistance to this initiative.',
            'Let\'s build momentum with a few quick wins.',
            'This transition will take about six months.',
          ],
          writing: {
            prompt: 'Viết đoạn văn thuyết phục về cách xử lý sự kháng cự (resistance) khi triển khai một thay đổi lớn trong công ty.',
            minWords: 50,
            phrases: ['To align the team, we should', 'This resistance can be addressed by', 'This initiative will build momentum by', 'During this transition'],
            sentenceBuilder: [
              { scrambled: 'The initiative / (build) / momentum / quickly', answer: 'The initiative built momentum quickly' },
              { scrambled: 'They / (align) / their goals / last month', answer: 'They aligned their goals last month' },
            ],
          },
        },
        { // Day 3
          vocab: [
            { word: 'Forecast',       phonetic: '/ˈfɔːrkæst/',        meaning: 'Dự báo',              quiz: { options: ['Dự báo', 'Phân bổ', 'Tối ưu hoá', 'Tạo sự khác biệt'], correct: 0 } },
            { word: 'Allocate',       phonetic: '/ˈæləkeɪt/',         meaning: 'Phân bổ',              quiz: { options: ['Bền vững', 'Phân bổ', 'Dự báo', 'Tối ưu hoá'], correct: 1 } },
            { word: 'Sustainable',    phonetic: '/səˈsteɪnəbl/',      meaning: 'Bền vững',             quiz: { options: ['Bền vững', 'Tạo sự khác biệt', 'Phân bổ', 'Dự báo'], correct: 0 } },
            { word: 'Differentiate', phonetic: '/ˌdɪfəˈrenʃieɪt/',   meaning: 'Tạo sự khác biệt',     quiz: { options: ['Tối ưu hoá', 'Dự báo', 'Tạo sự khác biệt', 'Bền vững'], correct: 2 } },
            { word: 'Optimize',       phonetic: '/ˈɒptɪmaɪz/',        meaning: 'Tối ưu hoá',           quiz: { options: ['Phân bổ', 'Tối ưu hoá', 'Bền vững', 'Tạo sự khác biệt'], correct: 1 } },
          ],
          reading: {
            title: 'Building a Sustainable Growth Strategy',
            passage: 'The board reviewed the revenue forecast and agreed to allocate more budget to R&D. To differentiate from competitors, the company will optimize its supply chain for sustainable long-term growth.',
            quiz: [
              { q: 'Hội đồng quản trị quyết định gì sau khi xem dự báo doanh thu?', options: ['Cắt giảm R&D', 'Phân bổ thêm ngân sách cho R&D', 'Sa thải nhân sự', 'Đóng cửa chi nhánh'], correct: 1 },
              { q: 'Công ty làm gì để tạo sự khác biệt với đối thủ?', options: ['Giảm giá sản phẩm', 'Tối ưu hoá chuỗi cung ứng', 'Sao chép đối thủ', 'Ngừng đầu tư'], correct: 1 },
            ],
          },
          listening: [
            'Our forecast shows strong growth next quarter.',
            'We need to allocate more budget to this project.',
            'This strategy will help us differentiate from competitors.',
            'Let\'s optimize the process for sustainability.',
          ],
          writing: {
            prompt: 'Viết đoạn văn thuyết phục đề xuất chiến lược tăng trưởng bền vững (sustainable growth) cho công ty.',
            minWords: 50,
            phrases: ['Based on our forecast', 'We should allocate resources to', 'This will help us differentiate by', 'To optimize for sustainability'],
            sentenceBuilder: [
              { scrambled: 'The company / (optimize) / its supply chain / this year', answer: 'The company optimized its supply chain this year' },
              { scrambled: 'They / (allocate) / more budget / to R&D', answer: 'They allocated more budget to R&D' },
            ],
          },
        },

  { // Day 4
    vocab: [
      { word: 'Acquire',       phonetic: '/əˈkwaɪər/',      meaning: 'Mua lại, thâu tóm', quiz: { options: ['Mua lại, thâu tóm', 'Thoái vốn', 'Định giá', 'Thẩm định'], correct: 0 } },
      { word: 'Divest',        phonetic: '/daɪˈvest/',      meaning: 'Thoái vốn, bán bớt tài sản', quiz: { options: ['Định giá', 'Sáp nhập', 'Thoái vốn, bán bớt tài sản', 'Hợp nhất'], correct: 2 } },
      { word: 'Valuation',     phonetic: '/ˌvæljuˈeɪʃn/',   meaning: 'Định giá doanh nghiệp', quiz: { options: ['Định giá doanh nghiệp', 'Thẩm định', 'Hợp nhất', 'Mua lại'], correct: 0 } },
      { word: 'Due diligence', phonetic: '/ˌdjuː ˈdɪlɪdʒəns/', meaning: 'Thẩm định kỹ lưỡng trước giao dịch', quiz: { options: ['Hợp nhất', 'Thoái vốn', 'Mua lại', 'Thẩm định kỹ lưỡng trước giao dịch'], correct: 3 } },
      { word: 'Consolidate',   phonetic: '/kənˈsɒlɪdeɪt/',  meaning: 'Hợp nhất, củng cố', quiz: { options: ['Hợp nhất, củng cố', 'Định giá doanh nghiệp', 'Thoái vốn', 'Mua lại'], correct: 0 } },
    ],
    reading: {
      title: 'A Landmark Acquisition',
      passage: 'After months of negotiation, Khanh\'s firm agreed to acquire a mid-sized logistics company to consolidate its position in the region. Before signing, the legal team conducted rigorous due diligence to uncover any hidden liabilities, while an independent bank finalized the valuation. Meanwhile, the target company\'s board decided to divest its unprofitable warehousing unit to make the deal more attractive.',
      quiz: [
        { q: 'Vì sao công ty của Khánh muốn mua lại công ty logistics?', options: ['Để thanh lý tài sản', 'Để hợp nhất và củng cố vị thế trong khu vực', 'Để sa thải nhân viên', 'Để giảm giá cổ phiếu'], correct: 1 },
        { q: 'Công ty mục tiêu đã làm gì để giao dịch hấp dẫn hơn?', options: ['Tăng giá bán', 'Thoái vốn đơn vị kho bãi không sinh lời', 'Mua thêm tài sản', 'Hủy hợp đồng'], correct: 1 },
      ],
    },
    listening: [
      'We plan to acquire a smaller competitor next quarter.',
      'The board decided to divest its non-core assets.',
      'An independent firm handled the valuation process.',
      'Due diligence revealed several red flags in their contracts.',
    ],
    writing: {
      prompt: 'Viết đoạn văn thuyết phục hội đồng quản trị về lý do nên mua lại (acquire) một công ty đối thủ nhỏ hơn.',
      minWords: 50,
      phrases: ['We propose to acquire', 'After completing due diligence', 'The valuation suggests', 'To consolidate our market position'],
      sentenceBuilder: [
        { scrambled: 'The firm / (conduct) / due diligence / before / the deal', answer: 'The firm conducted due diligence before the deal' },
        { scrambled: 'They / (divest) / the unprofitable unit / last quarter', answer: 'They divested the unprofitable unit last quarter' },
      ],
    },
  },
  { // Day 5
    vocab: [
      { word: 'Merger',        phonetic: '/ˈmɜːrdʒər/',     meaning: 'Sự sáp nhập', quiz: { options: ['Sự sáp nhập', 'Cổ phần đối ứng', 'Điều khoản chống thâu tóm', 'Cổ đông thiểu số'], correct: 0 } },
      { word: 'Antitrust',     phonetic: '/ˌæntiˈtrʌst/',   meaning: 'Chống độc quyền', quiz: { options: ['Cổ đông thiểu số', 'Chống độc quyền', 'Sự sáp nhập', 'Cổ phần đối ứng'], correct: 1 } },
      { word: 'Poison pill',   phonetic: '/ˈpɔɪzn pɪl/',     meaning: 'Điều khoản chống thâu tóm (thuốc độc)', quiz: { options: ['Sự sáp nhập', 'Chống độc quyền', 'Điều khoản chống thâu tóm (thuốc độc)', 'Cổ đông thiểu số'], correct: 2 } },
      { word: 'Minority stake', phonetic: '/maɪˈnɒrəti steɪk/', meaning: 'Cổ phần thiểu số', quiz: { options: ['Cổ phần thiểu số', 'Chống độc quyền', 'Sự sáp nhập', 'Điều khoản chống thâu tóm'], correct: 0 } },
      { word: 'Synergistic',   phonetic: '/ˌsɪnərˈdʒɪstɪk/', meaning: 'Mang tính cộng hưởng', quiz: { options: ['Chống độc quyền', 'Mang tính cộng hưởng', 'Cổ phần thiểu số', 'Sự sáp nhập'], correct: 1 } },
    ],
    reading: {
      title: 'Navigating a Complex Merger',
      passage: 'The proposed merger between the two telecom giants faced intense scrutiny from antitrust regulators concerned about reduced competition. To fend off a hostile bid, the smaller firm adopted a poison pill strategy, diluting the value of any minority stake an aggressor might acquire. Analysts, however, still viewed the potential union as highly synergistic for both customer bases.',
      quiz: [
        { q: 'Cơ quan nào lo ngại về vụ sáp nhập này?', options: ['Cơ quan thuế', 'Cơ quan chống độc quyền', 'Ngân hàng trung ương', 'Sở giao dịch chứng khoán'], correct: 1 },
        { q: 'Công ty nhỏ hơn làm gì để chống lại việc bị thâu tóm?', options: ['Tăng cổ tức', 'Áp dụng điều khoản chống thâu tóm (poison pill)', 'Bán toàn bộ công ty', 'Sa thải ban lãnh đạo'], correct: 1 },
      ],
    },
    listening: [
      'The merger is currently under antitrust review.',
      'They adopted a poison pill to block the takeover.',
      'An investor acquired a minority stake in the startup.',
      'Analysts called the deal highly synergistic.',
    ],
    writing: {
      prompt: 'Viết đoạn văn (tiếng Anh) giải thích vì sao một thương vụ sáp nhập (merger) có thể mang lại lợi ích cộng hưởng cho cả hai công ty.',
      minWords: 50,
      phrases: ['This merger would be synergistic because', 'Regulators may raise antitrust concerns', 'The company holds a minority stake in', 'To prevent a hostile takeover'],
      sentenceBuilder: [
        { scrambled: 'Regulators / (review) / the merger / for months', answer: 'Regulators reviewed the merger for months' },
        { scrambled: 'The company / (adopt) / a poison pill / strategy', answer: 'The company adopted a poison pill strategy' },
      ],
    },
  },
  { // Day 6
    vocab: [
      { word: 'Integration',   phonetic: '/ˌɪntɪˈɡreɪʃn/',  meaning: 'Sự tích hợp (sau sáp nhập)', quiz: { options: ['Sự tích hợp (sau sáp nhập)', 'Định giá quá cao', 'Thẩm định pháp lý', 'Bồi thường'], correct: 0 } },
      { word: 'Overvalued',    phonetic: '/ˌoʊvərˈvæljuːd/', meaning: 'Bị định giá quá cao', quiz: { options: ['Sự tích hợp', 'Bồi thường', 'Bị định giá quá cao', 'Thẩm định pháp lý'], correct: 2 } },
      { word: 'Indemnity',     phonetic: '/ɪnˈdemnəti/',    meaning: 'Điều khoản bồi thường', quiz: { options: ['Điều khoản bồi thường', 'Sự tích hợp', 'Bị định giá quá cao', 'Thẩm định pháp lý'], correct: 0 } },
      { word: 'Legal counsel', phonetic: '/ˈliːɡl ˈkaʊnsl/', meaning: 'Cố vấn pháp lý', quiz: { options: ['Bồi thường', 'Cố vấn pháp lý', 'Sự tích hợp', 'Bị định giá quá cao'], correct: 1 } },
      { word: 'Goodwill',      phonetic: '/ˈɡʊdwɪl/',       meaning: 'Lợi thế thương mại', quiz: { options: ['Lợi thế thương mại', 'Cố vấn pháp lý', 'Điều khoản bồi thường', 'Bị định giá quá cao'], correct: 0 } },
    ],
    reading: {
      title: 'Post-Deal Integration Challenges',
      passage: 'Six months after the acquisition closed, Duy\'s integration team struggled to merge two very different IT systems. Some board members privately admitted the target had been overvalued, inflating the goodwill recorded on the balance sheet. Fortunately, an indemnity clause negotiated by legal counsel protected the buyer from unforeseen tax liabilities uncovered after closing.',
      quiz: [
        { q: 'Vấn đề gì xảy ra 6 tháng sau khi thương vụ hoàn tất?', options: ['Đội tích hợp gặp khó khăn hợp nhất hệ thống IT', 'Công ty phá sản', 'Cổ phiếu tăng gấp đôi', 'Toàn bộ nhân viên nghỉ việc'], correct: 0 },
        { q: 'Điều khoản nào đã bảo vệ bên mua khỏi rủi ro thuế?', options: ['Điều khoản bồi thường (indemnity)', 'Điều khoản chống thâu tóm', 'Điều khoản bảo mật', 'Điều khoản cạnh tranh'], correct: 0 },
      ],
    },
    listening: [
      'The integration process is taking longer than expected.',
      'Some analysts believe the company was overvalued.',
      'The contract includes an indemnity clause for tax risks.',
      'Legal counsel reviewed every page of the agreement.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả những thách thức của giai đoạn tích hợp (integration) sau khi hai công ty sáp nhập.',
      minWords: 50,
      phrases: ['The integration process involves', 'To avoid being overvalued', 'An indemnity clause protects', 'Our legal counsel advised that'],
      sentenceBuilder: [
        { scrambled: 'The lawyers / (negotiate) / an indemnity clause / carefully', answer: 'The lawyers negotiated an indemnity clause carefully' },
        { scrambled: 'The target company / (be) / overvalued / by analysts', answer: 'The target company was overvalued by analysts' },
      ],
    },
  },
  { // Day 7
    vocab: [
      { word: 'Hostile takeover', phonetic: '/ˈhɒstaɪl ˈteɪkoʊvər/', meaning: 'Thâu tóm thù địch', quiz: { options: ['Thâu tóm thù địch', 'Cổ đông chi phối', 'Chia tách công ty', 'Tái cấp vốn'], correct: 0 } },
      { word: 'Majority shareholder', phonetic: '/məˈdʒɒrəti ˈʃeərhoʊldər/', meaning: 'Cổ đông chi phối', quiz: { options: ['Chia tách công ty', 'Cổ đông chi phối', 'Tái cấp vốn', 'Thâu tóm thù địch'], correct: 1 } },
      { word: 'Spin-off',      phonetic: '/ˈspɪn ɒf/',       meaning: 'Chia tách công ty con', quiz: { options: ['Chia tách công ty con', 'Cổ đông chi phối', 'Tái cấp vốn', 'Thâu tóm thù địch'], correct: 0 } },
      { word: 'Recapitalize',  phonetic: '/ˌriːˈkæpɪtəlaɪz/', meaning: 'Tái cấp vốn', quiz: { options: ['Thâu tóm thù địch', 'Chia tách công ty con', 'Tái cấp vốn', 'Cổ đông chi phối'], correct: 2 } },
      { word: 'Bidder',        phonetic: '/ˈbɪdər/',         meaning: 'Bên đấu giá, bên chào mua', quiz: { options: ['Bên đấu giá, bên chào mua', 'Chia tách công ty con', 'Tái cấp vốn', 'Cổ đông chi phối'], correct: 0 } },
    ],
    reading: {
      title: 'Fighting Off a Hostile Takeover',
      passage: 'When rumors of a hostile takeover surfaced, Trâm, the CFO, rallied the majority shareholder to defend the company\'s independence. The board considered a spin-off of the underperforming retail division to reduce the firm\'s appeal to opportunistic bidders. As an alternative, they explored recapitalizing the business through new debt to buy back shares.',
      quiz: [
        { q: 'Trâm đã làm gì khi có tin đồn về thâu tóm thù địch?', options: ['Bán toàn bộ công ty', 'Kêu gọi cổ đông chi phối bảo vệ sự độc lập của công ty', 'Nghỉ việc ngay lập tức', 'Sa thải toàn bộ ban giám đốc'], correct: 1 },
        { q: 'Hội đồng quản trị cân nhắc phương án nào để giảm sức hấp dẫn với bên chào mua?', options: ['Tăng giá cổ phiếu', 'Chia tách (spin-off) mảng bán lẻ kém hiệu quả', 'Mua thêm tài sản', 'Niêm yết thêm sàn quốc tế'], correct: 1 },
      ],
    },
    listening: [
      'The company is defending against a hostile takeover.',
      'The majority shareholder blocked the deal.',
      'They announced a spin-off of the retail division.',
      'The firm plans to recapitalize through new debt.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất chiến lược phòng thủ trước một cuộc thâu tóm thù địch (hostile takeover).',
      minWords: 50,
      phrases: ['To resist a hostile takeover', 'The majority shareholder supports', 'We are considering a spin-off of', 'The company plans to recapitalize by'],
      sentenceBuilder: [
        { scrambled: 'The board / (consider) / a spin-off / of the division', answer: 'The board considered a spin-off of the division' },
        { scrambled: 'A new bidder / (emerge) / last week / unexpectedly', answer: 'A new bidder emerged last week unexpectedly' },
      ],
    },
  },
  { // Day 8
    vocab: [
      { word: 'Deal structure', phonetic: '/diːl ˈstrʌktʃər/', meaning: 'Cấu trúc giao dịch', quiz: { options: ['Cấu trúc giao dịch', 'Bên bán', 'Ủy quyền', 'Điều khoản không cạnh tranh'], correct: 0 } },
      { word: 'Vendor',        phonetic: '/ˈvendər/',        meaning: 'Bên bán, nhà cung cấp', quiz: { options: ['Ủy quyền', 'Bên bán, nhà cung cấp', 'Cấu trúc giao dịch', 'Điều khoản không cạnh tranh'], correct: 1 } },
      { word: 'Mandate',       phonetic: '/ˈmændeɪt/',       meaning: 'Sự ủy quyền, nhiệm vụ được giao', quiz: { options: ['Sự ủy quyền, nhiệm vụ được giao', 'Cấu trúc giao dịch', 'Bên bán', 'Điều khoản không cạnh tranh'], correct: 0 } },
      { word: 'Non-compete',   phonetic: '/nɒn kəmˈpiːt/',    meaning: 'Điều khoản không cạnh tranh', quiz: { options: ['Bên bán', 'Sự ủy quyền', 'Điều khoản không cạnh tranh', 'Cấu trúc giao dịch'], correct: 2 } },
      { word: 'Earn-out',      phonetic: '/ˈɜːrn aʊt/',       meaning: 'Điều khoản trả thêm theo hiệu suất', quiz: { options: ['Điều khoản trả thêm theo hiệu suất', 'Bên bán', 'Sự ủy quyền', 'Cấu trúc giao dịch'], correct: 0 } },
    ],
    reading: {
      title: 'Structuring the Perfect Deal',
      passage: 'The investment bank was given a mandate to design an optimal deal structure for the acquisition. To bridge the gap between buyer and vendor on price, the parties agreed to an earn-out arrangement tied to future profits. As part of the agreement, the founder also signed a strict non-compete clause preventing him from starting a rival business for five years.',
      quiz: [
        { q: 'Ngân hàng đầu tư được giao nhiệm vụ gì?', options: ['Bán cổ phiếu ra công chúng', 'Thiết kế cấu trúc giao dịch tối ưu cho thương vụ', 'Kiểm toán nội bộ', 'Định giá bất động sản'], correct: 1 },
        { q: 'Nhà sáng lập đã ký điều khoản gì?', options: ['Điều khoản không cạnh tranh trong 5 năm', 'Điều khoản tăng lương', 'Điều khoản chia cổ tức', 'Điều khoản bảo hiểm'], correct: 0 },
      ],
    },
    listening: [
      'The bank was given a mandate to advise on the deal.',
      'The vendor negotiated hard on the final price.',
      'The contract includes a strict non-compete clause.',
      'An earn-out will reward the seller for future performance.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất một cấu trúc giao dịch (deal structure) công bằng cho cả bên mua và bên bán.',
      minWords: 50,
      phrases: ['We propose the following deal structure', 'The vendor has requested', 'Our mandate is to', 'An earn-out clause would allow'],
      sentenceBuilder: [
        { scrambled: 'The founder / (sign) / a non-compete / clause', answer: 'The founder signed a non-compete clause' },
        { scrambled: 'Both parties / (agree) / to an earn-out / structure', answer: 'Both parties agreed to an earn-out structure' },
      ],
    },
  },
  { // Day 9 — Chủ đề: Quản trị rủi ro
    vocab: [
      { word: 'Mitigate',      phonetic: '/ˈmɪtɪɡeɪt/',      meaning: 'Giảm thiểu (rủi ro)', quiz: { options: ['Giảm thiểu (rủi ro)', 'Mức độ phơi nhiễm rủi ro', 'Kế hoạch dự phòng', 'Trách nhiệm pháp lý'], correct: 0 } },
      { word: 'Exposure',      phonetic: '/ɪkˈspoʊʒər/',     meaning: 'Mức độ phơi nhiễm rủi ro', quiz: { options: ['Kế hoạch dự phòng', 'Mức độ phơi nhiễm rủi ro', 'Giảm thiểu (rủi ro)', 'Trách nhiệm pháp lý'], correct: 1 } },
      { word: 'Contingency',   phonetic: '/kənˈtɪndʒənsi/',  meaning: 'Kế hoạch dự phòng', quiz: { options: ['Trách nhiệm pháp lý', 'Giảm thiểu (rủi ro)', 'Mức độ phơi nhiễm rủi ro', 'Kế hoạch dự phòng'], correct: 3 } },
      { word: 'Liability',     phonetic: '/ˌlaɪəˈbɪləti/',   meaning: 'Trách nhiệm pháp lý, nghĩa vụ nợ', quiz: { options: ['Trách nhiệm pháp lý, nghĩa vụ nợ', 'Kế hoạch dự phòng', 'Giảm thiểu (rủi ro)', 'Mức độ phơi nhiễm rủi ro'], correct: 0 } },
      { word: 'Compliance',    phonetic: '/kəmˈplaɪəns/',    meaning: 'Sự tuân thủ (quy định)', quiz: { options: ['Mức độ phơi nhiễm rủi ro', 'Kế hoạch dự phòng', 'Sự tuân thủ (quy định)', 'Trách nhiệm pháp lý'], correct: 2 } },
    ],
    reading: {
      title: 'Building a Resilient Risk Framework',
      passage: 'The chief risk officer, Bình, presented a plan to mitigate the company\'s exposure to currency fluctuations in overseas markets. He also insisted on a robust contingency plan in case a key supplier defaulted, since such a failure could create significant liability for the firm. The compliance department confirmed that all new hedging instruments met regulatory standards.',
      quiz: [
        { q: 'Bình đề xuất kế hoạch gì?', options: ['Tăng cường quảng cáo', 'Giảm thiểu rủi ro biến động tỷ giá ở thị trường nước ngoài', 'Mở rộng văn phòng', 'Giảm giá sản phẩm'], correct: 1 },
        { q: 'Bộ phận tuân thủ (compliance) đã xác nhận điều gì?', options: ['Các công cụ phòng ngừa rủi ro mới đáp ứng quy định', 'Công ty vi phạm luật', 'Ngân sách bị cắt giảm', 'Nhân sự sẽ bị sa thải'], correct: 0 },
      ],
    },
    listening: [
      'We need to mitigate our exposure to currency risk.',
      'The company has significant exposure in emerging markets.',
      'Do we have a contingency plan for supplier failure?',
      'This could create serious liability for the firm.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất các biện pháp giảm thiểu (mitigate) rủi ro tài chính cho công ty trong năm tới.',
      minWords: 50,
      phrases: ['To mitigate this risk, we should', 'Our exposure to this market is', 'We need a contingency plan for', 'This could create liability if'],
      sentenceBuilder: [
        { scrambled: 'The team / (mitigate) / the risk / successfully', answer: 'The team mitigated the risk successfully' },
        { scrambled: 'The company / (have) / a contingency plan / for emergencies', answer: 'The company has a contingency plan for emergencies' },
      ],
    },
  },
  { // Day 10
    vocab: [
      { word: 'Hedge',         phonetic: '/hedʒ/',           meaning: 'Phòng ngừa rủi ro (tài chính)', quiz: { options: ['Phòng ngừa rủi ro (tài chính)', 'Ma trận rủi ro', 'Khả năng chịu đựng rủi ro', 'Giám sát'], correct: 0 } },
      { word: 'Risk appetite', phonetic: '/rɪsk ˈæpɪtaɪt/',  meaning: 'Khẩu vị rủi ro', quiz: { options: ['Ma trận rủi ro', 'Khẩu vị rủi ro', 'Phòng ngừa rủi ro', 'Giám sát'], correct: 1 } },
      { word: 'Vulnerability', phonetic: '/ˌvʌlnərəˈbɪləti/', meaning: 'Điểm yếu, lỗ hổng', quiz: { options: ['Khẩu vị rủi ro', 'Phòng ngừa rủi ro', 'Điểm yếu, lỗ hổng', 'Giám sát'], correct: 2 } },
      { word: 'Oversight',     phonetic: '/ˈoʊvərsaɪt/',     meaning: 'Sự giám sát', quiz: { options: ['Điểm yếu, lỗ hổng', 'Sự giám sát', 'Phòng ngừa rủi ro', 'Khẩu vị rủi ro'], correct: 1 } },
      { word: 'Risk matrix',   phonetic: '/rɪsk ˈmeɪtrɪks/', meaning: 'Ma trận đánh giá rủi ro', quiz: { options: ['Ma trận đánh giá rủi ro', 'Điểm yếu, lỗ hổng', 'Sự giám sát', 'Khẩu vị rủi ro'], correct: 0 } },
    ],
    reading: {
      title: 'Defining the Company\'s Risk Appetite',
      passage: 'Before approving the new investment, the board wanted to clearly define the company\'s risk appetite. Using a detailed risk matrix, the finance team identified a critical vulnerability in the firm\'s reliance on a single overseas supplier. The audit committee recommended stronger oversight, while treasury proposed using financial instruments to hedge against further disruption.',
      quiz: [
        { q: 'Ban lãnh đạo muốn xác định điều gì trước khi phê duyệt khoản đầu tư mới?', options: ['Khẩu vị rủi ro của công ty', 'Mức lương nhân viên', 'Vị trí văn phòng mới', 'Ngày nghỉ lễ'], correct: 0 },
        { q: 'Đội tài chính phát hiện điểm yếu gì?', options: ['Thiếu nhân sự IT', 'Sự phụ thuộc vào một nhà cung cấp nước ngoài duy nhất', 'Văn phòng quá nhỏ', 'Thiếu ngân sách marketing'], correct: 1 },
      ],
    },
    listening: [
      'What is our risk appetite for this investment?',
      'This exposes a key vulnerability in our supply chain.',
      'The board called for stronger oversight of the process.',
      'We used a risk matrix to prioritize these threats.',
    ],
    writing: {
      prompt: 'Viết đoạn văn phân tích khẩu vị rủi ro (risk appetite) phù hợp cho một công ty đang mở rộng ra thị trường mới.',
      minWords: 50,
      phrases: ['Our risk appetite for this project is', 'This exposes a vulnerability in', 'We recommend stronger oversight of', 'To hedge against this risk'],
      sentenceBuilder: [
        { scrambled: 'The team / (identify) / a critical vulnerability / yesterday', answer: 'The team identified a critical vulnerability yesterday' },
        { scrambled: 'The committee / (recommend) / stronger oversight / immediately', answer: 'The committee recommended stronger oversight immediately' },
      ],
    },
  },
  { // Day 11
    vocab: [
      { word: 'Whistleblower', phonetic: '/ˈwɪslbloʊər/',   meaning: 'Người tố giác sai phạm', quiz: { options: ['Người tố giác sai phạm', 'Sự cố', 'Kiểm toán', 'Điều tra nội bộ'], correct: 0 } },
      { word: 'Breach',        phonetic: '/briːtʃ/',        meaning: 'Vi phạm, sự cố xâm phạm', quiz: { options: ['Kiểm toán', 'Vi phạm, sự cố xâm phạm', 'Người tố giác sai phạm', 'Điều tra nội bộ'], correct: 1 } },
      { word: 'Audit trail',   phonetic: '/ˈɔːdɪt treɪl/',  meaning: 'Dấu vết kiểm toán', quiz: { options: ['Dấu vết kiểm toán', 'Vi phạm', 'Người tố giác sai phạm', 'Điều tra nội bộ'], correct: 0 } },
      { word: 'Misconduct',    phonetic: '/ˌmɪsˈkɒndʌkt/',  meaning: 'Hành vi sai trái', quiz: { options: ['Dấu vết kiểm toán', 'Điều tra nội bộ', 'Hành vi sai trái', 'Vi phạm'], correct: 2 } },
      { word: 'Internal probe', phonetic: '/ɪnˈtɜːrnl proʊb/', meaning: 'Cuộc điều tra nội bộ', quiz: { options: ['Cuộc điều tra nội bộ', 'Dấu vết kiểm toán', 'Hành vi sai trái', 'Vi phạm'], correct: 0 } },
    ],
    reading: {
      title: 'When a Whistleblower Speaks Up',
      passage: 'An anonymous whistleblower alerted the audit committee to a possible data breach affecting thousands of customer records. HR immediately launched an internal probe into alleged misconduct by a senior manager, examining the audit trail of every affected system. The CEO, Long, publicly praised the whistleblower for coming forward despite the risk to their career.',
      quiz: [
        { q: 'Người tố giác đã báo cáo vấn đề gì?', options: ['Một vụ vi phạm dữ liệu khách hàng', 'Lỗi kỹ thuật nhỏ', 'Sự chậm trễ giao hàng', 'Thay đổi logo công ty'], correct: 0 },
        { q: 'Long đã làm gì đối với người tố giác?', options: ['Sa thải họ', 'Công khai khen ngợi vì đã dũng cảm lên tiếng', 'Phớt lờ báo cáo', 'Kiện họ ra tòa'], correct: 1 },
      ],
    },
    listening: [
      'A whistleblower reported the data breach to compliance.',
      'The company suffered a serious security breach last month.',
      'HR launched an internal probe into the allegations.',
      'Investigators followed the audit trail carefully.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích tầm quan trọng của việc bảo vệ người tố giác (whistleblower) trong doanh nghiệp.',
      minWords: 50,
      phrases: ['The whistleblower reported that', 'This constitutes a serious breach of', 'An internal probe was launched to', 'The audit trail showed that'],
      sentenceBuilder: [
        { scrambled: 'The company / (launch) / an internal probe / quickly', answer: 'The company launched an internal probe quickly' },
        { scrambled: 'The breach / (affect) / thousands of records / last year', answer: 'The breach affected thousands of records last year' },
      ],
    },
  },
  { // Day 12
    vocab: [
      { word: 'Safeguard',     phonetic: '/ˈseɪfɡɑːrd/',    meaning: 'Biện pháp bảo vệ, bảo vệ', quiz: { options: ['Biện pháp bảo vệ, bảo vệ', 'Rủi ro hệ thống', 'Bảo hiểm rủi ro', 'Kịch bản xấu nhất'], correct: 0 } },
      { word: 'Systemic risk', phonetic: '/sɪˈstemɪk rɪsk/', meaning: 'Rủi ro hệ thống', quiz: { options: ['Bảo hiểm rủi ro', 'Rủi ro hệ thống', 'Biện pháp bảo vệ', 'Kịch bản xấu nhất'], correct: 1 } },
      { word: 'Underwrite',    phonetic: '/ˈʌndəraɪt/',     meaning: 'Bảo lãnh, bảo hiểm rủi ro', quiz: { options: ['Kịch bản xấu nhất', 'Biện pháp bảo vệ', 'Rủi ro hệ thống', 'Bảo lãnh, bảo hiểm rủi ro'], correct: 3 } },
      { word: 'Worst-case scenario', phonetic: '/wɜːrst keɪs sɪˈnɑːrioʊ/', meaning: 'Kịch bản xấu nhất', quiz: { options: ['Kịch bản xấu nhất', 'Rủi ro hệ thống', 'Bảo lãnh', 'Biện pháp bảo vệ'], correct: 0 } },
      { word: 'Stress test',   phonetic: '/stres test/',    meaning: 'Kiểm tra sức chịu đựng (tài chính)', quiz: { options: ['Bảo lãnh', 'Biện pháp bảo vệ', 'Kiểm tra sức chịu đựng (tài chính)', 'Rủi ro hệ thống'], correct: 2 } },
    ],
    reading: {
      title: 'Preparing for the Worst-Case Scenario',
      passage: 'To safeguard shareholder value, the bank ran an annual stress test simulating a severe recession. Regulators wanted to ensure no single institution posed a systemic risk to the wider economy. Insurance companies were asked to underwrite additional coverage in case the worst-case scenario ever materialized, protecting policyholders from catastrophic losses.',
      quiz: [
        { q: 'Ngân hàng thực hiện bài kiểm tra hằng năm nào?', options: ['Kiểm tra sức chịu đựng mô phỏng suy thoái nghiêm trọng', 'Kiểm tra an ninh mạng', 'Kiểm tra sự hài lòng khách hàng', 'Kiểm tra tốc độ giao dịch'], correct: 0 },
        { q: 'Cơ quan quản lý lo ngại điều gì?', options: ['Một tổ chức gây ra rủi ro hệ thống cho toàn nền kinh tế', 'Nhân viên nghỉ việc nhiều', 'Giá cổ phiếu tăng quá nhanh', 'Lợi nhuận quá cao'], correct: 0 },
      ],
    },
    listening: [
      'We must safeguard shareholder value at all costs.',
      'Regulators are worried about systemic risk in the sector.',
      'The insurer agreed to underwrite the new policy.',
      'The bank ran a stress test to prepare for a downturn.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất các biện pháp bảo vệ (safeguard) công ty trước một kịch bản xấu nhất (worst-case scenario) có thể xảy ra.',
      minWords: 50,
      phrases: ['To safeguard our business, we should', 'This could pose a systemic risk to', 'The insurer will underwrite', 'In the worst-case scenario'],
      sentenceBuilder: [
        { scrambled: 'The bank / (run) / a stress test / annually', answer: 'The bank runs a stress test annually' },
        { scrambled: 'The company / (safeguard) / its assets / carefully', answer: 'The company safeguards its assets carefully' },
      ],
    },
  },
  { // Day 13
    vocab: [
      { word: 'Regulatory scrutiny', phonetic: '/ˈreɡjələtɔːri ˈskruːtəni/', meaning: 'Sự giám sát của cơ quan quản lý', quiz: { options: ['Sự giám sát của cơ quan quản lý', 'Vi phạm dữ liệu', 'Trách nhiệm giải trình', 'Vượt qua kiểm toán'], correct: 0 } },
      { word: 'Accountability', phonetic: '/əˌkaʊntəˈbɪləti/', meaning: 'Trách nhiệm giải trình', quiz: { options: ['Vi phạm dữ liệu', 'Trách nhiệm giải trình', 'Sự giám sát', 'Vượt qua kiểm toán'], correct: 1 } },
      { word: 'Red flag',      phonetic: '/red flæɡ/',        meaning: 'Dấu hiệu cảnh báo', quiz: { options: ['Vượt qua kiểm toán', 'Vi phạm dữ liệu', 'Dấu hiệu cảnh báo', 'Trách nhiệm giải trình'], correct: 2 } },
      { word: 'Pass an audit', phonetic: '/pæs ən ˈɔːdɪt/',   meaning: 'Vượt qua kiểm toán', quiz: { options: ['Vượt qua kiểm toán', 'Trách nhiệm giải trình', 'Dấu hiệu cảnh báo', 'Sự giám sát'], correct: 0 } },
      { word: 'Data breach',   phonetic: '/ˈdeɪtə briːtʃ/',   meaning: 'Vi phạm/rò rỉ dữ liệu', quiz: { options: ['Trách nhiệm giải trình', 'Dấu hiệu cảnh báo', 'Vượt qua kiểm toán', 'Vi phạm/rò rỉ dữ liệu'], correct: 3 } },
    ],
    reading: {
      title: 'Facing Increased Regulatory Scrutiny',
      passage: 'Following a major data breach last year, the company has faced intense regulatory scrutiny from financial authorities. Kiên, the new compliance head, emphasized a culture of accountability, ensuring every red flag raised by staff was investigated promptly. Thanks to these reforms, the firm finally managed to pass an audit without a single major finding.',
      quiz: [
        { q: 'Tại sao công ty bị giám sát chặt chẽ hơn từ cơ quan quản lý?', options: ['Vì lợi nhuận tăng cao', 'Vì đã xảy ra vụ rò rỉ dữ liệu lớn năm ngoái', 'Vì mở thêm chi nhánh mới', 'Vì thay đổi logo'], correct: 1 },
        { q: 'Kiên đã nhấn mạnh điều gì?', options: ['Văn hóa trách nhiệm giải trình', 'Giảm lương nhân viên', 'Tăng giờ làm việc', 'Cắt giảm chi phí marketing'], correct: 0 },
      ],
    },
    listening: [
      'The company is under regulatory scrutiny right now.',
      'We must build a culture of accountability.',
      'This transaction raised several red flags.',
      'The firm finally managed to pass the audit.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích cách công ty nên xử lý khi đối mặt với sự giám sát chặt chẽ (regulatory scrutiny) từ cơ quan quản lý.',
      minWords: 50,
      phrases: ['We are facing regulatory scrutiny because', 'We must build a culture of accountability', 'This raised a red flag when', 'The company managed to pass the audit'],
      sentenceBuilder: [
        { scrambled: 'The company / (pass) / the audit / successfully', answer: 'The company passed the audit successfully' },
        { scrambled: 'The breach / (raise) / several red flags / immediately', answer: 'The breach raised several red flags immediately' },
      ],
    },
  },
  { // Day 14 — Chủ đề: Văn hóa doanh nghiệp
    vocab: [
      { word: 'Onboard',       phonetic: '/ˈɒnbɔːrd/',       meaning: 'Đào tạo hội nhập nhân viên mới', quiz: { options: ['Đào tạo hội nhập nhân viên mới', 'Sự gắn kết', 'Giữ chân nhân tài', 'Tính đa dạng'], correct: 0 } },
      { word: 'Engagement',    phonetic: '/ɪnˈɡeɪdʒmənt/',   meaning: 'Sự gắn kết (nhân viên)', quiz: { options: ['Giữ chân nhân tài', 'Sự gắn kết (nhân viên)', 'Đào tạo hội nhập', 'Tính đa dạng'], correct: 1 } },
      { word: 'Retention',     phonetic: '/rɪˈtenʃn/',       meaning: 'Sự giữ chân nhân tài', quiz: { options: ['Sự giữ chân nhân tài', 'Sự gắn kết', 'Đào tạo hội nhập', 'Tính đa dạng'], correct: 0 } },
      { word: 'Inclusive',     phonetic: '/ɪnˈkluːsɪv/',     meaning: 'Mang tính hòa nhập, bao gồm mọi người', quiz: { options: ['Tính đa dạng', 'Sự giữ chân nhân tài', 'Mang tính hòa nhập, bao gồm mọi người', 'Sự gắn kết'], correct: 2 } },
      { word: 'Cohesion',      phonetic: '/koʊˈhiːʒn/',      meaning: 'Sự gắn kết, tính đoàn kết', quiz: { options: ['Sự gắn kết, tính đoàn kết', 'Đào tạo hội nhập', 'Sự giữ chân nhân tài', 'Mang tính hòa nhập'], correct: 0 } },
    ],
    reading: {
      title: 'Building a Culture People Want to Stay In',
      passage: 'To improve retention rates, Hương redesigned the process to onboard new hires, pairing each of them with a mentor from day one. She also launched surveys to measure employee engagement across departments, discovering that teams with strong cohesion reported higher satisfaction. The company\'s new inclusive policies ensured every voice, regardless of background, was heard in decision-making.',
      quiz: [
        { q: 'Hương đã thay đổi điều gì để cải thiện tỷ lệ giữ chân nhân viên?', options: ['Quy trình đào tạo hội nhập nhân viên mới', 'Giảm giờ làm', 'Tăng lương gấp đôi', 'Cắt giảm phúc lợi'], correct: 0 },
        { q: 'Đội nhóm có tính gắn kết cao báo cáo điều gì?', options: ['Mức độ hài lòng thấp hơn', 'Mức độ hài lòng cao hơn', 'Doanh thu giảm', 'Tỷ lệ nghỉ việc cao hơn'], correct: 1 },
      ],
    },
    listening: [
      'We redesigned how we onboard new employees.',
      'Employee engagement scores improved this quarter.',
      'Retention is one of our top priorities this year.',
      'An inclusive culture drives stronger team cohesion.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách cải thiện sự gắn kết (engagement) và giữ chân (retention) nhân viên trong công ty.',
      minWords: 50,
      phrases: ['To improve retention, we should', 'Employee engagement can be boosted by', 'We aim to onboard new hires by', 'An inclusive culture fosters'],
      sentenceBuilder: [
        { scrambled: 'The company / (redesign) / its onboarding process / recently', answer: 'The company redesigned its onboarding process recently' },
        { scrambled: 'Strong cohesion / (improve) / team performance / significantly', answer: 'Strong cohesion improves team performance significantly' },
      ],
    },
  },
  { // Day 15
    vocab: [
      { word: 'Psychological safety', phonetic: '/ˌsaɪkəˈlɒdʒɪkl ˈseɪfti/', meaning: 'An toàn tâm lý (trong nhóm)', quiz: { options: ['An toàn tâm lý (trong nhóm)', 'Chuẩn mực hành vi', 'Sự minh bạch', 'Trao quyền'], correct: 0 } },
      { word: 'Norms',         phonetic: '/nɔːrmz/',         meaning: 'Chuẩn mực (hành vi, văn hóa)', quiz: { options: ['Sự minh bạch', 'Chuẩn mực (hành vi, văn hóa)', 'An toàn tâm lý', 'Trao quyền'], correct: 1 } },
      { word: 'Transparency',  phonetic: '/trænsˈpærənsi/',  meaning: 'Sự minh bạch', quiz: { options: ['Trao quyền', 'Chuẩn mực', 'An toàn tâm lý', 'Sự minh bạch'], correct: 3 } },
      { word: 'Empower',       phonetic: '/ɪmˈpaʊər/',       meaning: 'Trao quyền', quiz: { options: ['Trao quyền', 'Sự minh bạch', 'Chuẩn mực', 'An toàn tâm lý'], correct: 0 } },
      { word: 'Feedback loop', phonetic: '/ˈfiːdbæk luːp/',  meaning: 'Vòng phản hồi', quiz: { options: ['Chuẩn mực', 'Vòng phản hồi', 'Sự minh bạch', 'Trao quyền'], correct: 1 } },
    ],
    reading: {
      title: 'Creating Psychological Safety at Work',
      passage: 'Phương, the head of culture, believed that psychological safety was the foundation of a high-performing team, allowing employees to speak up without fear of embarrassment. She worked to establish clear norms around respectful disagreement and radical transparency in decision-making. By empowering managers to close the feedback loop quickly, the company saw a noticeable rise in innovative ideas from junior staff.',
      quiz: [
        { q: 'Phương tin rằng điều gì là nền tảng của đội nhóm hiệu suất cao?', options: ['Lương thưởng cao', 'An toàn tâm lý', 'Văn phòng hiện đại', 'Giờ làm linh hoạt'], correct: 1 },
        { q: 'Kết quả của việc trao quyền cho quản lý đóng vòng phản hồi nhanh là gì?', options: ['Nhân viên nghỉ việc nhiều hơn', 'Tăng ý tưởng sáng tạo từ nhân viên trẻ', 'Giảm doanh thu', 'Tăng chi phí vận hành'], correct: 1 },
      ],
    },
    listening: [
      'Psychological safety encourages people to speak up.',
      'We need clear norms around respectful feedback.',
      'Radical transparency builds trust across teams.',
      'Managers should empower their teams to make decisions.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích tại sao an toàn tâm lý (psychological safety) quan trọng đối với một đội nhóm sáng tạo.',
      minWords: 50,
      phrases: ['Psychological safety allows employees to', 'We should establish clear norms around', 'Transparency builds trust because', 'Empowering the team leads to'],
      sentenceBuilder: [
        { scrambled: 'The manager / (empower) / the team / to decide', answer: 'The manager empowered the team to decide' },
        { scrambled: 'Clear norms / (create) / a safer / environment', answer: 'Clear norms create a safer environment' },
      ],
    },
  },
  { // Day 16
    vocab: [
      { word: 'Meritocracy',   phonetic: '/ˌmerɪˈtɒkrəsi/',  meaning: 'Chế độ trọng dụng nhân tài', quiz: { options: ['Chế độ trọng dụng nhân tài', 'Sự trao quyền tự chủ', 'Văn hóa đổ lỗi', 'Sự tôn trọng lẫn nhau'], correct: 0 } },
      { word: 'Autonomy',      phonetic: '/ɔːˈtɒnəmi/',      meaning: 'Sự tự chủ trong công việc', quiz: { options: ['Văn hóa đổ lỗi', 'Sự tự chủ trong công việc', 'Chế độ trọng dụng nhân tài', 'Sự tôn trọng lẫn nhau'], correct: 1 } },
      { word: 'Blame culture', phonetic: '/bleɪm ˈkʌltʃər/', meaning: 'Văn hóa đổ lỗi', quiz: { options: ['Sự tự chủ', 'Chế độ trọng dụng nhân tài', 'Văn hóa đổ lỗi', 'Sự tôn trọng lẫn nhau'], correct: 2 } },
      { word: 'Mutual respect', phonetic: '/ˈmjuːtʃuəl rɪˈspekt/', meaning: 'Sự tôn trọng lẫn nhau', quiz: { options: ['Sự tôn trọng lẫn nhau', 'Sự tự chủ', 'Văn hóa đổ lỗi', 'Chế độ trọng dụng nhân tài'], correct: 0 } },
      { word: 'Camaraderie',   phonetic: '/ˌkæməˈrɑːdəri/',  meaning: 'Tình đồng đội, sự thân thiết', quiz: { options: ['Sự tự chủ', 'Tình đồng đội, sự thân thiết', 'Văn hóa đổ lỗi', 'Chế độ trọng dụng nhân tài'], correct: 1 } },
    ],
    reading: {
      title: 'From Blame Culture to True Meritocracy',
      passage: 'When Việt took over as regional director, he found a toxic blame culture where mistakes were punished rather than discussed openly. He replaced it with a genuine meritocracy, promoting employees based on results rather than tenure or connections. By granting teams more autonomy and organizing regular social events to build camaraderie, mutual respect between departments improved dramatically within a year.',
      quiz: [
        { q: 'Việt nhận thấy vấn đề văn hóa gì khi tiếp quản vị trí giám đốc vùng?', options: ['Văn hóa đổ lỗi', 'Văn hóa sáng tạo quá mức', 'Văn hóa làm việc từ xa', 'Văn hóa họp hành nhiều'], correct: 0 },
        { q: 'Việt đã thay thế văn hóa cũ bằng điều gì?', options: ['Chế độ trọng dụng nhân tài thực sự', 'Chế độ thâm niên', 'Chế độ làm việc theo ca', 'Chế độ lương cố định'], correct: 0 },
      ],
    },
    listening: [
      'We used to have a toxic blame culture here.',
      'This company operates as a true meritocracy.',
      'Giving teams more autonomy boosts motivation.',
      'These events help build camaraderie among staff.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách chuyển đổi từ văn hóa đổ lỗi (blame culture) sang chế độ trọng dụng nhân tài (meritocracy).',
      minWords: 50,
      phrases: ['We are moving away from a blame culture toward', 'A true meritocracy rewards', 'Granting teams more autonomy leads to', 'Building camaraderie helps because'],
      sentenceBuilder: [
        { scrambled: 'The company / (replace) / its blame culture / gradually', answer: 'The company replaced its blame culture gradually' },
        { scrambled: 'Teams / (gain) / more autonomy / this year', answer: 'Teams gained more autonomy this year' },
      ],
    },
  },
  { // Day 17
    vocab: [
      { word: 'Diversity',     phonetic: '/daɪˈvɜːrsəti/',   meaning: 'Sự đa dạng', quiz: { options: ['Sự đa dạng', 'Sự thiên vị vô thức', 'Nhân viên đại diện văn hóa', 'Tinh thần thuộc về'], correct: 0 } },
      { word: 'Unconscious bias', phonetic: '/ʌnˈkɒnʃəs ˈbaɪəs/', meaning: 'Sự thiên vị vô thức', quiz: { options: ['Nhân viên đại diện văn hóa', 'Sự thiên vị vô thức', 'Sự đa dạng', 'Tinh thần thuộc về'], correct: 1 } },
      { word: 'Sense of belonging', phonetic: '/sens əv bɪˈlɒŋɪŋ/', meaning: 'Tinh thần thuộc về (tổ chức)', quiz: { options: ['Sự thiên vị vô thức', 'Nhân viên đại diện văn hóa', 'Tinh thần thuộc về (tổ chức)', 'Sự đa dạng'], correct: 2 } },
      { word: 'Equity',        phonetic: '/ˈekwəti/',        meaning: 'Sự công bằng (đối xử)', quiz: { options: ['Sự công bằng (đối xử)', 'Sự đa dạng', 'Sự thiên vị vô thức', 'Tinh thần thuộc về'], correct: 0 } },
      { word: 'Underrepresented', phonetic: '/ˌʌndərˌreprɪˈzentɪd/', meaning: 'Chưa được đại diện đầy đủ', quiz: { options: ['Sự công bằng', 'Chưa được đại diện đầy đủ', 'Sự đa dạng', 'Tinh thần thuộc về'], correct: 1 } },
    ],
    reading: {
      title: 'Making Diversity More Than a Slogan',
      passage: 'The HR team recognized that simply hiring for diversity was not enough without addressing unconscious bias in promotion decisions. They trained managers to recognize when underrepresented groups were being overlooked for leadership roles. Beyond hiring numbers, the company focused on equity in pay and opportunity, ultimately strengthening every employee\'s sense of belonging within the organization.',
      quiz: [
        { q: 'HR nhận ra điều gì chưa đủ nếu chỉ tuyển dụng vì mục tiêu đa dạng?', options: ['Giải quyết sự thiên vị vô thức trong đề bạt', 'Tăng lương cho tất cả', 'Mở thêm chi nhánh', 'Thay đổi logo công ty'], correct: 0 },
        { q: 'Công ty tập trung vào điều gì ngoài số liệu tuyển dụng?', options: ['Sự công bằng trong lương thưởng và cơ hội', 'Giảm số ngày nghỉ phép', 'Tăng giờ làm thêm', 'Cắt giảm phúc lợi y tế'], correct: 0 },
      ],
    },
    listening: [
      'We need to address unconscious bias in hiring.',
      'This program strengthens every employee\'s sense of belonging.',
      'Equity means fair opportunity for everyone.',
      'Underrepresented groups deserve a seat at the table.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách công ty có thể cải thiện tính đa dạng (diversity) và công bằng (equity) trong tổ chức.',
      minWords: 50,
      phrases: ['To address unconscious bias, we should', 'Diversity without equity is not enough because', 'Underrepresented groups need', 'This builds a stronger sense of belonging'],
      sentenceBuilder: [
        { scrambled: 'Managers / (recognize) / unconscious bias / in training', answer: 'Managers recognized unconscious bias in training' },
        { scrambled: 'The company / (focus) / on equity / this year', answer: 'The company focused on equity this year' },
      ],
    },
  },
  { // Day 18
    vocab: [
      { word: 'Core values',   phonetic: '/kɔːr ˈvæljuːz/',  meaning: 'Giá trị cốt lõi', quiz: { options: ['Giá trị cốt lõi', 'Sự tận tâm', 'Nghi thức công ty', 'Đại sứ văn hóa'], correct: 0 } },
      { word: 'Commitment',    phonetic: '/kəˈmɪtmənt/',     meaning: 'Sự tận tâm, cam kết', quiz: { options: ['Nghi thức công ty', 'Sự tận tâm, cam kết', 'Giá trị cốt lõi', 'Đại sứ văn hóa'], correct: 1 } },
      { word: 'Ritual',        phonetic: '/ˈrɪtʃuəl/',       meaning: 'Nghi thức, truyền thống công ty', quiz: { options: ['Đại sứ văn hóa', 'Sự tận tâm', 'Nghi thức, truyền thống công ty', 'Giá trị cốt lõi'], correct: 2 } },
      { word: 'Culture ambassador', phonetic: '/ˈkʌltʃər æmˈbæsədər/', meaning: 'Đại sứ văn hóa (nội bộ)', quiz: { options: ['Giá trị cốt lõi', 'Nghi thức công ty', 'Sự tận tâm', 'Đại sứ văn hóa (nội bộ)'], correct: 3 } },
      { word: 'Reinforce',     phonetic: '/ˌriːɪnˈfɔːrs/',   meaning: 'Củng cố, tăng cường', quiz: { options: ['Củng cố, tăng cường', 'Giá trị cốt lõi', 'Nghi thức công ty', 'Sự tận tâm'], correct: 0 } },
    ],
    reading: {
      title: 'Keeping Culture Alive Across Offices',
      passage: 'As the company expanded to three new cities, Nga worried that its core values might dilute over time. She appointed culture ambassadors in every office to reinforce daily rituals, like Friday storytelling sessions celebrating employee wins. This consistent commitment to shared values, she argued, was what would keep the culture strong even as the company scaled rapidly.',
      quiz: [
        { q: 'Nga lo ngại điều gì khi công ty mở rộng sang 3 thành phố mới?', options: ['Giá trị cốt lõi có thể bị pha loãng', 'Doanh thu sẽ giảm', 'Nhân viên sẽ đòi tăng lương', 'Văn phòng sẽ quá chật'], correct: 0 },
        { q: 'Nga bổ nhiệm vai trò gì ở mỗi văn phòng?', options: ['Đại sứ văn hóa', 'Trưởng phòng nhân sự mới', 'Giám đốc tài chính khu vực', 'Chuyên viên pháp lý'], correct: 0 },
      ],
    },
    listening: [
      'Our core values guide every decision we make.',
      'She showed real commitment to the team\'s success.',
      'Friday storytelling has become a beloved ritual here.',
      'Culture ambassadors help reinforce our values daily.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách duy trì giá trị cốt lõi (core values) khi công ty mở rộng quy mô nhanh chóng.',
      minWords: 50,
      phrases: ['Our core values must be reinforced by', 'Culture ambassadors can help by', 'This ritual builds commitment because', 'As we scale, we must protect'],
      sentenceBuilder: [
        { scrambled: 'She / (appoint) / culture ambassadors / in every office', answer: 'She appointed culture ambassadors in every office' },
        { scrambled: 'The ritual / (reinforce) / the company\'s / values', answer: 'The ritual reinforces the company\'s values' },
      ],
    },
  },
  { // Day 19 — Chủ đề: Đàm phán quốc tế
    vocab: [
      { word: 'Concede',       phonetic: '/kənˈsiːd/',       meaning: 'Nhượng bộ', quiz: { options: ['Nhượng bộ', 'Đề nghị phản hồi', 'Bế tắc', 'Mặc cả'], correct: 0 } },
      { word: 'Counteroffer',  phonetic: '/ˈkaʊntərɒfər/',   meaning: 'Đề nghị phản hồi (trong đàm phán)', quiz: { options: ['Bế tắc', 'Đề nghị phản hồi (trong đàm phán)', 'Nhượng bộ', 'Mặc cả'], correct: 1 } },
      { word: 'Deadlock',      phonetic: '/ˈdedlɒk/',        meaning: 'Sự bế tắc', quiz: { options: ['Mặc cả', 'Nhượng bộ', 'Sự bế tắc', 'Đề nghị phản hồi'], correct: 2 } },
      { word: 'Bargain',       phonetic: '/ˈbɑːrɡɪn/',       meaning: 'Mặc cả, thỏa thuận', quiz: { options: ['Mặc cả, thỏa thuận', 'Sự bế tắc', 'Nhượng bộ', 'Đề nghị phản hồi'], correct: 0 } },
      { word: 'Ratify',        phonetic: '/ˈrætɪfaɪ/',       meaning: 'Phê chuẩn (hợp đồng, hiệp định)', quiz: { options: ['Đề nghị phản hồi', 'Sự bế tắc', 'Mặc cả', 'Phê chuẩn (hợp đồng, hiệp định)'], correct: 3 } },
    ],
    reading: {
      title: 'Breaking the Deadlock',
      passage: 'After hours of tense discussion, the Vietnamese delegation, led by Kiên, refused to concede on the pricing terms proposed by their overseas partner. When talks reached a deadlock, Kiên presented a creative counteroffer that included flexible payment schedules. Both sides finally struck a hard bargain, and the agreement was ratified by both governments the following month.',
      quiz: [
        { q: 'Đoàn đàm phán Việt Nam từ chối điều gì?', options: ['Nhượng bộ về điều khoản giá cả', 'Ký hợp đồng ngay lập tức', 'Hủy bỏ cuộc họp', 'Tăng gấp đôi đơn hàng'], correct: 0 },
        { q: 'Điều gì xảy ra sau khi hai bên đạt được thỏa thuận?', options: ['Thỏa thuận bị hủy bỏ', 'Thỏa thuận được hai chính phủ phê chuẩn', 'Đối tác rút lui', 'Giá cả tăng gấp ba'], correct: 1 },
      ],
    },
    listening: [
      'We are not willing to concede on this point.',
      'They presented a counteroffer during the meeting.',
      'The talks reached a deadlock yesterday.',
      'The agreement will be ratified next month.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả chiến lược đàm phán khi cuộc thương lượng rơi vào bế tắc (deadlock).',
      minWords: 50,
      phrases: ['We are not willing to concede on', 'Our counteroffer includes', 'To break this deadlock, we propose', 'The agreement was ratified by'],
      sentenceBuilder: [
        { scrambled: 'The delegation / (present) / a creative counteroffer / quickly', answer: 'The delegation presented a creative counteroffer quickly' },
        { scrambled: 'Both governments / (ratify) / the agreement / last month', answer: 'Both governments ratified the agreement last month' },
      ],
    },
  },
  { // Day 20
    vocab: [
      { word: 'Leverage point', phonetic: '/ˈlevərɪdʒ pɔɪnt/', meaning: 'Điểm mấu chốt tạo lợi thế', quiz: { options: ['Điểm mấu chốt tạo lợi thế', 'Nhượng quyền tối thiểu', 'Vùng thỏa thuận có thể chấp nhận', 'Chiến thuật trì hoãn'], correct: 0 } },
      { word: 'Walk-away point', phonetic: '/ˈwɔːk əweɪ pɔɪnt/', meaning: 'Điểm giới hạn để rút lui', quiz: { options: ['Vùng thỏa thuận có thể chấp nhận', 'Điểm giới hạn để rút lui', 'Điểm mấu chốt tạo lợi thế', 'Chiến thuật trì hoãn'], correct: 1 } },
      { word: 'Zone of agreement', phonetic: '/zoʊn əv əˈɡriːmənt/', meaning: 'Vùng thỏa thuận có thể chấp nhận', quiz: { options: ['Chiến thuật trì hoãn', 'Điểm giới hạn', 'Vùng thỏa thuận có thể chấp nhận', 'Điểm mấu chốt'], correct: 2 } },
      { word: 'Stalling tactic', phonetic: '/ˈstɔːlɪŋ ˈtæktɪk/', meaning: 'Chiến thuật trì hoãn', quiz: { options: ['Điểm mấu chốt', 'Vùng thỏa thuận', 'Điểm giới hạn', 'Chiến thuật trì hoãn'], correct: 3 } },
      { word: 'Good faith',    phonetic: '/ɡʊd feɪθ/',        meaning: 'Thiện chí', quiz: { options: ['Thiện chí', 'Chiến thuật trì hoãn', 'Điểm mấu chốt', 'Vùng thỏa thuận'], correct: 0 } },
    ],
    reading: {
      title: 'Reading the Room in Cross-Border Talks',
      passage: 'Before entering the negotiation room, Trâm identified her walk-away point and mapped out a likely zone of agreement with the foreign supplier. She noticed the other side using a stalling tactic, delaying key decisions to extract more concessions. Still, Trâm insisted the discussion continue in good faith, eventually finding a leverage point around exclusive distribution rights.',
      quiz: [
        { q: 'Trâm xác định điều gì trước khi bước vào phòng đàm phán?', options: ['Điểm giới hạn để rút lui và vùng thỏa thuận có thể chấp nhận', 'Giá vé máy bay', 'Địa điểm ăn trưa', 'Số lượng người tham dự'], correct: 0 },
        { q: 'Trâm nhận ra đối tác đang sử dụng chiến thuật gì?', options: ['Chiến thuật trì hoãn', 'Chiến thuật giảm giá ngay', 'Chiến thuật rút lui hoàn toàn', 'Chiến thuật ký hợp đồng nhanh'], correct: 0 },
      ],
    },
    listening: [
      'Know your walk-away point before you negotiate.',
      'We need to find the zone of agreement here.',
      'They used a stalling tactic to buy more time.',
      'Let\'s continue this discussion in good faith.',
    ],
    writing: {
      prompt: 'Viết đoạn văn hướng dẫn cách chuẩn bị trước một cuộc đàm phán quốc tế quan trọng.',
      minWords: 50,
      phrases: ['Before negotiating, identify your walk-away point', 'We must find a zone of agreement', 'They are using a stalling tactic', 'Let\'s proceed in good faith'],
      sentenceBuilder: [
        { scrambled: 'She / (identify) / her walk-away point / early', answer: 'She identified her walk-away point early' },
        { scrambled: 'They / (continue) / the talks / in good faith', answer: 'They continued the talks in good faith' },
      ],
    },
  },
  { // Day 21
    vocab: [
      { word: 'Arbitration',   phonetic: '/ˌɑːrbɪˈtreɪʃn/',  meaning: 'Trọng tài (giải quyết tranh chấp)', quiz: { options: ['Trọng tài (giải quyết tranh chấp)', 'Điều khoản ràng buộc', 'Sự nhượng bộ lẫn nhau', 'Bên trung gian'], correct: 0 } },
      { word: 'Binding clause', phonetic: '/ˈbaɪndɪŋ klɔːz/', meaning: 'Điều khoản ràng buộc pháp lý', quiz: { options: ['Bên trung gian', 'Điều khoản ràng buộc pháp lý', 'Trọng tài', 'Sự nhượng bộ lẫn nhau'], correct: 1 } },
      { word: 'Mutual concession', phonetic: '/ˈmjuːtʃuəl kənˈseʃn/', meaning: 'Sự nhượng bộ lẫn nhau', quiz: { options: ['Điều khoản ràng buộc', 'Bên trung gian', 'Sự nhượng bộ lẫn nhau', 'Trọng tài'], correct: 2 } },
      { word: 'Mediator',      phonetic: '/ˈmiːdieɪtər/',    meaning: 'Bên trung gian hòa giải', quiz: { options: ['Sự nhượng bộ lẫn nhau', 'Trọng tài', 'Điều khoản ràng buộc', 'Bên trung gian hòa giải'], correct: 3 } },
      { word: 'Impasse',       phonetic: '/ˈɪmpæs/',         meaning: 'Sự bế tắc hoàn toàn', quiz: { options: ['Trọng tài', 'Sự bế tắc hoàn toàn', 'Điều khoản ràng buộc', 'Bên trung gian'], correct: 1 } },
    ],
    reading: {
      title: 'When Talks Reach an Impasse',
      passage: 'When negotiations between the two companies reached a complete impasse, an independent mediator was brought in to help both sides find common ground. The contract eventually included a binding clause requiring international arbitration for any future disputes. Only through genuine mutual concession on delivery timelines were the parties able to move forward and finalize the deal.',
      quiz: [
        { q: 'Điều gì xảy ra khi đàm phán rơi vào bế tắc hoàn toàn?', options: ['Một bên trung gian hòa giải được mời vào', 'Hợp đồng bị hủy ngay', 'Cả hai bên kiện ra tòa', 'Công ty phá sản'], correct: 0 },
        { q: 'Hợp đồng cuối cùng bao gồm điều khoản gì?', options: ['Điều khoản ràng buộc yêu cầu trọng tài quốc tế', 'Điều khoản miễn trách nhiệm hoàn toàn', 'Điều khoản tăng giá tự động', 'Điều khoản không có thời hạn'], correct: 0 },
      ],
    },
    listening: [
      'The talks reached a complete impasse yesterday.',
      'A mediator was brought in to help resolve the dispute.',
      'The contract includes a binding arbitration clause.',
      'Mutual concession was necessary to close the deal.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách giải quyết khi một cuộc đàm phán rơi vào bế tắc hoàn toàn (impasse).',
      minWords: 50,
      phrases: ['When talks reach an impasse, we should', 'A mediator can help by', 'The contract should include a binding clause for', 'Mutual concession is necessary because'],
      sentenceBuilder: [
        { scrambled: 'An independent mediator / (help) / resolve the dispute / eventually', answer: 'An independent mediator helped resolve the dispute eventually' },
        { scrambled: 'The contract / (include) / a binding clause / for disputes', answer: 'The contract included a binding clause for disputes' },
      ],
    },
  },
  { // Day 22
    vocab: [
      { word: 'Cultural nuance', phonetic: '/ˈkʌltʃərəl ˈnjuːɑːns/', meaning: 'Sắc thái văn hóa tinh tế', quiz: { options: ['Sắc thái văn hóa tinh tế', 'Đề nghị mở đầu', 'Phái đoàn', 'Giai đoạn cuối cùng'], correct: 0 } },
      { word: 'Opening bid',   phonetic: '/ˈoʊpənɪŋ bɪd/',   meaning: 'Đề nghị mở đầu (đàm phán)', quiz: { options: ['Phái đoàn', 'Đề nghị mở đầu (đàm phán)', 'Sắc thái văn hóa', 'Giai đoạn cuối cùng'], correct: 1 } },
      { word: 'Delegation',    phonetic: '/ˌdelɪˈɡeɪʃn/',    meaning: 'Phái đoàn đại diện', quiz: { options: ['Giai đoạn cuối cùng', 'Đề nghị mở đầu', 'Phái đoàn đại diện', 'Sắc thái văn hóa'], correct: 2 } },
      { word: 'Final stretch', phonetic: '/ˈfaɪnl stretʃ/', meaning: 'Giai đoạn cuối cùng (đàm phán)', quiz: { options: ['Sắc thái văn hóa', 'Phái đoàn', 'Đề nghị mở đầu', 'Giai đoạn cuối cùng (đàm phán)'], correct: 3 } },
      { word: 'Interpreter',   phonetic: '/ɪnˈtɜːrprɪtər/', meaning: 'Người phiên dịch', quiz: { options: ['Người phiên dịch', 'Giai đoạn cuối cùng', 'Phái đoàn', 'Đề nghị mở đầu'], correct: 0 } },
    ],
    reading: {
      title: 'Reading Cultural Nuance in Global Deals',
      passage: 'Before meeting the Japanese delegation, Bình studied the cultural nuance of indirect communication to avoid misunderstandings during the talks. Their opening bid was deliberately conservative, a common tactic to leave room for gradual movement. With a skilled interpreter by his side, Bình navigated the final stretch of negotiations smoothly, securing a partnership both sides considered fair.',
      quiz: [
        { q: 'Bình đã chuẩn bị điều gì trước khi gặp phái đoàn Nhật Bản?', options: ['Nghiên cứu sắc thái văn hóa về giao tiếp gián tiếp', 'Học tiếng Nhật trong một ngày', 'Mua quà đắt tiền', 'Thay đổi lịch trình chuyến bay'], correct: 0 },
        { q: 'Ai đã giúp Bình vượt qua giai đoạn cuối của đàm phán?', options: ['Một người phiên dịch giỏi', 'Luật sư riêng', 'Trợ lý cá nhân', 'Đối thủ cạnh tranh'], correct: 0 },
      ],
    },
    listening: [
      'Understanding cultural nuance can prevent misunderstandings.',
      'Their opening bid was surprisingly conservative.',
      'The delegation arrived a day early for preparation.',
      'We are entering the final stretch of negotiations.',
    ],
    writing: {
      prompt: 'Viết đoạn văn về tầm quan trọng của việc hiểu sắc thái văn hóa (cultural nuance) khi đàm phán với đối tác nước ngoài.',
      minWords: 50,
      phrases: ['Understanding cultural nuance helps us', 'Their opening bid suggested', 'The delegation was impressed by', 'In the final stretch, we should'],
      sentenceBuilder: [
        { scrambled: 'Bình / (study) / cultural nuance / carefully', answer: 'Bình studied cultural nuance carefully' },
        { scrambled: 'The interpreter / (help) / navigate the negotiation / smoothly', answer: 'The interpreter helped navigate the negotiation smoothly' },
      ],
    },
  },
  { // Day 23
    vocab: [
      { word: 'Term sheet',    phonetic: '/tɜːrm ʃiːt/',      meaning: 'Bản tóm tắt điều khoản thỏa thuận', quiz: { options: ['Bản tóm tắt điều khoản thỏa thuận', 'Không ràng buộc pháp lý', 'Bên thứ ba trung lập', 'Đề nghị cuối cùng'], correct: 0 } },
      { word: 'Non-binding',   phonetic: '/nɒn ˈbaɪndɪŋ/',   meaning: 'Không có tính ràng buộc pháp lý', quiz: { options: ['Bên thứ ba trung lập', 'Không có tính ràng buộc pháp lý', 'Bản tóm tắt điều khoản', 'Đề nghị cuối cùng'], correct: 1 } },
      { word: 'Neutral party', phonetic: '/ˈnuːtrəl ˈpɑːrti/', meaning: 'Bên thứ ba trung lập', quiz: { options: ['Đề nghị cuối cùng', 'Không ràng buộc', 'Bên thứ ba trung lập', 'Bản tóm tắt điều khoản'], correct: 2 } },
      { word: 'Final offer',   phonetic: '/ˈfaɪnl ˈɒfər/',   meaning: 'Đề nghị cuối cùng', quiz: { options: ['Bản tóm tắt điều khoản', 'Bên thứ ba trung lập', 'Không ràng buộc', 'Đề nghị cuối cùng'], correct: 3 } },
      { word: 'Concession',    phonetic: '/kənˈseʃn/',       meaning: 'Sự nhượng bộ', quiz: { options: ['Sự nhượng bộ', 'Đề nghị cuối cùng', 'Bên thứ ba trung lập', 'Bản tóm tắt điều khoản'], correct: 0 } },
    ],
    reading: {
      title: 'From Term Sheet to Final Offer',
      passage: 'The two companies signed a non-binding term sheet outlining the general structure of the joint venture. When disagreements arose over intellectual property rights, they brought in a neutral party to facilitate discussions. After several rounds of small concessions on both sides, the buyer presented a final offer that both parties ultimately accepted.',
      quiz: [
        { q: 'Hai công ty đã ký loại tài liệu nào trước?', options: ['Bản tóm tắt điều khoản không ràng buộc', 'Hợp đồng chính thức cuối cùng', 'Đơn xin phá sản', 'Báo cáo tài chính'], correct: 0 },
        { q: 'Ai được mời vào để hỗ trợ thảo luận khi có bất đồng?', options: ['Một bên thứ ba trung lập', 'Cổ đông lớn nhất', 'Chính phủ', 'Đối thủ cạnh tranh'], correct: 0 },
      ],
    },
    listening: [
      'We signed a non-binding term sheet last week.',
      'A neutral party helped facilitate the discussion.',
      'They finally presented their final offer.',
      'Small concessions on both sides moved the deal forward.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả quy trình từ bản tóm tắt điều khoản (term sheet) đến đề nghị cuối cùng (final offer) trong một thương vụ.',
      minWords: 50,
      phrases: ['We signed a non-binding term sheet that', 'A neutral party helped by', 'Our final offer includes', 'Small concessions allowed us to'],
      sentenceBuilder: [
        { scrambled: 'The companies / (sign) / a non-binding term sheet / first', answer: 'The companies signed a non-binding term sheet first' },
        { scrambled: 'The buyer / (present) / a final offer / eventually', answer: 'The buyer presented a final offer eventually' },
      ],
    },
  },
  { // Day 24 — Chủ đề: Chiến lược thương hiệu
    vocab: [
      { word: 'Positioning',   phonetic: '/pəˈzɪʃənɪŋ/',     meaning: 'Định vị thương hiệu', quiz: { options: ['Định vị thương hiệu', 'Tái định vị thương hiệu', 'Giá trị thương hiệu', 'Nhận thức của khách hàng'], correct: 0 } },
      { word: 'Rebrand',       phonetic: '/ˌriːˈbrænd/',     meaning: 'Tái định vị thương hiệu, đổi thương hiệu', quiz: { options: ['Giá trị thương hiệu', 'Nhận thức của khách hàng', 'Tái định vị thương hiệu, đổi thương hiệu', 'Định vị thương hiệu'], correct: 2 } },
      { word: 'Brand equity',  phonetic: '/brænd ˈekwəti/',  meaning: 'Giá trị thương hiệu', quiz: { options: ['Giá trị thương hiệu', 'Định vị thương hiệu', 'Nhận thức của khách hàng', 'Tái định vị thương hiệu'], correct: 0 } },
      { word: 'Perception',    phonetic: '/pərˈsepʃn/',      meaning: 'Nhận thức, cảm nhận (của khách hàng)', quiz: { options: ['Tái định vị thương hiệu', 'Giá trị thương hiệu', 'Nhận thức, cảm nhận (của khách hàng)', 'Định vị thương hiệu'], correct: 2 } },
      { word: 'Loyalty',       phonetic: '/ˈlɔɪəlti/',       meaning: 'Sự trung thành (của khách hàng)', quiz: { options: ['Sự trung thành (của khách hàng)', 'Nhận thức', 'Giá trị thương hiệu', 'Tái định vị thương hiệu'], correct: 0 } },
    ],
    reading: {
      title: 'Reviving a Brand for a New Generation',
      passage: 'After years of declining sales, the marketing director decided to rebrand the entire product line to reflect a fresher, more youthful positioning. Consumer surveys showed the brand equity had eroded, with younger shoppers perceiving the company as outdated. By updating its visual identity and messaging, the company aimed to shift this perception and rebuild long-term customer loyalty.',
      quiz: [
        { q: 'Giám đốc marketing quyết định làm gì sau nhiều năm doanh số giảm?', options: ['Tái định vị toàn bộ dòng sản phẩm', 'Đóng cửa công ty', 'Sa thải toàn bộ đội ngũ', 'Giảm giá 90%'], correct: 0 },
        { q: 'Khảo sát người tiêu dùng cho thấy điều gì?', options: ['Giá trị thương hiệu đã suy giảm', 'Doanh thu tăng vọt', 'Khách hàng hài lòng tuyệt đối', 'Sản phẩm bán hết veo'], correct: 0 },
      ],
    },
    listening: [
      'We decided to rebrand the entire product line.',
      'Our brand equity has weakened over the years.',
      'Customer perception of the brand is changing.',
      'This campaign aims to build long-term loyalty.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất chiến lược tái định vị thương hiệu (rebrand) cho một công ty đang mất dần khách hàng trẻ.',
      minWords: 50,
      phrases: ['We propose to rebrand by', 'Our brand equity has been affected because', 'Customer perception can shift if', 'To build lasting loyalty, we should'],
      sentenceBuilder: [
        { scrambled: 'The company / (rebrand) / its product line / last year', answer: 'The company rebranded its product line last year' },
        { scrambled: 'Customer perception / (shift) / gradually / over time', answer: 'Customer perception shifted gradually over time' },
      ],
    },
  },
  { // Day 25
    vocab: [
      { word: 'Differentiator', phonetic: '/ˌdɪfəˈrenʃieɪtər/', meaning: 'Yếu tố tạo khác biệt', quiz: { options: ['Yếu tố tạo khác biệt', 'Câu chuyện thương hiệu', 'Đối tượng mục tiêu', 'Điểm chạm khách hàng'], correct: 0 } },
      { word: 'Brand narrative', phonetic: '/brænd ˈnærətɪv/', meaning: 'Câu chuyện thương hiệu', quiz: { options: ['Đối tượng mục tiêu', 'Câu chuyện thương hiệu', 'Yếu tố tạo khác biệt', 'Điểm chạm khách hàng'], correct: 1 } },
      { word: 'Target demographic', phonetic: '/ˈtɑːrɡɪt ˌdeməˈɡræfɪk/', meaning: 'Đối tượng nhân khẩu học mục tiêu', quiz: { options: ['Điểm chạm khách hàng', 'Yếu tố tạo khác biệt', 'Đối tượng nhân khẩu học mục tiêu', 'Câu chuyện thương hiệu'], correct: 2 } },
      { word: 'Touchpoint',   phonetic: '/ˈtʌtʃpɔɪnt/',     meaning: 'Điểm chạm khách hàng', quiz: { options: ['Câu chuyện thương hiệu', 'Đối tượng mục tiêu', 'Yếu tố tạo khác biệt', 'Điểm chạm khách hàng'], correct: 3 } },
      { word: 'Resonate',      phonetic: '/ˈrezəneɪt/',     meaning: 'Gây được tiếng vang, tạo sự đồng cảm', quiz: { options: ['Gây được tiếng vang, tạo sự đồng cảm', 'Điểm chạm khách hàng', 'Câu chuyện thương hiệu', 'Đối tượng mục tiêu'], correct: 0 } },
    ],
    reading: {
      title: 'Crafting a Brand Narrative That Resonates',
      passage: 'The agency helped the client identify a clear differentiator: unlike competitors, their coffee was sourced directly from small Vietnamese farms. This became the heart of a compelling brand narrative that resonated deeply with their target demographic of urban young professionals. Every touchpoint, from packaging to social media, was redesigned to reinforce this authentic story.',
      quiz: [
        { q: 'Yếu tố khác biệt của khách hàng này là gì?', options: ['Cà phê được lấy trực tiếp từ các nông trại nhỏ Việt Nam', 'Giá rẻ nhất thị trường', 'Đóng gói bằng nhựa tái chế', 'Giao hàng trong 10 phút'], correct: 0 },
        { q: 'Câu chuyện thương hiệu đã gây được tiếng vang với đối tượng nào?', options: ['Người cao tuổi ở nông thôn', 'Chuyên gia trẻ ở đô thị', 'Khách du lịch nước ngoài', 'Học sinh cấp 2'], correct: 1 },
      ],
    },
    listening: [
      'We found a clear differentiator for this brand.',
      'This brand narrative resonates with young professionals.',
      'Our target demographic is urban millennials.',
      'Every touchpoint should reinforce our story.',
    ],
    writing: {
      prompt: 'Viết đoạn văn xây dựng một câu chuyện thương hiệu (brand narrative) hấp dẫn cho một sản phẩm Việt Nam.',
      minWords: 50,
      phrases: ['Our key differentiator is', 'This brand narrative resonates with', 'Our target demographic includes', 'Every touchpoint should reflect'],
      sentenceBuilder: [
        { scrambled: 'The story / (resonate) / with young professionals / strongly', answer: 'The story resonated with young professionals strongly' },
        { scrambled: 'The agency / (redesign) / every touchpoint / carefully', answer: 'The agency redesigned every touchpoint carefully' },
      ],
    },
  },
  { // Day 26
    vocab: [
      { word: 'Brand ambassador', phonetic: '/brænd æmˈbæsədər/', meaning: 'Đại sứ thương hiệu', quiz: { options: ['Đại sứ thương hiệu', 'Sự trung thực trong quảng cáo', 'Lời hứa thương hiệu', 'Chiến dịch lan truyền'], correct: 0 } },
      { word: 'Brand promise', phonetic: '/brænd ˈprɒmɪs/',  meaning: 'Lời hứa thương hiệu', quiz: { options: ['Chiến dịch lan truyền', 'Lời hứa thương hiệu', 'Đại sứ thương hiệu', 'Sự trung thực trong quảng cáo'], correct: 1 } },
      { word: 'Authenticity',  phonetic: '/ˌɔːθenˈtɪsəti/',  meaning: 'Sự trung thực, tính chân thực', quiz: { options: ['Lời hứa thương hiệu', 'Đại sứ thương hiệu', 'Sự trung thực, tính chân thực', 'Chiến dịch lan truyền'], correct: 2 } },
      { word: 'Viral campaign', phonetic: '/ˈvaɪrəl kæmˈpeɪn/', meaning: 'Chiến dịch lan truyền', quiz: { options: ['Sự trung thực', 'Đại sứ thương hiệu', 'Lời hứa thương hiệu', 'Chiến dịch lan truyền'], correct: 3 } },
      { word: 'Endorsement',   phonetic: '/ɪnˈdɔːrsmənt/',   meaning: 'Sự chứng thực, bảo trợ', quiz: { options: ['Sự chứng thực, bảo trợ', 'Chiến dịch lan truyền', 'Sự trung thực', 'Lời hứa thương hiệu'], correct: 0 } },
    ],
    reading: {
      title: 'The Risk of Choosing the Wrong Ambassador',
      passage: 'When the company signed a famous singer as its brand ambassador, sales spiked overnight thanks to a viral campaign across social media. However, the marketing team learned a hard lesson about authenticity: the celebrity endorsement felt hollow because it contradicted the brand promise of sustainability. Duy, the CMO, later insisted future ambassadors must genuinely embody the values they represent.',
      quiz: [
        { q: 'Điều gì xảy ra sau khi công ty ký hợp đồng với ca sĩ nổi tiếng làm đại sứ?', options: ['Doanh số tăng vọt nhờ chiến dịch lan truyền', 'Công ty phá sản', 'Cổ phiếu giảm mạnh', 'Sản phẩm bị thu hồi'], correct: 0 },
        { q: 'Vấn đề với sự chứng thực của người nổi tiếng này là gì?', options: ['Nó mâu thuẫn với lời hứa thương hiệu về sự bền vững', 'Người đó đòi hỏi quá nhiều tiền', 'Người đó từ chối hợp tác', 'Không ai biết đến người đó'], correct: 0 },
      ],
    },
    listening: [
      'The brand ambassador helped boost our visibility.',
      'Our brand promise centers on sustainability.',
      'Consumers value authenticity over flashy marketing.',
      'The viral campaign exceeded all our expectations.',
    ],
    writing: {
      prompt: 'Viết đoạn văn phân tích rủi ro khi chọn sai đại sứ thương hiệu (brand ambassador) không phù hợp với giá trị công ty.',
      minWords: 50,
      phrases: ['Choosing the right brand ambassador requires', 'Our brand promise is centered on', 'Authenticity matters because', 'A viral campaign can backfire if'],
      sentenceBuilder: [
        { scrambled: 'The singer / (become) / the brand ambassador / last year', answer: 'The singer became the brand ambassador last year' },
        { scrambled: 'The endorsement / (contradict) / the brand promise / unfortunately', answer: 'The endorsement contradicted the brand promise unfortunately' },
      ],
    },
  },
  { // Day 27
    vocab: [
      { word: 'Market share',  phonetic: '/ˈmɑːrkɪt ʃeər/',  meaning: 'Thị phần', quiz: { options: ['Thị phần', 'Chiến lược định giá cao cấp', 'Sự trung thành thương hiệu', 'Chiến lược thâm nhập thị trường'], correct: 0 } },
      { word: 'Premium pricing', phonetic: '/ˈpriːmiəm ˈpraɪsɪŋ/', meaning: 'Chiến lược định giá cao cấp', quiz: { options: ['Chiến lược thâm nhập thị trường', 'Chiến lược định giá cao cấp', 'Thị phần', 'Sự trung thành thương hiệu'], correct: 1 } },
      { word: 'Brand loyalty', phonetic: '/brænd ˈlɔɪəlti/', meaning: 'Sự trung thành với thương hiệu', quiz: { options: ['Chiến lược định giá cao cấp', 'Thị phần', 'Sự trung thành với thương hiệu', 'Chiến lược thâm nhập thị trường'], correct: 2 } },
      { word: 'Market penetration', phonetic: '/ˈmɑːrkɪt ˌpenɪˈtreɪʃn/', meaning: 'Chiến lược thâm nhập thị trường', quiz: { options: ['Thị phần', 'Sự trung thành thương hiệu', 'Chiến lược định giá cao cấp', 'Chiến lược thâm nhập thị trường'], correct: 3 } },
      { word: 'Niche',         phonetic: '/niːʃ/',           meaning: 'Thị trường ngách', quiz: { options: ['Thị trường ngách', 'Thị phần', 'Chiến lược định giá cao cấp', 'Sự trung thành thương hiệu'], correct: 0 } },
    ],
    reading: {
      title: 'Choosing Between Growth and Premium Positioning',
      passage: 'The board debated whether to pursue aggressive market penetration by cutting prices or maintain premium pricing to protect the brand\'s exclusive image. Long argued that chasing market share too quickly could damage the hard-won brand loyalty built over a decade. Instead, he proposed focusing on a profitable niche of high-income professionals willing to pay more for quality.',
      quiz: [
        { q: 'Hội đồng quản trị tranh luận về điều gì?', options: ['Thâm nhập thị trường bằng giá rẻ hay giữ định giá cao cấp', 'Sa thải nhân viên hay không', 'Chuyển văn phòng hay không', 'Đổi tên công ty hay không'], correct: 0 },
        { q: 'Long lo ngại điều gì nếu chạy theo thị phần quá nhanh?', options: ['Làm tổn hại đến sự trung thành thương hiệu đã xây dựng', 'Công ty sẽ phá sản ngay', 'Nhân viên sẽ đình công', 'Giá cổ phiếu sẽ tăng gấp đôi'], correct: 0 },
      ],
    },
    listening: [
      'We are debating premium pricing versus market penetration.',
      'Market share alone doesn\'t guarantee long-term success.',
      'Brand loyalty took a decade to build.',
      'This niche market is small but highly profitable.',
    ],
    writing: {
      prompt: 'Viết đoạn văn so sánh chiến lược thâm nhập thị trường (market penetration) với chiến lược định giá cao cấp (premium pricing).',
      minWords: 50,
      phrases: ['Market penetration focuses on', 'Premium pricing helps protect', 'Brand loyalty is built through', 'This niche market offers'],
      sentenceBuilder: [
        { scrambled: 'The board / (debate) / the pricing strategy / for hours', answer: 'The board debated the pricing strategy for hours' },
        { scrambled: 'Long / (propose) / focusing on / a niche market', answer: 'Long proposed focusing on a niche market' },
      ],
    },
  },
  { // Day 28
    vocab: [
      { word: 'Word of mouth', phonetic: '/wɜːrd əv maʊθ/',  meaning: 'Truyền miệng', quiz: { options: ['Truyền miệng', 'Nhận diện thương hiệu', 'Định vị cạnh tranh', 'Tài sản vô hình'], correct: 0 } },
      { word: 'Brand recognition', phonetic: '/brænd ˌrekəɡˈnɪʃn/', meaning: 'Nhận diện thương hiệu', quiz: { options: ['Định vị cạnh tranh', 'Nhận diện thương hiệu', 'Truyền miệng', 'Tài sản vô hình'], correct: 1 } },
      { word: 'Competitive positioning', phonetic: '/kəmˈpetɪtɪv pəˈzɪʃənɪŋ/', meaning: 'Định vị cạnh tranh', quiz: { options: ['Tài sản vô hình', 'Truyền miệng', 'Nhận diện thương hiệu', 'Định vị cạnh tranh'], correct: 3 } },
      { word: 'Intangible asset', phonetic: '/ɪnˈtændʒəbl ˈæset/', meaning: 'Tài sản vô hình', quiz: { options: ['Tài sản vô hình', 'Định vị cạnh tranh', 'Truyền miệng', 'Nhận diện thương hiệu'], correct: 0 } },
      { word: 'Reputation',    phonetic: '/ˌrepjuˈteɪʃn/',   meaning: 'Danh tiếng', quiz: { options: ['Nhận diện thương hiệu', 'Tài sản vô hình', 'Danh tiếng', 'Định vị cạnh tranh'], correct: 2 } },
    ],
    reading: {
      title: 'The Hidden Value of Reputation',
      passage: 'Financial analysts often undervalue reputation as an intangible asset, yet it directly drives brand recognition and word of mouth among customers. Phương\'s startup gained significant traction not through expensive advertising, but through strong competitive positioning and satisfied customers recommending the product to friends. She now considers reputation the single most valuable asset on her company\'s books, even if accountants disagree.',
      quiz: [
        { q: 'Các nhà phân tích tài chính thường đánh giá thấp điều gì?', options: ['Danh tiếng như một tài sản vô hình', 'Doanh thu hàng tháng', 'Số lượng nhân viên', 'Giá thuê văn phòng'], correct: 0 },
        { q: 'Startup của Phương phát triển nhờ đâu?', options: ['Định vị cạnh tranh mạnh và truyền miệng tích cực', 'Quảng cáo đắt tiền', 'Vay vốn ngân hàng lớn', 'Mua lại đối thủ'], correct: 0 },
      ],
    },
    listening: [
      'Reputation is often an undervalued intangible asset.',
      'Strong word of mouth drove most of our growth.',
      'Brand recognition took years to establish.',
      'Our competitive positioning sets us apart.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích tại sao danh tiếng (reputation) là một tài sản vô hình (intangible asset) quan trọng của doanh nghiệp.',
      minWords: 50,
      phrases: ['Reputation is a valuable intangible asset because', 'Word of mouth helped us grow by', 'Brand recognition allows us to', 'Our competitive positioning relies on'],
      sentenceBuilder: [
        { scrambled: 'The startup / (gain) / traction / through word of mouth', answer: 'The startup gained traction through word of mouth' },
        { scrambled: 'Reputation / (become) / the company\'s / most valuable asset', answer: 'Reputation became the company\'s most valuable asset' },
      ],
    },
  },
  { // Day 29 — Chủ đề: Chuyển đổi tổ chức
    vocab: [
      { word: 'Restructure',   phonetic: '/ˌriːˈstrʌktʃər/', meaning: 'Tái cơ cấu', quiz: { options: ['Tái cơ cấu', 'Tinh gọn quy trình', 'Đại tu toàn diện', 'Thu hẹp quy mô'], correct: 0 } },
      { word: 'Streamline',    phonetic: '/ˈstriːmlaɪn/',    meaning: 'Tinh gọn, hợp lý hóa quy trình', quiz: { options: ['Đại tu toàn diện', 'Tinh gọn, hợp lý hóa quy trình', 'Tái cơ cấu', 'Thu hẹp quy mô'], correct: 1 } },
      { word: 'Overhaul',      phonetic: '/ˈoʊvərhɔːl/',    meaning: 'Đại tu, cải tổ toàn diện', quiz: { options: ['Thu hẹp quy mô', 'Tái cơ cấu', 'Đại tu, cải tổ toàn diện', 'Tinh gọn quy trình'], correct: 2 } },
      { word: 'Downsize',      phonetic: '/ˈdaʊnsaɪz/',     meaning: 'Thu hẹp quy mô, cắt giảm nhân sự', quiz: { options: ['Tinh gọn quy trình', 'Đại tu toàn diện', 'Tái cơ cấu', 'Thu hẹp quy mô, cắt giảm nhân sự'], correct: 3 } },
      { word: 'Realign',       phonetic: '/ˌriːəˈlaɪn/',    meaning: 'Tái định hướng, sắp xếp lại', quiz: { options: ['Tái định hướng, sắp xếp lại', 'Thu hẹp quy mô', 'Đại tu toàn diện', 'Tái cơ cấu'], correct: 0 } },
    ],
    reading: {
      title: 'A Painful but Necessary Overhaul',
      passage: 'Facing three consecutive quarters of losses, the executive board decided to restructure the entire organization from the ground up. The new CEO, Khánh, promised to streamline approval processes that had frustrated employees for years, cutting decision times from weeks to days. While the company had to downsize its regional offices, Khánh worked hard to realign remaining teams around a clearer, more focused mission.',
      quiz: [
        { q: 'Vì sao hội đồng điều hành quyết định tái cơ cấu công ty?', options: ['Sau ba quý lỗ liên tiếp', 'Vì muốn mở rộng thêm', 'Vì đối thủ yêu cầu', 'Vì luật pháp bắt buộc'], correct: 0 },
        { q: 'Khánh đã hứa làm gì với quy trình phê duyệt?', options: ['Tinh gọn, rút ngắn từ vài tuần xuống vài ngày', 'Kéo dài thêm để kiểm soát chặt hơn', 'Bỏ hoàn toàn quy trình phê duyệt', 'Chuyển toàn bộ ra nước ngoài'], correct: 0 },
      ],
    },
    listening: [
      'The company decided to restructure its operations.',
      'We need to streamline this approval process.',
      'They plan a full overhaul of the supply chain.',
      'The firm had to downsize several regional offices.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất kế hoạch tái cơ cấu (restructure) một công ty đang gặp khó khăn tài chính.',
      minWords: 50,
      phrases: ['We propose to restructure the company by', 'This will streamline our processes', 'An overhaul of the system is needed because', 'To realign our teams, we should'],
      sentenceBuilder: [
        { scrambled: 'The CEO / (streamline) / the approval process / successfully', answer: 'The CEO streamlined the approval process successfully' },
        { scrambled: 'The company / (realign) / its teams / around a clear mission', answer: 'The company realigned its teams around a clear mission' },
      ],
    },
  },
  { // Day 30
    vocab: [
      { word: 'Flatten the hierarchy', phonetic: '/ˈflætn ðə ˈhaɪərɑːrki/', meaning: 'Giảm bớt cấp bậc quản lý', quiz: { options: ['Giảm bớt cấp bậc quản lý', 'Chuyển đổi mô hình vận hành', 'Cấu trúc báo cáo', 'Ma trận chức năng'], correct: 0 } },
      { word: 'Operating model', phonetic: '/ˈɒpəreɪtɪŋ ˈmɒdl/', meaning: 'Mô hình vận hành', quiz: { options: ['Cấu trúc báo cáo', 'Ma trận chức năng', 'Mô hình vận hành', 'Giảm bớt cấp bậc quản lý'], correct: 2 } },
      { word: 'Reporting line', phonetic: '/rɪˈpɔːrtɪŋ laɪn/', meaning: 'Cấu trúc báo cáo (quản lý)', quiz: { options: ['Cấu trúc báo cáo (quản lý)', 'Mô hình vận hành', 'Ma trận chức năng', 'Giảm bớt cấp bậc'], correct: 0 } },
      { word: 'Matrix structure', phonetic: '/ˈmeɪtrɪks ˈstrʌktʃər/', meaning: 'Cấu trúc ma trận (tổ chức)', quiz: { options: ['Giảm bớt cấp bậc', 'Cấu trúc báo cáo', 'Mô hình vận hành', 'Cấu trúc ma trận (tổ chức)'], correct: 3 } },
      { word: 'Silo',          phonetic: '/ˈsaɪloʊ/',        meaning: 'Sự cô lập giữa các phòng ban', quiz: { options: ['Sự cô lập giữa các phòng ban', 'Cấu trúc ma trận', 'Mô hình vận hành', 'Cấu trúc báo cáo'], correct: 0 } },
    ],
    reading: {
      title: 'Breaking Down Organizational Silos',
      passage: 'To eliminate the silos that had formed between departments, the company adopted a matrix structure allowing employees to report to both a functional and a project manager. This meant redefining every reporting line and, in many cases, flattening the hierarchy to speed up decisions. The new operating model was challenging at first, but it ultimately improved collaboration across the business.',
      quiz: [
        { q: 'Công ty áp dụng cấu trúc nào để xóa bỏ sự cô lập giữa các phòng ban?', options: ['Cấu trúc ma trận', 'Cấu trúc phân cấp cứng nhắc', 'Cấu trúc gia đình trị', 'Cấu trúc một người quyết định'], correct: 0 },
        { q: 'Việc gì đã được thực hiện để đẩy nhanh việc ra quyết định?', options: ['Giảm bớt cấp bậc quản lý', 'Tăng thêm cấp quản lý', 'Thuê thêm giám đốc', 'Loại bỏ tất cả các cuộc họp'], correct: 0 },
      ],
    },
    listening: [
      'These silos are slowing down our decision-making.',
      'We adopted a matrix structure last year.',
      'Every reporting line needed to be redefined.',
      'Flattening the hierarchy sped up our approvals.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách phá bỏ sự cô lập giữa các phòng ban (silos) trong tổ chức.',
      minWords: 50,
      phrases: ['These silos prevent collaboration because', 'A matrix structure would allow', 'We need to redefine our reporting lines', 'Flattening the hierarchy could help by'],
      sentenceBuilder: [
        { scrambled: 'The company / (adopt) / a matrix structure / last year', answer: 'The company adopted a matrix structure last year' },
        { scrambled: 'Flattening the hierarchy / (speed up) / decision-making / significantly', answer: 'Flattening the hierarchy sped up decision-making significantly' },
      ],
    },
  },
  { // Day 31
    vocab: [
      { word: 'Change management', phonetic: '/tʃeɪndʒ ˈmænɪdʒmənt/', meaning: 'Quản lý sự thay đổi', quiz: { options: ['Quản lý sự thay đổi', 'Người ủng hộ sự thay đổi', 'Kế hoạch truyền thông nội bộ', 'Bên bị ảnh hưởng'], correct: 0 } },
      { word: 'Change champion', phonetic: '/tʃeɪndʒ ˈtʃæmpiən/', meaning: 'Người tiên phong ủng hộ thay đổi', quiz: { options: ['Kế hoạch truyền thông nội bộ', 'Người tiên phong ủng hộ thay đổi', 'Quản lý sự thay đổi', 'Bên bị ảnh hưởng'], correct: 1 } },
      { word: 'Internal communications', phonetic: '/ɪnˈtɜːrnl kəˌmjuːnɪˈkeɪʃnz/', meaning: 'Truyền thông nội bộ', quiz: { options: ['Bên bị ảnh hưởng', 'Quản lý sự thay đổi', 'Truyền thông nội bộ', 'Người tiên phong'], correct: 2 } },
      { word: 'Affected party', phonetic: '/əˈfektɪd ˈpɑːrti/', meaning: 'Bên/nhóm bị ảnh hưởng', quiz: { options: ['Truyền thông nội bộ', 'Người tiên phong', 'Quản lý sự thay đổi', 'Bên/nhóm bị ảnh hưởng'], correct: 3 } },
      { word: 'Buy-in',        phonetic: '/ˈbaɪ ɪn/',        meaning: 'Sự đồng thuận, ủng hộ', quiz: { options: ['Sự đồng thuận, ủng hộ', 'Bên bị ảnh hưởng', 'Truyền thông nội bộ', 'Người tiên phong'], correct: 0 } },
    ],
    reading: {
      title: 'Winning Hearts and Minds During Change',
      passage: 'Effective change management, Nga explained, starts with identifying change champions in every department who can influence their peers positively. A dedicated internal communications plan kept every affected party informed at each stage of the transformation. By continuously seeking buy-in rather than forcing compliance, the transformation faced far less pushback than similar projects at competitor firms.',
      quiz: [
        { q: 'Quản lý sự thay đổi hiệu quả bắt đầu từ đâu theo Nga?', options: ['Xác định người tiên phong ủng hộ ở mỗi phòng ban', 'Sa thải người phản đối', 'Tăng lương cho tất cả', 'Thuê tư vấn nước ngoài'], correct: 0 },
        { q: 'Cách tiếp cận nào giúp giảm sự phản đối trong quá trình chuyển đổi?', options: ['Liên tục tìm kiếm sự đồng thuận thay vì ép buộc', 'Giữ bí mật kế hoạch', 'Áp đặt quyết định từ trên xuống', 'Bỏ qua ý kiến nhân viên'], correct: 0 },
      ],
    },
    listening: [
      'Change management requires careful planning.',
      'We identified change champions in every team.',
      'Internal communications kept everyone informed.',
      'Getting buy-in early reduces resistance later.',
    ],
    writing: {
      prompt: 'Viết đoạn văn về vai trò của quản lý sự thay đổi (change management) trong một dự án chuyển đổi tổ chức.',
      minWords: 50,
      phrases: ['Effective change management starts with', 'Change champions can help by', 'Our internal communications plan will', 'To gain buy-in, we should'],
      sentenceBuilder: [
        { scrambled: 'Nga / (identify) / change champions / in every department', answer: 'Nga identified change champions in every department' },
        { scrambled: 'The plan / (keep) / affected parties / informed', answer: 'The plan kept affected parties informed' },
      ],
    },
  },
  { // Day 32
    vocab: [
      { word: 'Transformation roadmap', phonetic: '/ˌtrænsfərˈmeɪʃn ˈroʊdmæp/', meaning: 'Lộ trình chuyển đổi', quiz: { options: ['Lộ trình chuyển đổi', 'Chỉ số đo lường thành công', 'Giai đoạn thí điểm', 'Rủi ro triển khai'], correct: 0 } },
      { word: 'Success metric', phonetic: '/səkˈses ˈmetrɪk/', meaning: 'Chỉ số đo lường thành công', quiz: { options: ['Giai đoạn thí điểm', 'Chỉ số đo lường thành công', 'Lộ trình chuyển đổi', 'Rủi ro triển khai'], correct: 1 } },
      { word: 'Pilot phase',   phonetic: '/ˈpaɪlət feɪz/',   meaning: 'Giai đoạn thí điểm', quiz: { options: ['Rủi ro triển khai', 'Lộ trình chuyển đổi', 'Giai đoạn thí điểm', 'Chỉ số đo lường thành công'], correct: 2 } },
      { word: 'Rollout risk',  phonetic: '/ˈroʊlaʊt rɪsk/', meaning: 'Rủi ro trong quá trình triển khai', quiz: { options: ['Chỉ số đo lường thành công', 'Giai đoạn thí điểm', 'Lộ trình chuyển đổi', 'Rủi ro trong quá trình triển khai'], correct: 3 } },
      { word: 'Milestone',     phonetic: '/ˈmaɪlstoʊn/',    meaning: 'Cột mốc quan trọng', quiz: { options: ['Cột mốc quan trọng', 'Rủi ro triển khai', 'Giai đoạn thí điểm', 'Chỉ số đo lường thành công'], correct: 0 } },
    ],
    reading: {
      title: 'Mapping Out the Transformation Journey',
      passage: 'Việt\'s team built a detailed transformation roadmap with clear milestones for each quarter of the two-year project. Before a full rollout, they ran a pilot phase in one branch office to identify potential rollout risks early. Success metrics, including employee satisfaction and processing time, were tracked weekly to ensure the transformation stayed on course.',
      quiz: [
        { q: 'Đội của Việt đã xây dựng công cụ gì cho dự án 2 năm?', options: ['Lộ trình chuyển đổi với các cột mốc rõ ràng theo quý', 'Một bản báo cáo tài chính', 'Một chiến dịch quảng cáo', 'Một hợp đồng thuê văn phòng'], correct: 0 },
        { q: 'Trước khi triển khai toàn diện, đội đã làm gì?', options: ['Chạy giai đoạn thí điểm ở một chi nhánh', 'Triển khai ngay lập tức toàn công ty', 'Hủy bỏ dự án', 'Thuê thêm 100 nhân viên'], correct: 0 },
      ],
    },
    listening: [
      'We built a detailed transformation roadmap.',
      'Success metrics are tracked every week.',
      'The pilot phase starts next month in one branch.',
      'We identified several rollout risks early on.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả lộ trình chuyển đổi (transformation roadmap) cho một dự án kéo dài hai năm.',
      minWords: 50,
      phrases: ['Our transformation roadmap includes', 'Success metrics will be tracked by', 'The pilot phase will help us', 'This reduces rollout risk because'],
      sentenceBuilder: [
        { scrambled: 'The team / (build) / a transformation roadmap / carefully', answer: 'The team built a transformation roadmap carefully' },
        { scrambled: 'They / (run) / a pilot phase / in one branch', answer: 'They ran a pilot phase in one branch' },
      ],
    },
  },
  { // Day 33
    vocab: [
      { word: 'Legacy system', phonetic: '/ˈleɡəsi ˈsɪstəm/', meaning: 'Hệ thống cũ, lỗi thời', quiz: { options: ['Hệ thống cũ, lỗi thời', 'Sự thích ứng của tổ chức', 'Đường cong học tập', 'Người trong cuộc'], correct: 0 } },
      { word: 'Organizational agility', phonetic: '/ˌɔːrɡənəˈzeɪʃənl əˈdʒɪləti/', meaning: 'Sự linh hoạt của tổ chức', quiz: { options: ['Đường cong học tập', 'Hệ thống cũ', 'Sự linh hoạt của tổ chức', 'Người trong cuộc'], correct: 2 } },
      { word: 'Learning curve', phonetic: '/ˈlɜːrnɪŋ kɜːrv/', meaning: 'Đường cong học tập, quá trình làm quen', quiz: { options: ['Người trong cuộc', 'Đường cong học tập, quá trình làm quen', 'Sự linh hoạt của tổ chức', 'Hệ thống cũ'], correct: 1 } },
      { word: 'Insider',       phonetic: '/ˈɪnsaɪdər/',      meaning: 'Người trong cuộc, người am hiểu nội bộ', quiz: { options: ['Sự linh hoạt của tổ chức', 'Hệ thống cũ', 'Người trong cuộc, người am hiểu nội bộ', 'Đường cong học tập'], correct: 2 } },
      { word: 'Phase out',     phonetic: '/feɪz aʊt/',       meaning: 'Loại bỏ dần dần', quiz: { options: ['Loại bỏ dần dần', 'Người trong cuộc', 'Đường cong học tập', 'Sự linh hoạt của tổ chức'], correct: 0 } },
    ],
    reading: {
      title: 'Replacing Legacy Systems Without Losing Momentum',
      passage: 'The IT department planned to phase out an outdated legacy system that had powered the company\'s operations for over fifteen years. Long, a respected insider who understood every quirk of the old software, was brought in to consult during the transition. The company invested heavily in training to shorten the learning curve, believing this would ultimately strengthen organizational agility.',
      quiz: [
        { q: 'Bộ phận IT có kế hoạch gì với hệ thống cũ?', options: ['Loại bỏ dần dần sau 15 năm sử dụng', 'Nâng cấp nhẹ và giữ nguyên', 'Bán lại cho công ty khác', 'Sử dụng thêm 15 năm nữa'], correct: 0 },
        { q: 'Công ty đầu tư mạnh vào việc gì để rút ngắn quá trình làm quen?', options: ['Đào tạo nhân viên', 'Mua thêm máy tính', 'Thuê văn phòng mới', 'Tăng lương gấp đôi'], correct: 0 },
      ],
    },
    listening: [
      'We are finally phasing out this legacy system.',
      'Organizational agility helps us adapt faster.',
      'The learning curve for the new tool is steep.',
      'Long is an insider who knows the old system well.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất kế hoạch thay thế một hệ thống cũ (legacy system) mà không làm gián đoạn hoạt động công ty.',
      minWords: 50,
      phrases: ['We plan to phase out our legacy system by', 'This will improve organizational agility', 'To shorten the learning curve, we should', 'An insider like Long can help by'],
      sentenceBuilder: [
        { scrambled: 'The company / (phase out) / the legacy system / gradually', answer: 'The company phased out the legacy system gradually' },
        { scrambled: 'Training / (shorten) / the learning curve / significantly', answer: 'Training shortened the learning curve significantly' },
      ],
    },
  },
  { // Day 34 — Chủ đề: Quản lý khủng hoảng cấp cao
    vocab: [
      { word: 'Contain',       phonetic: '/kənˈteɪn/',       meaning: 'Kiểm soát, ngăn chặn (khủng hoảng)', quiz: { options: ['Kiểm soát, ngăn chặn (khủng hoảng)', 'Hậu quả', 'Phản ứng dữ dội', 'Tổn hại danh tiếng'], correct: 0 } },
      { word: 'Fallout',       phonetic: '/ˈfɔːlaʊt/',       meaning: 'Hậu quả (của khủng hoảng)', quiz: { options: ['Tổn hại danh tiếng', 'Phản ứng dữ dội', 'Hậu quả (của khủng hoảng)', 'Kiểm soát'], correct: 2 } },
      { word: 'Backlash',      phonetic: '/ˈbæklæʃ/',        meaning: 'Phản ứng dữ dội từ công chúng', quiz: { options: ['Kiểm soát', 'Phản ứng dữ dội từ công chúng', 'Hậu quả', 'Tổn hại danh tiếng'], correct: 1 } },
      { word: 'Reputational damage', phonetic: '/ˌrepjuˈteɪʃənl ˈdæmɪdʒ/', meaning: 'Tổn hại danh tiếng', quiz: { options: ['Hậu quả', 'Kiểm soát', 'Phản ứng dữ dội', 'Tổn hại danh tiếng'], correct: 3 } },
      { word: 'Damage control', phonetic: '/ˈdæmɪdʒ kənˈtroʊl/', meaning: 'Kiểm soát thiệt hại (truyền thông)', quiz: { options: ['Tổn hại danh tiếng', 'Hậu quả', 'Kiểm soát thiệt hại (truyền thông)', 'Phản ứng dữ dội'], correct: 2 } },
    ],
    reading: {
      title: 'The First 24 Hours of a Crisis',
      passage: 'When the product recall news broke, the crisis team worked around the clock to contain the story before it spread further on social media. Despite their efforts, public backlash intensified, forcing the CEO to issue a personal apology to manage the fallout. Corporate communications specialists were brought in to lead damage control and limit further reputational damage to the brand.',
      quiz: [
        { q: 'Đội xử lý khủng hoảng đã làm gì khi tin thu hồi sản phẩm lan ra?', options: ['Làm việc suốt ngày đêm để kiểm soát câu chuyện', 'Phớt lờ hoàn toàn', 'Sa thải toàn bộ đội truyền thông', 'Đóng cửa công ty ngay'], correct: 0 },
        { q: 'CEO đã làm gì để xử lý hậu quả?', options: ['Đưa ra lời xin lỗi cá nhân', 'Từ chức ngay lập tức', 'Kiện các phương tiện truyền thông', 'Giữ im lặng hoàn toàn'], correct: 0 },
      ],
    },
    listening: [
      'We need to contain this story immediately.',
      'The backlash on social media was intense.',
      'The company is still managing the fallout.',
      'Damage control is our top priority right now.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả cách một công ty nên phản ứng trong 24 giờ đầu tiên của một cuộc khủng hoảng truyền thông.',
      minWords: 50,
      phrases: ['To contain the crisis, we must', 'Public backlash can be reduced by', 'We are managing the fallout from', 'Damage control requires us to'],
      sentenceBuilder: [
        { scrambled: 'The team / (contain) / the story / quickly', answer: 'The team contained the story quickly' },
        { scrambled: 'The CEO / (issue) / a personal apology / immediately', answer: 'The CEO issued a personal apology immediately' },
      ],
    },
  },
  { // Day 35
    vocab: [
      { word: 'Press statement', phonetic: '/pres ˈsteɪtmənt/', meaning: 'Tuyên bố báo chí', quiz: { options: ['Tuyên bố báo chí', 'Người phát ngôn', 'Bên thứ ba xác minh', 'Kịch bản khủng hoảng'], correct: 0 } },
      { word: 'Spokesperson',  phonetic: '/ˈspoʊkspɜːrsn/',  meaning: 'Người phát ngôn', quiz: { options: ['Kịch bản khủng hoảng', 'Người phát ngôn', 'Tuyên bố báo chí', 'Bên thứ ba xác minh'], correct: 1 } },
      { word: 'Third-party verification', phonetic: '/θɜːrd ˈpɑːrti ˌverɪfɪˈkeɪʃn/', meaning: 'Xác minh từ bên thứ ba', quiz: { options: ['Người phát ngôn', 'Tuyên bố báo chí', 'Xác minh từ bên thứ ba', 'Kịch bản khủng hoảng'], correct: 2 } },
      { word: 'Crisis playbook', phonetic: '/ˈkraɪsɪs ˈpleɪbʊk/', meaning: 'Kịch bản/quy trình ứng phó khủng hoảng', quiz: { options: ['Bên thứ ba xác minh', 'Kịch bản/quy trình ứng phó khủng hoảng', 'Người phát ngôn', 'Tuyên bố báo chí'], correct: 1 } },
      { word: 'Credibility',   phonetic: '/ˌkredəˈbɪləti/',  meaning: 'Độ tin cậy, uy tín', quiz: { options: ['Độ tin cậy, uy tín', 'Kịch bản khủng hoảng', 'Người phát ngôn', 'Tuyên bố báo chí'], correct: 0 } },
    ],
    reading: {
      title: 'Following the Crisis Playbook',
      passage: 'The moment the safety concern surfaced, the company activated its crisis playbook, a document prepared years earlier for exactly this scenario. Bình, the official spokesperson, delivered a carefully worded press statement acknowledging the issue transparently. To restore public trust, the company also commissioned third-party verification of its safety standards, understanding that credibility, once lost, is extremely difficult to rebuild.',
      quiz: [
        { q: 'Công ty đã làm gì ngay khi vấn đề an toàn xuất hiện?', options: ['Kích hoạt kịch bản ứng phó khủng hoảng đã chuẩn bị trước', 'Phủ nhận hoàn toàn vấn đề', 'Sa thải người phát ngôn', 'Chuyển trụ sở ra nước ngoài'], correct: 0 },
        { q: 'Công ty đã làm gì để khôi phục niềm tin công chúng?', options: ['Thuê bên thứ ba xác minh tiêu chuẩn an toàn', 'Ngừng hoạt động vĩnh viễn', 'Đổi tên công ty', 'Kiện các nhà báo'], correct: 0 },
      ],
    },
    listening: [
      'We activated our crisis playbook right away.',
      'The spokesperson delivered a clear press statement.',
      'Third-party verification will help restore trust.',
      'Credibility is hard to rebuild once it\'s lost.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả nội dung một kịch bản ứng phó khủng hoảng (crisis playbook) mà công ty nên chuẩn bị sẵn.',
      minWords: 50,
      phrases: ['Our crisis playbook outlines', 'The spokesperson should communicate', 'Third-party verification adds credibility because', 'Restoring credibility requires'],
      sentenceBuilder: [
        { scrambled: 'The company / (activate) / its crisis playbook / immediately', answer: 'The company activated its crisis playbook immediately' },
        { scrambled: 'Bình / (deliver) / a press statement / calmly', answer: 'Bình delivered a press statement calmly' },
      ],
    },
  },
  { // Day 36
    vocab: [
      { word: 'Escalation protocol', phonetic: '/ˌeskəˈleɪʃn ˈproʊtəkɒl/', meaning: 'Quy trình leo thang xử lý', quiz: { options: ['Quy trình leo thang xử lý', 'Đơn vị chỉ huy khẩn cấp', 'Rủi ro tiềm ẩn', 'Kịch bản xấu nhất được diễn tập'], correct: 0 } },
      { word: 'War room',      phonetic: '/wɔːr ruːm/',      meaning: 'Phòng chỉ huy khẩn cấp', quiz: { options: ['Rủi ro tiềm ẩn', 'Phòng chỉ huy khẩn cấp', 'Quy trình leo thang xử lý', 'Kịch bản diễn tập'], correct: 1 } },
      { word: 'Latent risk',   phonetic: '/ˈleɪtnt rɪsk/',   meaning: 'Rủi ro tiềm ẩn', quiz: { options: ['Kịch bản diễn tập', 'Phòng chỉ huy khẩn cấp', 'Rủi ro tiềm ẩn', 'Quy trình leo thang xử lý'], correct: 2 } },
      { word: 'Simulation drill', phonetic: '/ˌsɪmjuˈleɪʃn drɪl/', meaning: 'Buổi diễn tập tình huống giả định', quiz: { options: ['Quy trình leo thang xử lý', 'Rủi ro tiềm ẩn', 'Phòng chỉ huy khẩn cấp', 'Buổi diễn tập tình huống giả định'], correct: 3 } },
      { word: 'Chain of command', phonetic: '/tʃeɪn əv kəˈmænd/', meaning: 'Chuỗi chỉ huy, hệ thống ra quyết định', quiz: { options: ['Buổi diễn tập giả định', 'Chuỗi chỉ huy, hệ thống ra quyết định', 'Rủi ro tiềm ẩn', 'Phòng chỉ huy khẩn cấp'], correct: 1 } },
    ],
    reading: {
      title: 'Rehearsing for the Unthinkable',
      passage: 'Every quarter, the risk team ran a simulation drill in a dedicated war room to test how quickly executives could respond to a major incident. This exercise revealed a latent risk in the company\'s escalation protocol: nobody was sure who had final authority when the CEO was unreachable. Correcting the chain of command afterward proved essential when a real crisis struck just two months later.',
      quiz: [
        { q: 'Đội quản lý rủi ro thực hiện gì mỗi quý?', options: ['Buổi diễn tập tình huống giả định trong phòng chỉ huy khẩn cấp', 'Một chuyến du lịch công ty', 'Kiểm toán tài chính', 'Họp cổ đông thường niên'], correct: 0 },
        { q: 'Buổi diễn tập phát hiện ra rủi ro tiềm ẩn gì?', options: ['Không rõ ai có thẩm quyền cuối cùng khi CEO không liên lạc được', 'Ngân sách không đủ', 'Văn phòng quá nhỏ', 'Thiếu máy tính'], correct: 0 },
      ],
    },
    listening: [
      'We ran a simulation drill in the war room today.',
      'This revealed a latent risk in our protocol.',
      'The escalation protocol needs to be clearer.',
      'We fixed a gap in the chain of command.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất việc tổ chức các buổi diễn tập tình huống giả định (simulation drill) để chuẩn bị cho khủng hoảng.',
      minWords: 50,
      phrases: ['A simulation drill helps us prepare for', 'This revealed a latent risk in', 'Our escalation protocol should include', 'The chain of command must be clear when'],
      sentenceBuilder: [
        { scrambled: 'The team / (run) / a simulation drill / every quarter', answer: 'The team runs a simulation drill every quarter' },
        { scrambled: 'The drill / (reveal) / a latent risk / immediately', answer: 'The drill revealed a latent risk immediately' },
      ],
    },
  },
  { // Day 37
    vocab: [
      { word: 'Public trust',  phonetic: '/ˈpʌblɪk trʌst/',  meaning: 'Niềm tin công chúng', quiz: { options: ['Niềm tin công chúng', 'Kịch bản tồi tệ nhất chưa từng dự đoán', 'Sự minh bạch trong khủng hoảng', 'Điều tra nguyên nhân gốc rễ'], correct: 0 } },
      { word: 'Root cause analysis', phonetic: '/ruːt kɔːz əˈnæləsɪs/', meaning: 'Phân tích nguyên nhân gốc rễ', quiz: { options: ['Niềm tin công chúng', 'Sự minh bạch', 'Phân tích nguyên nhân gốc rễ', 'Kịch bản tồi tệ nhất'], correct: 2 } },
      { word: 'Black swan event', phonetic: '/blæk swɒn ɪˈvent/', meaning: 'Sự kiện hiếm gặp, khó lường trước', quiz: { options: ['Phân tích nguyên nhân gốc rễ', 'Sự kiện hiếm gặp, khó lường trước', 'Niềm tin công chúng', 'Sự minh bạch'], correct: 1 } },
      { word: 'Full disclosure', phonetic: '/fʊl dɪsˈkloʊʒər/', meaning: 'Công khai đầy đủ thông tin', quiz: { options: ['Sự kiện hiếm gặp', 'Niềm tin công chúng', 'Phân tích nguyên nhân gốc rễ', 'Công khai đầy đủ thông tin'], correct: 3 } },
      { word: 'Accountable',   phonetic: '/əˈkaʊntəbl/',     meaning: 'Có trách nhiệm giải trình', quiz: { options: ['Có trách nhiệm giải trình', 'Công khai đầy đủ', 'Sự kiện hiếm gặp', 'Phân tích nguyên nhân gốc rễ'], correct: 0 } },
    ],
    reading: {
      title: 'Rebuilding Public Trust After a Crisis',
      passage: 'Executives described the factory fire as a true black swan event, something no one had planned for despite years of safety audits. To rebuild public trust, the company commissioned an independent root cause analysis and committed to full disclosure of the findings, even the embarrassing ones. Kiên, the operations director, personally held himself accountable and resigned from his position as a gesture of responsibility.',
      quiz: [
        { q: 'Ban lãnh đạo mô tả vụ cháy nhà máy là gì?', options: ['Một sự kiện hiếm gặp, khó lường trước', 'Một sự cố nhỏ không đáng lo', 'Một âm mưu của đối thủ', 'Một lỗi kỹ thuật đơn giản'], correct: 0 },
        { q: 'Kiên đã làm gì để thể hiện trách nhiệm?', options: ['Từ chức khỏi vị trí của mình', 'Đổ lỗi cho nhân viên', 'Yêu cầu tăng lương', 'Rời khỏi đất nước'], correct: 0 },
      ],
    },
    listening: [
      'This was truly a black swan event for the industry.',
      'We are committed to full disclosure of the findings.',
      'A root cause analysis is currently underway.',
      'Rebuilding public trust will take considerable time.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích cách một công ty có thể xây dựng lại niềm tin công chúng (public trust) sau một sự cố nghiêm trọng.',
      minWords: 50,
      phrases: ['To rebuild public trust, we must', 'A root cause analysis will help us', 'We are committed to full disclosure of', 'Being accountable means'],
      sentenceBuilder: [
        { scrambled: 'The company / (commission) / a root cause analysis / immediately', answer: 'The company commissioned a root cause analysis immediately' },
        { scrambled: 'Kiên / (hold) / himself accountable / publicly', answer: 'Kiên held himself accountable publicly' },
      ],
    },
  },
  { // Day 38
    vocab: [
      { word: 'Reputation recovery', phonetic: '/ˌrepjuˈteɪʃn rɪˈkʌvəri/', meaning: 'Sự phục hồi danh tiếng', quiz: { options: ['Sự phục hồi danh tiếng', 'Sự sụt giảm cổ phiếu', 'Nhân vật gây khủng hoảng', 'Chính sách bồi thường'], correct: 0 } },
      { word: 'Stock plunge',  phonetic: '/stɒk plʌndʒ/',    meaning: 'Sự sụt giảm mạnh giá cổ phiếu', quiz: { options: ['Sự phục hồi danh tiếng', 'Sự sụt giảm mạnh giá cổ phiếu', 'Nhân vật gây khủng hoảng', 'Chính sách bồi thường'], correct: 1 } },
      { word: 'Bad actor',     phonetic: '/bæd ˈæktər/',     meaning: 'Cá nhân/thành phần gây hại (trong tổ chức)', quiz: { options: ['Sự sụt giảm cổ phiếu', 'Chính sách bồi thường', 'Cá nhân/thành phần gây hại (trong tổ chức)', 'Sự phục hồi danh tiếng'], correct: 2 } },
      { word: 'Compensation policy', phonetic: '/ˌkɒmpenˈseɪʃn ˈpɒləsi/', meaning: 'Chính sách bồi thường', quiz: { options: ['Chính sách bồi thường', 'Sự sụt giảm cổ phiếu', 'Cá nhân gây hại', 'Sự phục hồi danh tiếng'], correct: 0 } },
      { word: 'Turning point',  phonetic: '/ˈtɜːrnɪŋ pɔɪnt/', meaning: 'Bước ngoặt', quiz: { options: ['Cá nhân gây hại', 'Chính sách bồi thường', 'Sự sụt giảm cổ phiếu', 'Bước ngoặt'], correct: 3 } },
    ],
    reading: {
      title: 'The Long Road to Reputation Recovery',
      passage: 'After the scandal caused a dramatic stock plunge, investigators identified a single bad actor whose falsified reports had misled senior management for years. The company introduced a fair compensation policy for affected customers as a first step toward reputation recovery. Analysts later described the transparent handling of the aftermath as a genuine turning point in restoring investor confidence.',
      quiz: [
        { q: 'Điều gì đã gây ra sự sụt giảm mạnh giá cổ phiếu?', options: ['Một vụ bê bối', 'Thời tiết xấu', 'Kỳ nghỉ lễ kéo dài', 'Thay đổi logo công ty'], correct: 0 },
        { q: 'Các nhà phân tích mô tả cách xử lý hậu quả minh bạch là gì?', options: ['Một bước ngoặt trong việc khôi phục niềm tin nhà đầu tư', 'Một thất bại hoàn toàn', 'Một sự lãng phí thời gian', 'Một quyết định sai lầm'], correct: 0 },
      ],
    },
    listening: [
      'The scandal caused a dramatic stock plunge.',
      'Investigators identified a single bad actor.',
      'We introduced a new compensation policy for customers.',
      'This was a genuine turning point for the company.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả hành trình phục hồi danh tiếng (reputation recovery) của một công ty sau bê bối.',
      minWords: 50,
      phrases: ['Reputation recovery began when', 'The stock plunge was caused by', 'We introduced a compensation policy for', 'This marked a turning point because'],
      sentenceBuilder: [
        { scrambled: 'Investigators / (identify) / a single bad actor / eventually', answer: 'Investigators identified a single bad actor eventually' },
        { scrambled: 'The company / (introduce) / a compensation policy / quickly', answer: 'The company introduced a compensation policy quickly' },
      ],
    },
  },
  { // Day 39 — Chủ đề: Đầu tư & tài chính doanh nghiệp
    vocab: [
      { word: 'Portfolio',     phonetic: '/pɔːrtˈfoʊlioʊ/',  meaning: 'Danh mục đầu tư', quiz: { options: ['Danh mục đầu tư', 'Cổ tức', 'Khả năng thanh toán nợ', 'Vốn hóa'], correct: 0 } },
      { word: 'Dividend',      phonetic: '/ˈdɪvɪdend/',      meaning: 'Cổ tức', quiz: { options: ['Vốn hóa', 'Danh mục đầu tư', 'Cổ tức', 'Khả năng thanh toán nợ'], correct: 2 } },
      { word: 'Solvency',      phonetic: '/ˈsɒlvənsi/',      meaning: 'Khả năng thanh toán nợ', quiz: { options: ['Khả năng thanh toán nợ', 'Cổ tức', 'Vốn hóa', 'Danh mục đầu tư'], correct: 0 } },
      { word: 'Capital structure', phonetic: '/ˈkæpɪtl ˈstrʌktʃər/', meaning: 'Cơ cấu vốn', quiz: { options: ['Cổ tức', 'Khả năng thanh toán nợ', 'Cơ cấu vốn', 'Danh mục đầu tư'], correct: 2 } },
      { word: 'Diversify',     phonetic: '/daɪˈvɜːrsɪfaɪ/',  meaning: 'Đa dạng hóa (đầu tư)', quiz: { options: ['Đa dạng hóa (đầu tư)', 'Cơ cấu vốn', 'Cổ tức', 'Khả năng thanh toán nợ'], correct: 0 } },
    ],
    reading: {
      title: 'Rethinking the Investment Portfolio',
      passage: 'The chief financial officer, Trâm, reviewed the company\'s entire portfolio, concerned that too much capital was concentrated in a single volatile market. To improve long-term solvency, she proposed diversifying into stable government bonds rather than only equities. The board also debated whether to reduce the dividend temporarily to strengthen the capital structure ahead of a planned expansion.',
      quiz: [
        { q: 'Trâm lo ngại điều gì về danh mục đầu tư của công ty?', options: ['Quá nhiều vốn tập trung vào một thị trường biến động', 'Danh mục quá đa dạng', 'Không có đủ nhân viên quản lý', 'Thiếu văn phòng đại diện'], correct: 0 },
        { q: 'Hội đồng quản trị tranh luận về việc gì?', options: ['Giảm tạm thời cổ tức để củng cố cơ cấu vốn', 'Tăng gấp đôi cổ tức ngay lập tức', 'Bán toàn bộ công ty', 'Sa thải CFO'], correct: 0 },
      ],
    },
    listening: [
      'We need to diversify our investment portfolio.',
      'The company announced a lower dividend this quarter.',
      'Solvency is critical during an economic downturn.',
      'This deal will change our capital structure significantly.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách đa dạng hóa (diversify) danh mục đầu tư của công ty để giảm rủi ro.',
      minWords: 50,
      phrases: ['We should diversify our portfolio by', 'This would strengthen our solvency', 'Our capital structure needs to', 'The dividend policy should reflect'],
      sentenceBuilder: [
        { scrambled: 'Trâm / (propose) / diversifying / into government bonds', answer: 'Trâm proposed diversifying into government bonds' },
        { scrambled: 'The board / (debate) / reducing / the dividend', answer: 'The board debated reducing the dividend' },
      ],
    },
  },
  { // Day 40
    vocab: [
      { word: 'Venture capital', phonetic: '/ˈventʃər ˈkæpɪtl/', meaning: 'Vốn đầu tư mạo hiểm', quiz: { options: ['Vốn đầu tư mạo hiểm', 'Vòng gọi vốn', 'Tỷ lệ pha loãng cổ phần', 'Định giá trước khi rót vốn'], correct: 0 } },
      { word: 'Funding round', phonetic: '/ˈfʌndɪŋ raʊnd/',   meaning: 'Vòng gọi vốn', quiz: { options: ['Tỷ lệ pha loãng', 'Vòng gọi vốn', 'Vốn đầu tư mạo hiểm', 'Định giá trước rót vốn'], correct: 1 } },
      { word: 'Equity dilution', phonetic: '/ˈekwəti daɪˈluːʃn/', meaning: 'Sự pha loãng cổ phần', quiz: { options: ['Vòng gọi vốn', 'Định giá trước rót vốn', 'Sự pha loãng cổ phần', 'Vốn đầu tư mạo hiểm'], correct: 2 } },
      { word: 'Pre-money valuation', phonetic: '/priː ˈmʌni ˌvæljuˈeɪʃn/', meaning: 'Định giá trước khi rót vốn', quiz: { options: ['Sự pha loãng cổ phần', 'Vốn đầu tư mạo hiểm', 'Vòng gọi vốn', 'Định giá trước khi rót vốn'], correct: 3 } },
      { word: 'Exit strategy', phonetic: '/ˈeksɪt ˈstrætədʒi/', meaning: 'Chiến lược thoái vốn', quiz: { options: ['Chiến lược thoái vốn', 'Vòng gọi vốn', 'Sự pha loãng cổ phần', 'Định giá trước rót vốn'], correct: 0 } },
    ],
    reading: {
      title: 'Navigating a New Funding Round',
      passage: 'Duy\'s startup secured its second funding round from a prominent venture capital firm eager to back Southeast Asian tech companies. Before signing, Duy negotiated hard on the pre-money valuation to minimize equity dilution for existing shareholders. Investors also asked about the founders\' exit strategy, whether through an IPO or eventual acquisition by a larger player.',
      quiz: [
        { q: 'Startup của Duy đã huy động vốn từ đâu?', options: ['Một quỹ đầu tư mạo hiểm nổi tiếng', 'Ngân hàng nhà nước', 'Chính phủ', 'Quỹ từ thiện'], correct: 0 },
        { q: 'Duy đàm phán về điều gì để giảm thiểu pha loãng cổ phần?', options: ['Định giá trước khi rót vốn', 'Mức lương nhân viên', 'Địa điểm văn phòng', 'Số ngày nghỉ phép'], correct: 0 },
      ],
    },
    listening: [
      'We closed our second funding round last month.',
      'The venture capital firm invested heavily in tech startups.',
      'Equity dilution is a concern for early shareholders.',
      'What is your exit strategy for this company?',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả cách một startup nên chuẩn bị trước khi gọi vốn từ nhà đầu tư mạo hiểm (venture capital).',
      minWords: 50,
      phrases: ['To secure this funding round, we need', 'Venture capital firms typically look for', 'We want to minimize equity dilution by', 'Our exit strategy involves'],
      sentenceBuilder: [
        { scrambled: 'The startup / (secure) / its second funding round / successfully', answer: 'The startup secured its second funding round successfully' },
        { scrambled: 'Duy / (negotiate) / the pre-money valuation / carefully', answer: 'Duy negotiated the pre-money valuation carefully' },
      ],
    },
  },
  { // Day 41
    vocab: [
      { word: 'Liquidity',     phonetic: '/lɪˈkwɪdəti/',     meaning: 'Tính thanh khoản', quiz: { options: ['Tính thanh khoản', 'Trái phiếu doanh nghiệp', 'Chi phí vốn', 'Lợi tức đầu tư'], correct: 0 } },
      { word: 'Corporate bond', phonetic: '/ˈkɔːrpərət bɒnd/', meaning: 'Trái phiếu doanh nghiệp', quiz: { options: ['Chi phí vốn', 'Trái phiếu doanh nghiệp', 'Tính thanh khoản', 'Lợi tức đầu tư'], correct: 1 } },
      { word: 'Cost of capital', phonetic: '/kɒst əv ˈkæpɪtl/', meaning: 'Chi phí sử dụng vốn', quiz: { options: ['Tính thanh khoản', 'Trái phiếu doanh nghiệp', 'Lợi tức đầu tư', 'Chi phí sử dụng vốn'], correct: 3 } },
      { word: 'Return on investment', phonetic: '/rɪˈtɜːrn ɒn ɪnˈvestmənt/', meaning: 'Lợi tức đầu tư (ROI)', quiz: { options: ['Chi phí sử dụng vốn', 'Lợi tức đầu tư (ROI)', 'Tính thanh khoản', 'Trái phiếu doanh nghiệp'], correct: 1 } },
      { word: 'Credit rating', phonetic: '/ˈkredɪt ˈreɪtɪŋ/', meaning: 'Xếp hạng tín nhiệm', quiz: { options: ['Lợi tức đầu tư', 'Tính thanh khoản', 'Xếp hạng tín nhiệm', 'Chi phí sử dụng vốn'], correct: 2 } },
    ],
    reading: {
      title: 'Managing Liquidity in Uncertain Times',
      passage: 'With markets growing volatile, the treasury team prioritized liquidity over aggressive expansion, keeping enough cash reserves to weather any downturn. The company issued a new corporate bond at a favorable rate, thanks to its strong credit rating maintained over the years. Every project now had to demonstrate a clear return on investment that justified the rising cost of capital.',
      quiz: [
        { q: 'Đội ngân quỹ ưu tiên điều gì hơn là mở rộng nhanh?', options: ['Tính thanh khoản', 'Lợi nhuận ngắn hạn', 'Số lượng nhân viên', 'Quảng cáo rầm rộ'], correct: 0 },
        { q: 'Công ty phát hành trái phiếu với lãi suất thuận lợi nhờ đâu?', options: ['Xếp hạng tín nhiệm mạnh', 'Chính phủ bảo lãnh', 'Giá cổ phiếu cao', 'Đối tác nước ngoài'], correct: 0 },
      ],
    },
    listening: [
      'Liquidity is our top priority this quarter.',
      'We issued a new corporate bond last week.',
      'The cost of capital has risen recently.',
      'Our credit rating remains strong despite the downturn.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích tầm quan trọng của việc duy trì tính thanh khoản (liquidity) trong giai đoạn kinh tế bất ổn.',
      minWords: 50,
      phrases: ['Maintaining liquidity allows us to', 'We issued a corporate bond to', 'The cost of capital affects our decision to', 'A strong credit rating helps us'],
      sentenceBuilder: [
        { scrambled: 'The company / (issue) / a corporate bond / last week', answer: 'The company issued a corporate bond last week' },
        { scrambled: 'The team / (prioritize) / liquidity / over expansion', answer: 'The team prioritized liquidity over expansion' },
      ],
    },
  },
  { // Day 42
    vocab: [
      { word: 'Capital expenditure', phonetic: '/ˈkæpɪtl ɪkˈspendɪtʃər/', meaning: 'Chi tiêu vốn (CAPEX)', quiz: { options: ['Chi tiêu vốn (CAPEX)', 'Dòng tiền tự do', 'Chỉ số nợ trên vốn chủ', 'Khấu hao'], correct: 0 } },
      { word: 'Free cash flow', phonetic: '/friː kæʃ floʊ/', meaning: 'Dòng tiền tự do', quiz: { options: ['Chỉ số nợ trên vốn chủ', 'Dòng tiền tự do', 'Chi tiêu vốn', 'Khấu hao'], correct: 1 } },
      { word: 'Debt-to-equity ratio', phonetic: '/det tuː ˈekwəti ˈreɪʃioʊ/', meaning: 'Tỷ lệ nợ trên vốn chủ sở hữu', quiz: { options: ['Dòng tiền tự do', 'Chi tiêu vốn', 'Tỷ lệ nợ trên vốn chủ sở hữu', 'Khấu hao'], correct: 2 } },
      { word: 'Depreciation', phonetic: '/dɪˌpriːʃiˈeɪʃn/', meaning: 'Khấu hao', quiz: { options: ['Khấu hao', 'Chi tiêu vốn', 'Dòng tiền tự do', 'Tỷ lệ nợ trên vốn chủ'], correct: 0 } },
      { word: 'Fiscal discipline', phonetic: '/ˈfɪskl ˈdɪsəplɪn/', meaning: 'Kỷ luật tài khóa', quiz: { options: ['Khấu hao', 'Tỷ lệ nợ trên vốn chủ', 'Chi tiêu vốn', 'Kỷ luật tài khóa'], correct: 3 } },
    ],
    reading: {
      title: 'The Discipline Behind Sound Financial Planning',
      passage: 'Bình insisted that every major capital expenditure be justified by its expected impact on free cash flow within three years. The company also worked to lower its debt-to-equity ratio, having grown too dependent on borrowed money during its rapid expansion phase. This renewed fiscal discipline, combined with careful accounting for depreciation, gave investors much greater confidence in the firm\'s long-term stability.',
      quiz: [
        { q: 'Bình yêu cầu điều gì đối với mỗi khoản chi tiêu vốn lớn?', options: ['Phải có tác động rõ ràng đến dòng tiền tự do trong 3 năm', 'Phải được CEO ký duyệt trực tiếp', 'Phải nhỏ hơn 1000 đô la', 'Phải được công bố trên báo chí'], correct: 0 },
        { q: 'Công ty muốn giảm chỉ số nào?', options: ['Tỷ lệ nợ trên vốn chủ sở hữu', 'Số lượng khách hàng', 'Doanh thu hàng năm', 'Số lượng nhân viên'], correct: 0 },
      ],
    },
    listening: [
      'Every capital expenditure needs strong justification.',
      'Free cash flow improved significantly this year.',
      'Our debt-to-equity ratio is still too high.',
      'Fiscal discipline is essential during expansion.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích tầm quan trọng của kỷ luật tài khóa (fiscal discipline) khi công ty đang mở rộng nhanh.',
      minWords: 50,
      phrases: ['Every capital expenditure must be justified by', 'We aim to improve our free cash flow by', 'Our debt-to-equity ratio should be', 'Fiscal discipline requires us to'],
      sentenceBuilder: [
        { scrambled: 'Bình / (insist) / on fiscal discipline / firmly', answer: 'Bình insisted on fiscal discipline firmly' },
        { scrambled: 'The company / (lower) / its debt-to-equity ratio / gradually', answer: 'The company lowered its debt-to-equity ratio gradually' },
      ],
    },
  },
  { // Day 43
    vocab: [
      { word: 'Asset allocation', phonetic: '/ˈæset ˌæləˈkeɪʃn/', meaning: 'Phân bổ tài sản', quiz: { options: ['Phân bổ tài sản', 'Chỉ số biến động thị trường', 'Nguyên tắc thận trọng', 'Danh mục rủi ro thấp'], correct: 0 } },
      { word: 'Volatility index', phonetic: '/ˌvɒləˈtɪləti ˈɪndeks/', meaning: 'Chỉ số đo lường biến động thị trường', quiz: { options: ['Nguyên tắc thận trọng', 'Chỉ số đo lường biến động thị trường', 'Phân bổ tài sản', 'Danh mục rủi ro thấp'], correct: 1 } },
      { word: 'Prudent approach', phonetic: '/ˈpruːdnt əˈproʊtʃ/', meaning: 'Cách tiếp cận thận trọng', quiz: { options: ['Chỉ số biến động', 'Phân bổ tài sản', 'Cách tiếp cận thận trọng', 'Danh mục rủi ro thấp'], correct: 2 } },
      { word: 'Low-risk portfolio', phonetic: '/loʊ rɪsk pɔːrtˈfoʊlioʊ/', meaning: 'Danh mục đầu tư rủi ro thấp', quiz: { options: ['Danh mục đầu tư rủi ro thấp', 'Chỉ số biến động', 'Cách tiếp cận thận trọng', 'Phân bổ tài sản'], correct: 0 } },
      { word: 'Yield',         phonetic: '/jiːld/',          meaning: 'Lợi suất (đầu tư)', quiz: { options: ['Lợi suất (đầu tư)', 'Danh mục rủi ro thấp', 'Cách tiếp cận thận trọng', 'Chỉ số biến động'], correct: 0 } },
    ],
    reading: {
      title: 'Choosing a Prudent Asset Allocation',
      passage: 'Given the sharp rise in the volatility index over the past quarter, Phương\'s investment committee adopted a more prudent approach to asset allocation. They shifted more funds into a low-risk portfolio of blue-chip stocks and bonds, sacrificing some potential yield for greater stability. This conservative strategy, though less exciting, protected the pension fund from severe losses during the market correction.',
      quiz: [
        { q: 'Vì sao ủy ban đầu tư của Phương chuyển sang cách tiếp cận thận trọng hơn?', options: ['Vì chỉ số biến động thị trường tăng mạnh', 'Vì lợi nhuận quá cao', 'Vì nhân viên yêu cầu', 'Vì luật mới ban hành'], correct: 0 },
        { q: 'Họ chuyển vốn vào loại danh mục nào?', options: ['Danh mục rủi ro thấp gồm cổ phiếu blue-chip và trái phiếu', 'Danh mục tiền điện tử', 'Danh mục bất động sản duy nhất', 'Danh mục cổ phiếu công nghệ mới nổi'], correct: 0 },
      ],
    },
    listening: [
      'The volatility index spiked sharply last quarter.',
      'We adopted a more prudent approach to investing.',
      'Our low-risk portfolio protected us during the downturn.',
      'The yield on this bond is lower but safer.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất một chiến lược phân bổ tài sản (asset allocation) thận trọng cho quỹ hưu trí trong giai đoạn thị trường biến động.',
      minWords: 50,
      phrases: ['Given the rising volatility index, we should', 'A prudent approach to asset allocation means', 'A low-risk portfolio can protect us by', 'The yield may be lower, but'],
      sentenceBuilder: [
        { scrambled: 'The committee / (adopt) / a prudent approach / immediately', answer: 'The committee adopted a prudent approach immediately' },
        { scrambled: 'They / (shift) / funds / into a low-risk portfolio', answer: 'They shifted funds into a low-risk portfolio' },
      ],
    },
  },
  { // Day 44 — Chủ đề: Đổi mới sáng tạo
    vocab: [
      { word: 'Disrupt',       phonetic: '/dɪsˈrʌpt/',       meaning: 'Phá vỡ, tạo đột phá (thị trường)', quiz: { options: ['Phá vỡ, tạo đột phá (thị trường)', 'Nguyên mẫu thử nghiệm', 'Lặp lại cải tiến', 'Ươm tạo (dự án mới)'], correct: 0 } },
      { word: 'Prototype',     phonetic: '/ˈproʊtətaɪp/',    meaning: 'Nguyên mẫu thử nghiệm', quiz: { options: ['Lặp lại cải tiến', 'Nguyên mẫu thử nghiệm', 'Phá vỡ thị trường', 'Ươm tạo'], correct: 1 } },
      { word: 'Iterate',       phonetic: '/ˈɪtəreɪt/',       meaning: 'Lặp lại và cải tiến dần', quiz: { options: ['Ươm tạo', 'Phá vỡ thị trường', 'Lặp lại và cải tiến dần', 'Nguyên mẫu thử nghiệm'], correct: 2 } },
      { word: 'Incubate',      phonetic: '/ˈɪŋkjubeɪt/',     meaning: 'Ươm tạo (ý tưởng, dự án mới)', quiz: { options: ['Nguyên mẫu thử nghiệm', 'Ươm tạo (ý tưởng, dự án mới)', 'Lặp lại cải tiến', 'Phá vỡ thị trường'], correct: 1 } },
      { word: 'Scalable',      phonetic: '/ˈskeɪləbl/',      meaning: 'Có khả năng mở rộng quy mô', quiz: { options: ['Có khả năng mở rộng quy mô', 'Ươm tạo', 'Nguyên mẫu thử nghiệm', 'Lặp lại cải tiến'], correct: 0 } },
    ],
    reading: {
      title: 'How a Small Team Disrupted an Industry',
      passage: 'Hương\'s innovation lab set out to disrupt the traditional insurance industry with a fully digital claims process. The team built a rough prototype in just two weeks, then continued to iterate based on real customer feedback every sprint. Once the concept proved scalable, the company decided to incubate it as a separate business unit with its own dedicated budget.',
      quiz: [
        { q: 'Phòng thí nghiệm đổi mới của Hương muốn làm gì với ngành bảo hiểm?', options: ['Tạo đột phá bằng quy trình bồi thường số hóa hoàn toàn', 'Đóng cửa toàn bộ ngành', 'Sao chép mô hình cũ', 'Tăng giá bảo hiểm'], correct: 0 },
        { q: 'Công ty quyết định làm gì khi ý tưởng chứng minh có khả năng mở rộng?', options: ['Ươm tạo nó thành một đơn vị kinh doanh riêng', 'Hủy bỏ dự án', 'Bán ý tưởng cho đối thủ', 'Giữ bí mật mãi mãi'], correct: 0 },
      ],
    },
    listening: [
      'This technology could disrupt the entire industry.',
      'We built a working prototype within two weeks.',
      'The team continues to iterate based on feedback.',
      'Once proven scalable, we\'ll incubate it further.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả cách một ý tưởng nhỏ có thể tạo đột phá (disrupt) trong một ngành truyền thống.',
      minWords: 50,
      phrases: ['This idea could disrupt the industry by', 'We built a prototype to test', 'We continue to iterate based on', 'Once scalable, we plan to incubate'],
      sentenceBuilder: [
        { scrambled: 'The team / (build) / a rough prototype / quickly', answer: 'The team built a rough prototype quickly' },
        { scrambled: 'The company / (decide) / to incubate / the idea', answer: 'The company decided to incubate the idea' },
      ],
    },
  },
  { // Day 45
    vocab: [
      { word: 'Ideation',      phonetic: '/aɪˌdiˈeɪʃn/',     meaning: 'Quá trình hình thành ý tưởng', quiz: { options: ['Quá trình hình thành ý tưởng', 'Tư duy thiết kế', 'Chấp nhận thất bại nhanh', 'Sản phẩm khả thi tối thiểu'], correct: 0 } },
      { word: 'Design thinking', phonetic: '/dɪˈzaɪn ˈθɪŋkɪŋ/', meaning: 'Tư duy thiết kế', quiz: { options: ['Chấp nhận thất bại nhanh', 'Tư duy thiết kế', 'Quá trình hình thành ý tưởng', 'Sản phẩm khả thi tối thiểu'], correct: 1 } },
      { word: 'Fail fast',     phonetic: '/feɪl fæst/',      meaning: 'Chấp nhận thất bại nhanh để học hỏi', quiz: { options: ['Sản phẩm khả thi tối thiểu', 'Quá trình hình thành ý tưởng', 'Tư duy thiết kế', 'Chấp nhận thất bại nhanh để học hỏi'], correct: 3 } },
      { word: 'Minimum viable product', phonetic: '/ˈmɪnɪməm ˈvaɪəbl ˈprɒdʌkt/', meaning: 'Sản phẩm khả thi tối thiểu (MVP)', quiz: { options: ['Tư duy thiết kế', 'Chấp nhận thất bại nhanh', 'Sản phẩm khả thi tối thiểu (MVP)', 'Quá trình hình thành ý tưởng'], correct: 2 } },
      { word: 'Cross-functional team', phonetic: '/krɒs ˈfʌŋkʃənl tiːm/', meaning: 'Đội đa chức năng', quiz: { options: ['Đội đa chức năng', 'Sản phẩm khả thi tối thiểu', 'Tư duy thiết kế', 'Chấp nhận thất bại nhanh'], correct: 0 } },
    ],
    reading: {
      title: 'Embracing a Fail-Fast Mindset',
      passage: 'The innovation workshop began with an ideation session where a cross-functional team of engineers, designers, and marketers brainstormed freely without judgment. Using design thinking principles, they quickly built a minimum viable product to test with real users. Kiên encouraged everyone to fail fast rather than spend months perfecting an idea that customers might ultimately reject.',
      quiz: [
        { q: 'Buổi hội thảo đổi mới bắt đầu bằng hoạt động gì?', options: ['Một phiên hình thành ý tưởng với đội đa chức năng', 'Một bài kiểm tra viết', 'Một cuộc họp cổ đông', 'Một buổi tiệc công ty'], correct: 0 },
        { q: 'Kiên khuyến khích điều gì?', options: ['Chấp nhận thất bại nhanh thay vì mất nhiều tháng hoàn thiện', 'Trì hoãn ra mắt sản phẩm', 'Giữ bí mật ý tưởng', 'Chỉ làm việc một mình'], correct: 0 },
      ],
    },
    listening: [
      'The ideation session produced dozens of new ideas.',
      'We used design thinking to solve this problem.',
      'It\'s better to fail fast than waste months on a bad idea.',
      'A cross-functional team worked on the prototype.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích tư duy "fail fast" (chấp nhận thất bại nhanh) trong quá trình đổi mới sáng tạo.',
      minWords: 50,
      phrases: ['The ideation session helped us', 'Design thinking encourages us to', 'We embraced a fail-fast approach by', 'A cross-functional team can achieve'],
      sentenceBuilder: [
        { scrambled: 'The team / (build) / a minimum viable product / quickly', answer: 'The team built a minimum viable product quickly' },
        { scrambled: 'Kiên / (encourage) / everyone / to fail fast', answer: 'Kiên encouraged everyone to fail fast' },
      ],
    },
  },
  { // Day 46
    vocab: [
      { word: 'Intellectual property', phonetic: '/ˌɪntəˈlektʃuəl ˈprɒpərti/', meaning: 'Sở hữu trí tuệ', quiz: { options: ['Sở hữu trí tuệ', 'Bằng sáng chế', 'Đổi mới đột phá', 'Đổi mới gia tăng'], correct: 0 } },
      { word: 'Patent',        phonetic: '/ˈpætnt/',         meaning: 'Bằng sáng chế', quiz: { options: ['Sở hữu trí tuệ', 'Bằng sáng chế', 'Đổi mới đột phá', 'Đổi mới gia tăng'], correct: 1 } },
      { word: 'Breakthrough innovation', phonetic: '/ˈbreɪkθruː ˌɪnəˈveɪʃn/', meaning: 'Đổi mới mang tính đột phá', quiz: { options: ['Bằng sáng chế', 'Đổi mới gia tăng', 'Đổi mới mang tính đột phá', 'Sở hữu trí tuệ'], correct: 2 } },
      { word: 'Incremental innovation', phonetic: '/ˌɪnkrəˈmentl ˌɪnəˈveɪʃn/', meaning: 'Đổi mới từng bước, gia tăng', quiz: { options: ['Đổi mới từng bước, gia tăng', 'Bằng sáng chế', 'Sở hữu trí tuệ', 'Đổi mới đột phá'], correct: 0 } },
      { word: 'First mover',   phonetic: '/fɜːrst ˈmuːvər/', meaning: 'Người đi đầu (thị trường)', quiz: { options: ['Đổi mới gia tăng', 'Người đi đầu (thị trường)', 'Bằng sáng chế', 'Sở hữu trí tuệ'], correct: 1 } },
    ],
    reading: {
      title: 'Protecting Your Competitive Edge',
      passage: 'After years of research, the lab finally secured a patent protecting its breakthrough innovation in battery technology. Legal advisors stressed the importance of safeguarding this intellectual property before competitors could copy the design. As the first mover in this niche, the company enjoyed a temporary monopoly, while its rivals were left making only incremental innovation to older products.',
      quiz: [
        { q: 'Phòng thí nghiệm đã đạt được điều gì sau nhiều năm nghiên cứu?', options: ['Một bằng sáng chế cho công nghệ pin đột phá', 'Một khoản vay ngân hàng lớn', 'Một hợp đồng quảng cáo', 'Một văn phòng mới'], correct: 0 },
        { q: 'Là người đi đầu, công ty được hưởng lợi thế gì?', options: ['Một sự độc quyền tạm thời trên thị trường', 'Miễn thuế vĩnh viễn', 'Không cần marketing', 'Không cần tuyển thêm nhân sự'], correct: 0 },
      ],
    },
    listening: [
      'We finally secured a patent for our new technology.',
      'Protecting our intellectual property is essential.',
      'This is a genuine breakthrough innovation for the industry.',
      'Being the first mover gave us a competitive edge.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích tầm quan trọng của việc bảo vệ sở hữu trí tuệ (intellectual property) đối với một đổi mới đột phá.',
      minWords: 50,
      phrases: ['Protecting our intellectual property means', 'This patent secures our breakthrough innovation', 'As the first mover, we can', 'Incremental innovation alone is not enough because'],
      sentenceBuilder: [
        { scrambled: 'The lab / (secure) / a patent / finally', answer: 'The lab secured a patent finally' },
        { scrambled: 'The company / (enjoy) / a temporary monopoly / as first mover', answer: 'The company enjoyed a temporary monopoly as first mover' },
      ],
    },
  },
  { // Day 47
    vocab: [
      { word: 'Open innovation', phonetic: '/ˈoʊpən ˌɪnəˈveɪʃn/', meaning: 'Đổi mới mở (hợp tác bên ngoài)', quiz: { options: ['Đổi mới mở (hợp tác bên ngoài)', 'Đối tác khởi nghiệp', 'Cuộc thi ý tưởng', 'Nền tảng gọi vốn cộng đồng'], correct: 0 } },
      { word: 'Startup partnership', phonetic: '/ˈstɑːrtʌp ˈpɑːrtnərʃɪp/', meaning: 'Quan hệ đối tác với công ty khởi nghiệp', quiz: { options: ['Cuộc thi ý tưởng', 'Quan hệ đối tác với công ty khởi nghiệp', 'Đổi mới mở', 'Nền tảng gọi vốn'], correct: 1 } },
      { word: 'Hackathon',     phonetic: '/ˈhækəθɒn/',       meaning: 'Cuộc thi lập trình/ý tưởng tốc độ', quiz: { options: ['Đổi mới mở', 'Quan hệ đối tác khởi nghiệp', 'Cuộc thi lập trình/ý tưởng tốc độ', 'Nền tảng gọi vốn'], correct: 2 } },
      { word: 'Crowdsourcing', phonetic: '/ˈkraʊdsɔːrsɪŋ/',  meaning: 'Huy động ý tưởng/nguồn lực từ đám đông', quiz: { options: ['Cuộc thi ý tưởng', 'Nền tảng gọi vốn', 'Quan hệ đối tác khởi nghiệp', 'Huy động ý tưởng/nguồn lực từ đám đông'], correct: 3 } },
      { word: 'Proof of concept', phonetic: '/pruːf əv ˈkɒnsept/', meaning: 'Bằng chứng khả thi ban đầu', quiz: { options: ['Huy động ý tưởng từ đám đông', 'Bằng chứng khả thi ban đầu', 'Đổi mới mở', 'Cuộc thi ý tưởng'], correct: 1 } },
    ],
    reading: {
      title: 'Innovating Beyond Company Walls',
      passage: 'Rather than relying solely on internal R&D, Long championed open innovation, forming several startup partnerships with promising local founders. The company also organized an annual hackathon, crowdsourcing fresh ideas from students and engineers outside the organization. Each winning idea then moved into a short proof of concept phase before receiving further investment.',
      quiz: [
        { q: 'Long ủng hộ cách tiếp cận nào thay vì chỉ dựa vào R&D nội bộ?', options: ['Đổi mới mở với các đối tác khởi nghiệp', 'Đóng cửa hoàn toàn với bên ngoài', 'Mua lại toàn bộ đối thủ', 'Sa thải đội R&D'], correct: 0 },
        { q: 'Công ty tổ chức sự kiện nào hằng năm?', options: ['Một cuộc thi hackathon để huy động ý tưởng từ bên ngoài', 'Một buổi tiệc cuối năm', 'Một cuộc họp cổ đông', 'Một chuyến du lịch nhân viên'], correct: 0 },
      ],
    },
    listening: [
      'We embraced open innovation to grow faster.',
      'The company formed several startup partnerships.',
      'This year\'s hackathon produced some brilliant ideas.',
      'Crowdsourcing helped us find fresh perspectives.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách công ty có thể áp dụng đổi mới mở (open innovation) thông qua hợp tác với startup bên ngoài.',
      minWords: 50,
      phrases: ['Open innovation allows us to', 'A startup partnership could help us', 'Organizing a hackathon would', 'Crowdsourcing ideas from outside brings'],
      sentenceBuilder: [
        { scrambled: 'Long / (champion) / open innovation / actively', answer: 'Long championed open innovation actively' },
        { scrambled: 'The company / (organize) / an annual hackathon / successfully', answer: 'The company organized an annual hackathon successfully' },
      ],
    },
  },
  { // Day 48
    vocab: [
      { word: 'Innovation pipeline', phonetic: '/ˌɪnəˈveɪʃn ˈpaɪplaɪn/', meaning: 'Quy trình phát triển ý tưởng đổi mới', quiz: { options: ['Quy trình phát triển ý tưởng đổi mới', 'Rào cản gia nhập thị trường', 'Người tiếp nhận sớm', 'Sản phẩm lỗi thời'], correct: 0 } },
      { word: 'Early adopter', phonetic: '/ˈɜːrli əˈdɒptər/', meaning: 'Người dùng tiếp nhận sản phẩm sớm', quiz: { options: ['Rào cản gia nhập', 'Người dùng tiếp nhận sản phẩm sớm', 'Sản phẩm lỗi thời', 'Quy trình phát triển ý tưởng'], correct: 1 } },
      { word: 'Barrier to entry', phonetic: '/ˈbæriər tuː ˈentri/', meaning: 'Rào cản gia nhập thị trường', quiz: { options: ['Người dùng tiếp nhận sớm', 'Sản phẩm lỗi thời', 'Rào cản gia nhập thị trường', 'Quy trình phát triển ý tưởng'], correct: 2 } },
      { word: 'Obsolete',      phonetic: '/ˌɒbsəˈliːt/',     meaning: 'Lỗi thời, lạc hậu', quiz: { options: ['Người dùng tiếp nhận sớm', 'Rào cản gia nhập', 'Quy trình phát triển ý tưởng', 'Lỗi thời, lạc hậu'], correct: 3 } },
      { word: 'Cutting-edge',  phonetic: '/ˈkʌtɪŋ edʒ/',     meaning: 'Tiên tiến nhất, đi đầu công nghệ', quiz: { options: ['Tiên tiến nhất, đi đầu công nghệ', 'Người dùng tiếp nhận sớm', 'Lỗi thời', 'Rào cản gia nhập'], correct: 0 } },
    ],
    reading: {
      title: 'Keeping the Innovation Pipeline Full',
      passage: 'To stay ahead of competitors, Nga made sure the company\'s innovation pipeline always had several cutting-edge projects in various stages of development. Early adopters were invited to test new features before public launch, giving valuable feedback that shaped the final product. Nga warned that failing to innovate consistently would eventually make even market leaders obsolete, no matter how high the barrier to entry once was.',
      quiz: [
        { q: 'Nga đảm bảo điều gì để công ty luôn dẫn đầu?', options: ['Quy trình phát triển ý tưởng đổi mới luôn có nhiều dự án tiên tiến', 'Giá sản phẩm luôn thấp nhất', 'Văn phòng luôn hiện đại nhất', 'Nhân viên luôn đông nhất'], correct: 0 },
        { q: 'Ai được mời thử nghiệm tính năng mới trước khi ra mắt?', options: ['Người dùng tiếp nhận sản phẩm sớm', 'Đối thủ cạnh tranh', 'Nhà đầu tư', 'Chính phủ'], correct: 0 },
      ],
    },
    listening: [
      'Our innovation pipeline is full of exciting projects.',
      'Early adopters gave us valuable feedback.',
      'A high barrier to entry once protected this market.',
      'This technology could soon become obsolete.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích cách công ty duy trì quy trình đổi mới (innovation pipeline) liên tục để không bị lỗi thời.',
      minWords: 50,
      phrases: ['Our innovation pipeline includes', 'Early adopters help us by', 'The barrier to entry in this market is', 'Without innovation, we risk becoming obsolete'],
      sentenceBuilder: [
        { scrambled: 'Nga / (keep) / the pipeline full / of new projects', answer: 'Nga kept the pipeline full of new projects' },
        { scrambled: 'Early adopters / (test) / new features / before launch', answer: 'Early adopters tested new features before launch' },
      ],
    },
  },
  { // Day 49 — Chủ đề: ESG & phát triển bền vững
    vocab: [
      { word: 'Carbon-neutral', phonetic: '/ˈkɑːrbən ˈnjuːtrəl/', meaning: 'Trung hòa carbon', quiz: { options: ['Trung hòa carbon', 'Dấu chân sinh thái', 'Trách nhiệm quản lý (môi trường)', 'Chuỗi cung ứng có đạo đức'], correct: 0 } },
      { word: 'Carbon footprint', phonetic: '/ˈkɑːrbən ˈfʊtprɪnt/', meaning: 'Dấu chân carbon (khí thải)', quiz: { options: ['Trung hòa carbon', 'Dấu chân carbon (khí thải)', 'Trách nhiệm quản lý', 'Chuỗi cung ứng đạo đức'], correct: 1 } },
      { word: 'Stewardship',   phonetic: '/ˈstjuːərdʃɪp/',   meaning: 'Trách nhiệm quản lý, gìn giữ (môi trường/tài nguyên)', quiz: { options: ['Dấu chân carbon', 'Chuỗi cung ứng đạo đức', 'Trách nhiệm quản lý, gìn giữ (môi trường/tài nguyên)', 'Trung hòa carbon'], correct: 2 } },
      { word: 'Ethical sourcing', phonetic: '/ˈeθɪkl ˈsɔːrsɪŋ/', meaning: 'Nguồn cung ứng có đạo đức', quiz: { options: ['Trách nhiệm quản lý', 'Nguồn cung ứng có đạo đức', 'Dấu chân carbon', 'Trung hòa carbon'], correct: 1 } },
      { word: 'Sustainability report', phonetic: '/səˌsteɪnəˈbɪləti rɪˈpɔːrt/', meaning: 'Báo cáo phát triển bền vững', quiz: { options: ['Báo cáo phát triển bền vững', 'Trung hòa carbon', 'Trách nhiệm quản lý', 'Nguồn cung ứng đạo đức'], correct: 0 } },
    ],
    reading: {
      title: 'Committing to a Carbon-Neutral Future',
      passage: 'The company pledged to become fully carbon-neutral by 2030, publishing its carbon footprint transparently in its annual sustainability report. Nga, the head of ESG, emphasized environmental stewardship as a core corporate value rather than a marketing slogan. The firm also revised its procurement policy to require ethical sourcing of raw materials from all suppliers worldwide.',
      quiz: [
        { q: 'Công ty cam kết điều gì vào năm 2030?', options: ['Trở nên hoàn toàn trung hòa carbon', 'Tăng gấp đôi lợi nhuận', 'Mở rộng ra 50 quốc gia', 'Sa thải một nửa nhân viên'], correct: 0 },
        { q: 'Công ty đã sửa đổi chính sách gì?', options: ['Chính sách thu mua yêu cầu nguồn cung ứng có đạo đức', 'Chính sách lương thưởng', 'Chính sách nghỉ phép', 'Chính sách bảo hiểm y tế'], correct: 0 },
      ],
    },
    listening: [
      'We pledged to become carbon-neutral by 2030.',
      'Our carbon footprint is published transparently.',
      'Environmental stewardship is a core value here.',
      'We require ethical sourcing from all our suppliers.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất kế hoạch để công ty trở nên trung hòa carbon (carbon-neutral) trong vòng 10 năm.',
      minWords: 50,
      phrases: ['We pledge to become carbon-neutral by', 'Our carbon footprint can be reduced through', 'Environmental stewardship means', 'Ethical sourcing ensures that'],
      sentenceBuilder: [
        { scrambled: 'The company / (pledge) / to become carbon-neutral / by 2030', answer: 'The company pledged to become carbon-neutral by 2030' },
        { scrambled: 'Nga / (emphasize) / environmental stewardship / consistently', answer: 'Nga emphasized environmental stewardship consistently' },
      ],
    },
  },
  { // Day 50
    vocab: [
      { word: 'Corporate governance', phonetic: '/ˈkɔːrpərət ˈɡʌvərnəns/', meaning: 'Quản trị doanh nghiệp', quiz: { options: ['Quản trị doanh nghiệp', 'Trách nhiệm xã hội doanh nghiệp', 'Đầu tư có tác động tích cực', 'Tiêu chuẩn lao động công bằng'], correct: 0 } },
      { word: 'Corporate social responsibility', phonetic: '/ˈkɔːrpərət ˈsoʊʃl rɪˌspɒnsəˈbɪləti/', meaning: 'Trách nhiệm xã hội doanh nghiệp (CSR)', quiz: { options: ['Đầu tư có tác động tích cực', 'Tiêu chuẩn lao động', 'Trách nhiệm xã hội doanh nghiệp (CSR)', 'Quản trị doanh nghiệp'], correct: 2 } },
      { word: 'Impact investing', phonetic: '/ˈɪmpækt ɪnˈvestɪŋ/', meaning: 'Đầu tư có tác động tích cực xã hội', quiz: { options: ['Quản trị doanh nghiệp', 'Trách nhiệm xã hội', 'Tiêu chuẩn lao động', 'Đầu tư có tác động tích cực xã hội'], correct: 3 } },
      { word: 'Fair labor standards', phonetic: '/feər ˈleɪbər ˈstændərdz/', meaning: 'Tiêu chuẩn lao động công bằng', quiz: { options: ['Tiêu chuẩn lao động công bằng', 'Đầu tư có tác động tích cực', 'Quản trị doanh nghiệp', 'Trách nhiệm xã hội'], correct: 0 } },
      { word: 'Greenwashing',  phonetic: '/ˈɡriːnwɒʃɪŋ/',    meaning: 'Tẩy xanh (giả vờ thân thiện môi trường)', quiz: { options: ['Tiêu chuẩn lao động', 'Đầu tư có tác động tích cực', 'Quản trị doanh nghiệp', 'Tẩy xanh (giả vờ thân thiện môi trường)'], correct: 3 } },
    ],
    reading: {
      title: 'Avoiding the Trap of Greenwashing',
      passage: 'Strong corporate governance requires more than a compliant board; it demands genuine accountability to shareholders and society alike. Bình worried that some competitors were guilty of greenwashing, exaggerating their environmental efforts to attract impact investing without real substance behind their claims. To avoid this trap, the company published verified data on fair labor standards alongside its corporate social responsibility initiatives.',
      quiz: [
        { q: 'Quản trị doanh nghiệp mạnh mẽ đòi hỏi điều gì hơn là một hội đồng tuân thủ?', options: ['Trách nhiệm giải trình thực sự với cổ đông và xã hội', 'Lợi nhuận cao nhất có thể', 'Văn phòng đẹp nhất', 'Nhiều nhân viên nhất'], correct: 0 },
        { q: 'Bình lo ngại đối thủ đang làm gì?', options: ['Tẩy xanh, phóng đại nỗ lực môi trường', 'Giảm giá quá mức', 'Sa thải nhân viên hàng loạt', 'Trốn thuế'], correct: 0 },
      ],
    },
    listening: [
      'Strong corporate governance builds long-term trust.',
      'We must avoid any accusation of greenwashing.',
      'Impact investing is growing rapidly worldwide.',
      'Fair labor standards protect workers everywhere.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích sự khác biệt giữa trách nhiệm xã hội doanh nghiệp (CSR) thực sự và hành vi tẩy xanh (greenwashing).',
      minWords: 50,
      phrases: ['Strong corporate governance requires', 'Greenwashing occurs when companies', 'Impact investing focuses on', 'Fair labor standards ensure that'],
      sentenceBuilder: [
        { scrambled: 'The company / (publish) / verified data / on labor standards', answer: 'The company published verified data on labor standards' },
        { scrambled: 'Bình / (worry) / about greenwashing / among competitors', answer: 'Bình worried about greenwashing among competitors' },
      ],
    },
  },
  { // Day 51
    vocab: [
      { word: 'Circular economy', phonetic: '/ˈsɜːrkjələr ɪˈkɒnəmi/', meaning: 'Kinh tế tuần hoàn', quiz: { options: ['Kinh tế tuần hoàn', 'Giảm thiểu rác thải', 'Nguồn năng lượng tái tạo', 'Chuỗi giá trị bền vững'], correct: 0 } },
      { word: 'Waste reduction', phonetic: '/weɪst rɪˈdʌkʃn/', meaning: 'Giảm thiểu rác thải', quiz: { options: ['Kinh tế tuần hoàn', 'Giảm thiểu rác thải', 'Nguồn năng lượng tái tạo', 'Chuỗi giá trị bền vững'], correct: 1 } },
      { word: 'Renewable energy', phonetic: '/rɪˈnjuːəbl ˈenərdʒi/', meaning: 'Năng lượng tái tạo', quiz: { options: ['Giảm thiểu rác thải', 'Chuỗi giá trị bền vững', 'Năng lượng tái tạo', 'Kinh tế tuần hoàn'], correct: 2 } },
      { word: 'Sustainable value chain', phonetic: '/səˈsteɪnəbl ˈvæljuː tʃeɪn/', meaning: 'Chuỗi giá trị bền vững', quiz: { options: ['Chuỗi giá trị bền vững', 'Giảm thiểu rác thải', 'Kinh tế tuần hoàn', 'Năng lượng tái tạo'], correct: 0 } },
      { word: 'Biodegradable',  phonetic: '/ˌbaɪoʊdɪˈɡreɪdəbl/', meaning: 'Có thể phân hủy sinh học', quiz: { options: ['Năng lượng tái tạo', 'Kinh tế tuần hoàn', 'Có thể phân hủy sinh học', 'Giảm thiểu rác thải'], correct: 2 } },
    ],
    reading: {
      title: 'Building a Sustainable Value Chain',
      passage: 'The factory transitioned to renewable energy sources, cutting its reliance on coal-fired power by over sixty percent within two years. Khánh championed the principles of a circular economy, redesigning packaging to be fully biodegradable and encouraging customers to return products for recycling. These waste reduction efforts became the foundation of a genuinely sustainable value chain, from raw material to final disposal.',
      quiz: [
        { q: 'Nhà máy đã chuyển sang nguồn gì trong 2 năm?', options: ['Năng lượng tái tạo', 'Nhân công giá rẻ hơn', 'Nguyên liệu nhập khẩu', 'Máy móc cũ hơn'], correct: 0 },
        { q: 'Khánh đã làm gì với bao bì sản phẩm?', options: ['Thiết kế lại để có thể phân hủy sinh học hoàn toàn', 'Làm bao bì đắt tiền hơn', 'Loại bỏ bao bì hoàn toàn', 'Nhập khẩu bao bì từ nước ngoài'], correct: 0 },
      ],
    },
    listening: [
      'The factory now runs on renewable energy.',
      'We embraced the principles of a circular economy.',
      'Our new packaging is fully biodegradable.',
      'Waste reduction is part of our sustainable value chain.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách công ty áp dụng nguyên tắc kinh tế tuần hoàn (circular economy) vào sản xuất.',
      minWords: 50,
      phrases: ['Adopting a circular economy means', 'We transitioned to renewable energy by', 'Our waste reduction efforts include', 'This creates a truly sustainable value chain'],
      sentenceBuilder: [
        { scrambled: 'The factory / (transition) / to renewable energy / gradually', answer: 'The factory transitioned to renewable energy gradually' },
        { scrambled: 'Khánh / (redesign) / the packaging / to be biodegradable', answer: 'Khánh redesigned the packaging to be biodegradable' },
      ],
    },
  },
  { // Day 52
    vocab: [
      { word: 'ESG criteria',  phonetic: '/iː es dʒiː kraɪˈtɪəriə/', meaning: 'Tiêu chí ESG (Môi trường, Xã hội, Quản trị)', quiz: { options: ['Tiêu chí ESG (Môi trường, Xã hội, Quản trị)', 'Trái phiếu xanh', 'Đầu tư có trách nhiệm', 'Kiểm toán bền vững'], correct: 0 } },
      { word: 'Green bond',    phonetic: '/ɡriːn bɒnd/',     meaning: 'Trái phiếu xanh', quiz: { options: ['Đầu tư có trách nhiệm', 'Trái phiếu xanh', 'Tiêu chí ESG', 'Kiểm toán bền vững'], correct: 1 } },
      { word: 'Responsible investing', phonetic: '/rɪˈspɒnsəbl ɪnˈvestɪŋ/', meaning: 'Đầu tư có trách nhiệm', quiz: { options: ['Trái phiếu xanh', 'Kiểm toán bền vững', 'Đầu tư có trách nhiệm', 'Tiêu chí ESG'], correct: 2 } },
      { word: 'Sustainability audit', phonetic: '/səˌsteɪnəˈbɪləti ˈɔːdɪt/', meaning: 'Kiểm toán bền vững', quiz: { options: ['Tiêu chí ESG', 'Đầu tư có trách nhiệm', 'Trái phiếu xanh', 'Kiểm toán bền vững'], correct: 3 } },
      { word: 'Net-zero',      phonetic: '/net ˈzɪəroʊ/',    meaning: 'Phát thải ròng bằng không', quiz: { options: ['Kiểm toán bền vững', 'Phát thải ròng bằng không', 'Trái phiếu xanh', 'Đầu tư có trách nhiệm'], correct: 1 } },
    ],
    reading: {
      title: 'Meeting Investors\' ESG Expectations',
      passage: 'Institutional investors increasingly evaluate companies against strict ESG criteria before committing capital, favoring firms with a credible path to net-zero emissions. To attract this responsible investing capital, the company issued its first green bond, dedicating the proceeds entirely to clean energy projects. An independent sustainability audit later confirmed the funds had been used exactly as promised.',
      quiz: [
        { q: 'Các nhà đầu tư tổ chức ngày càng đánh giá công ty dựa trên điều gì?', options: ['Tiêu chí ESG nghiêm ngặt', 'Giá cổ phiếu hiện tại', 'Số lượng chi nhánh', 'Tuổi của công ty'], correct: 0 },
        { q: 'Công ty đã phát hành gì để thu hút vốn đầu tư có trách nhiệm?', options: ['Trái phiếu xanh đầu tiên', 'Cổ phiếu ưu đãi', 'Chứng chỉ tiền gửi', 'Cổ phiếu quỹ'], correct: 0 },
      ],
    },
    listening: [
      'Investors now evaluate companies against ESG criteria.',
      'We issued our first green bond this year.',
      'Responsible investing is growing rapidly.',
      'A sustainability audit confirmed our progress toward net-zero.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích cách một công ty có thể thu hút vốn đầu tư có trách nhiệm (responsible investing) thông qua ESG.',
      minWords: 50,
      phrases: ['Meeting ESG criteria helps us attract', 'We issued a green bond to fund', 'Responsible investing capital favors companies that', 'A sustainability audit confirmed'],
      sentenceBuilder: [
        { scrambled: 'The company / (issue) / its first green bond / this year', answer: 'The company issued its first green bond this year' },
        { scrambled: 'The audit / (confirm) / the company\'s progress / toward net-zero', answer: 'The audit confirmed the company\'s progress toward net-zero' },
      ],
    },
  },
  { // Day 53
    vocab: [
      { word: 'Social impact',  phonetic: '/ˈsoʊʃl ˈɪmpækt/', meaning: 'Tác động xã hội', quiz: { options: ['Tác động xã hội', 'Chương trình cộng đồng', 'Trách nhiệm giải trình về khí hậu', 'Chuỗi cung ứng minh bạch'], correct: 0 } },
      { word: 'Community outreach', phonetic: '/kəˈmjuːnəti ˈaʊtriːtʃ/', meaning: 'Chương trình tiếp cận cộng đồng', quiz: { options: ['Tác động xã hội', 'Chương trình tiếp cận cộng đồng', 'Trách nhiệm khí hậu', 'Chuỗi cung ứng minh bạch'], correct: 1 } },
      { word: 'Climate accountability', phonetic: '/ˈklaɪmət əˌkaʊntəˈbɪləti/', meaning: 'Trách nhiệm giải trình về khí hậu', quiz: { options: ['Chương trình cộng đồng', 'Chuỗi cung ứng minh bạch', 'Trách nhiệm giải trình về khí hậu', 'Tác động xã hội'], correct: 2 } },
      { word: 'Supply chain transparency', phonetic: '/səˈplaɪ tʃeɪn trænsˈpærənsi/', meaning: 'Sự minh bạch trong chuỗi cung ứng', quiz: { options: ['Trách nhiệm khí hậu', 'Tác động xã hội', 'Chương trình cộng đồng', 'Sự minh bạch trong chuỗi cung ứng'], correct: 3 } },
      { word: 'Philanthropic',  phonetic: '/ˌfɪlənˈθrɒpɪk/', meaning: 'Mang tính từ thiện', quiz: { options: ['Mang tính từ thiện', 'Trách nhiệm khí hậu', 'Chuỗi cung ứng minh bạch', 'Tác động xã hội'], correct: 0 } },
    ],
    reading: {
      title: 'Measuring What Truly Matters',
      passage: 'Duy believed that measuring social impact required more than counting philanthropic donations at year-end galas. The company launched a genuine community outreach program in rural provinces, training local workers in digital skills alongside its charitable giving. It also embraced full supply chain transparency and stronger climate accountability, publishing data that regulators and customers could independently verify.',
      quiz: [
        { q: 'Duy tin rằng việc đo lường tác động xã hội cần điều gì?', options: ['Nhiều hơn là chỉ đếm các khoản quyên góp từ thiện', 'Chỉ cần tổ chức một buổi gala lớn', 'Chỉ cần thông cáo báo chí', 'Chỉ cần logo mới'], correct: 0 },
        { q: 'Công ty đã công bố dữ liệu gì để cơ quan quản lý có thể xác minh?', options: ['Sự minh bạch chuỗi cung ứng và trách nhiệm khí hậu', 'Lương của từng nhân viên', 'Bí mật kinh doanh', 'Danh sách khách hàng'], correct: 0 },
      ],
    },
    listening: [
      'We measure social impact beyond just donations.',
      'Our community outreach program reaches rural provinces.',
      'Climate accountability means publishing verifiable data.',
      'Supply chain transparency builds customer trust.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách công ty có thể đo lường tác động xã hội (social impact) một cách thực chất, không chỉ mang tính hình thức.',
      minWords: 50,
      phrases: ['Measuring social impact requires more than', 'Our community outreach program focuses on', 'Climate accountability means we must', 'Supply chain transparency allows customers to'],
      sentenceBuilder: [
        { scrambled: 'The company / (launch) / a community outreach program / recently', answer: 'The company launched a community outreach program recently' },
        { scrambled: 'Duy / (believe) / in measuring / real social impact', answer: 'Duy believed in measuring real social impact' },
      ],
    },
  },
  { // Day 54 — Chủ đề: Lãnh đạo đa văn hóa
    vocab: [
      { word: 'Empathy',       phonetic: '/ˈempəθi/',        meaning: 'Sự đồng cảm', quiz: { options: ['Sự đồng cảm', 'Khả năng thích ứng', 'Sự tin tưởng lẫn nhau', 'Hệ thống cấp bậc'], correct: 0 } },
      { word: 'Adaptability',  phonetic: '/əˌdæptəˈbɪləti/', meaning: 'Khả năng thích ứng', quiz: { options: ['Sự tin tưởng lẫn nhau', 'Khả năng thích ứng', 'Sự đồng cảm', 'Hệ thống cấp bậc'], correct: 1 } },
      { word: 'Rapport',       phonetic: '/ræˈpɔːr/',        meaning: 'Sự tin tưởng, gắn kết (trong quan hệ)', quiz: { options: ['Hệ thống cấp bậc', 'Sự đồng cảm', 'Sự tin tưởng, gắn kết (trong quan hệ)', 'Khả năng thích ứng'], correct: 2 } },
      { word: 'Hierarchy',     phonetic: '/ˈhaɪərɑːrki/',    meaning: 'Hệ thống cấp bậc', quiz: { options: ['Khả năng thích ứng', 'Hệ thống cấp bậc', 'Sự tin tưởng', 'Sự đồng cảm'], correct: 1 } },
      { word: 'Etiquette',     phonetic: '/ˈetɪkət/',        meaning: 'Phép tắc ứng xử, nghi thức', quiz: { options: ['Phép tắc ứng xử, nghi thức', 'Hệ thống cấp bậc', 'Sự đồng cảm', 'Khả năng thích ứng'], correct: 0 } },
    ],
    reading: {
      title: 'Leading Teams Across Cultures',
      passage: 'When Hương took charge of a team spanning Vietnam, Japan, and Germany, she quickly realized that leadership required deep cultural empathy rather than a one-size-fits-all approach. Her adaptability helped her build genuine rapport with each subsidiary, respecting that some cultures valued strict hierarchy while others preferred flat structures. She also studied local business etiquette carefully before every overseas trip to avoid unintended offense.',
      quiz: [
        { q: 'Hương nhận ra lãnh đạo đa văn hóa cần điều gì?', options: ['Sự đồng cảm văn hóa sâu sắc thay vì một cách tiếp cận chung', 'Chỉ cần nói tiếng Anh giỏi', 'Chỉ cần đi công tác nhiều', 'Chỉ cần có bằng MBA'], correct: 0 },
        { q: 'Hương đã làm gì trước mỗi chuyến công tác nước ngoài?', options: ['Nghiên cứu kỹ phép tắc ứng xử địa phương', 'Đặt vé máy bay hạng nhất', 'Học ngôn ngữ mới trong 1 ngày', 'Mang theo toàn bộ đội ngũ'], correct: 0 },
      ],
    },
    listening: [
      'Cultural empathy is essential for global leaders.',
      'Her adaptability helped her connect with every team.',
      'They built strong rapport over several meetings.',
      'Understanding local etiquette prevents misunderstandings.',
    ],
    writing: {
      prompt: 'Viết đoạn văn về những kỹ năng cần thiết để lãnh đạo một đội nhóm đa văn hóa (cross-cultural team) hiệu quả.',
      minWords: 50,
      phrases: ['Leading across cultures requires empathy because', 'Adaptability helps leaders by', 'Building rapport with international teams means', 'Understanding local etiquette is important because'],
      sentenceBuilder: [
        { scrambled: 'Hương / (build) / genuine rapport / with each subsidiary', answer: 'Hương built genuine rapport with each subsidiary' },
        { scrambled: 'She / (study) / local etiquette / carefully', answer: 'She studied local etiquette carefully' },
      ],
    },
  },
  { // Day 55
    vocab: [
      { word: 'Cross-cultural competence', phonetic: '/krɒs ˈkʌltʃərəl ˈkɒmpɪtəns/', meaning: 'Năng lực đa văn hóa', quiz: { options: ['Năng lực đa văn hóa', 'Giao tiếp gián tiếp', 'Giao tiếp trực tiếp', 'Định hướng thời gian'], correct: 0 } },
      { word: 'Indirect communication', phonetic: '/ˌɪndɪˈrekt kəˌmjuːnɪˈkeɪʃn/', meaning: 'Giao tiếp gián tiếp', quiz: { options: ['Năng lực đa văn hóa', 'Giao tiếp gián tiếp', 'Giao tiếp trực tiếp', 'Định hướng thời gian'], correct: 1 } },
      { word: 'Direct communication', phonetic: '/dəˈrekt kəˌmjuːnɪˈkeɪʃn/', meaning: 'Giao tiếp trực tiếp, thẳng thắn', quiz: { options: ['Giao tiếp gián tiếp', 'Giao tiếp trực tiếp, thẳng thắn', 'Năng lực đa văn hóa', 'Định hướng thời gian'], correct: 1 } },
      { word: 'Time orientation', phonetic: '/taɪm ˌɔːriənˈteɪʃn/', meaning: 'Định hướng/quan niệm về thời gian', quiz: { options: ['Giao tiếp trực tiếp', 'Định hướng/quan niệm về thời gian', 'Năng lực đa văn hóa', 'Giao tiếp gián tiếp'], correct: 1 } },
      { word: 'Cultural sensitivity', phonetic: '/ˈkʌltʃərəl ˌsensəˈtɪvəti/', meaning: 'Sự nhạy cảm văn hóa', quiz: { options: ['Định hướng thời gian', 'Giao tiếp trực tiếp', 'Giao tiếp gián tiếp', 'Sự nhạy cảm văn hóa'], correct: 3 } },
    ],
    reading: {
      title: 'When "Yes" Doesn\'t Always Mean Yes',
      passage: 'Việt learned early in his career that developing cross-cultural competence meant understanding subtle differences in communication style. In some markets, indirect communication was preferred to preserve harmony, while Western partners often expected blunt, direct communication instead. He also had to adjust to differing views on time orientation, since punctuality carried different weight across the regions where his company operated, always applying cultural sensitivity in every interaction.',
      quiz: [
        { q: 'Việt học được điều gì sớm trong sự nghiệp?', options: ['Phát triển năng lực đa văn hóa nghĩa là hiểu sự khác biệt trong giao tiếp', 'Chỉ cần biết ngoại ngữ', 'Chỉ cần đi công tác nhiều nơi', 'Chỉ cần có bằng cấp cao'], correct: 0 },
        { q: 'Một số thị trường ưa chuộng kiểu giao tiếp nào để giữ sự hòa hợp?', options: ['Giao tiếp gián tiếp', 'Giao tiếp cực kỳ thẳng thắn', 'Giao tiếp bằng văn bản duy nhất', 'Giao tiếp qua người thứ ba'], correct: 0 },
      ],
    },
    listening: [
      'Developing cross-cultural competence takes years of practice.',
      'Indirect communication is common in many Asian cultures.',
      'Western partners often prefer direct communication.',
      'Time orientation varies significantly across cultures.',
    ],
    writing: {
      prompt: 'Viết đoạn văn so sánh phong cách giao tiếp trực tiếp (direct) và gián tiếp (indirect) trong môi trường làm việc đa văn hóa.',
      minWords: 50,
      phrases: ['Cross-cultural competence involves understanding', 'Indirect communication is often used to', 'Direct communication can be perceived as', 'Cultural sensitivity requires us to'],
      sentenceBuilder: [
        { scrambled: 'Việt / (learn) / cross-cultural competence / early in his career', answer: 'Việt learned cross-cultural competence early in his career' },
        { scrambled: 'He / (adjust) / to different / time orientations', answer: 'He adjusted to different time orientations' },
      ],
    },
  },
  { // Day 56
    vocab: [
      { word: 'Global mindset', phonetic: '/ˈɡloʊbl ˈmaɪndset/', meaning: 'Tư duy toàn cầu', quiz: { options: ['Tư duy toàn cầu', 'Đội ngũ phân tán địa lý', 'Sự thấu hiểu bối cảnh văn hóa', 'Phong cách quản lý theo vùng'], correct: 0 } },
      { word: 'Distributed team', phonetic: '/dɪˈstrɪbjuːtɪd tiːm/', meaning: 'Đội ngũ phân tán về địa lý', quiz: { options: ['Tư duy toàn cầu', 'Đội ngũ phân tán về địa lý', 'Sự thấu hiểu bối cảnh', 'Phong cách quản lý theo vùng'], correct: 1 } },
      { word: 'Contextual awareness', phonetic: '/kənˈtekstʃuəl əˈweərnəs/', meaning: 'Sự thấu hiểu bối cảnh (văn hóa, tình huống)', quiz: { options: ['Đội ngũ phân tán', 'Phong cách quản lý theo vùng', 'Sự thấu hiểu bối cảnh (văn hóa, tình huống)', 'Tư duy toàn cầu'], correct: 2 } },
      { word: 'Regional management style', phonetic: '/ˈriːdʒənl ˈmænɪdʒmənt staɪl/', meaning: 'Phong cách quản lý theo vùng', quiz: { options: ['Sự thấu hiểu bối cảnh', 'Phong cách quản lý theo vùng', 'Đội ngũ phân tán', 'Tư duy toàn cầu'], correct: 1 } },
      { word: 'Inclusive leadership', phonetic: '/ɪnˈkluːsɪv ˈliːdərʃɪp/', meaning: 'Lãnh đạo mang tính hòa nhập', quiz: { options: ['Lãnh đạo mang tính hòa nhập', 'Phong cách quản lý theo vùng', 'Đội ngũ phân tán', 'Tư duy toàn cầu'], correct: 0 } },
    ],
    reading: {
      title: 'Managing a Truly Global Team',
      passage: 'Leading a distributed team across four time zones required Trâm to develop a genuine global mindset rather than simply exporting her local management habits. She practiced contextual awareness in every video call, recognizing that a regional management style effective in Vietnam might feel too hierarchical for her European colleagues. Her commitment to inclusive leadership ensured that even quieter team members from different cultures felt comfortable speaking up.',
      quiz: [
        { q: 'Trâm cần phát triển điều gì để lãnh đạo đội ngũ phân tán?', options: ['Tư duy toàn cầu thực sự', 'Chỉ cần nói được 5 ngôn ngữ', 'Chỉ cần đi công tác thường xuyên', 'Chỉ cần thăng chức nhanh'], correct: 0 },
        { q: 'Cam kết lãnh đạo hòa nhập của Trâm mang lại kết quả gì?', options: ['Thành viên nhóm ít nói cũng cảm thấy thoải mái lên tiếng', 'Mọi người phải làm việc nhiều giờ hơn', 'Chỉ những người giỏi nhất được phát biểu', 'Các cuộc họp bị hủy bỏ'], correct: 0 },
      ],
    },
    listening: [
      'Managing a global team requires a global mindset.',
      'Our distributed team spans four time zones.',
      'Contextual awareness helps avoid misunderstandings.',
      'Inclusive leadership gives everyone a voice.',
    ],
    writing: {
      prompt: 'Viết đoạn văn về cách phát triển tư duy toàn cầu (global mindset) khi quản lý một đội ngũ phân tán (distributed team).',
      minWords: 50,
      phrases: ['A global mindset means we should', 'Managing a distributed team requires', 'Contextual awareness helps us by', 'Inclusive leadership ensures that'],
      sentenceBuilder: [
        { scrambled: 'Trâm / (develop) / a genuine global mindset / over time', answer: 'Trâm developed a genuine global mindset over time' },
        { scrambled: 'She / (practice) / contextual awareness / in every call', answer: 'She practiced contextual awareness in every call' },
      ],
    },
  },
  { // Day 57
    vocab: [
      { word: 'Expatriate',    phonetic: '/ekˈspætrieɪt/',   meaning: 'Người làm việc xa xứ, chuyên gia nước ngoài', quiz: { options: ['Người làm việc xa xứ, chuyên gia nước ngoài', 'Cú sốc văn hóa', 'Khả năng hòa nhập', 'Chuyển giao kiến thức'], correct: 0 } },
      { word: 'Culture shock', phonetic: '/ˈkʌltʃər ʃɒk/',    meaning: 'Cú sốc văn hóa', quiz: { options: ['Chuyển giao kiến thức', 'Cú sốc văn hóa', 'Người làm việc xa xứ', 'Khả năng hòa nhập'], correct: 1 } },
      { word: 'Assimilation',  phonetic: '/əˌsɪmɪˈleɪʃn/',   meaning: 'Sự hòa nhập (văn hóa)', quiz: { options: ['Cú sốc văn hóa', 'Chuyển giao kiến thức', 'Sự hòa nhập (văn hóa)', 'Người làm việc xa xứ'], correct: 2 } },
      { word: 'Knowledge transfer', phonetic: '/ˈnɒlɪdʒ ˈtrænsfɜːr/', meaning: 'Chuyển giao kiến thức', quiz: { options: ['Sự hòa nhập', 'Chuyển giao kiến thức', 'Cú sốc văn hóa', 'Người làm việc xa xứ'], correct: 1 } },
      { word: 'Repatriation',  phonetic: '/ˌriːpeɪtriˈeɪʃn/', meaning: 'Sự hồi hương (nhân sự)', quiz: { options: ['Chuyển giao kiến thức', 'Cú sốc văn hóa', 'Sự hồi hương (nhân sự)', 'Sự hòa nhập'], correct: 2 } },
    ],
    reading: {
      title: 'Supporting Expatriates Through Every Stage',
      passage: 'When Kiên was sent as an expatriate to lead the Jakarta office, HR provided extensive support to help him manage the initial culture shock. Over eighteen months, his gradual assimilation into local business norms improved knowledge transfer between the regional teams significantly. The company also carefully planned his eventual repatriation, ensuring his hard-won international experience would benefit headquarters back home.',
      quiz: [
        { q: 'HR đã hỗ trợ Kiên điều gì khi anh được cử đi Jakarta?', options: ['Giúp anh vượt qua cú sốc văn hóa ban đầu', 'Chỉ cấp vé máy bay', 'Chỉ trả thêm lương', 'Không hỗ trợ gì cả'], correct: 0 },
        { q: 'Công ty đã lên kế hoạch cho điều gì khi Kiên trở về?', options: ['Sự hồi hương của anh để tận dụng kinh nghiệm quốc tế', 'Sa thải anh ngay khi về nước', 'Giảm lương của anh', 'Chuyển anh sang bộ phận khác không liên quan'], correct: 0 },
      ],
    },
    listening: [
      'Expatriates often need extra support in a new country.',
      'Culture shock is common during the first few months.',
      'His assimilation into the local culture took time.',
      'Knowledge transfer between teams improved significantly.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách công ty nên hỗ trợ nhân viên làm việc xa xứ (expatriate) vượt qua cú sốc văn hóa (culture shock).',
      minWords: 50,
      phrases: ['Expatriates often experience culture shock when', 'HR can support assimilation by', 'Knowledge transfer between teams improves when', 'Planning for repatriation ensures that'],
      sentenceBuilder: [
        { scrambled: 'Kiên / (manage) / the initial culture shock / gradually', answer: 'Kiên managed the initial culture shock gradually' },
        { scrambled: 'The company / (plan) / his repatriation / carefully', answer: 'The company planned his repatriation carefully' },
      ],
    },
  },
  { // Day 58
    vocab: [
      { word: 'Power distance', phonetic: '/ˈpaʊər ˈdɪstəns/', meaning: 'Khoảng cách quyền lực (văn hóa)', quiz: { options: ['Khoảng cách quyền lực (văn hóa)', 'Chủ nghĩa tập thể', 'Sự đối đầu (xung đột)', 'Giải quyết xung đột'], correct: 0 } },
      { word: 'Collectivism',  phonetic: '/kəˈlektɪvɪzəm/',  meaning: 'Chủ nghĩa tập thể', quiz: { options: ['Sự đối đầu', 'Chủ nghĩa tập thể', 'Khoảng cách quyền lực', 'Giải quyết xung đột'], correct: 1 } },
      { word: 'Confrontation', phonetic: '/ˌkɒnfrənˈteɪʃn/', meaning: 'Sự đối đầu, xung đột trực diện', quiz: { options: ['Chủ nghĩa tập thể', 'Khoảng cách quyền lực', 'Sự đối đầu, xung đột trực diện', 'Giải quyết xung đột'], correct: 2 } },
      { word: 'Conflict resolution', phonetic: '/ˈkɒnflɪkt ˌrezəˈluːʃn/', meaning: 'Giải quyết xung đột', quiz: { options: ['Sự đối đầu', 'Giải quyết xung đột', 'Khoảng cách quyền lực', 'Chủ nghĩa tập thể'], correct: 1 } },
      { word: 'Consensus-building', phonetic: '/kənˈsensəs ˈbɪldɪŋ/', meaning: 'Xây dựng sự đồng thuận', quiz: { options: ['Xây dựng sự đồng thuận', 'Sự đối đầu', 'Khoảng cách quyền lực', 'Chủ nghĩa tập thể'], correct: 0 } },
    ],
    reading: {
      title: 'Managing Conflict Across Cultures',
      passage: 'Phương noticed that her Vietnamese colleagues, shaped by a culture of collectivism and high power distance, often avoided open confrontation with senior leaders. To make conflict resolution effective in this environment, she shifted toward quiet, one-on-one conversations rather than public debate. This consensus-building approach ultimately proved far more successful than the confrontational styles she had used earlier in her career abroad.',
      quiz: [
        { q: 'Phương nhận thấy đồng nghiệp Việt Nam thường tránh điều gì?', options: ['Sự đối đầu công khai với lãnh đạo cấp cao', 'Làm việc nhóm', 'Đi họp đúng giờ', 'Sử dụng email'], correct: 0 },
        { q: 'Phương đã chuyển sang cách tiếp cận nào để giải quyết xung đột?', options: ['Các cuộc trò chuyện riêng, yên tĩnh thay vì tranh luận công khai', 'Tranh luận gay gắt trước toàn công ty', 'Gửi email cảnh cáo', 'Bỏ qua vấn đề hoàn toàn'], correct: 0 },
      ],
    },
    listening: [
      'Power distance affects how people interact with leaders.',
      'Collectivism shapes decision-making in many Asian cultures.',
      'Open confrontation is uncommon in some workplaces.',
      'Consensus-building often works better than direct debate.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách giải quyết xung đột (conflict resolution) phù hợp với văn hóa có khoảng cách quyền lực cao (power distance).',
      minWords: 50,
      phrases: ['In cultures with high power distance, we should', 'Collectivism means employees often prefer', 'Avoiding open confrontation can be addressed by', 'A consensus-building approach works because'],
      sentenceBuilder: [
        { scrambled: 'Phương / (shift) / toward quiet conversations / gradually', answer: 'Phương shifted toward quiet conversations gradually' },
        { scrambled: 'The consensus-building approach / (prove) / more successful / eventually', answer: 'The consensus-building approach proved more successful eventually' },
      ],
    },
  },
  { // Day 59 — Chủ đề: Quan hệ nhà đầu tư
    vocab: [
      { word: 'Disclosure',    phonetic: '/dɪsˈkloʊʒər/',    meaning: 'Sự công bố thông tin', quiz: { options: ['Sự công bố thông tin', 'Sự minh bạch', 'Kết quả kém hơn dự kiến', 'Định hướng tương lai'], correct: 0 } },
      { word: 'Underperform',  phonetic: '/ˌʌndərpərˈfɔːrm/', meaning: 'Có kết quả kém hơn dự kiến', quiz: { options: ['Sự công bố thông tin', 'Sự minh bạch', 'Có kết quả kém hơn dự kiến', 'Định hướng tương lai'], correct: 2 } },
      { word: 'Guidance',      phonetic: '/ˈɡaɪdəns/',       meaning: 'Định hướng, dự báo kết quả tài chính', quiz: { options: ['Sự công bố thông tin', 'Định hướng, dự báo kết quả tài chính', 'Sự minh bạch', 'Kết quả kém hơn'], correct: 1 } },
      { word: 'Shareholder',   phonetic: '/ˈʃeərhoʊldər/',   meaning: 'Cổ đông', quiz: { options: ['Sự minh bạch', 'Cổ đông', 'Định hướng', 'Sự công bố thông tin'], correct: 1 } },
      { word: 'Earnings call', phonetic: '/ˈɜːrnɪŋz kɔːl/',  meaning: 'Cuộc họp công bố kết quả kinh doanh', quiz: { options: ['Cuộc họp công bố kết quả kinh doanh', 'Cổ đông', 'Định hướng', 'Sự công bố thông tin'], correct: 0 } },
    ],
    reading: {
      title: 'Handling a Disappointing Earnings Call',
      passage: 'During the quarterly earnings call, the CFO had to explain why the company underperformed against its own guidance from the previous quarter. Full disclosure of the reasons, including rising material costs, was essential to maintain shareholder confidence. Kiên, the head of investor relations, later admitted that being transparent, even about bad news, ultimately built stronger long-term trust than trying to soften the message.',
      quiz: [
        { q: 'CFO phải giải thích điều gì trong cuộc họp công bố kết quả kinh doanh?', options: ['Vì sao công ty có kết quả kém hơn dự kiến', 'Vì sao công ty tăng trưởng vượt bậc', 'Vì sao cổ phiếu tăng giá', 'Vì sao công ty mở rộng'], correct: 0 },
        { q: 'Kiên nhận ra điều gì về việc minh bạch ngay cả tin xấu?', options: ['Nó xây dựng niềm tin dài hạn mạnh mẽ hơn', 'Nó khiến cổ đông tức giận hơn', 'Nó không có tác dụng gì', 'Nó làm giảm giá cổ phiếu vĩnh viễn'], correct: 0 },
      ],
    },
    listening: [
      'The company underperformed against its own guidance.',
      'Full disclosure is essential during earnings calls.',
      'Shareholders expect transparency, even with bad news.',
      'The next earnings call is scheduled for Thursday.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả cách công ty nên xử lý một cuộc họp công bố kết quả kinh doanh (earnings call) khi kết quả kém hơn dự kiến.',
      minWords: 50,
      phrases: ['We underperformed against our guidance because', 'Full disclosure requires us to explain', 'Shareholders value transparency because', 'This earnings call will focus on'],
      sentenceBuilder: [
        { scrambled: 'The CFO / (explain) / why the company underperformed / clearly', answer: 'The CFO explained why the company underperformed clearly' },
        { scrambled: 'Full disclosure / (build) / shareholder confidence / gradually', answer: 'Full disclosure built shareholder confidence gradually' },
      ],
    },
  },
  { // Day 60
    vocab: [
      { word: 'Institutional investor', phonetic: '/ˌɪnstɪˈtjuːʃənl ɪnˈvestər/', meaning: 'Nhà đầu tư tổ chức', quiz: { options: ['Nhà đầu tư tổ chức', 'Cổ đông tích cực', 'Phân tích viên chứng khoán', 'Định giá cổ phiếu'], correct: 0 } },
      { word: 'Activist shareholder', phonetic: '/ˈæktɪvɪst ˈʃeərhoʊldər/', meaning: 'Cổ đông tích cực (can thiệp quản trị)', quiz: { options: ['Nhà đầu tư tổ chức', 'Cổ đông tích cực (can thiệp quản trị)', 'Phân tích viên chứng khoán', 'Định giá cổ phiếu'], correct: 1 } },
      { word: 'Equity analyst', phonetic: '/ˈekwəti ˈænəlɪst/', meaning: 'Chuyên viên phân tích cổ phiếu', quiz: { options: ['Cổ đông tích cực', 'Định giá cổ phiếu', 'Chuyên viên phân tích cổ phiếu', 'Nhà đầu tư tổ chức'], correct: 2 } },
      { word: 'Share price',   phonetic: '/ʃeər praɪs/',     meaning: 'Giá cổ phiếu', quiz: { options: ['Nhà đầu tư tổ chức', 'Chuyên viên phân tích', 'Cổ đông tích cực', 'Giá cổ phiếu'], correct: 3 } },
      { word: 'Proxy vote',    phonetic: '/ˈprɒksi voʊt/',   meaning: 'Bỏ phiếu ủy quyền (cổ đông)', quiz: { options: ['Bỏ phiếu ủy quyền (cổ đông)', 'Giá cổ phiếu', 'Chuyên viên phân tích', 'Nhà đầu tư tổ chức'], correct: 0 } },
    ],
    reading: {
      title: 'Facing Pressure from Activist Shareholders',
      passage: 'When an activist shareholder demanded a seat on the board, the company braced for a contentious proxy vote at the upcoming annual meeting. Several institutional investors, holding significant blocks of shares, remained undecided on how they would vote. Meanwhile, equity analysts speculated publicly about the potential impact on the company\'s share price if the activist campaign succeeded.',
      quiz: [
        { q: 'Điều gì xảy ra khi một cổ đông tích cực đòi một ghế trong hội đồng quản trị?', options: ['Công ty chuẩn bị cho một cuộc bỏ phiếu ủy quyền gây tranh cãi', 'Công ty ngay lập tức đồng ý', 'Công ty hủy bỏ cuộc họp thường niên', 'Công ty kiện cổ đông đó'], correct: 0 },
        { q: 'Ai đưa ra dự đoán công khai về tác động lên giá cổ phiếu?', options: ['Chuyên viên phân tích cổ phiếu', 'Nhân viên kế toán', 'Bộ phận nhân sự', 'Đối tác cung ứng'], correct: 0 },
      ],
    },
    listening: [
      'An activist shareholder demanded a board seat.',
      'The proxy vote is scheduled for next month.',
      'Institutional investors remain undecided on this issue.',
      'Equity analysts are watching the share price closely.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả cách công ty nên phản ứng khi đối mặt với áp lực từ cổ đông tích cực (activist shareholder).',
      minWords: 50,
      phrases: ['An activist shareholder is demanding', 'Institutional investors will decide how to vote on', 'Equity analysts predict that', 'This could significantly affect our share price'],
      sentenceBuilder: [
        { scrambled: 'The company / (brace) / for a proxy vote / carefully', answer: 'The company braced for a proxy vote carefully' },
        { scrambled: 'Analysts / (speculate) / about the impact / publicly', answer: 'Analysts speculated about the impact publicly' },
      ],
    },
  },
  { // Day 61
    vocab: [
      { word: 'Investor sentiment', phonetic: '/ɪnˈvestər ˈsentɪmənt/', meaning: 'Tâm lý nhà đầu tư', quiz: { options: ['Tâm lý nhà đầu tư', 'Sổ tay quan hệ nhà đầu tư', 'Roadshow gọi vốn', 'Quản trị lợi nhuận'], correct: 0 } },
      { word: 'Investor relations', phonetic: '/ɪnˈvestər rɪˈleɪʃnz/', meaning: 'Bộ phận quan hệ nhà đầu tư', quiz: { options: ['Tâm lý nhà đầu tư', 'Bộ phận quan hệ nhà đầu tư', 'Roadshow gọi vốn', 'Quản trị lợi nhuận'], correct: 1 } },
      { word: 'Roadshow',      phonetic: '/ˈroʊdʃoʊ/',       meaning: 'Chuyến giới thiệu, roadshow gọi vốn', quiz: { options: ['Bộ phận quan hệ nhà đầu tư', 'Roadshow gọi vốn', 'Quản trị lợi nhuận', 'Tâm lý nhà đầu tư'], correct: 1 } },
      { word: 'Earnings management', phonetic: '/ˈɜːrnɪŋz ˈmænɪdʒmənt/', meaning: 'Quản trị lợi nhuận (kế toán)', quiz: { options: ['Tâm lý nhà đầu tư', 'Roadshow', 'Bộ phận quan hệ nhà đầu tư', 'Quản trị lợi nhuận (kế toán)'], correct: 3 } },
      { word: 'Analyst briefing', phonetic: '/ˈænəlɪst ˈbriːfɪŋ/', meaning: 'Buổi báo cáo cho chuyên viên phân tích', quiz: { options: ['Buổi báo cáo cho chuyên viên phân tích', 'Tâm lý nhà đầu tư', 'Roadshow', 'Quản trị lợi nhuận'], correct: 0 } },
    ],
    reading: {
      title: 'Preparing for a Global Investor Roadshow',
      passage: 'Ahead of its planned IPO, the company\'s investor relations team organized an extensive roadshow across Singapore, Hong Kong, and London to gauge investor sentiment. Executives held a detailed analyst briefing, carefully avoiding any hint of aggressive earnings management that might raise red flags. Long, the CFO, emphasized that honest, consistent messaging mattered far more than temporarily impressing skeptical analysts.',
      quiz: [
        { q: 'Đội quan hệ nhà đầu tư đã tổ chức gì trước đợt IPO?', options: ['Một chuyến roadshow qua nhiều thành phố lớn', 'Một bữa tiệc nội bộ', 'Một cuộc thi nội bộ', 'Một buổi đào tạo nhân viên'], correct: 0 },
        { q: 'Long nhấn mạnh điều gì quan trọng hơn việc gây ấn tượng tạm thời?', options: ['Thông điệp trung thực và nhất quán', 'Số liệu tài chính được làm đẹp', 'Lời hứa lợi nhuận cao', 'Quảng cáo rầm rộ'], correct: 0 },
      ],
    },
    listening: [
      'The roadshow will cover three major financial hubs.',
      'Investor sentiment has been mixed this quarter.',
      'The analyst briefing went smoothly overall.',
      'Aggressive earnings management can damage credibility.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả cách công ty chuẩn bị cho một chuyến roadshow gọi vốn (investor roadshow) trước đợt IPO.',
      minWords: 50,
      phrases: ['The roadshow aims to gauge investor sentiment', 'Our investor relations team is preparing', 'The analyst briefing will focus on', 'We avoid aggressive earnings management because'],
      sentenceBuilder: [
        { scrambled: 'The team / (organize) / an extensive roadshow / recently', answer: 'The team organized an extensive roadshow recently' },
        { scrambled: 'Long / (emphasize) / honest messaging / consistently', answer: 'Long emphasized honest messaging consistently' },
      ],
    },
  },
  { // Day 62
    vocab: [
      { word: 'Market capitalization', phonetic: '/ˈmɑːrkɪt ˌkæpɪtəlaɪˈzeɪʃn/', meaning: 'Vốn hóa thị trường', quiz: { options: ['Vốn hóa thị trường', 'Cổ phiếu bị định giá thấp', 'Chỉ số lợi nhuận trên cổ phiếu', 'Phân tích cơ bản'], correct: 0 } },
      { word: 'Undervalued stock', phonetic: '/ˌʌndərˈvæljuːd stɒk/', meaning: 'Cổ phiếu bị định giá thấp', quiz: { options: ['Vốn hóa thị trường', 'Cổ phiếu bị định giá thấp', 'Chỉ số EPS', 'Phân tích cơ bản'], correct: 1 } },
      { word: 'Earnings per share', phonetic: '/ˈɜːrnɪŋz pər ʃeər/', meaning: 'Lợi nhuận trên mỗi cổ phiếu (EPS)', quiz: { options: ['Cổ phiếu bị định giá thấp', 'Vốn hóa thị trường', 'Lợi nhuận trên mỗi cổ phiếu (EPS)', 'Phân tích cơ bản'], correct: 2 } },
      { word: 'Fundamental analysis', phonetic: '/ˌfʌndəˈmentl əˈnæləsɪs/', meaning: 'Phân tích cơ bản (chứng khoán)', quiz: { options: ['Vốn hóa thị trường', 'Cổ phiếu bị định giá thấp', 'Lợi nhuận trên mỗi cổ phiếu', 'Phân tích cơ bản (chứng khoán)'], correct: 3 } },
      { word: 'Buy rating',    phonetic: '/baɪ ˈreɪtɪŋ/',    meaning: 'Khuyến nghị mua (cổ phiếu)', quiz: { options: ['Khuyến nghị mua (cổ phiếu)', 'Phân tích cơ bản', 'Vốn hóa thị trường', 'Cổ phiếu bị định giá thấp'], correct: 0 } },
    ],
    reading: {
      title: 'Spotting an Undervalued Opportunity',
      passage: 'After conducting thorough fundamental analysis, the equity research team concluded that the company\'s stock was significantly undervalued given its strong earnings per share growth. Despite a relatively modest market capitalization compared to competitors, the firm\'s cash flow fundamentals were remarkably solid. The lead analyst subsequently issued a buy rating, predicting the share price would rise considerably once the broader market recognized this discrepancy.',
      quiz: [
        { q: 'Nhóm nghiên cứu cổ phiếu kết luận gì sau khi phân tích cơ bản?', options: ['Cổ phiếu của công ty bị định giá thấp đáng kể', 'Cổ phiếu đang bị định giá quá cao', 'Công ty sắp phá sản', 'Công ty không có tiềm năng'], correct: 0 },
        { q: 'Chuyên viên phân tích chính đã đưa ra khuyến nghị gì?', options: ['Khuyến nghị mua', 'Khuyến nghị bán ngay', 'Khuyến nghị giữ nguyên', 'Không đưa ra khuyến nghị nào'], correct: 0 },
      ],
    },
    listening: [
      'Fundamental analysis suggested the stock was undervalued.',
      'Earnings per share grew steadily this year.',
      'Market capitalization remains modest compared to rivals.',
      'The analyst issued a buy rating on the stock.',
    ],
    writing: {
      prompt: 'Viết đoạn văn phân tích vì sao một cổ phiếu có thể bị định giá thấp (undervalued) dựa trên phân tích cơ bản (fundamental analysis).',
      minWords: 50,
      phrases: ['Fundamental analysis suggests that', 'The stock appears undervalued because', 'Earnings per share has grown by', 'This justifies a buy rating because'],
      sentenceBuilder: [
        { scrambled: 'The team / (conduct) / thorough fundamental analysis / carefully', answer: 'The team conducted thorough fundamental analysis carefully' },
        { scrambled: 'The analyst / (issue) / a buy rating / afterward', answer: 'The analyst issued a buy rating afterward' },
      ],
    },
  },
  { // Day 63
    vocab: [
      { word: 'Capital markets', phonetic: '/ˈkæpɪtl ˈmɑːrkɪts/', meaning: 'Thị trường vốn', quiz: { options: ['Thị trường vốn', 'Định giá phát hành lần đầu', 'Đăng ký niêm yết', 'Sổ lệnh mua'], correct: 0 } },
      { word: 'IPO pricing',   phonetic: '/aɪ piː oʊ ˈpraɪsɪŋ/', meaning: 'Định giá cổ phiếu phát hành lần đầu', quiz: { options: ['Thị trường vốn', 'Định giá cổ phiếu phát hành lần đầu', 'Đăng ký niêm yết', 'Sổ lệnh mua'], correct: 1 } },
      { word: 'Listing requirement', phonetic: '/ˈlɪstɪŋ rɪˈkwaɪərmənt/', meaning: 'Yêu cầu niêm yết', quiz: { options: ['Định giá IPO', 'Yêu cầu niêm yết', 'Sổ lệnh mua', 'Thị trường vốn'], correct: 1 } },
      { word: 'Order book',    phonetic: '/ˈɔːrdər bʊk/',    meaning: 'Sổ lệnh mua (trong IPO)', quiz: { options: ['Yêu cầu niêm yết', 'Định giá IPO', 'Sổ lệnh mua (trong IPO)', 'Thị trường vốn'], correct: 2 } },
      { word: 'Oversubscribed', phonetic: '/ˌoʊvərsəbˈskraɪbd/', meaning: 'Vượt mức đăng ký mua (IPO)', quiz: { options: ['Vượt mức đăng ký mua (IPO)', 'Sổ lệnh mua', 'Yêu cầu niêm yết', 'Định giá IPO'], correct: 0 } },
    ],
    reading: {
      title: 'A Successful Debut on the Capital Markets',
      passage: 'After months of preparation, the company finally entered the capital markets, working closely with bankers to finalize its IPO pricing. Meeting every listing requirement of the stock exchange proved painstaking but necessary for regulatory approval. To everyone\'s delight, the order book was oversubscribed within hours, signaling overwhelming demand from both retail and institutional investors alike.',
      quiz: [
        { q: 'Công ty đã làm việc chặt chẽ với ngân hàng về điều gì?', options: ['Hoàn tất định giá cổ phiếu IPO', 'Mở thêm chi nhánh mới', 'Tuyển thêm nhân viên', 'Xây dựng nhà máy mới'], correct: 0 },
        { q: 'Điều gì xảy ra với sổ lệnh mua chỉ trong vài giờ?', options: ['Nó bị vượt mức đăng ký mua', 'Nó bị hủy bỏ hoàn toàn', 'Không ai đăng ký mua', 'Nó bị lỗi kỹ thuật'], correct: 0 },
      ],
    },
    listening: [
      'The company finally entered the capital markets.',
      'IPO pricing was finalized after weeks of negotiation.',
      'They met every listing requirement of the exchange.',
      'The order book was oversubscribed within hours.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả quá trình một công ty chuẩn bị niêm yết trên thị trường vốn (capital markets) qua một đợt IPO.',
      minWords: 50,
      phrases: ['Entering the capital markets requires', 'IPO pricing was determined by', 'Meeting listing requirements involved', 'The order book was oversubscribed because'],
      sentenceBuilder: [
        { scrambled: 'The company / (enter) / the capital markets / finally', answer: 'The company entered the capital markets finally' },
        { scrambled: 'The order book / (become) / oversubscribed / within hours', answer: 'The order book became oversubscribed within hours' },
      ],
    },
  },
  { // Day 64 — Chủ đề: Chuỗi cung ứng toàn cầu
    vocab: [
      { word: 'Procurement',   phonetic: '/prəˈkjʊərmənt/',  meaning: 'Thu mua (nguyên vật liệu, dịch vụ)', quiz: { options: ['Thu mua (nguyên vật liệu, dịch vụ)', 'Hậu cần, logistics', 'Điểm nghẽn', 'Thuế nhập khẩu'], correct: 0 } },
      { word: 'Logistics',     phonetic: '/ləˈdʒɪstɪks/',    meaning: 'Hậu cần, logistics', quiz: { options: ['Thu mua', 'Hậu cần, logistics', 'Điểm nghẽn', 'Thuế nhập khẩu'], correct: 1 } },
      { word: 'Bottleneck',    phonetic: '/ˈbɒtlnek/',       meaning: 'Điểm nghẽn (trong quy trình)', quiz: { options: ['Thuế nhập khẩu', 'Hậu cần', 'Điểm nghẽn (trong quy trình)', 'Thu mua'], correct: 2 } },
      { word: 'Tariff',        phonetic: '/ˈtærɪf/',         meaning: 'Thuế quan, thuế nhập khẩu', quiz: { options: ['Điểm nghẽn', 'Thuế quan, thuế nhập khẩu', 'Hậu cần', 'Thu mua'], correct: 1 } },
      { word: 'Resilience',    phonetic: '/rɪˈzɪliəns/',     meaning: 'Khả năng phục hồi, chống chịu', quiz: { options: ['Khả năng phục hồi, chống chịu', 'Thuế nhập khẩu', 'Điểm nghẽn', 'Hậu cần'], correct: 0 } },
    ],
    reading: {
      title: 'Building Supply Chain Resilience',
      passage: 'After a major port closure exposed a critical bottleneck in the company\'s logistics network, Bình overhauled the entire procurement strategy to rely on multiple regional suppliers. New tariffs on imported components added further pressure, pushing the company to source more materials locally. This diversified approach significantly improved the supply chain\'s resilience against future global disruptions.',
      quiz: [
        { q: 'Sự việc gì đã phơi bày điểm nghẽn nghiêm trọng trong mạng lưới logistics?', options: ['Việc đóng cửa một cảng lớn', 'Một cuộc đình công nhân viên', 'Sự cố mất điện', 'Thiên tai nhỏ'], correct: 0 },
        { q: 'Thuế nhập khẩu mới đã thúc đẩy công ty làm gì?', options: ['Tìm nguồn nguyên liệu nhiều hơn ở trong nước', 'Ngừng sản xuất hoàn toàn', 'Chuyển toàn bộ ra nước ngoài', 'Tăng giá bán gấp đôi'], correct: 0 },
      ],
    },
    listening: [
      'A major bottleneck disrupted our entire logistics network.',
      'We diversified our procurement across several regions.',
      'New tariffs increased the cost of imported components.',
      'Supply chain resilience is now a top priority.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách xây dựng khả năng phục hồi (resilience) cho chuỗi cung ứng trước các gián đoạn toàn cầu.',
      minWords: 50,
      phrases: ['To improve supply chain resilience, we should', 'This bottleneck in our logistics can be solved by', 'Rising tariffs have forced us to', 'Our procurement strategy now relies on'],
      sentenceBuilder: [
        { scrambled: 'Bình / (overhaul) / the procurement strategy / completely', answer: 'Bình overhauled the procurement strategy completely' },
        { scrambled: 'The port closure / (expose) / a critical bottleneck / immediately', answer: 'The port closure exposed a critical bottleneck immediately' },
      ],
    },
  },
  { // Day 65
    vocab: [
      { word: 'Just-in-time', phonetic: '/dʒʌst ɪn taɪm/',   meaning: 'Sản xuất/giao hàng đúng lúc (JIT)', quiz: { options: ['Sản xuất/giao hàng đúng lúc (JIT)', 'Nguồn cung đa dạng', 'Tồn kho dự phòng', 'Nhà cung cấp cấp một'], correct: 0 } },
      { word: 'Supplier diversification', phonetic: '/səˈplaɪər daɪˌvɜːrsɪfɪˈkeɪʃn/', meaning: 'Đa dạng hóa nhà cung cấp', quiz: { options: ['Sản xuất đúng lúc', 'Đa dạng hóa nhà cung cấp', 'Tồn kho dự phòng', 'Nhà cung cấp cấp một'], correct: 1 } },
      { word: 'Buffer stock',  phonetic: '/ˈbʌfər stɒk/',    meaning: 'Tồn kho dự phòng', quiz: { options: ['Nhà cung cấp cấp một', 'Đa dạng hóa nhà cung cấp', 'Sản xuất đúng lúc', 'Tồn kho dự phòng'], correct: 3 } },
      { word: 'Tier-one supplier', phonetic: '/tɪər wʌn səˈplaɪər/', meaning: 'Nhà cung cấp cấp một (trực tiếp)', quiz: { options: ['Tồn kho dự phòng', 'Nhà cung cấp cấp một (trực tiếp)', 'Sản xuất đúng lúc', 'Đa dạng hóa nhà cung cấp'], correct: 1 } },
      { word: 'Lead time',     phonetic: '/liːd taɪm/',      meaning: 'Thời gian chờ (từ đặt hàng đến giao hàng)', quiz: { options: ['Đa dạng hóa nhà cung cấp', 'Tồn kho dự phòng', 'Thời gian chờ (từ đặt hàng đến giao hàng)', 'Nhà cung cấp cấp một'], correct: 2 } },
    ],
    reading: {
      title: 'Rethinking Just-in-Time Manufacturing',
      passage: 'For years, the factory relied heavily on just-in-time manufacturing to minimize costs, keeping almost no buffer stock on hand. When a tier-one supplier suddenly went bankrupt, production halted for nearly three weeks due to unexpectedly long lead times from replacement vendors. Duy subsequently championed supplier diversification, arguing that a small increase in cost was worth the added protection against future shocks.',
      quiz: [
        { q: 'Nhà máy đã dựa vào phương pháp gì trong nhiều năm để giảm chi phí?', options: ['Sản xuất đúng lúc (just-in-time)', 'Tồn kho khổng lồ', 'Thuê ngoài toàn bộ sản xuất', 'Nhập khẩu 100% nguyên liệu'], correct: 0 },
        { q: 'Điều gì xảy ra khi một nhà cung cấp cấp một phá sản?', options: ['Sản xuất bị dừng gần 3 tuần', 'Không có gì thay đổi', 'Công ty lập tức phá sản', 'Giá cổ phiếu tăng'], correct: 0 },
      ],
    },
    listening: [
      'Just-in-time manufacturing minimizes inventory costs.',
      'We kept very little buffer stock on hand.',
      'A tier-one supplier went bankrupt unexpectedly.',
      'Lead times increased significantly after the disruption.',
    ],
    writing: {
      prompt: 'Viết đoạn văn phân tích rủi ro của việc phụ thuộc quá nhiều vào sản xuất đúng lúc (just-in-time) mà không có tồn kho dự phòng.',
      minWords: 50,
      phrases: ['Just-in-time manufacturing can be risky when', 'Keeping buffer stock helps protect against', 'Losing a tier-one supplier can cause', 'Long lead times force us to'],
      sentenceBuilder: [
        { scrambled: 'The factory / (rely) / on just-in-time manufacturing / for years', answer: 'The factory relied on just-in-time manufacturing for years' },
        { scrambled: 'Duy / (champion) / supplier diversification / afterward', answer: 'Duy championed supplier diversification afterward' },
      ],
    },
  },
  { // Day 66
    vocab: [
      { word: 'Freight cost',  phonetic: '/freɪt kɒst/',     meaning: 'Chi phí vận chuyển hàng hóa', quiz: { options: ['Chi phí vận chuyển hàng hóa', 'Kho ngoại quan', 'Vòng đời sản phẩm', 'Truy xuất nguồn gốc'], correct: 0 } },
      { word: 'Bonded warehouse', phonetic: '/ˈbɒndɪd ˈweərhaʊs/', meaning: 'Kho ngoại quan', quiz: { options: ['Chi phí vận chuyển', 'Kho ngoại quan', 'Vòng đời sản phẩm', 'Truy xuất nguồn gốc'], correct: 1 } },
      { word: 'Product lifecycle', phonetic: '/ˈprɒdʌkt ˈlaɪfsaɪkl/', meaning: 'Vòng đời sản phẩm', quiz: { options: ['Kho ngoại quan', 'Chi phí vận chuyển', 'Vòng đời sản phẩm', 'Truy xuất nguồn gốc'], correct: 2 } },
      { word: 'Traceability',  phonetic: '/ˌtreɪsəˈbɪləti/', meaning: 'Khả năng truy xuất nguồn gốc', quiz: { options: ['Vòng đời sản phẩm', 'Truy xuất nguồn gốc', 'Kho ngoại quan', 'Chi phí vận chuyển'], correct: 1 } },
      { word: 'Customs clearance', phonetic: '/ˈkʌstəmz ˈklɪərəns/', meaning: 'Thủ tục thông quan', quiz: { options: ['Chi phí vận chuyển', 'Kho ngoại quan', 'Thủ tục thông quan', 'Vòng đời sản phẩm'], correct: 2 } },
    ],
    reading: {
      title: 'Cutting Costs Without Cutting Corners',
      passage: 'Rising freight costs pushed the logistics team to negotiate longer-term contracts with shipping partners while investing in a new bonded warehouse near the port. To satisfy increasingly demanding customers, the company also improved traceability at every stage of the product lifecycle, from raw material sourcing to final delivery. Faster customs clearance procedures, achieved through digital documentation, further reduced overall delivery times by nearly a week.',
      quiz: [
        { q: 'Chi phí vận chuyển tăng đã thúc đẩy đội logistics làm gì?', options: ['Đàm phán hợp đồng dài hạn và đầu tư kho ngoại quan', 'Ngừng vận chuyển hoàn toàn', 'Tăng giá bán gấp đôi', 'Sa thải toàn bộ đội logistics'], correct: 0 },
        { q: 'Điều gì đã giúp giảm thời gian giao hàng gần một tuần?', options: ['Thủ tục thông quan nhanh hơn nhờ tài liệu số hóa', 'Thuê thêm tài xế', 'Mua thêm xe tải', 'Giảm số lượng đơn hàng'], correct: 0 },
      ],
    },
    listening: [
      'Freight costs have risen sharply this year.',
      'We invested in a new bonded warehouse near the port.',
      'Traceability improved throughout the product lifecycle.',
      'Faster customs clearance reduced delivery times.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách giảm chi phí vận chuyển (freight cost) và cải thiện thủ tục thông quan (customs clearance).',
      minWords: 50,
      phrases: ['Rising freight costs can be managed by', 'A bonded warehouse allows us to', 'Improving traceability across the product lifecycle', 'Faster customs clearance reduces'],
      sentenceBuilder: [
        { scrambled: 'The company / (invest) / in a bonded warehouse / recently', answer: 'The company invested in a bonded warehouse recently' },
        { scrambled: 'Faster customs clearance / (reduce) / delivery times / significantly', answer: 'Faster customs clearance reduced delivery times significantly' },
      ],
    },
  },
  { // Day 67
    vocab: [
      { word: 'Nearshoring',   phonetic: '/ˈnɪərʃɔːrɪŋ/',    meaning: 'Chuyển sản xuất về gần thị trường tiêu thụ', quiz: { options: ['Chuyển sản xuất về gần thị trường tiêu thụ', 'Đứt gãy chuỗi cung ứng', 'Kho hàng khu vực', 'Dự báo nhu cầu'], correct: 0 } },
      { word: 'Supply chain disruption', phonetic: '/səˈplaɪ tʃeɪn dɪsˈrʌpʃn/', meaning: 'Sự đứt gãy chuỗi cung ứng', quiz: { options: ['Chuyển sản xuất gần thị trường', 'Sự đứt gãy chuỗi cung ứng', 'Kho hàng khu vực', 'Dự báo nhu cầu'], correct: 1 } },
      { word: 'Regional hub',  phonetic: '/ˈriːdʒənl hʌb/',  meaning: 'Trung tâm phân phối khu vực', quiz: { options: ['Dự báo nhu cầu', 'Sự đứt gãy chuỗi cung ứng', 'Trung tâm phân phối khu vực', 'Chuyển sản xuất gần thị trường'], correct: 2 } },
      { word: 'Demand forecasting', phonetic: '/dɪˈmænd ˈfɔːrkæstɪŋ/', meaning: 'Dự báo nhu cầu', quiz: { options: ['Trung tâm phân phối khu vực', 'Dự báo nhu cầu', 'Chuyển sản xuất gần thị trường', 'Sự đứt gãy chuỗi cung ứng'], correct: 1 } },
      { word: 'Inventory turnover', phonetic: '/ˈɪnvəntɔːri ˈtɜːrnoʊvər/', meaning: 'Vòng quay hàng tồn kho', quiz: { options: ['Sự đứt gãy chuỗi cung ứng', 'Trung tâm phân phối khu vực', 'Dự báo nhu cầu', 'Vòng quay hàng tồn kho'], correct: 3 } },
    ],
    reading: {
      title: 'Moving Production Closer to Customers',
      passage: 'After repeated supply chain disruptions from overseas factories, the company embraced nearshoring, relocating part of its manufacturing to a regional hub closer to its main customers. This decision required significantly better demand forecasting to avoid either stockouts or excess inventory. Within a year, improved inventory turnover confirmed that the nearshoring strategy was paying off, despite higher initial labor costs.',
      quiz: [
        { q: 'Công ty đã áp dụng chiến lược gì sau nhiều lần đứt gãy chuỗi cung ứng?', options: ['Chuyển sản xuất về gần thị trường tiêu thụ (nearshoring)', 'Đóng cửa hoàn toàn nhà máy', 'Chuyển sản xuất ra xa hơn', 'Ngừng sản xuất tạm thời'], correct: 0 },
        { q: 'Chiến lược mới đòi hỏi công ty cải thiện điều gì?', options: ['Dự báo nhu cầu', 'Quảng cáo sản phẩm', 'Tuyển dụng CEO mới', 'Thiết kế logo mới'], correct: 0 },
      ],
    },
    listening: [
      'We embraced nearshoring to reduce disruption risk.',
      'Supply chain disruptions cost us millions last year.',
      'The new regional hub is closer to our main customers.',
      'Better demand forecasting improved our inventory turnover.',
    ],
    writing: {
      prompt: 'Viết đoạn văn phân tích lợi ích của việc chuyển sản xuất về gần thị trường tiêu thụ (nearshoring) để tránh đứt gãy chuỗi cung ứng.',
      minWords: 50,
      phrases: ['Nearshoring helps reduce the risk of', 'Supply chain disruptions taught us that', 'Our new regional hub allows us to', 'Better demand forecasting improves'],
      sentenceBuilder: [
        { scrambled: 'The company / (embrace) / nearshoring / after repeated disruptions', answer: 'The company embraced nearshoring after repeated disruptions' },
        { scrambled: 'Inventory turnover / (improve) / within a year / significantly', answer: 'Inventory turnover improved within a year significantly' },
      ],
    },
  },
  { // Day 68
    vocab: [
      { word: 'Vendor management', phonetic: '/ˈvendər ˈmænɪdʒmənt/', meaning: 'Quản lý nhà cung cấp', quiz: { options: ['Quản lý nhà cung cấp', 'Hợp đồng dài hạn', 'Kiểm định chất lượng', 'Ràng buộc hợp đồng'], correct: 0 } },
      { word: 'Long-term contract', phonetic: '/lɒŋ tɜːrm ˈkɒntrækt/', meaning: 'Hợp đồng dài hạn', quiz: { options: ['Quản lý nhà cung cấp', 'Hợp đồng dài hạn', 'Kiểm định chất lượng', 'Ràng buộc hợp đồng'], correct: 1 } },
      { word: 'Quality assurance', phonetic: '/ˈkwɒləti əˈʃʊərəns/', meaning: 'Kiểm định/đảm bảo chất lượng', quiz: { options: ['Hợp đồng dài hạn', 'Kiểm định/đảm bảo chất lượng', 'Quản lý nhà cung cấp', 'Ràng buộc hợp đồng'], correct: 1 } },
      { word: 'Contractual obligation', phonetic: '/kənˈtræktʃuəl ˌɒblɪˈɡeɪʃn/', meaning: 'Nghĩa vụ ràng buộc hợp đồng', quiz: { options: ['Kiểm định chất lượng', 'Quản lý nhà cung cấp', 'Hợp đồng dài hạn', 'Nghĩa vụ ràng buộc hợp đồng'], correct: 3 } },
      { word: 'Supplier audit',  phonetic: '/səˈplaɪər ˈɔːdɪt/', meaning: 'Kiểm toán nhà cung cấp', quiz: { options: ['Nghĩa vụ ràng buộc hợp đồng', 'Kiểm toán nhà cung cấp', 'Quản lý nhà cung cấp', 'Hợp đồng dài hạn'], correct: 1 } },
    ],
    reading: {
      title: 'Strengthening Vendor Management Practices',
      passage: 'Effective vendor management, Trâm explained, went far beyond simply signing a long-term contract and hoping for the best. Her team conducted regular supplier audits to verify quality assurance standards were consistently met at every factory. When one vendor repeatedly failed to meet its contractual obligations, the company had no choice but to terminate the relationship, despite the short-term disruption this caused.',
      quiz: [
        { q: 'Trâm giải thích quản lý nhà cung cấp hiệu quả cần gì hơn là chỉ ký hợp đồng?', options: ['Kiểm toán nhà cung cấp thường xuyên', 'Chỉ cần trả tiền đúng hạn', 'Chỉ cần gặp mặt mỗi năm một lần', 'Chỉ cần gửi email nhắc nhở'], correct: 0 },
        { q: 'Điều gì xảy ra khi một nhà cung cấp không đáp ứng nghĩa vụ hợp đồng?', options: ['Công ty phải chấm dứt mối quan hệ', 'Công ty tăng giá mua', 'Công ty phớt lờ vấn đề', 'Công ty ký thêm hợp đồng mới với họ'], correct: 0 },
      ],
    },
    listening: [
      'Effective vendor management requires ongoing oversight.',
      'We signed a long-term contract with our main supplier.',
      'Quality assurance standards must be consistently met.',
      'The company conducts regular supplier audits.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách cải thiện quản lý nhà cung cấp (vendor management) thông qua kiểm toán định kỳ.',
      minWords: 50,
      phrases: ['Effective vendor management involves', 'A long-term contract should include', 'Quality assurance standards must be', 'Regular supplier audits help ensure'],
      sentenceBuilder: [
        { scrambled: 'The team / (conduct) / regular supplier audits / consistently', answer: 'The team conducted regular supplier audits consistently' },
        { scrambled: 'The company / (terminate) / the relationship / eventually', answer: 'The company terminated the relationship eventually' },
      ],
    },
  },
  { // Day 69 — Chủ đề: Chuyển đổi số cấp doanh nghiệp
    vocab: [
      { word: 'Automate',      phonetic: '/ˈɔːtəmeɪt/',      meaning: 'Tự động hóa', quiz: { options: ['Tự động hóa', 'Hệ thống cũ', 'Khả năng tương thích', 'An ninh mạng'], correct: 0 } },
      { word: 'Legacy',        phonetic: '/ˈleɡəsi/',        meaning: 'Cũ, kế thừa (hệ thống lỗi thời)', quiz: { options: ['Tự động hóa', 'Cũ, kế thừa (hệ thống lỗi thời)', 'Khả năng tương thích', 'An ninh mạng'], correct: 1 } },
      { word: 'Interoperable', phonetic: '/ˌɪntərˈɒpərəbl/', meaning: 'Có khả năng tương thích, liên kết được', quiz: { options: ['An ninh mạng', 'Hệ thống cũ', 'Có khả năng tương thích, liên kết được', 'Tự động hóa'], correct: 2 } },
      { word: 'Cybersecurity', phonetic: '/ˈsaɪbərsɪˌkjʊərəti/', meaning: 'An ninh mạng', quiz: { options: ['An ninh mạng', 'Khả năng tương thích', 'Hệ thống cũ', 'Tự động hóa'], correct: 0 } },
      { word: 'Migration',     phonetic: '/maɪˈɡreɪʃn/',     meaning: 'Sự di chuyển, chuyển đổi (hệ thống, dữ liệu)', quiz: { options: ['Khả năng tương thích', 'An ninh mạng', 'Tự động hóa', 'Sự di chuyển, chuyển đổi (hệ thống, dữ liệu)'], correct: 3 } },
    ],
    reading: {
      title: 'A Bold Step Toward Full Digitalization',
      passage: 'The IT director proposed a plan to automate repetitive back-office tasks, freeing up staff for more strategic work across the organization. Before undertaking a full cloud migration, the team ensured every new system remained interoperable with existing legacy software still in use by older departments. Given increasing threats, cybersecurity was treated as a top priority throughout every stage of the digital transformation.',
      quiz: [
        { q: 'Giám đốc IT đề xuất kế hoạch gì?', options: ['Tự động hóa các công việc văn phòng lặp lại', 'Sa thải toàn bộ nhân viên hành chính', 'Mua thêm máy tính mới', 'Đóng cửa bộ phận IT'], correct: 0 },
        { q: 'Điều gì được coi là ưu tiên hàng đầu xuyên suốt quá trình chuyển đổi số?', options: ['An ninh mạng', 'Thiết kế văn phòng mới', 'Marketing sản phẩm', 'Tuyển dụng thêm CEO'], correct: 0 },
      ],
    },
    listening: [
      'We plan to automate several repetitive tasks.',
      'Our legacy systems still support older departments.',
      'The new software must remain interoperable with existing tools.',
      'Cybersecurity is a top priority during this migration.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất kế hoạch tự động hóa (automate) các quy trình văn phòng và đảm bảo an ninh mạng (cybersecurity) trong quá trình chuyển đổi số.',
      minWords: 50,
      phrases: ['We propose to automate tasks such as', 'Our legacy systems need to remain interoperable with', 'Cybersecurity must be prioritized during', 'This migration will require'],
      sentenceBuilder: [
        { scrambled: 'The director / (propose) / automating repetitive tasks / recently', answer: 'The director proposed automating repetitive tasks recently' },
        { scrambled: 'The team / (ensure) / interoperability / with legacy software', answer: 'The team ensured interoperability with legacy software' },
      ],
    },
  },
  { // Day 70
    vocab: [
      { word: 'Digital transformation', phonetic: '/ˈdɪdʒɪtl ˌtrænsfərˈmeɪʃn/', meaning: 'Chuyển đổi số', quiz: { options: ['Chuyển đổi số', 'Điện toán đám mây', 'Phân tích dữ liệu lớn', 'Tự động hóa quy trình bằng robot'], correct: 0 } },
      { word: 'Cloud computing', phonetic: '/klaʊd kəmˈpjuːtɪŋ/', meaning: 'Điện toán đám mây', quiz: { options: ['Chuyển đổi số', 'Điện toán đám mây', 'Phân tích dữ liệu lớn', 'Tự động hóa quy trình bằng robot'], correct: 1 } },
      { word: 'Big data analytics', phonetic: '/bɪɡ ˈdeɪtə ænəˈlɪtɪks/', meaning: 'Phân tích dữ liệu lớn', quiz: { options: ['Chuyển đổi số', 'Điện toán đám mây', 'Phân tích dữ liệu lớn', 'Tự động hóa quy trình bằng robot'], correct: 2 } },
      { word: 'Robotic process automation', phonetic: '/roʊˈbɒtɪk ˈproʊses ˌɔːtəˈmeɪʃn/', meaning: 'Tự động hóa quy trình bằng robot (RPA)', quiz: { options: ['Phân tích dữ liệu lớn', 'Điện toán đám mây', 'Chuyển đổi số', 'Tự động hóa quy trình bằng robot (RPA)'], correct: 3 } },
      { word: 'Tech stack',    phonetic: '/tek stæk/',       meaning: 'Bộ công nghệ được sử dụng', quiz: { options: ['Tự động hóa quy trình bằng robot', 'Bộ công nghệ được sử dụng', 'Điện toán đám mây', 'Phân tích dữ liệu lớn'], correct: 1 } },
    ],
    reading: {
      title: 'Choosing the Right Technology Stack',
      passage: 'The company\'s digital transformation strategy centered on three key pillars: migrating core operations to cloud computing, deploying big data analytics to understand customer behavior, and introducing robotic process automation for finance workflows. Nga carefully evaluated which tech stack would scale efficiently as the business grew, avoiding the temptation to chase every trendy new tool without a clear business case.',
      quiz: [
        { q: 'Chiến lược chuyển đổi số của công ty tập trung vào ba trụ cột nào?', options: ['Điện toán đám mây, phân tích dữ liệu lớn, và tự động hóa bằng robot', 'Quảng cáo, bán hàng, và marketing', 'Tuyển dụng, đào tạo, và lương thưởng', 'Xây dựng nhà máy mới'], correct: 0 },
        { q: 'Nga đã tránh làm gì khi lựa chọn công nghệ?', options: ['Chạy theo mọi công cụ thời thượng mà không có lý do kinh doanh rõ ràng', 'Sử dụng công nghệ cũ mãi mãi', 'Đầu tư vào bất kỳ công nghệ nào rẻ nhất', 'Tham khảo ý kiến chuyên gia'], correct: 0 },
      ],
    },
    listening: [
      'Our digital transformation strategy has three key pillars.',
      'We migrated core operations to cloud computing.',
      'Big data analytics revealed valuable customer insights.',
      'Robotic process automation streamlined our finance workflows.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả chiến lược chuyển đổi số (digital transformation) toàn diện cho một doanh nghiệp lớn.',
      minWords: 50,
      phrases: ['Our digital transformation strategy focuses on', 'Cloud computing allows us to', 'Big data analytics helps us understand', 'Robotic process automation reduces'],
      sentenceBuilder: [
        { scrambled: 'The company / (migrate) / core operations / to the cloud', answer: 'The company migrated core operations to the cloud' },
        { scrambled: 'Nga / (evaluate) / the tech stack / carefully', answer: 'Nga evaluated the tech stack carefully' },
      ],
    },
  },
  { // Day 71
    vocab: [
      { word: 'Data-driven',   phonetic: '/ˈdeɪtə drɪvn/',   meaning: 'Dựa trên dữ liệu (ra quyết định)', quiz: { options: ['Dựa trên dữ liệu (ra quyết định)', 'Nền tảng số hóa', 'Trải nghiệm khách hàng số', 'Kiến trúc điện toán đám mây'], correct: 0 } },
      { word: 'Digital platform', phonetic: '/ˈdɪdʒɪtl ˈplætfɔːrm/', meaning: 'Nền tảng số hóa', quiz: { options: ['Dựa trên dữ liệu', 'Nền tảng số hóa', 'Trải nghiệm khách hàng số', 'Kiến trúc điện toán đám mây'], correct: 1 } },
      { word: 'Digital customer experience', phonetic: '/ˈdɪdʒɪtl ˈkʌstəmər ɪkˈspɪəriəns/', meaning: 'Trải nghiệm khách hàng số', quiz: { options: ['Dựa trên dữ liệu', 'Nền tảng số hóa', 'Trải nghiệm khách hàng số', 'Kiến trúc điện toán đám mây'], correct: 2 } },
      { word: 'Cloud architecture', phonetic: '/klaʊd ˈɑːrkɪtektʃər/', meaning: 'Kiến trúc điện toán đám mây', quiz: { options: ['Dựa trên dữ liệu', 'Trải nghiệm khách hàng số', 'Nền tảng số hóa', 'Kiến trúc điện toán đám mây'], correct: 3 } },
      { word: 'API integration', phonetic: '/eɪ piː aɪ ˌɪntɪˈɡreɪʃn/', meaning: 'Tích hợp giao diện lập trình ứng dụng (API)', quiz: { options: ['Kiến trúc điện toán đám mây', 'Tích hợp giao diện lập trình ứng dụng (API)', 'Dựa trên dữ liệu', 'Nền tảng số hóa'], correct: 1 } },
    ],
    reading: {
      title: 'Becoming a Truly Data-Driven Company',
      passage: 'Becoming a data-driven organization meant every major decision, from pricing to inventory, now relied on real-time dashboards rather than gut instinct. Khánh led the rollout of a unified digital platform, seamlessly connecting sales, logistics, and customer service through careful API integration. This modern cloud architecture also dramatically improved the digital customer experience, cutting average response times from hours to minutes.',
      quiz: [
        { q: 'Trở thành một công ty dựa trên dữ liệu có nghĩa là gì?', options: ['Mọi quyết định lớn đều dựa trên bảng điều khiển theo thời gian thực', 'Mọi quyết định dựa vào cảm tính', 'Không cần dữ liệu gì cả', 'Chỉ CEO mới được quyết định'], correct: 0 },
        { q: 'Kiến trúc điện toán đám mây mới đã cải thiện điều gì?', options: ['Trải nghiệm khách hàng số', 'Giá cổ phiếu ngay lập tức', 'Số lượng nhân viên', 'Diện tích văn phòng'], correct: 0 },
      ],
    },
    listening: [
      'We are now a truly data-driven organization.',
      'The new digital platform connects every department.',
      'API integration made the systems work seamlessly together.',
      'Our digital customer experience improved dramatically.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả cách một công ty trở thành tổ chức dựa trên dữ liệu (data-driven) để cải thiện trải nghiệm khách hàng.',
      minWords: 50,
      phrases: ['Becoming data-driven means every decision relies on', 'Our new digital platform connects', 'API integration allows us to', 'This improved our digital customer experience by'],
      sentenceBuilder: [
        { scrambled: 'Khánh / (lead) / the rollout / of a digital platform', answer: 'Khánh led the rollout of a digital platform' },
        { scrambled: 'The new architecture / (improve) / customer experience / dramatically', answer: 'The new architecture improved customer experience dramatically' },
      ],
    },
  },
  { // Day 72
    vocab: [
      { word: 'Artificial intelligence', phonetic: '/ˌɑːrtɪˈfɪʃl ɪnˈtelɪdʒəns/', meaning: 'Trí tuệ nhân tạo', quiz: { options: ['Trí tuệ nhân tạo', 'Mô hình dự đoán', 'Chatbot', 'Học máy'], correct: 0 } },
      { word: 'Machine learning', phonetic: '/məˈʃiːn ˈlɜːrnɪŋ/', meaning: 'Học máy', quiz: { options: ['Trí tuệ nhân tạo', 'Mô hình dự đoán', 'Chatbot', 'Học máy'], correct: 3 } },
      { word: 'Predictive model', phonetic: '/prɪˈdɪktɪv ˈmɒdl/', meaning: 'Mô hình dự đoán', quiz: { options: ['Học máy', 'Mô hình dự đoán', 'Chatbot', 'Trí tuệ nhân tạo'], correct: 1 } },
      { word: 'Algorithm',     phonetic: '/ˈælɡərɪðəm/',     meaning: 'Thuật toán', quiz: { options: ['Mô hình dự đoán', 'Chatbot', 'Thuật toán', 'Học máy'], correct: 2 } },
      { word: 'Chatbot',       phonetic: '/ˈtʃætbɒt/',       meaning: 'Trợ lý ảo tự động (chatbot)', quiz: { options: ['Học máy', 'Thuật toán', 'Mô hình dự đoán', 'Trợ lý ảo tự động (chatbot)'], correct: 3 } },
    ],
    reading: {
      title: 'Bringing Artificial Intelligence to the Front Line',
      passage: 'The customer service team deployed an advanced chatbot powered by machine learning to handle routine inquiries around the clock. Behind the scenes, a predictive model built on years of transaction data flagged potential churn risks before customers even considered leaving. Kiên emphasized that artificial intelligence should support, not replace, human agents, since only people could handle the algorithm\'s more nuanced or emotional edge cases.',
      quiz: [
        { q: 'Đội chăm sóc khách hàng đã triển khai công cụ gì?', options: ['Một chatbot được hỗ trợ bởi học máy', 'Một tổng đài điện thoại mới', 'Một đội ngũ tình nguyện viên', 'Một trang web mới'], correct: 0 },
        { q: 'Kiên nhấn mạnh điều gì về vai trò của AI?', options: ['AI nên hỗ trợ, không thay thế nhân viên', 'AI nên thay thế hoàn toàn nhân viên', 'AI không có giá trị gì', 'AI chỉ dùng cho marketing'], correct: 0 },
      ],
    },
    listening: [
      'The chatbot handles routine customer inquiries.',
      'Machine learning powers many of our new tools.',
      'This predictive model flags potential churn risks.',
      'Artificial intelligence should support human agents.',
    ],
    writing: {
      prompt: 'Viết đoạn văn phân tích cách trí tuệ nhân tạo (artificial intelligence) có thể hỗ trợ, không thay thế, nhân viên trong doanh nghiệp.',
      minWords: 50,
      phrases: ['Artificial intelligence should support rather than replace', 'Machine learning enables us to', 'This predictive model helps us identify', 'The chatbot handles routine tasks such as'],
      sentenceBuilder: [
        { scrambled: 'The team / (deploy) / an advanced chatbot / recently', answer: 'The team deployed an advanced chatbot recently' },
        { scrambled: 'Kiên / (emphasize) / that AI should support agents / clearly', answer: 'Kiên emphasized that AI should support agents clearly' },
      ],
    },
  },
  { // Day 73
    vocab: [
      { word: 'Digital literacy', phonetic: '/ˈdɪdʒɪtl ˈlɪtərəsi/', meaning: 'Năng lực số (kỹ năng công nghệ)', quiz: { options: ['Năng lực số (kỹ năng công nghệ)', 'Chống lại sự thay đổi công nghệ', 'Kỹ năng công nghệ đang thiếu hụt', 'Hệ sinh thái công nghệ'], correct: 0 } },
      { word: 'Tech resistance', phonetic: '/tek rɪˈzɪstəns/', meaning: 'Sự chống đối với thay đổi công nghệ', quiz: { options: ['Năng lực số', 'Sự chống đối với thay đổi công nghệ', 'Kỹ năng công nghệ thiếu hụt', 'Hệ sinh thái công nghệ'], correct: 1 } },
      { word: 'Skills gap',     phonetic: '/skɪlz ɡæp/',     meaning: 'Khoảng cách/thiếu hụt kỹ năng', quiz: { options: ['Hệ sinh thái công nghệ', 'Năng lực số', 'Sự chống đối', 'Khoảng cách/thiếu hụt kỹ năng'], correct: 3 } },
      { word: 'Tech ecosystem', phonetic: '/tek ˈiːkoʊsɪstəm/', meaning: 'Hệ sinh thái công nghệ', quiz: { options: ['Năng lực số', 'Khoảng cách kỹ năng', 'Hệ sinh thái công nghệ', 'Sự chống đối'], correct: 2 } },
      { word: 'Upskill',       phonetic: '/ˈʌpskɪl/',        meaning: 'Nâng cao kỹ năng (cho nhân viên)', quiz: { options: ['Nâng cao kỹ năng (cho nhân viên)', 'Hệ sinh thái công nghệ', 'Khoảng cách kỹ năng', 'Sự chống đối'], correct: 0 } },
    ],
    reading: {
      title: 'Closing the Digital Skills Gap',
      passage: 'When the company introduced new software company-wide, HR quickly discovered a significant skills gap among long-tenured employees unfamiliar with modern tools. Some managers even displayed quiet tech resistance, worried the changes might expose their limited digital literacy. To address this, the company launched a company-wide effort to upskill every employee, gradually building a healthier internal tech ecosystem.',
      quiz: [
        { q: 'HR phát hiện điều gì khi công ty giới thiệu phần mềm mới?', options: ['Một khoảng cách kỹ năng đáng kể ở nhân viên lâu năm', 'Tất cả nhân viên đều thành thạo ngay', 'Không có vấn đề gì', 'Chỉ có một người gặp khó khăn'], correct: 0 },
        { q: 'Công ty đã làm gì để giải quyết vấn đề này?', options: ['Triển khai nỗ lực nâng cao kỹ năng cho toàn bộ nhân viên', 'Sa thải nhân viên lớn tuổi', 'Ngừng sử dụng phần mềm mới', 'Thuê ngoài toàn bộ công việc'], correct: 0 },
      ],
    },
    listening: [
      'We discovered a significant digital skills gap.',
      'Some managers showed quiet resistance to new tech.',
      'Digital literacy varies widely across the company.',
      'We launched an effort to upskill every employee.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất kế hoạch nâng cao kỹ năng (upskill) cho nhân viên để thu hẹp khoảng cách kỹ năng số (digital skills gap).',
      minWords: 50,
      phrases: ['We discovered a significant skills gap in', 'Tech resistance can be addressed by', 'Improving digital literacy requires', 'Our plan to upskill employees includes'],
      sentenceBuilder: [
        { scrambled: 'HR / (discover) / a significant skills gap / quickly', answer: 'HR discovered a significant skills gap quickly' },
        { scrambled: 'The company / (launch) / an effort to upskill / employees', answer: 'The company launched an effort to upskill employees' },
      ],
    },
  },
  { // Day 74 — Chủ đề: Quản lý tài năng cấp cao
    vocab: [
      { word: 'Succession planning', phonetic: '/səkˈseʃn ˈplænɪŋ/', meaning: 'Lập kế hoạch kế nhiệm', quiz: { options: ['Lập kế hoạch kế nhiệm', 'Cố vấn, dìu dắt', 'Săn đầu người', 'Năng lực cốt lõi'], correct: 0 } },
      { word: 'Mentorship',    phonetic: '/ˈmentɔːrʃɪp/',    meaning: 'Sự cố vấn, dìu dắt (nhân viên)', quiz: { options: ['Lập kế hoạch kế nhiệm', 'Sự cố vấn, dìu dắt (nhân viên)', 'Săn đầu người', 'Năng lực cốt lõi'], correct: 1 } },
      { word: 'Headhunt',      phonetic: '/ˈhedhʌnt/',       meaning: 'Săn đầu người (tuyển dụng nhân tài)', quiz: { options: ['Năng lực cốt lõi', 'Lập kế hoạch kế nhiệm', 'Sự cố vấn', 'Săn đầu người (tuyển dụng nhân tài)'], correct: 3 } },
      { word: 'Core competency', phonetic: '/kɔːr ˈkɒmpɪtənsi/', meaning: 'Năng lực cốt lõi', quiz: { options: ['Săn đầu người', 'Năng lực cốt lõi', 'Sự cố vấn', 'Lập kế hoạch kế nhiệm'], correct: 1 } },
      { word: 'Attrition',     phonetic: '/əˈtrɪʃn/',        meaning: 'Tỷ lệ hao hụt nhân sự (tự nhiên)', quiz: { options: ['Sự cố vấn', 'Năng lực cốt lõi', 'Tỷ lệ hao hụt nhân sự (tự nhiên)', 'Săn đầu người'], correct: 2 } },
    ],
    reading: {
      title: 'Preparing the Next Generation of Leaders',
      passage: 'Concerned about rising attrition among senior managers nearing retirement, the board prioritized succession planning across every critical department. Long paired promising junior employees with experienced executives through a structured mentorship program focused on developing core competencies. When internal talent proved insufficient for a specialized finance role, the company reluctantly turned to a headhunting firm to fill the gap quickly.',
      quiz: [
        { q: 'Hội đồng quản trị lo ngại điều gì về nhân sự cấp cao?', options: ['Tỷ lệ hao hụt nhân sự tăng khi họ gần nghỉ hưu', 'Họ đòi tăng lương quá cao', 'Họ làm việc quá chậm', 'Họ không muốn đi công tác'], correct: 0 },
        { q: 'Công ty đã làm gì khi thiếu nhân tài nội bộ cho vị trí tài chính?', options: ['Nhờ đến một công ty săn đầu người', 'Bỏ trống vị trí đó mãi mãi', 'Thuê một thực tập sinh', 'Đóng cửa phòng tài chính'], correct: 0 },
      ],
    },
    listening: [
      'Succession planning is a top priority for the board.',
      'Our mentorship program pairs juniors with executives.',
      'We had to headhunt for this specialized role.',
      'Core competencies are developed through structured training.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất một kế hoạch kế nhiệm (succession planning) cho các vị trí lãnh đạo cấp cao.',
      minWords: 50,
      phrases: ['Succession planning ensures that', 'Our mentorship program helps develop', 'When internal talent is insufficient, we may need to headhunt', 'Building core competencies requires'],
      sentenceBuilder: [
        { scrambled: 'The board / (prioritize) / succession planning / carefully', answer: 'The board prioritized succession planning carefully' },
        { scrambled: 'Long / (pair) / junior employees / with executives', answer: 'Long paired junior employees with executives' },
      ],
    },
  },
  { // Day 75
    vocab: [
      { word: 'Talent pipeline', phonetic: '/ˈtælənt ˈpaɪplaɪn/', meaning: 'Nguồn nhân tài kế cận', quiz: { options: ['Nguồn nhân tài kế cận', 'Đánh giá hiệu suất', 'Lộ trình phát triển sự nghiệp', 'Chương trình giữ chân nhân tài'], correct: 0 } },
      { word: 'Performance review', phonetic: '/pərˈfɔːrməns rɪˈvjuː/', meaning: 'Đánh giá hiệu suất làm việc', quiz: { options: ['Nguồn nhân tài kế cận', 'Đánh giá hiệu suất làm việc', 'Lộ trình phát triển sự nghiệp', 'Chương trình giữ chân nhân tài'], correct: 1 } },
      { word: 'Career trajectory', phonetic: '/kəˈrɪər trəˈdʒektəri/', meaning: 'Lộ trình, quỹ đạo phát triển sự nghiệp', quiz: { options: ['Đánh giá hiệu suất', 'Lộ trình phát triển sự nghiệp', 'Nguồn nhân tài kế cận', 'Chương trình giữ chân nhân tài'], correct: 1 } },
      { word: 'Retention program', phonetic: '/rɪˈtenʃn ˈproʊɡræm/', meaning: 'Chương trình giữ chân nhân tài', quiz: { options: ['Lộ trình phát triển sự nghiệp', 'Nguồn nhân tài kế cận', 'Đánh giá hiệu suất', 'Chương trình giữ chân nhân tài'], correct: 3 } },
      { word: 'High-potential employee', phonetic: '/haɪ pəˈtenʃl ɪmˈplɔɪiː/', meaning: 'Nhân viên có tiềm năng cao', quiz: { options: ['Chương trình giữ chân nhân tài', 'Nhân viên có tiềm năng cao', 'Nguồn nhân tài kế cận', 'Đánh giá hiệu suất'], correct: 1 } },
    ],
    reading: {
      title: 'Nurturing Tomorrow\'s Leaders Today',
      passage: 'HR built a robust talent pipeline by identifying high-potential employees early through rigorous performance reviews. Each candidate then received a customized career trajectory, complete with stretch assignments and leadership training. To prevent these valuable individuals from leaving for competitors, the company also launched a dedicated retention program offering equity grants and clear promotion timelines.',
      quiz: [
        { q: 'HR xây dựng nguồn nhân tài kế cận bằng cách nào?', options: ['Xác định nhân viên tiềm năng cao qua đánh giá hiệu suất nghiêm ngặt', 'Tuyển dụng ngẫu nhiên', 'Chỉ dựa vào thâm niên', 'Chỉ dựa vào mối quan hệ cá nhân'], correct: 0 },
        { q: 'Công ty đã làm gì để ngăn nhân tài rời đi?', options: ['Triển khai chương trình giữ chân nhân tài với cổ phần và lộ trình thăng tiến', 'Giảm lương của họ', 'Tăng giờ làm việc', 'Cấm họ tìm việc khác'], correct: 0 },
      ],
    },
    listening: [
      'We built a robust talent pipeline this year.',
      'Performance reviews help identify high-potential employees.',
      'Each employee has a customized career trajectory.',
      'Our retention program includes equity grants.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách xây dựng nguồn nhân tài kế cận (talent pipeline) và giữ chân nhân viên tiềm năng cao.',
      minWords: 50,
      phrases: ['Building a strong talent pipeline requires', 'Performance reviews help us identify', 'Each employee deserves a clear career trajectory', 'Our retention program offers'],
      sentenceBuilder: [
        { scrambled: 'HR / (build) / a robust talent pipeline / carefully', answer: 'HR built a robust talent pipeline carefully' },
        { scrambled: 'The company / (launch) / a retention program / recently', answer: 'The company launched a retention program recently' },
      ],
    },
  },
  { // Day 76
    vocab: [
      { word: '360-degree feedback', phonetic: '/θriː ˈsɪksti dɪˈɡriː ˈfiːdbæk/', meaning: 'Phản hồi đa chiều (360 độ)', quiz: { options: ['Phản hồi đa chiều (360 độ)', 'Kế hoạch phát triển cá nhân', 'Đánh giá năng lực', 'Nhân viên có hiệu suất kém'], correct: 0 } },
      { word: 'Personal development plan', phonetic: '/ˈpɜːrsənl dɪˈveləpmənt plæn/', meaning: 'Kế hoạch phát triển cá nhân', quiz: { options: ['Phản hồi đa chiều', 'Kế hoạch phát triển cá nhân', 'Đánh giá năng lực', 'Nhân viên hiệu suất kém'], correct: 1 } },
      { word: 'Competency assessment', phonetic: '/ˈkɒmpɪtənsi əˈsesmənt/', meaning: 'Đánh giá năng lực', quiz: { options: ['Kế hoạch phát triển cá nhân', 'Đánh giá năng lực', 'Phản hồi đa chiều', 'Nhân viên hiệu suất kém'], correct: 1 } },
      { word: 'Underperformer', phonetic: '/ˌʌndərpərˈfɔːrmər/', meaning: 'Nhân viên có hiệu suất kém', quiz: { options: ['Đánh giá năng lực', 'Kế hoạch phát triển cá nhân', 'Phản hồi đa chiều', 'Nhân viên có hiệu suất kém'], correct: 3 } },
      { word: 'Talent review',  phonetic: '/ˈtælənt rɪˈvjuː/', meaning: 'Rà soát nhân tài (định kỳ)', quiz: { options: ['Nhân viên hiệu suất kém', 'Rà soát nhân tài (định kỳ)', 'Đánh giá năng lực', 'Kế hoạch phát triển cá nhân'], correct: 1 } },
    ],
    reading: {
      title: 'Making Talent Reviews More Objective',
      passage: 'To reduce bias, Việt introduced 360-degree feedback into the annual talent review process, gathering input from peers, subordinates, and supervisors alike. Every employee then received a detailed competency assessment paired with a personalized development plan for the coming year. For a small number of persistent underperformers, managers were required to create clear improvement plans before considering any further action.',
      quiz: [
        { q: 'Việt giới thiệu điều gì để giảm thiên vị trong đánh giá?', options: ['Phản hồi đa chiều (360 độ)', 'Chỉ đánh giá từ một người quản lý', 'Bỏ qua đánh giá hoàn toàn', 'Chỉ đánh giá bằng điểm số'], correct: 0 },
        { q: 'Mỗi nhân viên nhận được gì sau đánh giá năng lực?', options: ['Một kế hoạch phát triển cá nhân riêng cho năm tới', 'Một khoản tiền thưởng ngay lập tức', 'Một lời khen ngợi chung chung', 'Một chức danh mới'], correct: 0 },
      ],
    },
    listening: [
      'We introduced 360-degree feedback this year.',
      'Every employee receives a personal development plan.',
      'The competency assessment covers technical and soft skills.',
      'Persistent underperformers need clear improvement plans.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất áp dụng phản hồi đa chiều (360-degree feedback) trong quy trình đánh giá nhân viên.',
      minWords: 50,
      phrases: ['360-degree feedback helps reduce bias by', 'Each employee should receive a personal development plan', 'The competency assessment evaluates', 'Underperformers need a clear improvement plan'],
      sentenceBuilder: [
        { scrambled: 'Việt / (introduce) / 360-degree feedback / recently', answer: 'Việt introduced 360-degree feedback recently' },
        { scrambled: 'Each employee / (receive) / a development plan / annually', answer: 'Each employee received a development plan annually' },
      ],
    },
  },
  { // Day 77
    vocab: [
      { word: 'Executive coaching', phonetic: '/ɪɡˈzekjətɪv ˈkoʊtʃɪŋ/', meaning: 'Huấn luyện dành cho lãnh đạo cấp cao', quiz: { options: ['Huấn luyện dành cho lãnh đạo cấp cao', 'Vốn con người', 'Lãnh đạo kế cận', 'Đào tạo tại chỗ'], correct: 0 } },
      { word: 'Human capital', phonetic: '/ˈhjuːmən ˈkæpɪtl/', meaning: 'Vốn con người', quiz: { options: ['Huấn luyện lãnh đạo', 'Vốn con người', 'Lãnh đạo kế cận', 'Đào tạo tại chỗ'], correct: 1 } },
      { word: 'Bench strength', phonetic: '/bentʃ streŋθ/', meaning: 'Đội ngũ lãnh đạo kế cận (dự phòng)', quiz: { options: ['Vốn con người', 'Đội ngũ lãnh đạo kế cận (dự phòng)', 'Huấn luyện lãnh đạo', 'Đào tạo tại chỗ'], correct: 1 } },
      { word: 'On-the-job training', phonetic: '/ɒn ðə dʒɒb ˈtreɪnɪŋ/', meaning: 'Đào tạo tại chỗ (trong công việc)', quiz: { options: ['Vốn con người', 'Lãnh đạo kế cận', 'Huấn luyện lãnh đạo', 'Đào tạo tại chỗ (trong công việc)'], correct: 3 } },
      { word: 'Leadership pipeline', phonetic: '/ˈliːdərʃɪp ˈpaɪplaɪn/', meaning: 'Nguồn lãnh đạo kế cận', quiz: { options: ['Đào tạo tại chỗ', 'Nguồn lãnh đạo kế cận', 'Vốn con người', 'Huấn luyện lãnh đạo'], correct: 1 } },
    ],
    reading: {
      title: 'Investing in Tomorrow\'s Executives',
      passage: 'Recognizing human capital as its most valuable asset, the company invested heavily in executive coaching for its most promising directors. This investment strengthened the organization\'s bench strength, ensuring a reliable leadership pipeline ready to step up when needed. Combined with hands-on, on-the-job training in cross-functional projects, these efforts prepared future leaders far more effectively than traditional classroom courses alone.',
      quiz: [
        { q: 'Công ty coi điều gì là tài sản quý giá nhất?', options: ['Vốn con người', 'Bất động sản', 'Bằng sáng chế', 'Thương hiệu'], correct: 0 },
        { q: 'Khoản đầu tư vào huấn luyện lãnh đạo cấp cao mang lại điều gì?', options: ['Củng cố đội ngũ lãnh đạo kế cận của tổ chức', 'Giảm chi phí ngay lập tức', 'Tăng doanh số bán hàng', 'Giảm số lượng nhân viên'], correct: 0 },
      ],
    },
    listening: [
      'Human capital is our most valuable asset.',
      'We invested heavily in executive coaching this year.',
      'Our bench strength has improved significantly.',
      'On-the-job training complements formal courses well.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích tầm quan trọng của việc đầu tư vào huấn luyện lãnh đạo cấp cao (executive coaching) và vốn con người (human capital).',
      minWords: 50,
      phrases: ['Human capital is our most valuable asset because', 'Executive coaching helps directors develop', 'This strengthens our bench strength by', 'On-the-job training complements'],
      sentenceBuilder: [
        { scrambled: 'The company / (invest) / heavily in executive coaching / this year', answer: 'The company invested heavily in executive coaching this year' },
        { scrambled: 'This / (strengthen) / the leadership pipeline / significantly', answer: 'This strengthened the leadership pipeline significantly' },
      ],
    },
  },
  { // Day 78
    vocab: [
      { word: 'Employer branding', phonetic: '/ɪmˈplɔɪər ˈbrændɪŋ/', meaning: 'Xây dựng thương hiệu nhà tuyển dụng', quiz: { options: ['Xây dựng thương hiệu nhà tuyển dụng', 'Gói phúc lợi tổng thể', 'Đề xuất giá trị cho nhân viên', 'Trải nghiệm ứng viên'], correct: 0 } },
      { word: 'Total rewards', phonetic: '/ˈtoʊtl rɪˈwɔːrdz/', meaning: 'Gói phúc lợi và đãi ngộ tổng thể', quiz: { options: ['Xây dựng thương hiệu nhà tuyển dụng', 'Gói phúc lợi và đãi ngộ tổng thể', 'Đề xuất giá trị nhân viên', 'Trải nghiệm ứng viên'], correct: 1 } },
      { word: 'Employee value proposition', phonetic: '/ɪmˈplɔɪiː ˈvæljuː ˌprɒpəˈzɪʃn/', meaning: 'Đề xuất giá trị cho nhân viên', quiz: { options: ['Gói phúc lợi tổng thể', 'Đề xuất giá trị cho nhân viên', 'Xây dựng thương hiệu tuyển dụng', 'Trải nghiệm ứng viên'], correct: 1 } },
      { word: 'Candidate experience', phonetic: '/ˈkændɪdət ɪkˈspɪəriəns/', meaning: 'Trải nghiệm của ứng viên (tuyển dụng)', quiz: { options: ['Đề xuất giá trị nhân viên', 'Gói phúc lợi tổng thể', 'Xây dựng thương hiệu tuyển dụng', 'Trải nghiệm của ứng viên (tuyển dụng)'], correct: 3 } },
      { word: 'Talent acquisition', phonetic: '/ˈtælənt ˌækwɪˈzɪʃn/', meaning: 'Thu hút và tuyển dụng nhân tài', quiz: { options: ['Trải nghiệm ứng viên', 'Thu hút và tuyển dụng nhân tài', 'Gói phúc lợi tổng thể', 'Xây dựng thương hiệu tuyển dụng'], correct: 1 } },
    ],
    reading: {
      title: 'Competing for Talent in a Tight Market',
      passage: 'In an increasingly competitive labor market, Hương realized that strong employer branding was essential to attract skilled candidates before they even applied. Her team redesigned the entire total rewards package, clarifying the company\'s employee value proposition beyond just salary. They also streamlined every step of the candidate experience, recognizing that a slow, confusing talent acquisition process often drove top performers straight to competitors.',
      quiz: [
        { q: 'Hương nhận ra điều gì quan trọng để thu hút ứng viên giỏi?', options: ['Xây dựng thương hiệu nhà tuyển dụng mạnh', 'Chỉ cần trả lương cao nhất', 'Chỉ cần quảng cáo trên báo', 'Chỉ cần tuyển nhanh nhất'], correct: 0 },
        { q: 'Đội của Hương đã làm gì với trải nghiệm ứng viên?', options: ['Tinh gọn mọi bước để tránh mất ứng viên giỏi vào tay đối thủ', 'Kéo dài quy trình để kiểm tra kỹ hơn', 'Bỏ qua phỏng vấn hoàn toàn', 'Chỉ tuyển qua giới thiệu nội bộ'], correct: 0 },
      ],
    },
    listening: [
      'Strong employer branding attracts top candidates.',
      'We redesigned our entire total rewards package.',
      'Our employee value proposition goes beyond salary.',
      'A smooth candidate experience prevents losing talent.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất cách xây dựng thương hiệu nhà tuyển dụng (employer branding) để thu hút nhân tài trong thị trường cạnh tranh.',
      minWords: 50,
      phrases: ['Strong employer branding helps us attract', 'Our total rewards package includes', 'Our employee value proposition goes beyond', 'Improving the candidate experience means'],
      sentenceBuilder: [
        { scrambled: 'Hương / (redesign) / the total rewards package / thoroughly', answer: 'Hương redesigned the total rewards package thoroughly' },
        { scrambled: 'The team / (streamline) / the candidate experience / significantly', answer: 'The team streamlined the candidate experience significantly' },
      ],
    },
  },
  { // Day 79 — Chủ đề: Thuyết trình cấp cao
    vocab: [
      { word: 'Persuasive',    phonetic: '/pərˈsweɪsɪv/',    meaning: 'Có sức thuyết phục', quiz: { options: ['Có sức thuyết phục', 'Diễn đạt rõ ràng, lưu loát', 'Hấp dẫn, lôi cuốn', 'Lập luận phản bác'], correct: 0 } },
      { word: 'Articulate',    phonetic: '/ɑːrˈtɪkjəleɪt/',  meaning: 'Diễn đạt rõ ràng, lưu loát', quiz: { options: ['Có sức thuyết phục', 'Diễn đạt rõ ràng, lưu loát', 'Hấp dẫn, lôi cuốn', 'Lập luận phản bác'], correct: 1 } },
      { word: 'Compelling',    phonetic: '/kəmˈpelɪŋ/',      meaning: 'Hấp dẫn, lôi cuốn, đầy sức hút', quiz: { options: ['Có sức thuyết phục', 'Diễn đạt rõ ràng', 'Hấp dẫn, lôi cuốn, đầy sức hút', 'Lập luận phản bác'], correct: 2 } },
      { word: 'Rebuttal',      phonetic: '/rɪˈbʌtl/',        meaning: 'Lập luận phản bác', quiz: { options: ['Có sức thuyết phục', 'Diễn đạt rõ ràng', 'Hấp dẫn, lôi cuốn', 'Lập luận phản bác'], correct: 3 } },
      { word: 'Concise',       phonetic: '/kənˈsaɪs/',       meaning: 'Ngắn gọn, súc tích', quiz: { options: ['Ngắn gọn, súc tích', 'Có sức thuyết phục', 'Lập luận phản bác', 'Hấp dẫn, lôi cuốn'], correct: 0 } },
    ],
    reading: {
      title: 'Delivering a Boardroom-Ready Presentation',
      passage: 'Before presenting to the board, Kiên rehearsed his most persuasive arguments until every point felt naturally articulate rather than memorized. He opened with a compelling story about a customer whose life had changed because of the new product, immediately capturing everyone\'s attention. Anticipating tough questions, he also prepared a concise rebuttal for each likely objection, ensuring he never appeared caught off guard.',
      quiz: [
        { q: 'Kiên đã luyện tập điều gì trước khi trình bày với hội đồng quản trị?', options: ['Những lập luận thuyết phục nhất cho đến khi diễn đạt tự nhiên', 'Chỉ đọc lại slide nhiều lần', 'Chỉ ghi nhớ số liệu tài chính', 'Chỉ chuẩn bị trang phục'], correct: 0 },
        { q: 'Kiên đã chuẩn bị gì cho các câu hỏi khó có thể xảy ra?', options: ['Một lập luận phản bác ngắn gọn cho mỗi phản đối có thể', 'Không chuẩn bị gì cả', 'Nhờ người khác trả lời thay', 'Từ chối trả lời câu hỏi khó'], correct: 0 },
      ],
    },
    listening: [
      'His arguments were both persuasive and articulate.',
      'She opened with a compelling customer story.',
      'He prepared a concise rebuttal for each objection.',
      'A concise presentation keeps the board engaged.',
    ],
    writing: {
      prompt: 'Viết đoạn văn hướng dẫn cách chuẩn bị một bài thuyết trình có sức thuyết phục (persuasive) trước hội đồng quản trị.',
      minWords: 50,
      phrases: ['To be more persuasive, you should', 'An articulate presentation requires', 'Opening with a compelling story helps', 'Prepare a concise rebuttal for'],
      sentenceBuilder: [
        { scrambled: 'Kiên / (rehearse) / his persuasive arguments / carefully', answer: 'Kiên rehearsed his persuasive arguments carefully' },
        { scrambled: 'He / (prepare) / a concise rebuttal / for each objection', answer: 'He prepared a concise rebuttal for each objection' },
      ],
    },
  },
  { // Day 80
    vocab: [
      { word: 'Executive summary', phonetic: '/ɪɡˈzekjətɪv ˈsʌməri/', meaning: 'Bản tóm tắt điều hành', quiz: { options: ['Bản tóm tắt điều hành', 'Câu chuyện dẫn dắt bằng dữ liệu', 'Điểm nhấn chính', 'Nhịp điệu trình bày'], correct: 0 } },
      { word: 'Data storytelling', phonetic: '/ˈdeɪtə ˈstɔːritelɪŋ/', meaning: 'Kể chuyện bằng dữ liệu', quiz: { options: ['Bản tóm tắt điều hành', 'Kể chuyện bằng dữ liệu', 'Điểm nhấn chính', 'Nhịp điệu trình bày'], correct: 1 } },
      { word: 'Key takeaway',  phonetic: '/kiː ˈteɪkəweɪ/',  meaning: 'Điểm nhấn/thông điệp chính cần nhớ', quiz: { options: ['Kể chuyện bằng dữ liệu', 'Điểm nhấn/thông điệp chính cần nhớ', 'Bản tóm tắt điều hành', 'Nhịp điệu trình bày'], correct: 1 } },
      { word: 'Pacing',        phonetic: '/ˈpeɪsɪŋ/',        meaning: 'Nhịp điệu (khi trình bày)', quiz: { options: ['Bản tóm tắt điều hành', 'Điểm nhấn chính', 'Kể chuyện bằng dữ liệu', 'Nhịp điệu (khi trình bày)'], correct: 3 } },
      { word: 'Q&A session',   phonetic: '/kjuː ænd eɪ ˈseʃn/', meaning: 'Phần hỏi đáp', quiz: { options: ['Nhịp điệu trình bày', 'Phần hỏi đáp', 'Kể chuyện bằng dữ liệu', 'Bản tóm tắt điều hành'], correct: 1 } },
    ],
    reading: {
      title: 'Turning Numbers Into a Compelling Narrative',
      passage: 'Rather than overwhelming investors with spreadsheets, Trâm mastered the art of data storytelling, weaving quarterly figures into a clear narrative about the company\'s growth. She always began with a concise executive summary, ensuring even distracted listeners grasped the key takeaway within the first two minutes. Careful pacing throughout the presentation left ample time for a thoughtful Q&A session at the end.',
      quiz: [
        { q: 'Trâm đã làm chủ nghệ thuật gì thay vì làm nhà đầu tư choáng ngợp với bảng tính?', options: ['Kể chuyện bằng dữ liệu', 'Đọc số liệu thô', 'Chiếu video quảng cáo', 'Phát tài liệu giấy'], correct: 0 },
        { q: 'Trâm luôn bắt đầu bài trình bày bằng gì?', options: ['Một bản tóm tắt điều hành ngắn gọn', 'Một câu chuyện cười', 'Một video dài 10 phút', 'Một bài hát mở đầu'], correct: 0 },
      ],
    },
    listening: [
      'Data storytelling makes numbers easier to understand.',
      'The executive summary should be brief and clear.',
      'Make sure your audience remembers the key takeaway.',
      'Good pacing keeps the audience engaged throughout.',
    ],
    writing: {
      prompt: 'Viết đoạn văn hướng dẫn cách sử dụng kể chuyện bằng dữ liệu (data storytelling) để thuyết trình hiệu quả với nhà đầu tư.',
      minWords: 50,
      phrases: ['Data storytelling helps investors understand', 'Start with a concise executive summary that', 'Make sure the key takeaway is', 'Good pacing allows time for'],
      sentenceBuilder: [
        { scrambled: 'Trâm / (master) / the art of data storytelling / gradually', answer: 'Trâm mastered the art of data storytelling gradually' },
        { scrambled: 'She / (begin) / with a concise executive summary / always', answer: 'She always began with a concise executive summary' },
      ],
    },
  },
  { // Day 81
    vocab: [
      { word: 'Body language', phonetic: '/ˈbɒdi ˈlæŋɡwɪdʒ/', meaning: 'Ngôn ngữ cơ thể', quiz: { options: ['Ngôn ngữ cơ thể', 'Sự tự tin', 'Khoảng lặng có chủ đích', 'Câu hỏi tu từ'], correct: 0 } },
      { word: 'Poise',         phonetic: '/pɔɪz/',           meaning: 'Sự tự tin, điềm tĩnh', quiz: { options: ['Ngôn ngữ cơ thể', 'Sự tự tin, điềm tĩnh', 'Khoảng lặng có chủ đích', 'Câu hỏi tu từ'], correct: 1 } },
      { word: 'Deliberate pause', phonetic: '/dɪˈlɪbərət pɔːz/', meaning: 'Khoảng lặng có chủ đích', quiz: { options: ['Ngôn ngữ cơ thể', 'Sự tự tin', 'Khoảng lặng có chủ đích', 'Câu hỏi tu từ'], correct: 2 } },
      { word: 'Rhetorical question', phonetic: '/rɪˈtɒrɪkl ˈkwestʃən/', meaning: 'Câu hỏi tu từ (không cần trả lời)', quiz: { options: ['Ngôn ngữ cơ thể', 'Sự tự tin', 'Câu hỏi tu từ (không cần trả lời)', 'Khoảng lặng có chủ đích'], correct: 2 } },
      { word: 'Vocal tone',     phonetic: '/ˈvoʊkl toʊn/',   meaning: 'Ngữ điệu giọng nói', quiz: { options: ['Khoảng lặng có chủ đích', 'Câu hỏi tu từ', 'Ngôn ngữ cơ thể', 'Ngữ điệu giọng nói'], correct: 3 } },
    ],
    reading: {
      title: 'The Art of Commanding a Room',
      passage: 'Confident body language, Duy discovered, mattered almost as much as the content of his speech when addressing five hundred conference attendees. He maintained natural poise even during unexpected technical glitches, using a deliberate pause to regain composure rather than rushing nervously. A well-placed rhetorical question, combined with a warmer vocal tone, transformed a dry technical topic into an engaging conversation with the audience.',
      quiz: [
        { q: 'Duy nhận ra điều gì cũng quan trọng gần bằng nội dung bài phát biểu?', options: ['Ngôn ngữ cơ thể tự tin', 'Trang phục đắt tiền', 'Slide có nhiều màu sắc', 'Micro chất lượng cao'], correct: 0 },
        { q: 'Duy đã làm gì khi gặp sự cố kỹ thuật bất ngờ?', options: ['Sử dụng khoảng lặng có chủ đích để lấy lại bình tĩnh', 'Bỏ chạy khỏi sân khấu', 'La hét vào micro', 'Kết thúc bài phát biểu ngay lập tức'], correct: 0 },
      ],
    },
    listening: [
      'Confident body language matters as much as your words.',
      'She maintained poise despite the technical glitch.',
      'A deliberate pause can help you regain composure.',
      'A rhetorical question engages the audience effectively.',
    ],
    writing: {
      prompt: 'Viết đoạn văn hướng dẫn cách sử dụng ngôn ngữ cơ thể (body language) và sự tự tin (poise) khi thuyết trình trước đám đông lớn.',
      minWords: 50,
      phrases: ['Confident body language helps you', 'Maintaining poise during difficulties means', 'Use a deliberate pause to', 'A rhetorical question can engage the audience by'],
      sentenceBuilder: [
        { scrambled: 'Duy / (maintain) / natural poise / during the glitch', answer: 'Duy maintained natural poise during the glitch' },
        { scrambled: 'He / (use) / a deliberate pause / to regain composure', answer: 'He used a deliberate pause to regain composure' },
      ],
    },
  },
  { // Day 82
    vocab: [
      { word: 'Stakeholder buy-in', phonetic: '/ˈsteɪkhoʊldər ˈbaɪ ɪn/', meaning: 'Sự đồng thuận của các bên liên quan', quiz: { options: ['Sự đồng thuận của các bên liên quan', 'Bài phát biểu truyền cảm hứng', 'Lời kêu gọi hành động', 'Thông điệp cốt lõi'], correct: 0 } },
      { word: 'Keynote speech', phonetic: '/ˈkiːnoʊt spiːtʃ/', meaning: 'Bài phát biểu chính, dẫn dắt hội nghị', quiz: { options: ['Sự đồng thuận của các bên liên quan', 'Bài phát biểu chính, dẫn dắt hội nghị', 'Lời kêu gọi hành động', 'Thông điệp cốt lõi'], correct: 1 } },
      { word: 'Call to action', phonetic: '/kɔːl tuː ˈækʃn/', meaning: 'Lời kêu gọi hành động', quiz: { options: ['Sự đồng thuận', 'Bài phát biểu chính', 'Lời kêu gọi hành động', 'Thông điệp cốt lõi'], correct: 2 } },
      { word: 'Core message',   phonetic: '/kɔːr ˈmesɪdʒ/', meaning: 'Thông điệp cốt lõi', quiz: { options: ['Sự đồng thuận', 'Lời kêu gọi hành động', 'Bài phát biểu chính', 'Thông điệp cốt lõi'], correct: 3 } },
      { word: 'Audience engagement', phonetic: '/ˈɔːdiəns ɪnˈɡeɪdʒmənt/', meaning: 'Sự tương tác với khán giả', quiz: { options: ['Thông điệp cốt lõi', 'Sự tương tác với khán giả', 'Lời kêu gọi hành động', 'Bài phát biểu chính'], correct: 1 } },
    ],
    reading: {
      title: 'Crafting a Keynote That Moves People to Act',
      passage: 'Long spent weeks refining his keynote speech for the industry conference, distilling everything down to a single core message about the future of sustainable manufacturing. To secure genuine stakeholder buy-in rather than polite applause, he ended with a clear call to action, inviting attendees to join a specific pilot initiative. Interactive polling throughout the talk kept audience engagement remarkably high for a topic many considered technical and dry.',
      quiz: [
        { q: 'Long đã dành nhiều tuần để làm gì?', options: ['Hoàn thiện bài phát biểu chính cho hội nghị ngành', 'Chuẩn bị trang phục', 'Học thuộc lòng slide', 'Đặt vé máy bay'], correct: 0 },
        { q: 'Long đã kết thúc bài phát biểu bằng gì để có được sự đồng thuận thực sự?', options: ['Một lời kêu gọi hành động rõ ràng', 'Một lời chào tạm biệt', 'Một câu chuyện cười', 'Một danh sách cảm ơn'], correct: 0 },
      ],
    },
    listening: [
      'His keynote speech left a lasting impression.',
      'We need genuine stakeholder buy-in, not just applause.',
      'End your presentation with a strong call to action.',
      'Interactive polling boosted audience engagement significantly.',
    ],
    writing: {
      prompt: 'Viết đoạn văn hướng dẫn cách kết thúc một bài thuyết trình bằng lời kêu gọi hành động (call to action) hiệu quả.',
      minWords: 50,
      phrases: ['Your keynote speech should focus on', 'To secure stakeholder buy-in, you must', 'End with a clear call to action such as', 'Boosting audience engagement requires'],
      sentenceBuilder: [
        { scrambled: 'Long / (refine) / his keynote speech / for weeks', answer: 'Long refined his keynote speech for weeks' },
        { scrambled: 'He / (end) / with a clear call to action / effectively', answer: 'He ended with a clear call to action effectively' },
      ],
    },
  },
  { // Day 83
    vocab: [
      { word: 'Visual aid',    phonetic: '/ˈvɪʒuəl eɪd/',    meaning: 'Công cụ hỗ trợ trực quan (slide, biểu đồ)', quiz: { options: ['Công cụ hỗ trợ trực quan (slide, biểu đồ)', 'Sự rõ ràng của thông điệp', 'Đối phó với câu hỏi khó', 'Kiểm soát thời lượng'], correct: 0 } },
      { word: 'Clarity',        phonetic: '/ˈklærəti/',      meaning: 'Sự rõ ràng (của thông điệp)', quiz: { options: ['Công cụ hỗ trợ trực quan', 'Sự rõ ràng (của thông điệp)', 'Đối phó với câu hỏi khó', 'Kiểm soát thời lượng'], correct: 1 } },
      { word: 'Fielding questions', phonetic: '/ˈfiːldɪŋ ˈkwestʃənz/', meaning: 'Đối phó, xử lý câu hỏi (khéo léo)', quiz: { options: ['Công cụ hỗ trợ trực quan', 'Sự rõ ràng', 'Đối phó, xử lý câu hỏi (khéo léo)', 'Kiểm soát thời lượng'], correct: 2 } },
      { word: 'Time management', phonetic: '/taɪm ˈmænɪdʒmənt/', meaning: 'Quản lý/kiểm soát thời lượng', quiz: { options: ['Sự rõ ràng', 'Đối phó câu hỏi', 'Công cụ hỗ trợ trực quan', 'Quản lý/kiểm soát thời lượng'], correct: 3 } },
      { word: 'Dry run',        phonetic: '/draɪ rʌn/',      meaning: 'Buổi tổng duyệt (trước khi trình bày thật)', quiz: { options: ['Quản lý thời lượng', 'Buổi tổng duyệt (trước khi trình bày thật)', 'Sự rõ ràng', 'Công cụ hỗ trợ trực quan'], correct: 1 } },
    ],
    reading: {
      title: 'The Final Rehearsal Before Show Time',
      passage: 'The week before the shareholder meeting, Bình\'s team ran a full dry run in front of a small internal audience to catch any weaknesses. Colleagues noted that some visual aids actually reduced clarity rather than enhancing it, so several slides were simplified. The rehearsal also revealed that Bình struggled with time management, spending too long on background context and leaving little room for fielding questions afterward.',
      quiz: [
        { q: 'Đội của Bình đã làm gì vào tuần trước cuộc họp cổ đông?', options: ['Chạy một buổi tổng duyệt đầy đủ', 'Hủy bỏ cuộc họp', 'Thuê một diễn giả khác', 'In thêm tài liệu'], correct: 0 },
        { q: 'Buổi tổng duyệt phát hiện Bình gặp khó khăn ở điểm gì?', options: ['Quản lý thời lượng, dành quá nhiều thời gian cho phần nền', 'Không biết đọc slide', 'Quên tên công ty', 'Không biết dùng micro'], correct: 0 },
      ],
    },
    listening: [
      'We ran a full dry run before the real presentation.',
      'Some visual aids actually reduced clarity.',
      'Time management is crucial during long presentations.',
      'Fielding questions well requires quick thinking.',
    ],
    writing: {
      prompt: 'Viết đoạn văn hướng dẫn cách chuẩn bị một buổi tổng duyệt (dry run) hiệu quả trước một bài thuyết trình quan trọng.',
      minWords: 50,
      phrases: ['A dry run helps identify weaknesses such as', 'Visual aids should improve clarity, not reduce it', 'Good time management ensures that', 'Fielding questions confidently requires'],
      sentenceBuilder: [
        { scrambled: 'The team / (run) / a full dry run / before the meeting', answer: 'The team ran a full dry run before the meeting' },
        { scrambled: 'Bình / (struggle) / with time management / during rehearsal', answer: 'Bình struggled with time management during rehearsal' },
      ],
    },
  },
  { // Day 84 — Chủ đề: Quản trị doanh nghiệp
    vocab: [
      { word: 'Governance',    phonetic: '/ˈɡʌvərnəns/',     meaning: 'Sự quản trị (doanh nghiệp)', quiz: { options: ['Sự quản trị (doanh nghiệp)', 'Nghĩa vụ trung thực, tận tâm', 'Sự giám sát của hội đồng', 'Người thổi còi'], correct: 0 } },
      { word: 'Fiduciary duty', phonetic: '/fɪˈduːʃiəri ˈduːti/', meaning: 'Nghĩa vụ trung thực, tận tâm (fiduciary)', quiz: { options: ['Sự quản trị', 'Nghĩa vụ trung thực, tận tâm (fiduciary)', 'Sự giám sát của hội đồng', 'Người thổi còi'], correct: 1 } },
      { word: 'Board oversight', phonetic: '/bɔːrd ˈoʊvərsaɪt/', meaning: 'Sự giám sát của hội đồng quản trị', quiz: { options: ['Sự quản trị', 'Nghĩa vụ trung thực', 'Sự giám sát của hội đồng quản trị', 'Người thổi còi'], correct: 2 } },
      { word: 'Independent director', phonetic: '/ˌɪndɪˈpendənt dəˈrektər/', meaning: 'Thành viên hội đồng độc lập', quiz: { options: ['Người thổi còi', 'Sự giám sát của hội đồng', 'Nghĩa vụ trung thực', 'Thành viên hội đồng độc lập'], correct: 3 } },
      { word: 'Conflict of interest', phonetic: '/ˈkɒnflɪkt əv ˈɪntrəst/', meaning: 'Xung đột lợi ích', quiz: { options: ['Thành viên hội đồng độc lập', 'Xung đột lợi ích', 'Nghĩa vụ trung thực', 'Sự giám sát của hội đồng'], correct: 1 } },
    ],
    reading: {
      title: 'Strengthening Corporate Governance Standards',
      passage: 'Improving corporate governance meant more than adding a compliance policy; the board needed to genuinely honor its fiduciary duty to every shareholder, large or small. To strengthen board oversight, the company appointed three new independent directors with no prior ties to management. When a potential conflict of interest arose involving a director\'s family business, the board handled it transparently, recusing the individual from the relevant vote.',
      quiz: [
        { q: 'Cải thiện quản trị doanh nghiệp cần điều gì hơn là chỉ thêm một chính sách tuân thủ?', options: ['Hội đồng thực sự tôn trọng nghĩa vụ trung thực với mọi cổ đông', 'Chỉ cần thuê thêm luật sư', 'Chỉ cần in thêm báo cáo', 'Chỉ cần tổ chức tiệc thường niên'], correct: 0 },
        { q: 'Công ty đã làm gì để tăng cường giám sát của hội đồng?', options: ['Bổ nhiệm ba thành viên hội đồng độc lập mới', 'Giảm số lượng thành viên hội đồng', 'Sa thải toàn bộ ban giám đốc', 'Bỏ hoàn toàn hội đồng quản trị'], correct: 0 },
      ],
    },
    listening: [
      'Strong corporate governance protects all shareholders.',
      'The board must honor its fiduciary duty at all times.',
      'We appointed three new independent directors.',
      'This conflict of interest was handled transparently.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích tầm quan trọng của nghĩa vụ trung thực (fiduciary duty) và giám sát của hội đồng quản trị (board oversight).',
      minWords: 50,
      phrases: ['Corporate governance requires the board to', 'Fiduciary duty means directors must', 'Strengthening board oversight involves', 'A conflict of interest must be handled by'],
      sentenceBuilder: [
        { scrambled: 'The company / (appoint) / three independent directors / recently', answer: 'The company appointed three independent directors recently' },
        { scrambled: 'The board / (handle) / the conflict of interest / transparently', answer: 'The board handled the conflict of interest transparently' },
      ],
    },
  },
  { // Day 85
    vocab: [
      { word: 'Audit committee', phonetic: '/ˈɔːdɪt kəˈmɪti/', meaning: 'Ủy ban kiểm toán', quiz: { options: ['Ủy ban kiểm toán', 'Sự minh bạch trong quản trị', 'Quyền biểu quyết của cổ đông', 'Trách nhiệm giải trình của ban điều hành'], correct: 0 } },
      { word: 'Governance transparency', phonetic: '/ˈɡʌvərnəns trænsˈpærənsi/', meaning: 'Sự minh bạch trong quản trị', quiz: { options: ['Ủy ban kiểm toán', 'Sự minh bạch trong quản trị', 'Quyền biểu quyết của cổ đông', 'Trách nhiệm giải trình'], correct: 1 } },
      { word: 'Voting rights', phonetic: '/ˈvoʊtɪŋ raɪts/',  meaning: 'Quyền biểu quyết (của cổ đông)', quiz: { options: ['Ủy ban kiểm toán', 'Sự minh bạch', 'Quyền biểu quyết (của cổ đông)', 'Trách nhiệm giải trình'], correct: 2 } },
      { word: 'Executive accountability', phonetic: '/ɪɡˈzekjətɪv əˌkaʊntəˈbɪləti/', meaning: 'Trách nhiệm giải trình của ban điều hành', quiz: { options: ['Ủy ban kiểm toán', 'Quyền biểu quyết', 'Sự minh bạch', 'Trách nhiệm giải trình của ban điều hành'], correct: 3 } },
      { word: 'Annual general meeting', phonetic: '/ˈænjuəl ˈdʒenrəl ˈmiːtɪŋ/', meaning: 'Đại hội cổ đông thường niên (AGM)', quiz: { options: ['Trách nhiệm giải trình', 'Quyền biểu quyết', 'Đại hội cổ đông thường niên (AGM)', 'Ủy ban kiểm toán'], correct: 2 } },
    ],
    reading: {
      title: 'A More Transparent Annual General Meeting',
      passage: 'At this year\'s annual general meeting, the newly formed audit committee presented its first independent report on the company\'s financial controls. Shareholders praised the increased governance transparency, especially the detailed disclosure of executive compensation tied to measurable performance metrics. For the first time, minority shareholders also gained expanded voting rights on major strategic decisions, reflecting a genuine commitment to executive accountability.',
      quiz: [
        { q: 'Ủy ban kiểm toán mới thành lập đã trình bày gì tại đại hội cổ đông thường niên?', options: ['Báo cáo độc lập đầu tiên về kiểm soát tài chính', 'Kế hoạch sa thải nhân viên', 'Báo cáo về logo mới', 'Kế hoạch mở nhà hàng'], correct: 0 },
        { q: 'Cổ đông thiểu số lần đầu tiên có được điều gì?', options: ['Quyền biểu quyết mở rộng về các quyết định chiến lược lớn', 'Cổ tức gấp đôi', 'Ghế trong ban giám đốc ngay lập tức', 'Quyền phủ quyết tuyệt đối'], correct: 0 },
      ],
    },
    listening: [
      'The audit committee presented its first report today.',
      'Governance transparency has improved significantly.',
      'Minority shareholders gained expanded voting rights.',
      'Executive accountability was a key theme this year.',
    ],
    writing: {
      prompt: 'Viết đoạn văn mô tả cách một công ty tăng cường sự minh bạch trong quản trị (governance transparency) tại đại hội cổ đông.',
      minWords: 50,
      phrases: ['The audit committee is responsible for', 'Governance transparency improved when', 'Voting rights were expanded to allow', 'Executive accountability requires disclosure of'],
      sentenceBuilder: [
        { scrambled: 'The audit committee / (present) / its first report / this year', answer: 'The audit committee presented its first report this year' },
        { scrambled: 'Minority shareholders / (gain) / expanded voting rights / recently', answer: 'Minority shareholders gained expanded voting rights recently' },
      ],
    },
  },
  { // Day 86
    vocab: [
      { word: 'Whistleblowing policy', phonetic: '/ˈwɪslbloʊɪŋ ˈpɒləsi/', meaning: 'Chính sách bảo vệ người tố giác', quiz: { options: ['Chính sách bảo vệ người tố giác', 'Quy tắc ứng xử', 'Kiểm soát nội bộ', 'Xung đột giữa ban điều hành và hội đồng'], correct: 0 } },
      { word: 'Code of conduct', phonetic: '/koʊd əv ˈkɒndʌkt/', meaning: 'Quy tắc ứng xử (doanh nghiệp)', quiz: { options: ['Chính sách bảo vệ người tố giác', 'Quy tắc ứng xử (doanh nghiệp)', 'Kiểm soát nội bộ', 'Xung đột'], correct: 1 } },
      { word: 'Internal controls', phonetic: '/ɪnˈtɜːrnl kənˈtroʊlz/', meaning: 'Kiểm soát nội bộ', quiz: { options: ['Chính sách bảo vệ người tố giác', 'Quy tắc ứng xử', 'Kiểm soát nội bộ', 'Xung đột'], correct: 2 } },
      { word: 'Board-management friction', phonetic: '/bɔːrd ˈmænɪdʒmənt ˈfrɪkʃn/', meaning: 'Xung đột giữa hội đồng và ban điều hành', quiz: { options: ['Kiểm soát nội bộ', 'Quy tắc ứng xử', 'Chính sách bảo vệ người tố giác', 'Xung đột giữa hội đồng và ban điều hành'], correct: 3 } },
      { word: 'Ethical standard', phonetic: '/ˈeθɪkl ˈstændərd/', meaning: 'Tiêu chuẩn đạo đức', quiz: { options: ['Tiêu chuẩn đạo đức', 'Kiểm soát nội bộ', 'Chính sách bảo vệ người tố giác', 'Xung đột'], correct: 0 } },
    ],
    reading: {
      title: 'Resolving Tension Between the Board and Management',
      passage: 'A new whistleblowing policy encouraged employees to report violations of the company\'s code of conduct without fear of retaliation. Auditors found the internal controls generally sound, though they recommended tighter oversight of expense approvals. Some board-management friction emerged when directors questioned whether certain executive decisions truly reflected the company\'s stated ethical standards, prompting a broader review of decision-making authority.',
      quiz: [
        { q: 'Chính sách bảo vệ người tố giác mới khuyến khích điều gì?', options: ['Nhân viên báo cáo vi phạm mà không sợ bị trả thù', 'Nhân viên tố cáo lẫn nhau vô căn cứ', 'Nhân viên giữ im lặng tuyệt đối', 'Nhân viên chỉ báo cáo qua mạng xã hội'], correct: 0 },
        { q: 'Điều gì gây ra xung đột giữa hội đồng và ban điều hành?', options: ['Các giám đốc đặt câu hỏi về việc quyết định có phản ánh tiêu chuẩn đạo đức không', 'Tranh cãi về màu sắc logo', 'Bất đồng về địa điểm văn phòng', 'Tranh cãi về giờ nghỉ trưa'], correct: 0 },
      ],
    },
    listening: [
      'The whistleblowing policy protects employees who report violations.',
      'Everyone must follow the company\'s code of conduct.',
      'Auditors reviewed our internal controls thoroughly.',
      'Some friction emerged between the board and management.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất một chính sách bảo vệ người tố giác (whistleblowing policy) hiệu quả cho doanh nghiệp.',
      minWords: 50,
      phrases: ['Our whistleblowing policy encourages employees to', 'The code of conduct requires that', 'Internal controls should ensure', 'Board-management friction can be resolved by'],
      sentenceBuilder: [
        { scrambled: 'The company / (introduce) / a whistleblowing policy / recently', answer: 'The company introduced a whistleblowing policy recently' },
        { scrambled: 'Auditors / (recommend) / tighter internal controls / afterward', answer: 'Auditors recommended tighter internal controls afterward' },
      ],
    },
  },
  { // Day 87
    vocab: [
      { word: 'Statutory compliance', phonetic: '/ˈstætʃətɔːri kəmˈplaɪəns/', meaning: 'Tuân thủ pháp luật (quy định)', quiz: { options: ['Tuân thủ pháp luật (quy định)', 'Trách nhiệm hữu hạn', 'Quyền cổ đông', 'Báo cáo tài chính đã kiểm toán'], correct: 0 } },
      { word: 'Limited liability', phonetic: '/ˈlɪmɪtɪd ˌlaɪəˈbɪləti/', meaning: 'Trách nhiệm hữu hạn', quiz: { options: ['Tuân thủ pháp luật', 'Trách nhiệm hữu hạn', 'Quyền cổ đông', 'Báo cáo tài chính đã kiểm toán'], correct: 1 } },
      { word: 'Shareholder rights', phonetic: '/ˈʃeərhoʊldər raɪts/', meaning: 'Quyền của cổ đông', quiz: { options: ['Tuân thủ pháp luật', 'Trách nhiệm hữu hạn', 'Quyền của cổ đông', 'Báo cáo tài chính đã kiểm toán'], correct: 2 } },
      { word: 'Audited financial statement', phonetic: '/ˈɔːdɪtɪd faɪˈnænʃl ˈsteɪtmənt/', meaning: 'Báo cáo tài chính đã được kiểm toán', quiz: { options: ['Tuân thủ pháp luật', 'Trách nhiệm hữu hạn', 'Quyền của cổ đông', 'Báo cáo tài chính đã được kiểm toán'], correct: 3 } },
      { word: 'Regulatory filing', phonetic: '/ˈreɡjələtɔːri ˈfaɪlɪŋ/', meaning: 'Hồ sơ nộp cho cơ quan quản lý', quiz: { options: ['Báo cáo tài chính đã kiểm toán', 'Quyền cổ đông', 'Trách nhiệm hữu hạn', 'Hồ sơ nộp cho cơ quan quản lý'], correct: 3 } },
    ],
    reading: {
      title: 'Meeting Every Legal Obligation',
      passage: 'The legal team ensured full statutory compliance across every market where the company operated, submitting each required regulatory filing well before its deadline. Because the business was structured with limited liability, individual shareholders were protected from personal responsibility for corporate debts. The company also strengthened its respect for shareholder rights, publishing audited financial statements every quarter rather than merely once a year.',
      quiz: [
        { q: 'Đội pháp lý đảm bảo điều gì ở mọi thị trường công ty hoạt động?', options: ['Tuân thủ pháp luật đầy đủ và nộp hồ sơ đúng hạn', 'Chỉ tuân thủ ở thị trường lớn nhất', 'Bỏ qua các quy định nhỏ', 'Chỉ nộp báo cáo khi bị yêu cầu'], correct: 0 },
        { q: 'Vì cấu trúc trách nhiệm hữu hạn, cổ đông cá nhân được bảo vệ khỏi điều gì?', options: ['Trách nhiệm cá nhân đối với nợ của công ty', 'Thuế thu nhập cá nhân', 'Nghĩa vụ quân sự', 'Tranh chấp gia đình'], correct: 0 },
      ],
    },
    listening: [
      'We maintain full statutory compliance in every market.',
      'Limited liability protects individual shareholders.',
      'Shareholder rights were strengthened this year.',
      'Audited financial statements are now published quarterly.',
    ],
    writing: {
      prompt: 'Viết đoạn văn giải thích tầm quan trọng của việc tuân thủ pháp luật (statutory compliance) và công bố báo cáo tài chính đã kiểm toán (audited financial statement) minh bạch.',
      minWords: 50,
      phrases: ['Statutory compliance requires us to', 'Limited liability protects shareholders by', 'Shareholder rights include the ability to', 'Audited financial statements are published'],
      sentenceBuilder: [
        { scrambled: 'The legal team / (ensure) / full statutory compliance / carefully', answer: 'The legal team ensured full statutory compliance carefully' },
        { scrambled: 'The company / (publish) / audited financial statements / quarterly', answer: 'The company published audited financial statements quarterly' },
      ],
    },
  },
  { // Day 88 — Chủ đề: Tăng trưởng & mở rộng thị trường
    vocab: [
      { word: 'Market expansion', phonetic: '/ˈmɑːrkɪt ɪkˈspænʃn/', meaning: 'Mở rộng thị trường', quiz: { options: ['Mở rộng thị trường', 'Chỗ đứng ban đầu (thị trường mới)', 'Bản địa hóa sản phẩm', 'Rào cản gia nhập thị trường mới'], correct: 0 } },
      { word: 'Foothold',      phonetic: '/ˈfʊthoʊld/',      meaning: 'Chỗ đứng ban đầu (ở thị trường mới)', quiz: { options: ['Mở rộng thị trường', 'Chỗ đứng ban đầu (ở thị trường mới)', 'Bản địa hóa sản phẩm', 'Rào cản gia nhập'], correct: 1 } },
      { word: 'Localize',      phonetic: '/ˈloʊkəlaɪz/',     meaning: 'Bản địa hóa (sản phẩm, dịch vụ)', quiz: { options: ['Mở rộng thị trường', 'Chỗ đứng ban đầu', 'Bản địa hóa (sản phẩm, dịch vụ)', 'Rào cản gia nhập'], correct: 2 } },
      { word: 'Market entry barrier', phonetic: '/ˈmɑːrkɪt ˈentri ˈbæriər/', meaning: 'Rào cản gia nhập thị trường mới', quiz: { options: ['Bản địa hóa', 'Chỗ đứng ban đầu', 'Mở rộng thị trường', 'Rào cản gia nhập thị trường mới'], correct: 3 } },
      { word: 'Joint venture',  phonetic: '/dʒɔɪnt ˈventʃər/', meaning: 'Liên doanh', quiz: { options: ['Liên doanh', 'Rào cản gia nhập', 'Bản địa hóa', 'Chỗ đứng ban đầu'], correct: 0 } },
    ],
    reading: {
      title: 'Gaining a Foothold in a New Market',
      passage: 'Planning a major market expansion into Indonesia, Phương recognized the significant market entry barriers posed by unfamiliar regulations and strong local competitors. Rather than entering alone, the company formed a joint venture with a respected local partner to gain an initial foothold more quickly. Every product also had to be carefully localized, from packaging language to pricing, to resonate with Indonesian consumers.',
      quiz: [
        { q: 'Phương nhận ra điều gì khi lên kế hoạch mở rộng thị trường vào Indonesia?', options: ['Rào cản gia nhập thị trường đáng kể do quy định và đối thủ mạnh', 'Không có rào cản nào cả', 'Chi phí vận chuyển quá thấp', 'Không cần thay đổi gì cả'], correct: 0 },
        { q: 'Công ty đã làm gì thay vì tự mình gia nhập thị trường?', options: ['Thành lập liên doanh với đối tác địa phương uy tín', 'Từ bỏ kế hoạch hoàn toàn', 'Mua lại toàn bộ đối thủ', 'Chờ đợi 10 năm nữa'], correct: 0 },
      ],
    },
    listening: [
      'We are planning a major market expansion into Southeast Asia.',
      'Gaining an initial foothold took nearly a year.',
      'Every product had to be carefully localized.',
      'A joint venture helped us overcome market entry barriers.',
    ],
    writing: {
      prompt: 'Viết đoạn văn đề xuất chiến lược mở rộng thị trường (market expansion) sang một quốc gia Đông Nam Á mới thông qua liên doanh (joint venture).',
      minWords: 50,
      phrases: ['Our market expansion plan focuses on', 'To gain a foothold quickly, we propose', 'Every product must be localized by', 'A joint venture helps us overcome'],
      sentenceBuilder: [
        { scrambled: 'The company / (form) / a joint venture / with a local partner', answer: 'The company formed a joint venture with a local partner' },
        { scrambled: 'The product / (localize) / carefully / for Indonesian consumers', answer: 'The product was localized carefully for Indonesian consumers' },
      ],
    },
  },
  { // Day 89
    vocab: [
      { word: 'Emerging market', phonetic: '/ɪˈmɜːrdʒɪŋ ˈmɑːrkɪt/', meaning: 'Thị trường mới nổi', quiz: { options: ['Thị trường mới nổi', 'Sức mua của người tiêu dùng', 'Điều chỉnh theo thị trường địa phương', 'Đối tác phân phối'], correct: 0 } },
      { word: 'Purchasing power', phonetic: '/ˈpɜːrtʃəsɪŋ ˈpaʊər/', meaning: 'Sức mua (của người tiêu dùng)', quiz: { options: ['Thị trường mới nổi', 'Sức mua (của người tiêu dùng)', 'Điều chỉnh theo thị trường địa phương', 'Đối tác phân phối'], correct: 1 } },
      { word: 'Market adaptation', phonetic: '/ˈmɑːrkɪt ˌædæpˈteɪʃn/', meaning: 'Điều chỉnh theo thị trường địa phương', quiz: { options: ['Thị trường mới nổi', 'Sức mua', 'Điều chỉnh theo thị trường địa phương', 'Đối tác phân phối'], correct: 2 } },
      { word: 'Distribution partner', phonetic: '/ˌdɪstrɪˈbjuːʃn ˈpɑːrtnər/', meaning: 'Đối tác phân phối', quiz: { options: ['Điều chỉnh theo thị trường', 'Sức mua', 'Thị trường mới nổi', 'Đối tác phân phối'], correct: 3 } },
      { word: 'Growth trajectory', phonetic: '/ɡroʊθ trəˈdʒektəri/', meaning: 'Quỹ đạo tăng trưởng', quiz: { options: ['Đối tác phân phối', 'Quỹ đạo tăng trưởng', 'Sức mua', 'Thị trường mới nổi'], correct: 1 } },
    ],
    reading: {
      title: 'Betting on the Right Emerging Market',
      passage: 'After careful analysis, Khánh identified Vietnam\'s northern provinces as a promising emerging market with rapidly rising purchasing power among young families. Successful market adaptation meant redesigning the product\'s price points to match local income levels rather than simply copying the strategy used in wealthier cities. Partnering with an established distribution partner accelerated this expansion, putting the company on a strong growth trajectory within just two years.',
      quiz: [
        { q: 'Khánh xác định điều gì đầy hứa hẹn ở các tỉnh phía Bắc Việt Nam?', options: ['Một thị trường mới nổi với sức mua tăng nhanh', 'Một thị trường đã bão hòa', 'Một thị trường không có tiềm năng', 'Một thị trường chỉ dành cho người già'], correct: 0 },
        { q: 'Việc hợp tác với đối tác phân phối đã mang lại điều gì?', options: ['Đẩy nhanh quỹ đạo tăng trưởng trong 2 năm', 'Làm chậm quá trình mở rộng', 'Không có tác động gì', 'Gây thua lỗ ngay lập tức'], correct: 0 },
      ],
    },
    listening: [
      'This region is a promising emerging market for us.',
      'Rising purchasing power is attracting new investors.',
      'Successful market adaptation requires local research.',
      'Our distribution partner accelerated the expansion.',
    ],
    writing: {
      prompt: 'Viết đoạn văn phân tích tiềm năng của một thị trường mới nổi (emerging market) và cách điều chỉnh chiến lược (market adaptation) phù hợp.',
      minWords: 50,
      phrases: ['This emerging market shows promise because', 'Rising purchasing power suggests that', 'Successful market adaptation requires', 'Our distribution partner will help us'],
      sentenceBuilder: [
        { scrambled: 'Khánh / (identify) / a promising emerging market / carefully', answer: 'Khánh identified a promising emerging market carefully' },
        { scrambled: 'The partnership / (accelerate) / the expansion / significantly', answer: 'The partnership accelerated the expansion significantly' },
      ],
    },
  },
  { // Day 90
    vocab: [
      { word: 'Global footprint', phonetic: '/ˈɡloʊbl ˈfʊtprɪnt/', meaning: 'Sự hiện diện toàn cầu', quiz: { options: ['Sự hiện diện toàn cầu', 'Chiến lược mở rộng theo giai đoạn', 'Đối tác chiến lược lâu dài', 'Tầm nhìn dài hạn'], correct: 0 } },
      { word: 'Phased expansion', phonetic: '/feɪzd ɪkˈspænʃn/', meaning: 'Chiến lược mở rộng theo giai đoạn', quiz: { options: ['Sự hiện diện toàn cầu', 'Chiến lược mở rộng theo giai đoạn', 'Đối tác chiến lược lâu dài', 'Tầm nhìn dài hạn'], correct: 1 } },
      { word: 'Long-term partner', phonetic: '/lɒŋ tɜːrm ˈpɑːrtnər/', meaning: 'Đối tác chiến lược lâu dài', quiz: { options: ['Sự hiện diện toàn cầu', 'Chiến lược mở rộng theo giai đoạn', 'Đối tác chiến lược lâu dài', 'Tầm nhìn dài hạn'], correct: 2 } },
      { word: 'Long-term vision', phonetic: '/lɒŋ tɜːrm ˈvɪʒn/', meaning: 'Tầm nhìn dài hạn', quiz: { options: ['Sự hiện diện toàn cầu', 'Chiến lược mở rộng theo giai đoạn', 'Đối tác chiến lược lâu dài', 'Tầm nhìn dài hạn'], correct: 3 } },
      { word: 'Legacy of leadership', phonetic: '/ˈleɡəsi əv ˈliːdərʃɪp/', meaning: 'Di sản lãnh đạo để lại', quiz: { options: ['Di sản lãnh đạo để lại', 'Sự hiện diện toàn cầu', 'Chiến lược mở rộng theo giai đoạn', 'Đối tác chiến lược'], correct: 0 } },
    ],
    reading: {
      title: 'Building a Legacy Beyond Borders',
      passage: 'After a decade of steady growth, the company\'s global footprint now spanned twelve countries across three continents, a milestone Nga once considered impossible. Rather than expanding recklessly, she had always favored a phased expansion, entering each new region only after securing a reliable long-term partner familiar with local conditions. Reflecting on her career, Nga hoped her long-term vision for sustainable, people-first growth would become a genuine legacy of leadership for the generation of executives following in her footsteps.',
      quiz: [
        { q: 'Sau một thập kỷ tăng trưởng, sự hiện diện toàn cầu của công ty đã đạt được gì?', options: ['Trải rộng khắp 12 quốc gia trên 3 châu lục', 'Chỉ còn hoạt động ở một quốc gia', 'Phá sản hoàn toàn', 'Chỉ có văn phòng ở Việt Nam'], correct: 0 },
        { q: 'Nga hy vọng điều gì sẽ trở thành di sản lãnh đạo của mình?', options: ['Tầm nhìn dài hạn về tăng trưởng bền vững, lấy con người làm trung tâm', 'Chỉ số lợi nhuận cao nhất từng đạt được', 'Số lượng văn phòng lớn nhất', 'Mức lương cao nhất ngành'], correct: 0 },
      ],
    },
    listening: [
      'Our global footprint now spans twelve countries.',
      'We always favored a phased expansion strategy.',
      'A reliable long-term partner made all the difference.',
      'Her long-term vision became a true legacy of leadership.',
    ],
    writing: {
      prompt: 'Viết đoạn văn tổng kết hành trình mở rộng toàn cầu (global footprint) của một công ty và tầm nhìn dài hạn (long-term vision) của người lãnh đạo.',
      minWords: 50,
      phrases: ['Our global footprint now spans', 'We favored a phased expansion because', 'A long-term partner helped us by', 'This reflects a genuine long-term vision for'],
      sentenceBuilder: [
        { scrambled: 'The company\'s global footprint / (span) / twelve countries / eventually', answer: 'The company\'s global footprint spanned twelve countries eventually' },
        { scrambled: 'Nga / (favor) / a phased expansion / consistently', answer: 'Nga favored a phased expansion consistently' },
      ],
    },
  },
      ],
    },
  };

  const lessonOverlay   = document.getElementById('lesson-overlay');
  const lessonBody      = document.getElementById('lesson-body');
  const lessonBackBtn   = document.getElementById('lesson-back-btn');
  const lessonNextBtn   = document.getElementById('lesson-next-btn');
  const lessonLevelBadge= document.getElementById('lesson-level-badge');
  const lessonStepDots  = document.querySelectorAll('.lesson-step-dot');
  const daypickerBtn    = document.getElementById('lesson-daypicker-btn');
  const daypickerPanel  = document.getElementById('lesson-daypicker-panel');
  const daypickerClose  = document.getElementById('lesson-daypicker-close');
  const daypickerGrid   = document.getElementById('lesson-daypicker-grid');

  let lessonState = null;

  function getCurrentLevel() {
    return localStorage.getItem('zen-level') || 'beginner';
  }

  // ── Day progress per level: which "day" of content to serve next. Advances only when a
  // lesson round is actually completed — not by calendar date — so a diligent learner who
  // finishes several rounds in one sitting (via "Học Thêm") races ahead through the roadmap.
  const DAY_PROGRESS_KEY = 'zen-day-progress';

  function loadDayProgress() {
    try { return JSON.parse(localStorage.getItem(DAY_PROGRESS_KEY)) || {}; } catch { return {}; }
  }

  function saveDayProgress(data) {
    localStorage.setItem(DAY_PROGRESS_KEY, JSON.stringify(data));
    notifyDataChanged();
  }

  function getCurrentDay(level) {
    return loadDayProgress()[level] || 1;
  }

  function advanceDay(level) {
    const progress = loadDayProgress();
    progress[level] = (progress[level] || 1) + 1;
    saveDayProgress(progress);
    return progress[level];
  }

  function getDayContent(level, dayNumber) {
    const days = LESSONS[level].days;
    const safeDay = Number.isInteger(dayNumber) && dayNumber > 0 ? dayNumber : 1;
    return days[(safeDay - 1) % days.length];
  }

  function resetLessonState(overrideDay) {
    const level = getCurrentLevel();
    const currentRoadmapDay = getCurrentDay(level);
    const dayNumber = Number.isInteger(overrideDay) && overrideDay > 0 ? overrideDay : currentRoadmapDay;
    const data = getDayContent(level, dayNumber);
    lessonState = {
      level,
      dayNumber,
      // Reviewing a day other than today's roadmap day is just practice — it must not
      // advance the roadmap or overwrite today's in-progress save.
      isReviewDay: dayNumber !== currentRoadmapDay,
      data,
      step: 0,
      // Adaptive vocab round: test-first, teach only the words missed, retest those at the end.
      vocabRound: {
        order: data.vocab.map((_, i) => i),
        pos: 0,
        attempts: {},
        results: {}, // wordIdx -> 'known' | 'learned' | 'weak'
      },
      readingAnswers: new Array(data.reading.quiz.length).fill(null),
      listeningTicks: new Array(data.listening.length).fill(false),
      listeningScores: new Array(data.listening.length).fill(null),
      sentenceAnswers: new Array(data.writing.sentenceBuilder.length).fill(null),
      writingText: '',
      xpAwarded: false,
    };
  }

  // ── Save/resume progress: lets the user pause mid-lesson and pick up where they left off ──
  const LESSON_PROGRESS_KEY = 'zen-lesson-progress';

  function saveLessonProgress() {
    if (!lessonState) return;
    // Reviewing a past/future day is just practice — don't let it clobber today's real
    // in-progress save, or resuming the app later would drop the learner into the review
    // session instead of today's roadmap lesson.
    if (lessonState.isReviewDay) return;
    const { data, ...toSave } = lessonState; // `data` is just a reference to the static LESSONS entry — no need to persist it
    toSave.date = getTodayStr();
    localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(toSave));
    notifyDataChanged();
  }

  function loadLessonProgress() {
    try { return JSON.parse(localStorage.getItem(LESSON_PROGRESS_KEY)); } catch { return null; }
  }

  // Word-overlap similarity: % of target words actually present in what was recognized/typed
  function wordOverlapScore(target, attempt) {
    const norm = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    const targetWords = norm(target);
    const attemptWords = new Set(norm(attempt));
    if (targetWords.length === 0) return 0;
    const matched = targetWords.filter(w => attemptWords.has(w)).length;
    return Math.round((matched / targetWords.length) * 100);
  }

  function normalizeSentence(s) {
    return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  }

  function speak(text) {
    if (!window.speechSynthesis) { showToast('Trình duyệt của bạn không hỗ trợ đọc văn bản.'); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }

  function updateStepper() {
    lessonStepDots.forEach(dot => {
      const i = parseInt(dot.getAttribute('data-step'), 10);
      dot.classList.toggle('active', i === lessonState.step);
      dot.classList.toggle('done', i < lessonState.step);
    });
  }

  function updateFooterButtons() {
    lessonBackBtn.disabled = lessonState.step === 0;
    if (lessonState.step === 3) {
      lessonNextBtn.innerHTML = 'Xem Đánh Giá <i class="fas fa-chart-bar"></i>';
      lessonNextBtn.style.display = '';
    } else if (lessonState.step === 4) {
      // Result step has its own "Học Thêm" / "Dừng Tạm Thời" actions in the body instead.
      lessonNextBtn.style.display = 'none';
    } else {
      lessonNextBtn.innerHTML = 'Tiếp Theo <i class="fas fa-arrow-right"></i>';
      lessonNextBtn.style.display = '';
    }
  }

  const VOCAB_RESULT_LABEL = { known: 'Đã biết', learned: 'Đã học lại', weak: 'Cần ôn thêm' };
  const VOCAB_RESULT_CLASS = { known: 'good', learned: 'mid', weak: 'low' };

  function renderVocabStep() {
    const { data } = lessonState;
    const round = lessonState.vocabRound;

    if (round.pos >= round.order.length) {
      renderVocabSummary();
      return;
    }

    const wordIdx = round.order[round.pos];
    const word = data.vocab[wordIdx];
    const attemptNum = round.attempts[wordIdx] || 0; // 0 = first try (test only), 1 = retry (learn card shown)
    const progressLabel = `Từ ${round.pos + 1} / ${round.order.length}`;

    if (attemptNum === 0) {
      // First encounter: quiz first — no meaning shown yet.
      lessonBody.innerHTML = `
        <h3>Từ Vựng Hôm Nay</h3>
        <p class="lesson-body-desc">${progressLabel} — Bạn có biết nghĩa của từ này không? Chọn đáp án đúng, nếu chưa biết cứ đoán rồi học ngay bên dưới.</p>
        <div class="lesson-vocab-card lesson-vocab-card--quiz">
          <div class="lesson-vocab-word">${word.word}</div>
          <div class="lesson-vocab-phonetic">${word.phonetic}</div>
        </div>
        <div class="lesson-quiz-item" id="vocab-quiz-item">
          <div class="lesson-quiz-q">"${word.word}" có nghĩa là gì?</div>
          <div class="lesson-quiz-options">
            ${word.quiz.options.map((opt, oi) => `<button class="lesson-quiz-opt" data-oi="${oi}">${opt}</button>`).join('')}
          </div>
        </div>
      `;
      lessonBody.querySelectorAll('#vocab-quiz-item .lesson-quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const oi = parseInt(btn.getAttribute('data-oi'), 10);
          const correct = oi === word.quiz.correct;
          round.attempts[wordIdx] = 1;
          if (correct) {
            round.results[wordIdx] = 'known';
            addXP(4);
          } else {
            addXP(1);
            round.order.push(wordIdx); // schedule a retry later in the queue
          }
          renderVocabFeedback(word, oi, correct, !correct);
        });
      });
    } else {
      // Retry pass: show the learn card, then re-quiz the same word.
      lessonBody.innerHTML = `
        <h3>Từ Vựng Hôm Nay</h3>
        <p class="lesson-body-desc">${progressLabel} — Bạn chưa nhớ từ này, học lại rồi làm lại bài kiểm tra.</p>
        <div class="lesson-vocab-card">
          <div class="lesson-vocab-word">${word.word}</div>
          <div class="lesson-vocab-phonetic">${word.phonetic}</div>
          <div class="lesson-vocab-meaning">${word.meaning}</div>
        </div>
        <div class="lesson-quiz-item" id="vocab-quiz-item">
          <div class="lesson-quiz-q">Giờ thử lại: "${word.word}" có nghĩa là gì?</div>
          <div class="lesson-quiz-options">
            ${word.quiz.options.map((opt, oi) => `<button class="lesson-quiz-opt" data-oi="${oi}">${opt}</button>`).join('')}
          </div>
        </div>
      `;
      lessonBody.querySelectorAll('#vocab-quiz-item .lesson-quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const oi = parseInt(btn.getAttribute('data-oi'), 10);
          const correct = oi === word.quiz.correct;
          round.attempts[wordIdx] = 2;
          round.results[wordIdx] = correct ? 'learned' : 'weak';
          addXP(correct ? 4 : 1);
          renderVocabFeedback(word, oi, correct, false);
        });
      });
    }
  }

  function renderVocabFeedback(word, chosenIdx, correct, willRetry) {
    lessonBody.querySelectorAll('#vocab-quiz-item .lesson-quiz-opt').forEach((btn, oi) => {
      btn.disabled = true;
      if (oi === word.quiz.correct) btn.classList.add('correct');
      else if (oi === chosenIdx) btn.classList.add('wrong');
    });

    const feedback = document.createElement('div');
    feedback.className = `lesson-sb-feedback ${correct ? 'correct' : 'wrong'}`;
    feedback.style.marginTop = '14px';
    feedback.innerHTML = correct
      ? '✅ Chính xác! Chuyển sang từ tiếp theo.'
      : (willRetry ? `❌ Chưa đúng — nghĩa là "${word.meaning}". Từ này sẽ được hỏi lại cuối vòng.` : `❌ Vẫn chưa đúng — nghĩa là "${word.meaning}". Ôn lại từ này sau nhé.`);
    lessonBody.appendChild(feedback);

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'lesson-nav-btn btn-primary';
    nextBtn.style.marginTop = '14px';
    nextBtn.innerHTML = 'Từ Tiếp Theo <i class="fas fa-arrow-right"></i>';
    nextBtn.addEventListener('click', () => {
      lessonState.vocabRound.pos++;
      renderVocabStep();
    });
    lessonBody.appendChild(nextBtn);
  }

  function renderVocabSummary() {
    const { data } = lessonState;
    const results = lessonState.vocabRound.results;
    const rows = data.vocab.map((word, idx) => {
      const r = results[idx] || 'weak';
      return `<tr><td>${word.word}</td><td>${word.meaning}</td><td><span class="lesson-result-tag ${VOCAB_RESULT_CLASS[r]}">${VOCAB_RESULT_LABEL[r]}</span></td></tr>`;
    }).join('');

    lessonBody.innerHTML = `
      <h3>Từ Vựng Hôm Nay</h3>
      <p class="lesson-body-desc">Hoàn tất! Đây là kết quả ${data.vocab.length} từ vựng hôm nay — bấm "Tiếp Theo" bên dưới để qua phần Đọc Hiểu.</p>
      <table class="lesson-result-table">
        <thead><tr><th>Từ</th><th>Nghĩa</th><th>Kết quả</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function renderQuizItem(q, qi, answers, group) {
    const answered = answers[qi];
    const opts = q.options.map((opt, oi) => {
      let cls = 'lesson-quiz-opt';
      if (answered !== null) {
        if (oi === q.correct) cls += ' correct';
        else if (oi === answered) cls += ' wrong';
      }
      return `<button class="${cls}" data-group="${group}" data-qi="${qi}" data-oi="${oi}" ${answered !== null ? 'disabled' : ''}>${opt}</button>`;
    }).join('');
    return `
      <div class="lesson-quiz-item">
        <div class="lesson-quiz-q">${q.q}</div>
        <div class="lesson-quiz-options">${opts}</div>
      </div>
    `;
  }

  function bindQuizEvents(group) {
    lessonBody.querySelectorAll(`.lesson-quiz-opt[data-group="${group}"]`).forEach(btn => {
      btn.addEventListener('click', () => {
        const qi = parseInt(btn.getAttribute('data-qi'), 10);
        const oi = parseInt(btn.getAttribute('data-oi'), 10);
        const answers = lessonState.readingAnswers;
        if (answers[qi] !== null) return; // already answered — guard beyond the disabled attribute
        const quizData = lessonState.data.reading.quiz;
        answers[qi] = oi;
        addXP(oi === quizData[qi].correct ? 4 : 1);
        renderReadingStep();
      });
    });
  }

  function renderReadingStep() {
    const { data, readingAnswers } = lessonState;
    const quiz = data.reading.quiz.map((q, qi) => renderQuizItem(q, qi, readingAnswers, 'reading')).join('');
    lessonBody.innerHTML = `
      <h3>${data.reading.title}</h3>
      <p class="lesson-body-desc">Đọc đoạn văn ngắn sau và trả lời câu hỏi.</p>
      <div class="lesson-passage">${data.reading.passage}</div>
      ${quiz}
    `;
    bindQuizEvents('reading');
  }

  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const PASS_THRESHOLD = 50;

  function renderListeningStep() {
    const { data, listeningTicks, listeningScores } = lessonState;
    const micSupported = !!SpeechRecognitionCtor;

    const items = data.listening.map((sentence, i) => {
      const score = listeningScores[i];
      let resultHtml = '';
      if (score !== null) {
        const passed = score >= PASS_THRESHOLD;
        resultHtml = `<div class="lesson-listen-result ${passed ? 'pass' : 'fail'}">${score}% khớp — ${passed ? 'Đạt ✅' : 'Chưa đạt, thử lại nhé'}</div>`;
      }
      const micControl = micSupported
        ? `<button class="lesson-listen-mic" data-idx="${i}" aria-label="Ghi âm để chấm điểm nói"><i class="fas fa-microphone"></i></button>`
        : `<label class="lesson-listen-check">
             <input type="checkbox" data-idx="${i}" class="lesson-listen-tick" ${listeningTicks[i] ? 'checked' : ''}>
             Đã luyện nói
           </label>`;
      return `
        <div class="lesson-listen-item">
          <button class="lesson-listen-play" data-idx="${i}" aria-label="Nghe câu này"><i class="fas fa-volume-up"></i></button>
          <div class="lesson-listen-main">
            <span class="lesson-listen-text">"${sentence}"</span>
            ${resultHtml}
          </div>
          ${micControl}
        </div>
      `;
    }).join('');

    lessonBody.innerHTML = `
      <h3>Nghe &amp; Nói</h3>
      <p class="lesson-body-desc">${micSupported
        ? 'Bấm 🔊 để nghe câu mẫu, sau đó bấm 🎤 và nói theo. App sẽ chấm % khớp — đạt từ 50% trở lên mới tính là hoàn thành.'
        : 'Trình duyệt này không hỗ trợ ghi âm chấm điểm. Bấm 🔊 để nghe rồi tự luyện nói và tick "Đã luyện nói".'}</p>
      ${items}
    `;

    lessonBody.querySelectorAll('.lesson-listen-play').forEach(btn => {
      btn.addEventListener('click', () => speak(data.listening[parseInt(btn.getAttribute('data-idx'), 10)]));
    });

    lessonBody.querySelectorAll('.lesson-listen-tick').forEach(chk => {
      chk.addEventListener('change', () => {
        const idx = parseInt(chk.getAttribute('data-idx'), 10);
        const wasTicked = listeningTicks[idx];
        listeningTicks[idx] = chk.checked;
        if (chk.checked && !wasTicked) addXP(2);
        if (!chk.checked && wasTicked) addXP(-2);
      });
    });

    lessonBody.querySelectorAll('.lesson-listen-mic').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        recordAndGrade(idx, data.listening[idx], btn);
      });
    });
  }

  function recordAndGrade(idx, targetSentence, btn) {
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    btn.classList.add('recording');
    btn.disabled = true;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const score = wordOverlapScore(targetSentence, transcript);
      const wasTicked = lessonState.listeningTicks[idx];
      lessonState.listeningScores[idx] = score;
      lessonState.listeningTicks[idx] = score >= PASS_THRESHOLD;
      if (lessonState.listeningTicks[idx] && !wasTicked) addXP(2);
      if (!lessonState.listeningTicks[idx] && wasTicked) addXP(-2);
      showToast(score >= PASS_THRESHOLD ? `🎤 Nghe được: "${transcript}" — ${score}% khớp, đạt!` : `🎤 Nghe được: "${transcript}" — ${score}% khớp, thử lại nhé.`);
      renderListeningStep();
    };

    recognition.onerror = () => {
      btn.classList.remove('recording');
      btn.disabled = false;
      showToast('Không ghi âm được. Kiểm tra quyền truy cập microphone và thử lại.');
    };

    recognition.onend = () => {
      btn.classList.remove('recording');
      btn.disabled = false;
    };

    recognition.start();
  }

  function renderWritingStep() {
    const { data, writingText, sentenceAnswers } = lessonState;
    const w = data.writing;

    const phraseChips = w.phrases.map(p => `<button type="button" class="lesson-phrase-chip" data-phrase="${p.replace(/"/g, '&quot;')}">${p}</button>`).join('');

    const sentenceItems = w.sentenceBuilder.map((item, i) => {
      const answered = sentenceAnswers[i];
      const isCorrect = answered !== null && answered.correct;
      let stateHtml = '';
      if (answered !== null) {
        stateHtml = isCorrect
          ? `<div class="lesson-sb-feedback correct">✅ Chính xác!</div>`
          : `<div class="lesson-sb-feedback wrong">❌ Chưa đúng. Đáp án đúng: <strong>${item.answer}</strong></div>`;
      }
      return `
        <div class="lesson-sb-item">
          <div class="lesson-sb-scrambled">${item.scrambled}</div>
          <div class="lesson-sb-input-row">
            <input type="text" class="lesson-sb-input" data-idx="${i}" placeholder="Sắp xếp và chia đúng thì..." value="${answered ? answered.text.replace(/"/g, '&quot;') : ''}" ${answered !== null ? 'disabled' : ''}>
            <button type="button" class="lesson-sb-check" data-idx="${i}" ${answered !== null ? 'disabled' : ''}>Kiểm Tra</button>
          </div>
          ${stateHtml}
        </div>
      `;
    }).join('');

    lessonBody.innerHTML = `
      <h3>Luyện Viết</h3>

      <p class="lesson-body-desc">Trước tiên, sắp xếp lại các cụm từ sau (có từ trong ngoặc cần chia đúng thì) thành câu hoàn chỉnh:</p>
      ${sentenceItems}

      <div class="lesson-writing-prompt">${w.prompt}</div>
      <div class="lesson-body-desc">Cụm từ tham khảo — bấm để chèn vào bài viết:</div>
      <div class="lesson-phrase-chips">${phraseChips}</div>
      <textarea class="lesson-writing-textarea" id="lesson-writing-textarea" placeholder="Viết câu trả lời của bạn ở đây...">${writingText}</textarea>
      <div class="lesson-writing-count" id="lesson-writing-count"></div>
    `;

    const textarea = document.getElementById('lesson-writing-textarea');
    const countEl = document.getElementById('lesson-writing-count');

    function updateCount() {
      const words = textarea.value.trim().split(/\s+/).filter(Boolean).length;
      const ok = words >= w.minWords;
      countEl.textContent = `${words} / ${w.minWords} từ tối thiểu`;
      countEl.classList.toggle('ok', ok);
    }

    textarea.addEventListener('input', () => {
      lessonState.writingText = textarea.value;
      updateCount();
    });
    updateCount();

    lessonBody.querySelectorAll('.lesson-phrase-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const phrase = chip.getAttribute('data-phrase');
        textarea.value = textarea.value.trim().length ? `${textarea.value.trim()} ${phrase} ` : `${phrase} `;
        lessonState.writingText = textarea.value;
        updateCount();
        textarea.focus();
      });
    });

    lessonBody.querySelectorAll('.lesson-sb-check').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.getAttribute('data-idx'), 10);
        if (sentenceAnswers[i] !== null) return;
        const input = lessonBody.querySelector(`.lesson-sb-input[data-idx="${i}"]`);
        const text = input.value;
        const correct = normalizeSentence(text) === normalizeSentence(w.sentenceBuilder[i].answer);
        sentenceAnswers[i] = { text, correct };
        addXP(correct ? 4 : 1);
        renderWritingStep();
      });
    });
  }

  function renderResultStep() {
    const { data, readingAnswers, listeningTicks, writingText, sentenceAnswers } = lessonState;
    const vocabResults = lessonState.vocabRound.results;
    const vocabKnown = data.vocab.filter((_, i) => vocabResults[i] === 'known').length;
    const vocabLearned = data.vocab.filter((_, i) => vocabResults[i] === 'learned').length;
    const vocabWeak = data.vocab.filter((_, i) => vocabResults[i] === 'weak').length;
    const readingCorrect = readingAnswers.filter((a, i) => a === data.reading.quiz[i].correct).length;
    const listenDone = listeningTicks.filter(Boolean).length;
    const wordCount = writingText.trim().split(/\s+/).filter(Boolean).length;
    const writingPass = wordCount >= data.writing.minWords;
    const sentenceCorrect = sentenceAnswers.filter(a => a && a.correct).length;

    const vocabPct = Math.round(((vocabKnown * 100 + vocabLearned * 70 + vocabWeak * 30) / (data.vocab.length * 100)) * 100);
    const readingPct = Math.round((readingCorrect / data.reading.quiz.length) * 100);
    const listenPct = Math.round((listenDone / data.listening.length) * 100);
    const sentencePct = Math.round((sentenceCorrect / data.writing.sentenceBuilder.length) * 100);
    const writingPct = Math.round((sentencePct + (writingPass ? 100 : wordCount > 0 ? 50 : 0)) / 2);
    const overallPct = Math.round((vocabPct + readingPct + listenPct + writingPct) / 4);

    function tag(pct) {
      if (pct >= 80) return '<span class="lesson-result-tag good">Tốt</span>';
      if (pct >= 50) return '<span class="lesson-result-tag mid">Khá</span>';
      return '<span class="lesson-result-tag low">Cần cố gắng</span>';
    }

    lessonBody.innerHTML = `
      <div class="lesson-result-summary">
        <div class="lesson-result-score">${overallPct}%</div>
        <div class="lesson-result-msg">${overallPct >= 80 ? 'Xuất sắc! Bạn đã nắm chắc bài học hôm nay.' : overallPct >= 50 ? 'Khá tốt! Ôn lại phần yếu để chắc kiến thức hơn.' : 'Đừng nản — hãy thử lại bài học này lần nữa nhé.'}</div>
      </div>
      <table class="lesson-result-table">
        <thead><tr><th>Kỹ năng</th><th>Kết quả</th><th>Đánh giá</th></tr></thead>
        <tbody>
          <tr><td>🔤 Từ Vựng</td><td>${vocabKnown} đã biết, ${vocabLearned} đã học lại, ${vocabWeak} cần ôn thêm</td><td>${tag(vocabPct)}</td></tr>
          <tr><td>📖 Đọc Hiểu</td><td>${readingCorrect}/${data.reading.quiz.length} đúng</td><td>${tag(readingPct)}</td></tr>
          <tr><td>🎧 Nghe &amp; Nói</td><td>${listenDone}/${data.listening.length} đạt (≥50%)</td><td>${tag(listenPct)}</td></tr>
          <tr><td>✍️ Viết</td><td>${sentenceCorrect}/${data.writing.sentenceBuilder.length} câu đúng, ${wordCount} từ</td><td>${tag(writingPct)}</td></tr>
        </tbody>
      </table>
      <div class="lesson-result-actions">
        <button type="button" class="lesson-result-action-btn" id="lesson-learn-more-btn"><i class="fas fa-redo"></i> Học Thêm</button>
        <button type="button" class="lesson-result-action-btn secondary" id="lesson-pause-btn"><i class="fas fa-pause"></i> Dừng Tạm Thời</button>
      </div>
    `;

    document.getElementById('lesson-learn-more-btn').addEventListener('click', () => {
      resetLessonState();
      lessonLevelBadge.textContent = `${LESSONS[lessonState.level].badge} · Ngày ${lessonState.dayNumber}`;
      renderLessonStep();
      showToast(`📚 Học thêm Ngày ${lessonState.dayNumber} — rút ngắn lộ trình của bạn!`);
    });

    document.getElementById('lesson-pause-btn').addEventListener('click', () => {
      showToast('⏸️ Đã lưu tiến độ hôm nay. Hẹn gặp lại!');
      closeLessonOverlay();
    });

    if (!lessonState.xpAwarded) {
      lessonState.xpAwarded = true;
      if (lessonState.isReviewDay) {
        addXP(8);
        showToast(`🔁 Đã ôn lại Ngày ${lessonState.dayNumber}! +8 XP thưởng.`);
      } else {
        addXP(20);
        showToast('🎉 Hoàn thành bài học hôm nay! +20 XP thưởng.');
        // Advance the roadmap by one day so "Học Thêm" (or the next visit) serves fresh content —
        // diligent learners doing multiple rounds in one sitting race ahead through the roadmap.
        const dayProgress = loadDayProgress();
        if ((dayProgress[lessonState.level] || 1) === lessonState.dayNumber) {
          advanceDay(lessonState.level);
        }
      }
    }
  }

  function renderLessonStep() {
    updateStepper();
    updateFooterButtons();
    const renderers = [renderVocabStep, renderReadingStep, renderListeningStep, renderWritingStep, renderResultStep];
    renderers[lessonState.step]();
    lessonBody.scrollTop = 0;
    saveLessonProgress();
  }

  function openDaypicker() {
    const level = getCurrentLevel();
    const totalDays = LESSONS[level].days.length;
    const currentRoadmapDay = getCurrentDay(level);
    let cellsHtml = '';
    for (let day = 1; day <= totalDays; day++) {
      let cls = 'lesson-day-cell';
      if (day === currentRoadmapDay) cls += ' current';
      else if (day < currentRoadmapDay) cls += ' done';
      cellsHtml += `<button type="button" class="${cls}" data-day="${day}">${day}</button>`;
    }
    daypickerGrid.innerHTML = cellsHtml;
    daypickerGrid.querySelectorAll('.lesson-day-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const day = parseInt(cell.getAttribute('data-day'), 10);
        closeDaypicker();
        resetLessonState(day);
        lessonLevelBadge.textContent = `${LESSONS[lessonState.level].badge} · Ngày ${lessonState.dayNumber}`;
        renderLessonStep();
        if (lessonState.isReviewDay) showToast(`🔁 Đang ôn lại Ngày ${day}.`);
      });
    });
    daypickerPanel.classList.add('open');
    daypickerPanel.setAttribute('aria-hidden', 'false');
  }

  function closeDaypicker() {
    daypickerPanel.classList.remove('open');
    daypickerPanel.setAttribute('aria-hidden', 'true');
  }

  daypickerBtn?.addEventListener('click', openDaypicker);
  daypickerClose?.addEventListener('click', closeDaypicker);

  function openLessonOverlay() {
    const saved = loadLessonProgress();
    const level = getCurrentLevel();
    // Only resume a genuinely paused (mid-lesson) session. A saved session already at the
    // Result step has nothing left to resume — start fresh so the (possibly newly advanced) day is shown.
    // Also reject saves from before the day-progress feature existed (no dayNumber field).
    if (saved && saved.date === getTodayStr() && saved.level === level && saved.step < 4 && Number.isInteger(saved.dayNumber)) {
      lessonState = { ...saved, data: getDayContent(level, saved.dayNumber) };
      showToast('📌 Đã khôi phục tiến độ bài học hôm nay.');
    } else {
      resetLessonState();
    }
    lessonLevelBadge.textContent = `${LESSONS[level].badge} · Ngày ${lessonState.dayNumber}`;
    lessonOverlay.classList.add('open');
    lessonOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderLessonStep();
  }

  function closeLessonOverlay() {
    saveLessonProgress();
    closeDaypicker();
    lessonOverlay.classList.remove('open');
    lessonOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  document.querySelectorAll('#navbar-cta, #mobile-drawer-cta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeDrawer();
      openLessonOverlay();
    });
  });

  const lessonCloseBtn = document.getElementById('lesson-close-btn');
  if (lessonCloseBtn) lessonCloseBtn.addEventListener('click', closeLessonOverlay);

  lessonOverlay?.addEventListener('click', (e) => {
    if (e.target === lessonOverlay) closeLessonOverlay();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lessonOverlay.classList.contains('open')) closeLessonOverlay();
  });

  lessonBackBtn.addEventListener('click', () => {
    if (lessonState.step > 0) {
      lessonState.step--;
      renderLessonStep();
    }
  });

  lessonNextBtn.addEventListener('click', () => {
    if (lessonState.step === 4) {
      closeLessonOverlay();
      return;
    }
    lessonState.step++;
    renderLessonStep();
  });

});
