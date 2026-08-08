# 📅 AcademicFlow / LifePlanner – Academic & Habit Management System

**AcademicFlow (LifePlanner)** is a personal productivity platform designed to centralize academic scheduling, track daily habits, and manage deadline-driven tasks[cite: 11, 14]. The application features an interactive dashboard calendar, habit consistency heatmaps, and a dedicated task management workflow.

---

## 📸 Screenshots

| Infinite Calendar & Dashboard View | Task & Habit Sidebar |
| :---: | :---: |
| ![Dashboard View](screenshots/dashboard.png) | ![Sidebar View](screenshots/sidebar.png) |



---

## ✨ Key Features

- 🗓️ **Infinite Calendar & Dashboard:** Centralized view for recurring academic classes, events, and daily schedules.
- 🔥 **Habit Tracking & Heatmap (Streaks):** Real-time consistency score calculations displayed on a dynamic streak widget.
- 📝 **Task & Preparation Management:** Organize single-day or multi-day tasks, complete with custom preparation days (`prepDays`).
- 📊 **Healthy Stats & Todo Sidebar:** Slide-out drawer offering quick task filtering, status updates, and productivity metrics.
- 🎨 **Premium Dark Theme:** Fully customizable UI supporting dynamic theme switching and smooth layout transitions.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Radix UI, Axios, Date-fns, Lucide Icons
- **Backend:** Node.js / Express.js (REST APIs) or C# .NET WPF
- **Database:** PostgreSQL / SQLite
- **Architecture:** Multi-Layered Architecture (Presentation Layer, Business Logic Layer with Controllers & Services, Data Access Layer)

---

## 📁 Repository Structure

```text
AcademicFlow/
├── src/
│   ├── components/         # UI Components (Calendar, DayView, TodoSidebar, TaskForm)
│   ├── controllers/        # API Controllers (taskController, todoController)
│   ├── services/           # Business Logic & Streak Calculation Services
│   ├── utils/              # Utility Functions (Theme management, Date handling)
│   ├── App.jsx             # Root Component
│   └── main.jsx
├── screenshots/            # Showcase images for GitHub
└── README.md
