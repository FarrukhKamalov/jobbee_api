# Jobbee API

## 👨‍💻 Project Overview
Jobbee API is a comprehensive backend system for managing job listings, applications, and user authentication. It provides a RESTful API that supports CRUD operations, user management, and secure authentication.

## 🚀 Features
- **Job Listings:** Create, update, delete, and search job posts.
- **User Authentication:** Secure registration and login using JWT.
- **Role-Based Access:** Admin and user roles with distinct permissions.
- **Pagination and Filtering:** Efficient data handling for job listings.

## 🛠 Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB**
- **JWT for Authentication**
- **Mongoose for Database Modeling**

## 📚 Installation

1. Clone the repo:
    ```bash
    git clone https://github.com/KamolovFarrux2005/jobbeeapi.git
    ```

2. Navigate to the project directory:
    ```bash
    cd jobbeeapi
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Set up environment variables by creating a `.env` file:
    ```plaintext
    NODE_ENV=development
    PORT=5000
    MONGO_URI=your_mongo_uri
    JWT_SECRET=your_secret
    JWT_EXPIRES_TIME=7d
    ```

5. Start the server:
    ```bash
    npm start
    ```

## 🔗 API Endpoints
```plaintext
/api/v1/jobs - CRUD operations for job listings
/api/v1/auth - User registration and login
```

## 🛡️ Security

- Helmet: Protects against well-known vulnerabilities.
- Rate Limiting: Prevents DDoS attacks.

## 📄 License
- **This project is licensed under the MIT License.**

