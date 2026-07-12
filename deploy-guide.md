# MediConnect - Deployment & Developer Guide

This guide details how to run MediConnect locally, push it to GitHub, and deploy it to Render using the preconfigured Render Blueprint.

---

## 🛠️ Local Development

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database running locally

### 1. Database Configuration
1. Open `backend/.env` and update the database credentials to match your local PostgreSQL server:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=mediconnect
   DB_PASSWORD=your_password
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret
   ```
2. In the `backend` folder, run the following commands to install dependencies, generate the Prisma Client, and sync the schema with your local database:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   ```

### 2. Start the Backend Server
In the `backend` folder:
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### 3. Start the Frontend App
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
The Vite development server will open at `http://localhost:5173`.

---

## 🚀 Deployment to GitHub

To deploy to Render, your code must be on a GitHub repository. Follow these steps to initialize git and push your code:

1. **Open your terminal** at the project root (`doctor-appointment-system`).
2. **Initialize Git**:
   ```bash
   git init
   ```
3. **Commit the files**:
   ```bash
   git add .
   git commit -m "Initial commit: full-stack doctor appointment website with Render blueprint"
   ```
4. **Create a new repository** on your GitHub account (leave it empty without initializing README or gitignore).
5. **Link and push**:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## ☁️ Deployment to Render (1-Click Blueprint)

Once your code is pushed to GitHub, deployment on Render takes a single click:

1. Log in to [Render](https://render.com).
2. Go to the **Blueprints** dashboard page and click **New Blueprint Instance**.
3. Connect your GitHub repository containing this project.
4. Render will automatically detect the `render.yaml` file.
5. Review the service configurations (it will set up a Free Web Service for backend, a Free Static Site for frontend, and a Free PostgreSQL database).
6. Click **Approve** / **Deploy**.

Render will automatically link the database URL to the backend, compile your frontend to talk to your backend service, and make your application live!
