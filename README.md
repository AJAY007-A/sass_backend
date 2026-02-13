# 🧱 SaaS Backend API

A fully functional, production-grade Node.js backend for a SaaS application — built with **Express v5**, **Prisma ORM**, **Razorpay**, **Resend**, and **Google OAuth**.

---

## 📁 Project Structure

```
backend/
│
├── prisma/
│   ├── schema.prisma              # Database schema & models
│   └── migrations/                # Auto-generated migrations
│
├── src/
│   ├── server.js                  # Entry point (DB connect, graceful shutdown)
│   ├── app.js                     # Express app setup (CORS, Helmet, Passport, routes)
│   │
│   ├── config/
│   │   ├── db.js                  # Prisma client singleton
│   │   ├── razorpay.js            # Razorpay SDK setup
│   │   ├── resend.js              # Resend email client
│   │   └── passport.js            # Google OAuth strategy
│   │
│   ├── routes/
│   │   ├── index.js               # Mounts all sub-routes
│   │   ├── authRoutes.js          # /api/auth/*
│   │   ├── billingRoutes.js       # /api/billing/*
│   │   ├── adminRoutes.js         # /api/admin/*
│   │   ├── premiumRoutes.js       # /api/premium/*
│   │   └── webhookRoutes.js       # /api/webhooks/*
│   │
│   ├── controllers/
│   │   ├── authController.js      # Register, login, Google, password reset
│   │   ├── billingController.js   # Subscribe, cancel, get subscription, payments
│   │   ├── adminController.js     # Stats, recent users, recent payments
│   │   ├── premiumController.js   # Protected premium content
│   │   └── webhookController.js   # Razorpay webhook handler
│   │
│   ├── services/
│   │   ├── authService.js         # Auth business logic
│   │   ├── billingService.js      # Razorpay integration logic
│   │   ├── webhookService.js      # Webhook signature verification & event handling
│   │   ├── emailService.js        # Styled HTML email templates (Resend)
│   │   └── adminService.js        # Analytics & metrics queries
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification + admin guard
│   │   ├── subscriptionMiddleware.js  # Blocks FREE users from premium
│   │   └── errorMiddleware.js     # Global error handler (dev vs prod)
│   │
│   └── utils/
│       ├── generateToken.js       # JWT token generator
│       ├── asyncHandler.js        # Async try-catch wrapper
│       └── AppError.js            # Custom operational error class
│
├── .env                           # Secrets & API keys
├── package.json
└── README.md
```

---

## 🧠 Architecture Pattern

```
Route → Controller → Service → Database / External API
```

This separation makes the app **scalable**, **testable**, and **easy to maintain**.

---

## 🔗 API Endpoints

### Auth — `/api/auth`

| Method  | Endpoint                    | Auth   | Description                     |
|---------|-----------------------------|--------|---------------------------------|
| `POST`  | `/register`                 | Public | Register + auto FREE plan       |
| `POST`  | `/login`                    | Public | Login with email & password     |
| `GET`   | `/me`                       | JWT    | Get current user profile        |
| `POST`  | `/forgot-password`          | Public | Send password reset email       |
| `PATCH` | `/reset-password/:token`    | Public | Reset password with token       |
| `GET`   | `/google`                   | Public | Start Google OAuth flow         |
| `GET`   | `/google/callback`          | OAuth  | Google callback → redirect      |

### Billing — `/api/billing`

| Method  | Endpoint          | Auth | Description                     |
|---------|-------------------|------|---------------------------------|
| `POST`  | `/subscribe`      | JWT  | Create Razorpay subscription    |
| `POST`  | `/cancel`         | JWT  | Cancel active subscription      |
| `GET`   | `/subscription`   | JWT  | Get subscription details        |
| `GET`   | `/payments`       | JWT  | Get payment history             |

### Admin — `/api/admin`

| Method | Endpoint     | Auth  | Description                      |
|--------|-------------|-------|----------------------------------|
| `GET`  | `/stats`    | Admin | Dashboard analytics              |
| `GET`  | `/users`    | Admin | Recent users list                |
| `GET`  | `/payments` | Admin | Recent payments list             |

### Premium — `/api/premium`

| Method | Endpoint | Auth       | Description                      |
|--------|----------|------------|----------------------------------|
| `GET`  | `/`      | JWT + Sub  | Premium-only content             |

### Webhooks — `/api/webhooks`

| Method | Endpoint     | Auth    | Description                     |
|--------|--------------|---------|---------------------------------|
| `POST` | `/razorpay`  | Webhook | Razorpay event handler          |

### Health

| Method | Endpoint   | Auth   | Description                      |
|--------|------------|--------|----------------------------------|
| `GET`  | `/health`  | Public | Server health check              |

---

## 🎯 Features

- ✅ Email & Google authentication
- ✅ Forgot / reset password with secure tokens
- ✅ Auto FREE subscription on registration
- ✅ Razorpay recurring billing (BASIC / PRO / PREMIUM)
- ✅ Webhook automation (signature verification + 5 event types)
- ✅ Styled email notifications (welcome, reset, subscription, cancellation)
- ✅ Premium feature protection (JWT + subscription middleware)
- ✅ Admin analytics dashboard (users, MRR, churn, plan breakdown)
- ✅ Payment history tracking
- ✅ Graceful shutdown & error handling
- ✅ Express v5 compatible

---

## 🛠️ Tech Stack

| Technology                  | Purpose                         |
|-----------------------------|---------------------------------|
| **Node.js + Express v5**    | Web framework                   |
| **Prisma**                  | ORM for PostgreSQL              |
| **Razorpay**                | Payment & subscription billing  |
| **Resend**                  | Transactional emails            |
| **Passport.js**             | Google OAuth 2.0                |
| **JSON Web Tokens (JWT)**   | Stateless authentication        |
| **bcryptjs**                | Password hashing                |
| **Helmet**                  | Security headers                |
| **Morgan**                  | HTTP request logging (dev)      |

---

## ⚙️ Environment Variables

Create a `.env` file in the root with these keys:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development

RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"

RAZORPAY_PLAN_BASIC="plan_xxx"
RAZORPAY_PLAN_PRO="plan_xxx"
RAZORPAY_PLAN_PREMIUM="plan_xxx"

GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

RESEND_API_KEY="your_resend_api_key"
EMAIL_FROM=onboarding@resend.dev

FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 4. Start development server

```bash
npm run dev
```

### 5. Start production server

```bash
npm start
```

---

## 📊 Database Models

| Model                | Description                           |
|----------------------|---------------------------------------|
| **User**             | Email, password hash, Google ID, role |
| **Subscription**     | Plan, status, Razorpay sub ID, dates  |
| **Payment**          | Amount, currency, Razorpay payment ID |
| **PasswordResetToken** | Hashed token, expiry, user link     |

### Enums

- **Role**: `USER`, `ADMIN`
- **Plan**: `FREE`, `BASIC`, `PRO`, `PREMIUM`
- **SubscriptionStatus**: `TRIALING`, `ACTIVE`, `PAST_DUE`, `CANCELED`

---

## 🔐 Security

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT-based stateless authentication
- Razorpay webhook **HMAC SHA256 signature verification**
- Password reset tokens are **SHA256 hashed** before storage
- **Helmet** for HTTP security headers
- CORS restricted to frontend origin
- Request body size limited to **10kb**
- No `console.log` statements in production code

---
