# Finance Tracker

A simple web application that helps users track their personal finances by logging transactions, visualizing analytics, and monitoring spending goals — built with React and .NET.

---

## Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)   
- [Screenshots](#screenshots)  

---

## Features

- User authentication (register, login, logout)
- Profile update (email, password, name, goal)
- Add income and expenses
- Categorize transactions (salary, bills, custom, etc.)
- Monthly analytics: income vs expenses
- Category analytics: expenses
- Net worth and goal tracking
- Transaction history table with search option
- Responsive and modern UI

---

## Tech Stack

### Frontend
- **React** + **Vite**
- **Tailwind CSS** for styling

### Backend
- **.NET**
- **MySQL** (via Entity Framework Core)
- **Clean Architecture** principles
- **JWT** Authentication

---

## Getting Started

### Prerequisites

- Node.js & npm  
- .NET SDK  
- MySQL Server

### Clone the Repo

```bash
git clone https://github.com/vesc0/finance-tracker-webapp
cd finance-tracker-webapp
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend/FinanceTracker.API
dotnet restore
dotnet ef database update
dotnet run
```

---

## Screenshots
![Login](screenshots/login.png)
![Dashboard](screenshots/dashboard.png)
![Transactions](screenshots/transactions.png)
![Mobile](screenshots/mobile.png)
