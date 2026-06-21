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

  profileCards.forEach(card => {
    card.addEventListener('click', () => {
      const profile = card.getAttribute('data-profile');

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
  // 9. Word of the Day
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
    try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, lastDate: '' }; } catch { return { count: 0, lastDate: '' }; }
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

  renderHabits();
  initTrackerEvents();

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

});
