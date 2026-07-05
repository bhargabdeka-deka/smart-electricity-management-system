# ⚡ Smart Electricity Management System

A production-grade, full-stack MERN (MongoDB, Express, React, Node.js) web application designed to digitize and streamline the operations of an electricity board. This system manages the complete lifecycle of electricity connections, from customer application and field engineer inspection to meter installation and ongoing energy tracking.

## 🚀 Key Features

### 👤 Customer Portal
- **Dynamic State-Driven Dashboard**: Adapts intelligently based on the user's current lifecycle stage (Registered, Pending, Approved, Meter Installed, Withdrawn, etc.).
- **Smart Connection Application**: A guided, multi-step stepper form for applying for a new electricity connection.
- **Application Tracker & History**: A comprehensive, read-only audit trail and timeline view of all past and current applications.
- **Application Withdrawal**: Production-grade cancellation workflow allowing users to safely withdraw pending applications without deleting historical records.
- **Copy-to-Clipboard Utilities**: One-click copying for Application IDs and Account Numbers.

### 👷 Field Engineer Workflows
- **Assigned Jobs Dashboard**: Engineers can view their scheduled site inspections.
- **Digital Inspection & Metering**: Secure workflow for determining required load, verifying premises, and registering physical meter serial numbers.

### 🛡️ Administrative & System Features
- **Strict Role-Based Access Control (RBAC)**: Secure routing and API endpoints split between `User`, `Engineer`, `Admin`, and `Superadmin`.
- **Duplicate Application Prevention**: Backend validation ensures users cannot submit concurrent connection requests.
- **Secure ID Generation**: Robust, auto-generated Application IDs (e.g., `APP-2026-681923`) enforced at the database schema level.
- **Responsive UI/UX**: Built with modern CSS Grid/Flexbox, ensuring pixel-perfect rendering across mobile, tablet, and desktop displays.

## 🛠️ Technology Stack

- **Frontend**: React.js, React Router DOM, Axios, Lucide React (Icons), React Toastify.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB & Mongoose.
- **Authentication**: JSON Web Tokens (JWT) & bcrypt.js.
- **Styling**: Vanilla CSS with modern custom properties, flexbox, and grid layouts (Tailwind-free for maximum granular control).

## 📂 Architecture Highlights

### The Lifecycle Engine
The core of the customer portal is powered by a custom lifecycle engine (`lifecycleConfig.js` and `stateMapper.js`). Instead of hardcoding UI components, the dashboard renders widgets (Account Summary, Timeline, Quick Actions, Alerts) dynamically based on the strict current status of the customer's `ConnectionRequest` document in MongoDB.

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (Local or Atlas URI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd smart-electricity-system
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `/server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```

5. **Run the Application:**
   Start both servers (preferably in separate terminals):
   
   **Terminal 1 (Backend):**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 (Frontend):**
   ```bash
   cd client
   npm start
   ```

   *The frontend runs on `http://localhost:3000` and proxies API requests to the backend.*

## 🤝 Contributing
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📝 License
This project is proprietary and confidential. Unauthorized copying of this file, via any medium is strictly prohibited.
