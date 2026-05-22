# 🚀 Nexus Inventory

**Live Demo:** https://nexus-cqo0i0imu-mehaksetia2004-4237s-projects.vercel.app

> **A full-stack B2B Inventory & Procurement Platform** — connecting Vendors and Buyers with real-time stock management, integrated payments, and role-based dashboards.

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
Create a `.env` file (see [Environment Variables] below), then:
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

Create a `.env` file in the `Nexus_Inventory-backend-setup/` folder:

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

> 💡 `VITE_API_BASE_URL` is optional — it defaults to `http://localhost:3000` if not set.
> ⚠️ **Never commit your `.env` file to GitHub!** It is already listed in `.gitignore`.

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
| GET | `/api/products` | All roles |
| GET | `/api/products/:id` | All roles |
| POST | `/api/products` | Vendor |
| PUT | `/api/products/:id` | Vendor (own products) |
| DELETE | `/api/products/:id` | Vendor (own products) |

### Orders
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/orders` | Buyer |
| GET | `/api/orders/my` | Buyer |
| GET | `/api/orders/vendor` | Vendor |
| PATCH | `/api/orders/:id/status` | Vendor |

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


*Nexus Inventory — Procurement & Supply Chain, Reimagined for Business.*
