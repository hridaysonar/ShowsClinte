# 🛡️ Life Insurance Management Platform

A modern, full-stack life insurance management web application designed for seamless interaction between customers, agents, and administrators. Built with the **MERN Stack**, this platform enables users to explore policies, get personalized quotes, apply for insurance, manage payments, and track claims—all from a secure and responsive web interface.

## 🔗 Live Site

[🌐 Visit Live Website](https://assignment-11-6aa37.web.app/)

## 🔐 Admin Credentials

-   **Email:** admin@insurehub.com
-   **Password:** Admin@123

## 🧠 Tech Stack

-   **Frontend:** React.js, Tailwind CSS, Framer Motion, Headless UI, React Router, React Hook Form, SweetAlert2, React Helmet Async
-   **Backend:** Express.js, MongoDB, JWT, Stripe
-   **Authentication:** Firebase Auth (Email/Password + Google)
-   **State/Data Management:** @tanstack/react-query
-   **Other Tools:** PDF Generator, React Icons, Date-fns

---

## ✅ Features

-   🔐 **Role-Based Authentication:** Admin, Agent, Customer (with JWT & Firebase)
-   📱 **Fully Responsive UI:** Mobile, Tablet & Desktop compatible
-   🎯 **Policy Quote Calculator:** Custom quote based on age, gender, duration, etc.
-   🧾 **Policy Application System:** Apply online and track application status
-   👩‍💼 **Agent Assignment & Application Management:** Admins can assign agents
-   💬 **Admin Rejection with Feedback Modal** with database storage
-   💳 **Stripe Payment Integration:** Secure premium payment & status tracking
-   📁 **Policy Claim System:** Customers can submit and track claims
-   📈 **Transaction History:** Track payments & generate reports with filters
-   ✍️ **Blog System:** Role-based blog creation, editing, and listing
-   📸 **Profile Management:** Role badge, profile update & last login info
-   📜 **PDF Generation:** Download approved policy as a PDF
-   🌟 **Testimonials:** Star rating + review shown dynamically on homepage
-   🔍 **Search & Filter Policies:** Keyword search & category filters
-   📰 **Newsletter Subscription:** Stores data in DB
-   🎉 **SweetAlert2 & Toastify Integration:** No default browser alerts
-   🧠 **Clean & Structured Codebase:** Reusable components, optimized queries
-   🔁 **Pagination & Sorting:** Policies page supports pagination
-   🎨 **Dynamic Helmet Titles** across routes

---

## 🧭 Folder Structure

```bash
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── routes/
│   │   ├── context/
│   │   └── main.jsx
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middlewares/
│   └── index.js
```

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
