# InfoShield

InfoShield is a **Chrome extension** designed to analyze and display the credibility of highlighted text on webpages. It currently shows a placeholder credibility score tooltip when text is selected.

---

## How to Set Up Locally

Follow these steps to fork, clone, and set up the project:

### 1. Fork the Repository

1. Go to the original repository: [https://github.com/Dibaa23/infoshield](https://github.com/Dibaa23/infoshield).  
2. Click the **Fork** button in the top-right corner to create a copy under your GitHub account.

### 2. Clone Your Forked Repository

Replace `<your-username>` with your GitHub username:
```bash
cd Documents/Github
git clone https://github.com/<your-username>/infoshield.git
cd infoshield
```

### 3. Check Node.js and npm Versions

Ensure you have the required versions of Node.js and npm installed:
```bash
node -v
npm -v
```
Minimum versions:
- **Node.js**: `v22.13.0`  
- **npm**: `10.9.2`

### 4. Install Dependencies

Install all required packages:
```bash
npm install
```

### 5. Start the Development Server

Run the following command to start the local development server:
```bash
npm run dev
```
- The app will be available at:
  ```
  Local:   http://localhost:8080/
  Network: http://<your-ip>:8080/
  ```
- Press `Ctrl + C` to stop the server.

---

## How to Load as a Chrome Extension

1. Open **Chrome** and navigate to:
   ```
   chrome://extensions/
   ```
2. Enable **Developer Mode** (toggle in the top-right corner).  
3. Click **Load unpacked**.  
4. Select the `/public` folder inside the cloned project directory.  
5. Go to **Details** for the extension:
   - **Pin to Toolbar**: Pin the extension to the browser toolbar for quick access.  
   - **Allow in Incognito**: Enable this option if needed.  
   - **Allow Access to File URLs**: Grant access if testing on local HTML files.  

---

## What to Expect

- Navigate to any webpage in Chrome.  
- **Highlight text** with your cursor.  
- A small **credibility score tooltip** will appear, displaying placeholder data.  

---

## Troubleshooting

- If you encounter errors during setup, ensure your Node.js and npm versions are up-to-date.  
- Check the **Developer Console** (`F12` > Console) on any webpage to debug issues with the extension.  

---

## Future Plans

- **Fact-Checking Backend**: Integrate AI or APIs for real credibility scores.  
- **Enhanced UI**: Build React/Vite-based popups or dashboards.  
- **Styling Updates**: Improve tooltip visuals and interactivity.  

---

## Contributing

1. **Fork the repository** to your GitHub account.  
2. **Clone the forked repository** to your local machine:  
   ```bash
   git clone https://github.com/<your-username>/infoshield.git
   cd infoshield
   ```
3. **Create a new branch** for your changes:  
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** to the codebase.  
5. **Check the status** of your changes:  
   ```bash
   git status
   ```
6. **Stage the changes** for commit:  
   ```bash
   git add .
   ```
7. **Configure your Git identity (if not already set)**:  
   ```bash
   git config --global user.email "your-email@example.com"
   git config --global user.name "Your Name"
   ```
8. **Commit your changes** with a descriptive message:  
   ```bash
   git commit -m "Your descriptive commit message"
   ```
9. **Push the branch** to your forked repository:  
   ```bash
   git push origin feature/your-feature-name
   ```
10. **Open a Pull Request**:  
    - Go to the original repository on GitHub.  
    - Click "Compare & pull request" to submit your changes for review.  

---