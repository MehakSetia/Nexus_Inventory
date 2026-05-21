# 🚀 Nexus Inventory

> **A full-stack B2B Inventory & Procurement Platform** — connecting Vendors and Buyers with real-time stock management, integrated payments, and role-based dashboards.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [API Endpoints](#-api-endpoints)
- [Roles & Permissions](#-roles--permissions)
- [Screenshots](#-screenshots)

---

## 🌟 Overview

Nexus is a **B2B Inventory Management System** built to streamline procurement and supply chain operations. Vendors can list products, track orders, and manage their storefronts. Buyers can browse products, place orders, and make payments. Admins have full oversight across all users, orders, and transactions.

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication & Authorization |
| **Zod** | Schema validation |
| **Razorpay** | Payment gateway integration |
| **Multer** | Image upload handling |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client |
| **Vite** | Build tool & dev server |
| **Vanilla CSS** | Custom styling with CSS variables |

---

## ✨ Features

### 👤 Authentication
- Register and Login with JWT-based authentication
- Role-based access control: **Buyer**, **Vendor**, **Admin**
- Protected routes — unauthenticated users land on the public Landing Page

### 📦 Products
- Vendors can **Add**, **Edit**, and **Delete** products
- Products include: Name, Price, Stock, Category, Description, Image URL, and **Dimensions (L × W × H)**
- Buyers can **browse and search** all available products
- Product detail modal shows Vendor name, dimensions, and full product info

### 🛒 Orders & Payments
- Buyers can **place orders** with Razorpay payment checkout
- Real-time order status tracking: `Pending → Processing → Shipped → Delivered`
- Vendors can **view and update** the status of their orders
- Automated **refund processing** on order cancellations

### 🛡️ Admin Dashboard
- Full visibility into all **Users**, **Orders**, and **Transactions**
- Search and filter users by name or email
- Manage user roles and platform-wide data

### 🎨 UI/UX
- Beautiful **Light Blue** themed interface with glassmorphism effects
- Fully responsive layout
- Smooth micro-animations and hover effects
- Role-aware navigation bar (links change based on who is logged in)

---

## 📁 Project Structure

```
Nexus_Inventory/
├── Nexus_Inventory-backend-setup/    ← Backend (branch: backend/setup)
│   └── src/
│       ├── controllers/              ← Business logic
│       ├── models/                   ← Mongoose schemas
│       ├── routes/                   ← Express routes
│       ├── validators/               ← Zod validation schemas
│       └── middleware/               ← Auth & error middleware
│
└── Nexus_Inventory-frontend/         ← Frontend (branch: frontend/setup)
    └── frontend/src/
        ├── pages/                    ← Page components
        ├── components/               ← Reusable UI components
        ├── auth/                     ← Token store & auth utilities
        └── utils/                    ← Helper functions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Razorpay account (for payment integration)

### 1. Clone the Repository
```bash
git clone https://github.com/MehakSetia/Nexus_Inventory.git
```

### 2. Setup Backend
```bash
cd Nexus_Inventory-backend-setup
npm install
```
Create a `.env` file (see [Environment Variables](#-environment-variables) below), then:
```bash
npm run dev
```
Backend runs on `http://localhost:3000`

### 3. Setup Frontend
```bash
cd Nexus_Inventory-frontend/frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend
Create a `.env` file inside `Nexus_Inventory-backend-setup/`:

```env
# Server
PORT=3000

# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend
Create a `.env` file inside `Nexus_Inventory-frontend/frontend/`:

```env
# Razorpay public key (required for checkout)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

> 💡 `VITE_API_BASE_URL` is optional — it defaults to `http://localhost:3000` if not set locally.
> When deploying the frontend, set it to your live backend URL.

> ⚠️ **Never commit your `.env` files to GitHub!** Both are already listed in `.gitignore`.

---

## 🌐 Deployment

### Backend — Render
| Field | Value |
|---|---|
| **Live URL** | https://nexus-inventory-2hho.onrender.com |
| **Platform** | [Render](https://render.com) |
| **Root Directory** | `Nexus_Inventory-backend-setup` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Branch** | `main` |

Add all backend environment variables in Render → **Environment** tab (do not commit `.env`).

> ⚠️ Make sure to whitelist `0.0.0.0/0` in **MongoDB Atlas → Network Access** so Render's servers can connect.

### Frontend — (Vercel / Netlify)
Before deploying the frontend, update the `.env` to point to the live backend:
```env
VITE_API_BASE_URL=https://nexus-inventory-2hho.onrender.com
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Products
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/product` | All roles |
| GET | `/api/product/:id` | All roles |
| POST | `/api/product` | Vendor |
| PUT | `/api/product/:id` | Vendor (own products) |
| DELETE | `/api/product/:id` | Vendor (own products) |

### Orders
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/order` | Buyer |
| GET | `/api/order/my` | Buyer |
| GET | `/api/order/vendor` | Vendor |
| PATCH | `/api/order/:id/status` | Vendor |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/admin/users` | Admin |
| GET | `/api/admin/orders` | Admin |

---

## 👥 Roles & Permissions

| Feature | Buyer | Vendor | Admin |
|---|:---:|:---:|:---:|
| Browse Products | ✅ | ✅ | ✅ |
| Place Orders | ✅ | ❌ | ❌ |
| Manage Own Products | ❌ | ✅ | ❌ |
| View Vendor Orders | ❌ | ✅ | ❌ |
| Admin Dashboard | ❌ | ❌ | ✅ |

---

## 📸 Screenshots

> Landing Page, Product Catalog, and Admin Dashboard coming soon!

---

## 👩‍💻 Author

**Mehak Setia**  
[GitHub](https://github.com/MehakSetia) · Built with ♥

---

*Nexus Inventory — Procurement & Supply Chain, Reimagined for Business.*
