

---

# 🚀 GigFlow Server (Local Setup)

Backend API for the **(GigFlow)** platform.

Built with:

* **Node.js & Express** – Server & REST API
* **MongoDB & Mongoose** – Database & ODM
* **Socket.io** – Real-time features
* **JWT** – Authentication

---

## 📦 Prerequisites

Install the following before starting:

* **Node.js** (v18+ recommended)
* **npm**
* **MongoDB (local)** or **MongoDB Atlas**
* (Optional) Postman / Thunder Client for testing APIs

---

## ⚙️ Local Setup & Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/gigflow-server.git
cd gigflow-server
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/gigflow
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

✅ Notes:

* Make sure MongoDB is running locally
* Use `127.0.0.1` instead of `localhost`
* `CLIENT_URL` must match your frontend dev URL

---

### 4️⃣ Start MongoDB

Check if running:

```bash
mongosh
```

If not running:

```bash
sudo systemctl start mongod
```

---

### 5️⃣ Run the server

Development mode (recommended):

```bash
npm run dev
```

Or normal mode:

```bash
npm start
```

Server will start at:

```
http://localhost:5000
```

---

## 🔌 Socket.io (Local)

Frontend connection example:

```js
const socket = io("http://localhost:5000", {
  withCredentials: true
});
```

---

## ⚠️ Important Local Configuration

### ✅ CORS

Ensure:

```env
CLIENT_URL=http://localhost:5173
```

### ✅ Cookies & Auth

If frontend runs on a different port:

* `credentials: true`
* `secure: false`
* `sameSite: "none"`

(Use `secure: true` only in production)

---

