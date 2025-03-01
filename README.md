# Sheqlee Backend

## A Job Matching & Freelance Platform Backend (Node.js, Express, MongoDB)

### 📌 Overview

Sheqlee is a job matching and freelance marketplace, enabling authentication, job subscriptions, freelancer & company management, and admin controls.And this is the Backend service of the Sheqlee platform.

This backend is built with Node.js, Express, and MongoDB, featuring JWT & Google OAuth authentication, dynamic job subscription handling, and comprehensive admin controls.

---

### 📜 Features

- ✅ **Authentication** – Secure JWT & Google OAuth for user login.
- ✅ **Freelancer Management** – Apply for jobs, subscribe to categories & tags, and manage favorite jobs.
- ✅ **Company Management** – Post jobs, manage job listings, and oversee applicants.
- ✅ **Admin Controls** – Activate/deactivate freelancers, companies, and job posts.
- ✅ **Job Subscription System** – Freelancers can subscribe to categories & tags to get relevant job updates.
- ✅ **Favorites & Applied Jobs** – Freelancers can mark jobs as favorites and track applied jobs.
- ✅ **Middleware & API Enhancements** – Secure routes, error handling, and data validation.

---

### 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ORM
- **Authentication:** JWT, Google OAuth
- **Validation:** Joi, Express Validator
- **Security:** Helmet, CORS, Rate Limiting, bcrypt for password hashing
- **Logging:** Morgan

---

### 🚀 Installation & Setup

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/sheqlee/cohort-2-group-4-backend.git
cd cohort-2-group-4-backend
```

#### 2️⃣ Install Dependencies

```bash
npm install
```

#### 3️⃣ Set Up Environment Variables

Create a `.env` file in the root and add:

```env
PORT=3000
DATABASE=mongodb_address
JWT_SECRET=your_secret
JWT_COOKIE_EXPIRES_IN=90
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_FREELANCER_REDIRECT_URI=your_freelancer_redirect_uri_callback
GOOGLE_COMPANY_REDIRECT_URI=your_company_redirect_uri_callback
DELETION_REQUEST_PERIOD=30
EMAIL_USERNAME=your_email_username
EMAIL_PASSWORD=your_email_app_password
```

#### 4️⃣ Run the Server

```bash
npm start
```

---

### 🔒 Security Features

- **JWT Authentication**: Protects user sessions
- **Google OAuth**: Allows seamless login
- **Rate Limiting**: Prevents abuse & DDoS attacks
- **Input Validation**: Secures data inputs
- **Helmet & CORS**: Enhances security & cross-origin requests

---

### 📩 Contact

- 💻 **Developed by**: Yowhans Nigus
- 📧 **Email**: johansking959@gmail.com
- 🔗 **GitHub**: [jo11223](https://github.com/jo11223)
