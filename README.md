# 🏦 Leo Bank — Fintech Wallet App

A full-stack digital wallet application built with React, Node.js, and Supabase. Leo Bank allows users to send money, deposit, withdraw, and refer friends for bonuses.

---

## 🌐 Live Demo

- **Frontend:** [leo-bank.vercel.app](https://leo-bank.vercel.app)
- **Backend API:** [leo-bank.onrender.com](https://leo-bank.onrender.com)

---

## ✨ Features

- 🔐 User authentication (Register & Login with JWT)
- 💸 Send money between wallets
- 💰 Deposit and withdraw funds
- 📊 Transaction history with chart
- 👤 User profile page
- 🎁 Referral system — both referrer and new user get ₦500 bonus
- 📱 Fully responsive (mobile, tablet, desktop)

---

## 🛠 Tech Stack

**Frontend**
- React + Vite
- React Router DOM
- Axios
- Recharts
- React Toastify
- CSS (custom responsive styles)

**Backend**
- Node.js + Express
- Supabase (PostgreSQL database)
- JWT Authentication
- Bcrypt (password hashing)

**Deployment**
- Frontend → Vercel
- Backend → Render
- Database → Supabase

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Supabase account and project

### 1. Clone the repository

```bash
git clone https://github.com/Lionel559/leo-bank.git
cd leo-bank
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

Start the backend server:

```bash
node server.js
```

Server runs on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Update `src/config.js` with your backend URL:

```js
const API = "http://localhost:5000"
export default API
```

Start the frontend:

```bash
npm run dev
```

App runs on `http://localhost:5173`

---

## 🗄 Database Tables

### `users`
| Column | Type |
|--------|------|
| id | uuid |
| name | text |
| email | text |
| phone | text |
| country | text |
| password | text (hashed) |
| wallet_id | text |
| balance | numeric |
| referral | text |

### `transcations`
| Column | Type |
|--------|------|
| id | uuid |
| sender_wallet | text |
| receiver_wallet | text |
| amount | numeric |
| type | text |
| status | text |
| created_at | timestamp |

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Create new account | ❌ |
| POST | `/login` | Login and get token | ❌ |
| GET | `/balance/:wallet` | Get user balance | ✅ |
| GET | `/transactions` | Get transaction history | ✅ |
| POST | `/send-money` | Transfer to another wallet | ✅ |
| POST | `/deposit` | Deposit funds | ✅ |
| POST | `/withdraw` | Withdraw funds | ✅ |

---

## 🎁 Referral System

Every user's **Wallet ID** is their referral code. When a new user registers using a referral code:
- ✅ New user receives **₦500** starting balance
- ✅ Referrer receives **₦500** bonus added to their balance
- Both transactions are logged in the transaction history

---

## 📁 Project Structure

```
leo-bank/
├── backend/
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   └── Sidebar.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Transactions.jsx
    │   │   └── Referrals.jsx
    │   ├── styles/
    │   │   ├── auth.css
    │   │   ├── dashboard.css
    │   │   ├── sidebar.css
    │   │   └── layout.css
    │   ├── config.js
    │   └── App.jsx
    └── package.json
```

---

## 🔒 Security

- Passwords are hashed using **bcrypt**
- All protected routes require a **JWT token**
- Environment variables are used for all sensitive keys
- `.env` file is excluded from version control

---

## 👨‍💻 Author

**Lionel** — [@lionel559](https://github.com/lionel559)

---

## 📄 License

This project is for educational purposes.
