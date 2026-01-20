# SOC Alert Noise Killer

This project is a full-stack application designed to help Security Operations Center (SOC) analysts triage and manage high-volume security alerts from systems like Wazuh.

## Project Structure

- **/server**: The backend API server (Node.js / Express).
- **/client**: The frontend user interface (React / Vite).
- **/simulator**: A script to generate and send mock Wazuh alerts to the backend.

---

## Quick Start (Development)

Follow these steps to get the application running in a local development environment.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- Windows Terminal (or a similar multi-tab terminal) is recommended for a better experience.

### Step 1: Install Dependencies

You need to install the dependencies for all three parts of the project.

1.  **Install Server Dependencies:**
    ```bash
    cd server
    npm install
    ```

2.  **Install Client Dependencies:**
    ```bash
    cd client
    npm install --legacy-peer-deps
    ```
    > **Note:** The `--legacy-peer-deps` flag is currently needed to resolve a dependency conflict with ESLint plugins.

3.  **Install Simulator Dependencies:**
    ```bash
    cd simulator
    npm install
    ```

### Step 2: Run the Application

A single script handles the entire startup process.

1.  **Go to the project root directory.**
2.  **Run the development startup script:**
    ```bash
    .\start-dev.bat
    ```

This script will:
1.  Stop any previously running Node.js processes.
2.  Open three new terminal windows for the **Backend**, **Frontend**, and **Simulator**.
3.  The frontend will be accessible at `http://localhost:5173`.

### Deprecated Scripts

The following scripts are no longer in use and should be ignored:

- `start_soc_tool.bat`
- `reset_and_run.bat`

These files were part of a previous, broken setup and will be removed in a future update.

---

## How It Works

- The **Backend** server listens on port `5000` for incoming alert data.
- The **Frontend**, a Vite-powered React app, runs on port `5173` and communicates with the backend via a proxy for all `/api` requests.
- The **Simulator** sends a flood of mock alerts to the backend's `/api/alerts` endpoint to populate the dashboard with data.
