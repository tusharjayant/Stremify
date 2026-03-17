# 🎬 Stremify - Video Management Backend

A powerful, scalable, and fully functional backend API for a video hosting and streaming platform (inspired by YouTube).

## 🚀 Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB & Mongoose
* **File Handling:** Multer & Cloudinary
* **Authentication:** JWT (JSON Web Tokens) & Bcrypt

## ✨ Key Features
* 🔐 **Secure Authentication:** User signup, login, logout, and secure access/refresh token generation.
* 📹 **Video Management:** Video upload, publish/unpublish, and tracking watch history.
* 💬 **Social Interactions:** Like, comment, and tweet functionalities.
* 🧑‍🤝‍🧑 **Subscriptions:** Subscribe/unsubscribe to channels and view subscriber count.
* 📁 **Playlists:** Create, update, and manage video playlists.
* ⚙️ **Standardized Responses:** Custom `ApiError` and `ApiResponse` utilities for clean debugging.
  
## 🛠️ Installation & Setup

**1. Clone the repository:**
```bash
$git clone https://github.com/tusharjayant/Stremify.git$
```

**2. Install dependencies:**
```bash
npm install
```

**3. Environment Variables:**

Create a .env file in the root directory and add your secrets:

```
PORT=8000
MONGODB_URI=<your-mongodb-connection-string>
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=<your-access-token-secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

**4. Start the development server:**

```bash
npm run dev
```
Developed by Tushar Jayant
