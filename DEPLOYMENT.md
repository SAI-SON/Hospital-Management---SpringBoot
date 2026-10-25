# 🚀 MediBook Deployment Guide

This guide explains how to deploy MediBook to production in under 10 minutes using free-tier cloud platforms:
- **Backend (Spring Boot + Java 17)**: [Render](https://render.com) or [Railway](https://railway.app)
- **Database (PostgreSQL)**: [Neon Serverless Postgres](https://neon.tech)
- **Frontend (React + Vite)**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Database Setup (Neon PostgreSQL)](#step-1-database-setup-neon-postgresql)
3. [Step 2: Deploy Backend to Render](#step-2-deploy-backend-to-render)
4. [Step 3: Deploy Frontend to Vercel](#step-3-deploy-frontend-to-vercel)
5. [Alternative: Deploy Backend to Railway](#alternative-deploy-backend-to-railway)
6. [Alternative: Deploy Frontend to Netlify](#alternative-deploy-frontend-to-netlify)
7. [Environment Variables Reference](#environment-variables-reference)

---

## 1. Prerequisites
- A GitHub account with this repository pushed: `https://github.com/SAI-SON/Hospital-Management---SpringBoot.git`
- A free account on [Neon](https://neon.tech)
- A free account on [Render](https://render.com) or [Railway](https://railway.app)
- A free account on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

---

## Step 1: Database Setup (Neon PostgreSQL)
1. Log in to [Neon Console](https://console.neon.tech).
2. Create or select your project (e.g., `Hospital`).
3. Under **Dashboard**, copy your connection string:
   ```
   postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
   ```
4. Convert it to JDBC format:
   ```
   jdbc:postgresql://[endpoint].neon.tech:5432/[dbname]?sslmode=require
   ```
   *(Flyway migrations `V1`, `V2`, and `V3` run automatically on Spring Boot startup)*.

---

## Step 2: Deploy Backend to Render

### Method A: Blueprint (1-Click)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository (`Hospital-Management---SpringBoot`).
4. Render detects `render.yaml` automatically.
5. Fill in the required environment variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://[endpoint].neon.tech:5432/[dbname]?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: `[your-neon-user]`
   - `SPRING_DATASOURCE_PASSWORD`: `[your-neon-password]`
   - `FRONTEND_URL`: `https://your-frontend.vercel.app` (or update after deploying frontend)
6. Click **Apply**.

### Method B: Manual Web Service
1. In Render, click **New +** → **Web Service**.
2. Connect your repo and configure:
   - **Name**: `medibook-backend`
   - **Root Directory**: `backend`
   - **Language**: `Docker`
   - **Branch**: `main`
   - **Instance Type**: `Free`
3. Add Environment Variables:
   | Key | Value |
   |---|---|
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://[endpoint].neon.tech:5432/[dbname]?sslmode=require` |
   | `SPRING_DATASOURCE_USERNAME` | `[neon-username]` |
   | `SPRING_DATASOURCE_PASSWORD` | `[neon-password]` |
   | `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` |
   | `SERVER_PORT` | `8080` |
4. Click **Create Web Service**.
5. Copy your live backend URL (e.g., `https://medibook-backend.onrender.com`).

---

## Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New…** → **Project**.
3. Import your GitHub repository (`Hospital-Management---SpringBoot`).
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: click **Edit** and choose `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://medibook-backend.onrender.com/api/v1` |
   | `VITE_FIREBASE_API_KEY` | *(your Firebase API key)* |
   | `VITE_FIREBASE_AUTH_DOMAIN` | *(your Firebase auth domain)* |
   | `VITE_FIREBASE_PROJECT_ID` | *(your Firebase project ID)* |
   | `VITE_FIREBASE_STORAGE_BUCKET` | *(your Firebase storage bucket)* |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | *(your messaging sender ID)* |
   | `VITE_FIREBASE_APP_ID` | *(your Firebase app ID)* |
6. Click **Deploy**.
7. Vercel automatically uses [`frontend/vercel.json`](frontend/vercel.json) for smooth SPA routing without 404s!
8. Copy your live Vercel URL (e.g., `https://medibook-xyz.vercel.app`) and ensure it matches `FRONTEND_URL` in your backend Render environment variables.

---

## Alternative: Deploy Backend to Railway

1. Log in to [Railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select `Hospital-Management---SpringBoot`.
4. In **Settings**:
   - **Root Directory**: `/backend`
   - **Build**: Uses `backend/Dockerfile` automatically.
5. In **Variables**, add the same Spring Boot environment variables.
6. In **Networking**, click **Generate Domain** (e.g., `medibook-backend.up.railway.app`).

---

## Alternative: Deploy Frontend to Netlify

1. Log in to [Netlify](https://netlify.com).
2. Click **Add new site** → **Import an existing project**.
3. Select GitHub and choose your repository.
4. Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add `VITE_API_BASE_URL` and Firebase variables under **Site configuration** → **Environment variables**.
6. Click **Deploy site**.
7. Netlify automatically detects [`frontend/public/_redirects`](frontend/public/_redirects).

---

## Environment Variables Reference

### Backend (Spring Boot)
| Variable | Description | Example |
|---|---|---|
| `SPRING_DATASOURCE_URL` | JDBC URL for PostgreSQL | `jdbc:postgresql://ep-xyz.neon.tech:5432/Hospital?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `neondb_owner` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `******` |
| `JWT_SECRET` | 256-bit Hex secret for JWT signing | `404E63526655...` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `https://medibook.vercel.app` |
| `SERVER_PORT` | HTTP port | `8080` |

### Frontend (React + Vite)
| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base path | `https://medibook-backend.onrender.com/api/v1` |
| `VITE_FIREBASE_*` | Firebase Client SDK credentials | (from Firebase console) |
