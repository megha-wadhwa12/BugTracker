### 📌 BugTrack Pro — Modern Issue Tracking System

A clean, fast, developer-friendly bug tracking application built with **Next.js + Node.js + MongoDB**.  
Manage issues with full CRUD, priorities, assignment, activity logs, and a modern dashboard.

---

### 🚀 Live Demo

**Frontend:** https://bug-track-pro.vercel.app/

**Backend API:** https://bugtracker-zfsc.onrender.com/

---

### 🧩 Features

#### ⭐ Core Features

- Create, edit, delete bugs
- Set priority: **Low / Medium / High**
- Set bug status: **Open → In Progress → Done**
- Assign bugs to team members
- Recently updated bugs panel
- Project-wide activity feed (similar to Jira / Linear)
- Bug detail page with full update history
- Filter bugs by status & priority
- Dashboard metrics
- Clean, responsive UI

#### ⭐ Technical Features

- Full **MERN** architecture
- REST API using **Express**
- Automatic activity log generation
- Modern **Next.js App Router** frontend
- Fully responsive Tailwind UI
- Deployed on **Vercel + Render**
- **Docker-ready** setup

---

### 🏗️ Tech Stack

#### Frontend

- Next.js 14 (App Router)
- React
- Tailwind CSS
- Axios

#### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- CORS

#### DevOps

- Docker (optional)
- Vercel (frontend)
- Render (backend)

---

### 📂 Project Structure

`bugtrack-pro/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│
└── frontend/
    ├── app/
    ├── components/
    ├── public/
    ├── package.json
    ├── Dockerfile`

### ⚙️ Environment Variables

#### Frontend

NEXT_PUBLIC_API_URL=https://your-backend-url

#### Backend

PORT=7001
MONGO_URI=your-mongodb-atlas-url

---

### 🧪 API Endpoints

#### Bugs

| Method | Endpoint  | Description            |
| ------ | --------- | ---------------------- |
| GET    | /bugs     | Get all bugs + filters |
| GET    | /bugs/:id | Get single bug         |
| POST   | /bugs     | Create new bug         |
| PATCH  | /bugs/:id | Update bug             |
| DELETE | /bugs/:id | Delete bug             |

---

### 📊 Dashboard Logic

**Metrics**

- Open = status **open**
- In Progress = status **in-progress**
- Resolved = status **done**

**Recently Updated Bugs**

- Sorted by `updatedAt`
- Shows latest 5 updates

**Recent Activity**

- Combined activity logs from all bugs
- Sorted by timestamp
- Examples:
  - Status changed from _open → in-progress_
  - Assigned to _Megha_
  - Priority changed to _high_

---

### 📝 Running Locally

#### Backend

```
cd backend

npm install

npm start
```

#### Frontend

```
cd frontend

npm install

npm run dev

```

### 🐳 Docker Usage (Optional)

Start full stack:

`docker compose up --build`

---

### 🚀 Deployment

#### Frontend (Vercel)

- Import GitHub repo
- Auto builds Next.js app

#### Backend (Render)

- Import GitHub repo
- Add environment variables
- Deploy as Web Service

---

### 🧑‍💻 Author

**Megha Wadhwa**  
Full Stack Developer

---

### ⭐ Status

**Completed & Production Ready**  
Includes complete UI, activity system, backend API, and deployment setup.

---

### 📄 License

MIT License

---

##### ❤️ Thank You for Visiting

---
