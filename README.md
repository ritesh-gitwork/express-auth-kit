# express-auth-kit

Plug-and-play authentication for Express.js apps.  
Ships with signup, signin, JWT protection, MongoDB/Mongoose, and Zod input validation — all in ES Modules.

---

## Features

- User signup with hashed passwords (bcryptjs)
- User signin with JWT token response
- `GET /auth/me` — fetch the logged-in user
- Zod validation on all inputs (clear error messages)
- `authMiddleware` to protect any route in your app
- `connectDB` helper to connect to MongoDB

---

## Requirements

- Node.js 18+
- Express 4 or 5
- A MongoDB database (local or MongoDB Atlas)

---

## Installation

```bash
npm install express-auth-kit
```

Install Express and dotenv in your own project if you haven't already:

```bash
npm install express dotenv
```

---

## Quick Start

### 1. Create a `.env` file in your project root

```env
MONGO_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

> Never commit your `.env` file. Add it to `.gitignore`.

---

### 2. Set up your Express app

```js
// app.js
import "dotenv/config";
import express from "express";
import { connectDB, authRouter } from "express-auth-kit";

const app = express();

// Parse incoming JSON
app.use(express.json());

// Connect to MongoDB
await connectDB(process.env.MONGO_URI);

// Mount auth routes at /auth
app.use("/auth", authRouter);

// Your own routes below...
app.get("/", (req, res) => res.send("Hello World"));

app.listen(3000, () => console.log("Server running on port 3000"));
```

> Make sure your `package.json` has `"type": "module"` to use ES Modules.

---

## Auth Routes

All routes are mounted wherever you call `app.use('/auth', authRouter)`.

### `POST /auth/signup`

Register a new user.

**Request body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success response (201):**

```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGci...",
  "user": {
    "id": "664abc...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Validation error (400):**

```json
{
  "success": false,
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

---

### `POST /auth/signin`

Sign in with email and password.

**Request body:**

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success response (200):**

```json
{
  "success": true,
  "message": "Signed in successfully",
  "token": "eyJhbGci...",
  "user": {
    "id": "664abc...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Invalid credentials (401):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### `GET /auth/me` _(protected)_

Get the currently authenticated user. Requires a valid JWT in the `Authorization` header.

**Request headers:**

```
Authorization: Bearer <your_token>
```

**Success response (200):**

```json
{
  "success": true,
  "user": {
    "_id": "664abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Protecting Your Own Routes

Use `authMiddleware` on any route you want to lock behind authentication.

```js
import { authMiddleware } from 'express-auth-kit';

// Single route
app.get('/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Hello user ${req.user.userId}` });
});

// Router group
import { Router } from 'express';
const router = Router();
router.use(authMiddleware); // protects ALL routes in this router

router.get('/profile', (req, res) => { ... });
router.put('/settings', (req, res) => { ... });
```

After the middleware runs, `req.user` contains:

```js
{
  userId: "664abc..."; // MongoDB _id of the logged-in user
}
```

---

## API Reference

### `connectDB(mongoUri)`

Connects to MongoDB. Call this once before starting your server.

```js
import { connectDB } from "express-auth-kit";

await connectDB(process.env.MONGO_URI);
```

| Parameter  | Type   | Description                    |
| ---------- | ------ | ------------------------------ |
| `mongoUri` | string | Your MongoDB connection string |

Throws if `mongoUri` is missing or the connection fails.

---

### `authRouter`

An Express Router with three routes pre-configured:

| Method | Path      | Description        |
| ------ | --------- | ------------------ |
| POST   | `/signup` | Register new user  |
| POST   | `/signin` | Login, returns JWT |
| GET    | `/me`     | Get current user   |

Mount it with:

```js
app.use("/auth", authRouter); // routes become /auth/signup, /auth/signin, /auth/me
app.use("/api/auth", authRouter); // or any prefix you like
```

---

### `authMiddleware`

Express middleware that verifies the JWT from the `Authorization: Bearer <token>` header.

On success: adds `req.user = { userId }` and calls `next()`.  
On failure: responds `401` with `{ success: false, message: "..." }`.

---

## Environment Variables

| Variable         | Required | Default | Description                   |
| ---------------- | -------- | ------- | ----------------------------- |
| `MONGO_URI`      | Yes      | —       | MongoDB connection string     |
| `JWT_SECRET`     | Yes      | —       | Secret key for signing JWTs   |
| `JWT_EXPIRES_IN` | No       | `7d`    | JWT expiry (e.g. `1h`, `30d`) |

---

## Full Project Example

```
my-project/
├── .env
├── package.json        ← must have "type": "module"
├── app.js
└── routes/
    └── posts.js
```

```js
// app.js
import "dotenv/config";
import express from "express";
import { connectDB, authRouter } from "express-auth-kit";
import postsRouter from "./routes/posts.js";

const app = express();
app.use(express.json());

await connectDB(process.env.MONGO_URI);

app.use("/auth", authRouter);
app.use("/posts", postsRouter); // your own routes

app.listen(3000);
```

```js
// routes/posts.js
import { Router } from "express";
import { authMiddleware } from "express-auth-kit";

const router = Router();

router.get("/", (req, res) => res.json({ posts: [] })); // public
router.post("/", authMiddleware, (req, res) => {
  // protected
  res.json({ message: `Post created by ${req.user.userId}` });
});

export default router;
```

---

## License

MIT
