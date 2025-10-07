# ✅ Setup Checklist

Use this checklist to get your D&D Initiative Tracker up and running!

## 📋 Pre-Setup

- [x] Node.js installed (check with `node --version`)
- [x] Dependencies installed (`npm install` completed)
- [ ] MongoDB Atlas account created
- [ ] Environment variables configured

---

## 🗄️ MongoDB Atlas Setup

### 1. Create Account & Cluster
- [ ] Go to https://www.mongodb.com/cloud/atlas/register
- [ ] Sign up (email, Google, or GitHub)
- [ ] Create a **FREE M0 Cluster**
- [ ] Choose any cloud provider (AWS/Google/Azure)
- [ ] Select closest region
- [ ] Wait for cluster to deploy (2-3 minutes)

### 2. Database Access
- [ ] Go to **Database Access** (left sidebar)
- [ ] Click **"Add New Database User"**
- [ ] Authentication: **Password**
- [ ] Username: `dnduser` (or your choice)
- [ ] Password: Click **"Autogenerate Secure Password"**
- [ ] **SAVE THE PASSWORD SOMEWHERE!** 📝
- [ ] Privileges: **Atlas admin**
- [ ] Click **"Add User"**

### 3. Network Access
- [ ] Go to **Network Access** (left sidebar)
- [ ] Click **"Add IP Address"**
- [ ] Click **"Allow Access from Anywhere"**
- [ ] Or manually add: `0.0.0.0/0`
- [ ] Click **"Confirm"**

### 4. Get Connection String
- [ ] Go to **Database** (left sidebar)
- [ ] Click **"Connect"** button on your cluster
- [ ] Choose **"Connect your application"**
- [ ] Driver: **Node.js**
- [ ] Version: **4.1 or later**
- [ ] Copy the connection string
- [ ] It looks like: `mongodb+srv://dnduser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

---

## ⚙️ Environment Configuration

### Open `.env.local` file
- [ ] File exists in project root
- [ ] If not, copy from `.env.local.example`

### Fill in values:

#### MONGODB_URI
- [ ] Paste your connection string
- [ ] Replace `<password>` with your actual password
- [ ] Add `/dnd-tracker` before the `?`
- [ ] Example: `mongodb+srv://dnduser:MyPass123@cluster0.xxxxx.mongodb.net/dnd-tracker?retryWrites=true&w=majority`

#### JWT_SECRET
- [ ] Generate a random string (at least 32 characters)
- [ ] Or use: https://randomkeygen.com/
- [ ] Or use: `super-secret-key-for-jwt-tokens-change-this-in-production`

#### NEXTAUTH_URL
- [ ] For local dev: `http://localhost:3000`
- [ ] Leave as-is unless using different port

### Save the file
- [ ] Press Ctrl+S (or Cmd+S on Mac)
- [ ] Verify no `.example` in filename

---

## 🚀 Start the Application

### Run Development Server
```bash
npm run dev
```

### Verify:
- [ ] Terminal shows: `Ready in X ms`
- [ ] No error messages
- [ ] Shows: `Local: http://localhost:3000`

---

## 🧪 Test the Application

### Test 1: Public View
- [ ] Open browser: http://localhost:3000
- [ ] See "No active battle" message
- [ ] Page loads without errors

### Test 2: DM Registration
- [ ] Go to: http://localhost:3000/admin
- [ ] Click "Register"
- [ ] Enter:
  - [ ] Username: `TestDM`
  - [ ] Email: `test@example.com`
  - [ ] Password: `password123`
- [ ] Click "Register"
- [ ] Redirected to dashboard

### Test 3: Create Player Group
- [ ] In dashboard, click **"+ Create Group"**
- [ ] Group name: `Test Adventurers`
- [ ] Add character:
  - [ ] Name: `TestHero`
  - [ ] Image URL: (leave blank or use any image URL)
- [ ] Click **"Create Group"**
- [ ] Group appears in list

### Test 4: Start Battle
- [ ] Click **"Start New Battle"**
- [ ] Battle name: `Test Battle`
- [ ] Select group: `Test Adventurers`
- [ ] Click **"Start Battle"**
- [ ] Battle appears with characters

### Test 5: Add NPC
- [ ] Click **"+ Add NPC"**
- [ ] Name: `Goblin`
- [ ] Initiative: `12`
- [ ] Click **"Add"**
- [ ] Goblin appears in list

### Test 6: Set Initiative
- [ ] Click on TestHero's initiative number
- [ ] Change to: `15`
- [ ] Press Enter
- [ ] Characters re-sort by initiative

### Test 7: Player View
- [ ] Open **NEW browser tab/window**
- [ ] Go to: http://localhost:3000
- [ ] See battle name
- [ ] See TestHero (name visible)
- [ ] See "?" (Goblin is hidden)

### Test 8: Reveal NPC
- [ ] Go back to DM dashboard
- [ ] Click **🔒 Hidden** button on Goblin
- [ ] Changes to **👁️ Revealed**
- [ ] Check player view (refresh if needed)
- [ ] Goblin name now visible

### Test 9: Next Turn
- [ ] Click **"Next Turn →"**
- [ ] Highlighted character changes
- [ ] Player view shows new current turn

### Test 10: Add Lair Action
- [ ] Click **"+ Lair (20)"**
- [ ] "Lair Action" appears at top (initiative 20)
- [ ] 🏰 emoji visible

---

## ✅ Success!

If all tests passed, your app is working perfectly! 🎉

---

## 📱 Next Steps

### Share with Your Players
- [ ] Share URL: `http://localhost:3000`
- [ ] Only works on same network
- [ ] Or deploy to Vercel (see below)

### Deploy to Internet (Optional)
- [ ] Push code to GitHub
- [ ] Create Vercel account
- [ ] Import repository
- [ ] Add environment variables
- [ ] Deploy
- [ ] Share Vercel URL with players

See **SETUP.md** for deployment instructions.

---

## ❌ Troubleshooting

### "Cannot connect to database"
- [ ] Check `.env.local` exists
- [ ] Verify MONGODB_URI is correct
- [ ] Confirm `<password>` is replaced
- [ ] Check Network Access in MongoDB Atlas

### "Port 3000 already in use"
- [ ] Kill existing process
- [ ] Or run: `npm run dev -- -p 3001`

### "Module not found" errors
- [ ] Delete `node_modules` folder
- [ ] Run `npm install` again

### "Unauthorized" in dashboard
- [ ] Open browser DevTools (F12)
- [ ] Go to Application → Local Storage
- [ ] Delete all entries
- [ ] Log in again

### Changes don't appear
- [ ] Save all files
- [ ] Restart dev server (Ctrl+C, then `npm run dev`)
- [ ] Hard refresh browser (Ctrl+Shift+R)

---

## 📞 Need Help?

1. Check **QUICKSTART.md** for setup guide
2. Read **SETUP.md** for detailed docs
3. View **ARCHITECTURE.md** for technical details
4. Inspect **PROJECT_STRUCTURE.md** for code organization

---

## 🎲 Ready to Roll!

Once all checkboxes are complete, you're ready for your D&D session!

**DM URL**: http://localhost:3000/admin/dashboard  
**Player URL**: http://localhost:3000

Happy adventuring! ⚔️🐉
