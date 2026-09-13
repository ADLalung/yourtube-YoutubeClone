# Render.com Deployment Issues - yourtube Frontend

## 🔴 CRITICAL ISSUES

### 1. **Hardcoded Firebase API Key (SECURITY VULNERABILITY)**
**File:** [src/lib/firebase.js](src/lib/firebase.js)
**Issue:** Firebase configuration is hardcoded in the source code, which is exposed publicly on GitHub.
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCyxbdclt2ocA5zgE-MDy1ndYIFqVMAr30",
  authDomain: "yourtube-8cda9.firebaseapp.com",
  projectId: "yourtube-8cda9",
  storageBucket: "yourtube-8cda9.firebasestorage.app",
  messagingSenderId: "921641878423",
  appId: "1:921641878423:web:0d65801eebaf2b25f03ad2",
};
```

**Fix:**
- Move Firebase config to environment variables
- Create `.env.example` with placeholders
- Update `firebase.js` to read from environment variables

---

### 2. **Backend URL Defaults to Localhost in Production**
**File:** [next.config.ts](next.config.ts)
**Issue:** The `BACKEND_URL` defaults to `http://localhost:5000` if not set, which will fail on Render.
```javascript
env:{
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5000",
}
```

**Current .env setting:**
```
BACKEND_URL=http://localhost:5000
```

**Problem:** On Render, this will try to connect to localhost instead of the actual backend server.

**Fix:**
- Set `BACKEND_URL` environment variable in Render dashboard to the production backend URL
- Change default to throw an error or use a sentinel value to indicate misconfiguration
- Add `.env.example` with production URL template

---

## ⚠️ IMPORTANT ISSUES

### 3. **Missing Environment Configuration Files**
**Issue:** No `.env.example` or `.env.local` file in the yourtube directory for reference during deployment.

**Fix:**
- Create `.env.example`:
```
BACKEND_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

---

### 4. **Missing start Script in package.json**
**File:** [package.json](package.json)
**Issue:** While the `start` script exists, ensure Render knows to run `npm run build && npm start`

**Current scripts:**
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

**Status:** ✅ This is correct for Render deployment. The `start` script is present.

---

## 📋 DEPLOYMENT CHECKLIST

Before deploying to Render.com:

- [ ] Set up Firebase config as environment variables (use `NEXT_PUBLIC_` prefix for client-side)
- [ ] Set `BACKEND_URL` in Render environment variables to production backend URL
- [ ] Create `.env.example` file for reference
- [ ] Ensure server is deployed first and running
- [ ] Test API connectivity before production release
- [ ] Verify Firebase credentials are NOT exposed in the built output

---

## 🔧 Recommended Environment Variables for Render

In Render dashboard, add these environment variables:

```
BACKEND_URL=https://your-backend-render-url.onrender.com

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCyxbdclt2ocA5zgE-MDy1ndYIFqVMAr30
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=yourtube-8cda9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=yourtube-8cda9
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=yourtube-8cda9.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=921641878423
NEXT_PUBLIC_FIREBASE_APP_ID=1:921641878423:web:0d65801eebaf2b25f03ad2
```

Note: Use `NEXT_PUBLIC_` prefix for variables that need to be accessible in the browser.

---

## 📝 Summary

| Issue | Severity | Impact | Status |
|-------|----------|--------|--------|
| Hardcoded Firebase API Key | 🔴 Critical | Security vulnerability | ⚠️ Needs Fix |
| Backend URL defaults to localhost | 🔴 Critical | API calls will fail in production | ⚠️ Needs Fix |
| Missing .env.example | ⚠️ High | Difficult deployment setup | ⚠️ Needs Fix |
| Package.json scripts | ✅ OK | Ready for deployment | ✅ No Action Needed |
