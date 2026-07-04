document.addEventListener('DOMContentLoaded', () => {

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
  }

  function loadStreak() {
    try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, lastDate: '', freezes: 0, lastFreezeWeek: '' }; } catch { return { count: 0, lastDate: '', freezes: 0, lastFreezeWeek: '' }; }
  }

  function saveStreak(data) {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
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
      vocab: [
        { word: 'Meeting',   phonetic: '/ˈmiːtɪŋ/',  meaning: 'Cuộc họp' },
        { word: 'Schedule',  phonetic: '/ˈskedʒuːl/', meaning: 'Lịch trình' },
        { word: 'Email',     phonetic: '/ˈiːmeɪl/',  meaning: 'Thư điện tử' },
        { word: 'Colleague', phonetic: '/ˈkɒliːɡ/',  meaning: 'Đồng nghiệp' },
      ],
      vocabQuiz: [
        { q: 'Từ nào có nghĩa là "cuộc họp"?', options: ['Meeting', 'Schedule', 'Email', 'Colleague'], correct: 0 },
        { q: 'Từ nào có nghĩa là "đồng nghiệp"?', options: ['Email', 'Colleague', 'Schedule', 'Meeting'], correct: 1 },
        { q: '"Schedule" có nghĩa là gì?', options: ['Thư điện tử', 'Cuộc họp', 'Lịch trình', 'Đồng nghiệp'], correct: 2 },
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
    intermediate: {
      badge: 'B1 - B2',
      vocab: [
        { word: 'Deadline',   phonetic: '/ˈdedlaɪn/',    meaning: 'Hạn chót' },
        { word: 'Negotiate',  phonetic: '/nɪˈɡoʊʃieɪt/',  meaning: 'Đàm phán' },
        { word: 'Feedback',   phonetic: '/ˈfiːdbæk/',     meaning: 'Phản hồi, góp ý' },
        { word: 'Prioritize', phonetic: '/praɪˈɒrɪtaɪz/', meaning: 'Ưu tiên' },
      ],
      vocabQuiz: [
        { q: 'Từ nào có nghĩa là "hạn chót"?', options: ['Feedback', 'Deadline', 'Negotiate', 'Prioritize'], correct: 1 },
        { q: '"Negotiate" có nghĩa là gì?', options: ['Ưu tiên', 'Phản hồi', 'Đàm phán', 'Hạn chót'], correct: 2 },
        { q: 'Từ nào có nghĩa là "ưu tiên"?', options: ['Prioritize', 'Deadline', 'Feedback', 'Negotiate'], correct: 0 },
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
    advanced: {
      badge: 'C1+',
      vocab: [
        { word: 'Leverage',   phonetic: '/ˈlevərɪdʒ/',   meaning: 'Tận dụng lợi thế' },
        { word: 'Synergy',    phonetic: '/ˈsɪnərdʒi/',   meaning: 'Hiệu ứng cộng hưởng' },
        { word: 'Escalate',   phonetic: '/ˈeskəleɪt/',   meaning: 'Leo thang, báo cáo lên cấp cao hơn' },
        { word: 'Stakeholder',phonetic: '/ˈsteɪkhoʊldər/',meaning: 'Bên liên quan' },
      ],
      vocabQuiz: [
        { q: 'Từ nào có nghĩa là "tận dụng lợi thế"?', options: ['Synergy', 'Leverage', 'Escalate', 'Stakeholder'], correct: 1 },
        { q: '"Escalate" trong ngữ cảnh công sở nghĩa là gì?', options: ['Giảm quy mô', 'Báo cáo lên cấp cao hơn', 'Kết thúc dự án', 'Tuyển thêm người'], correct: 1 },
        { q: 'Từ nào chỉ "bên liên quan" trong một dự án?', options: ['Stakeholder', 'Synergy', 'Leverage', 'Escalate'], correct: 0 },
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
  };

  const lessonOverlay   = document.getElementById('lesson-overlay');
  const lessonBody      = document.getElementById('lesson-body');
  const lessonBackBtn   = document.getElementById('lesson-back-btn');
  const lessonNextBtn   = document.getElementById('lesson-next-btn');
  const lessonLevelBadge= document.getElementById('lesson-level-badge');
  const lessonStepDots  = document.querySelectorAll('.lesson-step-dot');

  let lessonState = null;

  function getCurrentLevel() {
    return localStorage.getItem('zen-level') || 'beginner';
  }

  function resetLessonState() {
    const level = getCurrentLevel();
    const data = LESSONS[level];
    lessonState = {
      level,
      data,
      step: 0,
      vocabAnswers: new Array(data.vocabQuiz.length).fill(null),
      readingAnswers: new Array(data.reading.quiz.length).fill(null),
      listeningTicks: new Array(data.listening.length).fill(false),
      listeningScores: new Array(data.listening.length).fill(null),
      sentenceAnswers: new Array(data.writing.sentenceBuilder.length).fill(null),
      writingText: '',
      xpAwarded: false,
    };
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
      lessonNextBtn.disabled = false;
    } else if (lessonState.step === 4) {
      lessonNextBtn.innerHTML = 'Đóng <i class="fas fa-check"></i>';
      lessonNextBtn.disabled = false;
    } else {
      lessonNextBtn.innerHTML = 'Tiếp Theo <i class="fas fa-arrow-right"></i>';
      lessonNextBtn.disabled = false;
    }
  }

  function renderVocabStep() {
    const { data, vocabAnswers } = lessonState;
    const cards = data.vocab.map(v => `
      <div class="lesson-vocab-card">
        <div class="lesson-vocab-word">${v.word}</div>
        <div class="lesson-vocab-phonetic">${v.phonetic}</div>
        <div class="lesson-vocab-meaning">${v.meaning}</div>
      </div>
    `).join('');

    const quiz = data.vocabQuiz.map((q, qi) => renderQuizItem(q, qi, vocabAnswers, 'vocab')).join('');

    lessonBody.innerHTML = `
      <h3>Từ Vựng Hôm Nay</h3>
      <p class="lesson-body-desc">Đọc kỹ 4 từ vựng sau, sau đó làm nhanh bài kiểm tra bên dưới.</p>
      <div class="lesson-vocab-list">${cards}</div>
      ${quiz}
    `;
    bindQuizEvents('vocab');
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
        const answers = group === 'vocab' ? lessonState.vocabAnswers : lessonState.readingAnswers;
        if (answers[qi] !== null) return; // already answered — guard beyond the disabled attribute
        const quizData = group === 'vocab' ? lessonState.data.vocabQuiz : lessonState.data.reading.quiz;
        answers[qi] = oi;
        addXP(oi === quizData[qi].correct ? 4 : 1);
        if (group === 'vocab') renderVocabStep(); else renderReadingStep();
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
    const { data, vocabAnswers, readingAnswers, listeningTicks, writingText, sentenceAnswers } = lessonState;
    const vocabCorrect = vocabAnswers.filter((a, i) => a === data.vocabQuiz[i].correct).length;
    const readingCorrect = readingAnswers.filter((a, i) => a === data.reading.quiz[i].correct).length;
    const listenDone = listeningTicks.filter(Boolean).length;
    const wordCount = writingText.trim().split(/\s+/).filter(Boolean).length;
    const writingPass = wordCount >= data.writing.minWords;
    const sentenceCorrect = sentenceAnswers.filter(a => a && a.correct).length;

    const vocabPct = Math.round((vocabCorrect / data.vocabQuiz.length) * 100);
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
          <tr><td>🔤 Từ Vựng</td><td>${vocabCorrect}/${data.vocabQuiz.length} đúng</td><td>${tag(vocabPct)}</td></tr>
          <tr><td>📖 Đọc Hiểu</td><td>${readingCorrect}/${data.reading.quiz.length} đúng</td><td>${tag(readingPct)}</td></tr>
          <tr><td>🎧 Nghe &amp; Nói</td><td>${listenDone}/${data.listening.length} đạt (≥50%)</td><td>${tag(listenPct)}</td></tr>
          <tr><td>✍️ Viết</td><td>${sentenceCorrect}/${data.writing.sentenceBuilder.length} câu đúng, ${wordCount} từ</td><td>${tag(writingPct)}</td></tr>
        </tbody>
      </table>
    `;

    if (!lessonState.xpAwarded) {
      lessonState.xpAwarded = true;
      addXP(20);
      showToast('🎉 Hoàn thành bài học hôm nay! +20 XP thưởng.');
    }
  }

  function renderLessonStep() {
    updateStepper();
    updateFooterButtons();
    const renderers = [renderVocabStep, renderReadingStep, renderListeningStep, renderWritingStep, renderResultStep];
    renderers[lessonState.step]();
    lessonBody.scrollTop = 0;
  }

  function openLessonOverlay() {
    resetLessonState();
    lessonLevelBadge.textContent = lessonState.data.badge;
    lessonOverlay.classList.add('open');
    lessonOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderLessonStep();
  }

  function closeLessonOverlay() {
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
