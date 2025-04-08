# 🚀 Project Setup Guide

## 1. **Clone the Repository**
```sh
git clone <repository-url>
cd edu-center
```

## 2. **Install Dependencies**
```sh
npm install
```

## 3. **Set Up Environment Variables**
- Create a `.env` file in the root directory.
- Use the `.env.example` file as a reference:

```env
DB_USER=
DB_PASSWORD=
DB_APP=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_DURATION=
REFRESH_TOKEN_DURATION=
VALKEY_HOST=valkey
VALKEY_PORT=6379
```

## 4. **Set Up MongoDB**
Ensure MongoDB is running locally **or** provide a valid connection string in the `.env` file.

## 5. **Set Up Valkey**
Valkey is a Redis-compatible caching service.  
For installation instructions, check the [Valkey GitHub repository](https://github.com/valkey-io/valkey).

---

# Running the Project

### Development Mode (with auto-reload)
```sh
npm run dev
```

### Production Mode
```sh
npm start
```

---

# Using Docker

### 1. **Build and Start Containers**
```sh
docker-compose up --build
```

### 2. **Stop Containers**
```sh
docker-compose down
```