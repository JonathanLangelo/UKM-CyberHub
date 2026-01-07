# CTF Challenge - IDOR Vulnerability

> **⚠️ DISCLAIMER**: This project is created for educational purposes only as part of a Capture The Flag (CTF) competition. The vulnerabilities are intentionally implemented for learning purposes.

## 🎯 Challenge Overview

**Difficulty**: Medium  
**Category**: Web Security  
**Flag**: `ICH{G3l0_D4h_b1s4_1D0R}`

### Learning Objectives

Participants will learn about:
- How APIs work and handle requests
- The difference between **Authentication** (who you are) vs **Authorization** (what you can access)
- **IDOR (Insecure Direct Object Reference)** vulnerability
- How to inspect and manipulate API requests using browser DevTools

## 🏗️ Technology Stack

### Vercel Serverless Functions
- **What**: Functions that run on-demand without managing servers
- **How**: Each file in `/api` folder becomes an HTTP endpoint
- **Example**: `api/login.js` → `https://your-app.vercel.app/api/login`

### Backend
- **Node.js** with Vercel Serverless Functions
- JSON file-based data storage (no external database)
- RESTful API endpoints

### Frontend
- Pure HTML, CSS, JavaScript (no frameworks)
- Fetch API for backend communication
- localStorage for session management

## 📁 Project Structure

```
ctf-idor-challenge/
├── public/
│   ├── index.html          # Login page
│   ├── dashboard.html      # User dashboard
│   └── styles.css          # Styling
├── api/
│   ├── login.js            # Authentication endpoint
│   └── profile.js          # Profile endpoint (VULNERABLE)
├── data/
│   └── users.json          # User database
├── vercel.json             # Vercel configuration
├── package.json            # Project metadata
└── README.md               # This file
```

## 🔐 Demo Credentials

| Username   | Password  | Role     |
|------------|-----------|----------|
| employee1  | pass123   | employee |
| employee2  | pass456   | employee |
| employee3  | pass789   | employee |
| admin      | admin2024 | admin    |

> **Note**: Only the admin account contains the flag!

## 🚀 Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier is sufficient)

### Step-by-Step Deployment

1. **Initialize Git Repository**
   ```bash
   cd ctf-idor-challenge
   git init
   git add .
   git commit -m "Initial commit: CTF IDOR Challenge"
   ```

2. **Create GitHub Repository**
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it `ctf-idor-challenge`
   - Don't initialize with README (we already have one)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ctf-idor-challenge.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration
   - Click "Deploy"
   - Wait for deployment to complete (~1-2 minutes)

5. **Access Your Challenge**
   - Vercel will provide a URL like: `https://ctf-idor-challenge.vercel.app`
   - Share this URL with participants

## 🧪 Local Development

To test locally before deploying:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Run Development Server**
   ```bash
   cd ctf-idor-challenge
   vercel dev
   ```

3. **Access Locally**
   - Open browser to `http://localhost:3000`

## 🎓 For Organizers: Exploit Guide

### How to Exploit the IDOR Vulnerability

1. **Login as Regular User**
   - Use credentials: `employee1` / `pass123`
   - You'll be redirected to the dashboard

2. **Open Browser DevTools**
   - Press `F12` or `Right Click → Inspect`
   - Go to the **Network** tab

3. **Observe the API Request**
   - You'll see a request to `/api/profile?id=1`
   - This fetches the profile for user ID 1

4. **Exploit the Vulnerability**
   - **Method 1**: Directly modify the URL
     - In the browser address bar, you won't see the API call
     - Open DevTools Console and run:
       ```javascript
       fetch('/api/profile?id=0')
         .then(r => r.json())
         .then(data => console.log(data));
       ```
   
   - **Method 2**: Use browser to navigate
     - Open a new tab and go to:
       ```
       https://your-app.vercel.app/api/profile?id=0
       ```
   
   - **Method 3**: Modify the JavaScript
     - In DevTools Console, run:
       ```javascript
       localStorage.setItem('userId', '0');
       location.reload();
       ```

5. **Retrieve the Flag**
   - The admin profile (ID: 0) will be displayed
   - The flag `ICH{G3l0_D4h_b1s4_1D0R}` will appear on the dashboard

## 🐛 Vulnerability Explanation

### Where is the Vulnerability?

**File**: `api/profile.js`

**Vulnerable Code**:
```javascript
// Get user ID from query parameter
const userId = req.query.id;

// VULNERABILITY: No authorization check!
// The API does NOT verify if the requesting user has permission
const user = users.find(u => u.id === parseInt(userId));
```

### Why is it Vulnerable?

1. **Missing Authorization**: The API accepts any user ID without verifying if the requester has permission to access it
2. **Client-Side Trust**: The application trusts the `id` parameter sent from the client
3. **Predictable IDs**: User IDs are sequential integers (0, 1, 2, 3), making them easy to guess

### How Should it be Fixed?

```javascript
// Proper implementation would include:
1. Session token verification
2. Check if logged-in user ID matches requested ID
3. Return 403 Forbidden if unauthorized

// Example:
const loggedInUserId = verifySessionToken(req.headers.authorization);
if (loggedInUserId !== parseInt(userId)) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

## 📚 Educational Resources

- [OWASP IDOR](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References)
- [PortSwigger IDOR](https://portswigger.net/web-security/access-control/idor)

## 📝 License

MIT License - For educational purposes only.

---

**Created by**: UKM Cyber Security  
**Purpose**: CTF Educational Challenge  
**Year**: 2026
