# Render.com Deployment Guide

## ✅ Issues Fixed

### 1. **Nodemon Crash (FIXED)**
- ✓ Moved `nodemon` from `dependencies` to `devDependencies`
- ✓ Changed start script from `nodemon index.js` to `node index.js`
- ✓ Added dev script: `npm run dev` (uses nodemon locally)

**Before (causes crash):**
```json
"scripts": { "start": "nodemon index.js" },
"dependencies": { "nodemon": "^3.1.14" }
```

**After (production-ready):**
```json
"scripts": { 
  "start": "node index.js",
  "dev": "nodemon index.js"
},
"devDependencies": { "nodemon": "^3.1.14" }
```

### 2. **MongoDB Connection Timeouts (FIXED)**
- ✓ Increased from 5000ms to 30000ms
- ✓ Better reliability on Render's slower infrastructure

### 3. **Port Binding (FIXED)**
- ✓ Explicit host binding: `app.listen(PORT, "0.0.0.0", ...)`
- ✓ Render can now properly route traffic

---

## 🚨 CRITICAL REMAINING ISSUES

### **Issue: Ephemeral Filesystem (File Uploads Lost on Restart)**

**Problem:**
- Uploads stored in local `/uploads` directory
- Render restarts apps regularly (after 15 min of inactivity, during deploys, etc.)
- All uploaded videos will be **permanently deleted** on restart

**Solution Options:**

#### Option A: **Use Cloudinary (Easiest for Videos)**
1. Sign up: https://cloudinary.com (free tier available)
2. Install: `npm install cloudinary`
3. Update filehelper.js to use Cloudinary instead of local storage
4. Add credentials to Render environment variables

#### Option B: **Use AWS S3**
1. Create S3 bucket and get credentials
2. Install: `npm install aws-sdk`
3. Update upload logic to use S3
4. Add AWS credentials to Render environment variables

#### Option C: **Use MongoDB GridFS**
- Store videos as binary data in MongoDB
- Less recommended but works if already using MongoDB

**⚠️ Do NOT rely on local file storage on Render!**

---

### **Issue: Security - .env Committed to Git**

**Problem:**
- `.env` file contains exposed MongoDB credentials
- Anyone with access to repo can compromise your database

**Fix:**
1. Add `.env` to `.gitignore` (already done ✓)
2. **Never commit `.env` file**
3. On Render: Set environment variables in:
   - Dashboard → Select Service → Environment
   - Add: `DB_URL` and `PORT`

**Setup on Render:**
1. Create new Web Service → Connect to GitHub repo
2. In Settings → Environment:
   ```
   DB_URL=mongodb+srv://...
   PORT=5000
   ```

---

## 📋 Render Deployment Checklist

- [ ] Commit fixed `package.json` (nodemon moved to devDependencies)
- [ ] Commit fixed `index.js` (timeouts increased, host binding added)
- [ ] Ensure `.env` is in `.gitignore` (✓ already done)
- [ ] **DO NOT commit `.env` file to GitHub**
- [ ] Create Render Web Service
- [ ] Add Environment Variables in Render Dashboard:
  - `DB_URL` = your MongoDB connection string
  - `NODE_ENV` = "production"
- [ ] Set Start Command: (Render auto-detects `npm start`)
- [ ] Configure file upload solution (Cloudinary recommended)
- [ ] Test: `curl https://your-render-app.onrender.com/`

---

## 🔧 Local Development

To run with nodemon locally:
```bash
cd server
npm install
npm run dev
```

---

## 🐛 Debugging on Render

1. **View Logs:** Dashboard → Logs tab
2. **Common Errors:**
   - `EADDRINUSE` → Port already in use (shouldn't happen with 0.0.0.0 binding)
   - `MongooseError: Cannot connect` → Check DB_URL in environment
   - `ENOSPC` → Disk full (from files not cleaning up)

---

## 📝 Next Steps

1. **Implement cloud storage** for video uploads (CRITICAL)
2. Set environment variables on Render dashboard
3. Deploy and monitor logs
4. Test file upload → ensure persists after restart

