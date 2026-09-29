# ResQGrid Setup Guide 🚀

Follow this step-by-step guide to install, configure, and launch the ResQGrid multi-hazard decision support system on your local machine.

---

## 📋 Prerequisites
Ensure your system has the following installed before proceeding:
- **Node.js** (v18.0 or higher recommended)
- **npm** (comes bundled with Node.js)
- **Git** (for cloning the repository)

---

## 🛠️ Installation Process

### Step 1: Clone the Repository
Open your terminal or command prompt and run:
```bash
git clone https://github.com/your-username/ResQGrid.git
cd ResQGrid
```

### Step 2: Install Dependencies
ResQGrid uses a monorepo structure with a Node.js Express backend and a React (Vite) frontend. We have a built-in script to install everything at once.

Run the following command from the **root directory**:
```bash
npm run install:all
```
*(This command automatically navigates into both the `/server` and `/client` folders and runs `npm install` for you).*

### Step 3: Configure Environment (Optional but Recommended)
By default, the backend runs entirely in **DEMO MODE** using an in-memory database and procedurally generated fallback data. It requires **zero setup** to run the hackathon demo. 

However, if you want to connect it to a real database:
1. Navigate to the `/server` folder.
2. Rename `.env.example` to `.env`.
3. Add your MongoDB Atlas connection string: `MONGO_URI=mongodb+srv://...`

---

## 🚀 Running the Application

Once dependencies are installed, you can launch both the backend server and the frontend React application simultaneously.

Run the following command from the **root directory**:
```bash
npm run dev
```

You will see output indicating that both the server and the client have started.
- The **Frontend** will automatically become available at: [http://localhost:5173](http://localhost:5173)
- The **Backend API** will run at: `http://localhost:5000`

---

## 🔐 Demo Login Credentials
When you open `http://localhost:5173` in your browser, you will be greeted by the ResQGrid login screen. 

Use the Quick Login buttons on the screen, or log in manually using these pre-seeded demo accounts:

**Administrator (Full Access)**
- Email: `admin@resqgrid.gov.in`
- Password: `Admin@123`

**Sub Admin / Analyst**
- Email: `analyst@resqgrid.gov.in`
- Password: `Analyst@12345`

---

## 🛑 Troubleshooting

- **White Screen or Missing Map Tiles?** 
  Refresh the page. Ensure you are connected to the internet, as the interactive map pulls live satellite tiles from Esri, and the engine fetches live weather telemetry from Open-Meteo.
- **Port Conflicts?**
  If `localhost:5000` or `localhost:5173` is already in use by another app, you can change the backend port in `server/.env` (`PORT=5001`) and update the Vite proxy inside `client/vite.config.js`.
