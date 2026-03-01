# Vehicle Management System

Full-stack application for managing family vehicles, drivers, and refueling logs.

## Project Structure
- `src/`: Angular Frontend Application
- `backend/`: Node.js/Express + MongoDB Backend Application

## Prerequisites
- Node.js (v18+)
- MongoDB (running locally or URI provided in `.env`)

## Getting Started

### 1. Backend Setup
The backend handles data persistence and API endpoints.

```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:3000`.

### 2. Frontend Setup
The Angular application provides the user interface.

```bash
# In the root directory
npm install
ng serve
```
Navigate to `http://localhost:4200/`.

## Features
- **Dashboard**: Summary of vehicles, drivers, and costs.
- **Vehicles**: Manage vehicle details (ITV, Insurance, etc.).
- **Drivers**: Manage driver profiles.
- **Refuels**: Track fuel consumption and costs.
"# ControladorGasoil" 
