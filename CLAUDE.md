# Zen English — Hướng Dẫn Dự Án

Website học tiếng Anh cho người đi làm tại Việt Nam. Tất cả nội dung nghiệp vụ đã được tách vào `.claude/rules/`:

| File | Nội dung |
|------|----------|
| [01-project-context.md](.claude/rules/01-project-context.md) | Đối tượng mục tiêu, vấn đề cốt lõi, triết lý học tập |
| [02-learning-methods.md](.claude/rules/02-learning-methods.md) | 4 phương pháp học: Micro-Learning, Contextual Input, Spaced Repetition, Output-First |
| [03-study-schedules.md](.claude/rules/03-study-schedules.md) | Lộ trình 15 / 30 / 60 phút mỗi ngày |
| [04-tools-resources.md](.claude/rules/04-tools-resources.md) | App, podcast, kênh YouTube được khuyến nghị |

## Stack Kỹ Thuật
- Vanilla HTML/CSS/JS — không framework, không build tool
- Một file duy nhất mỗi loại: `index.html`, `style.css`, `app.js`
- LocalStorage: `zen-theme`, `zen-tracker`, `zen-streak`
- CDN: FontAwesome 6.4.0, Google Fonts (Inter + Outfit)
