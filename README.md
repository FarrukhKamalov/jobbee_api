Jobbee API
👨‍💻 Project Overview
Jobbee API is a comprehensive backend system for managing job listings, applications, and user authentication. It provides a RESTful API that supports CRUD operations, user management, and secure authentication.

🚀 Features
Job Listings: Create, update, delete, and search job posts.
User Authentication: Secure registration and login using JWT.
Role-Based Access: Admin and user roles with distinct permissions.
Pagination and Filtering: Efficient data handling for job listings.
🛠 Tech Stack
Node.js
Express.js
MongoDB
JWT for Authentication
Mongoose for Database Modeling
📚 Installation
Clone the repo:
bash
Copy code
git clone https://github.com/KamolovFarrux2005/jobbeeapi.git
Navigate to the project directory:
bash
Copy code
cd jobbeeapi
Install dependencies:
bash
Copy code
npm install
Set up environment variables by creating a .env file:
plaintext
Copy code
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
JWT_EXPIRES_TIME=7d
Start the server:
bash
Copy code
npm start
🧪 Running Tests
To run tests, use:
bash
Copy code
npm test
🔗 API Endpoints
/api/v1/jobs - CRUD operations for job listings
/api/v1/auth - User registration and login
🛡️ Security
Helmet: Protects against well-known vulnerabilities.
Rate Limiting: Prevents DDoS attacks.
📄 License
This project is licensed under the MIT License.

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check issues page.

