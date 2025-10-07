# 🚀 Deploy to Vercel - Step by Step

Your code is ready to deploy! Follow these steps:

---

## ✅ Prerequisites Complete

- ✅ Git repository initialized
- ✅ All files committed
- ✅ MongoDB Atlas configured
- ✅ Ready to deploy!

---

## 📋 Step 1: Push to GitHub

### Option A: Using GitHub Desktop (Easier)
1. Download and install [GitHub Desktop](https://desktop.github.com/)
2. Open GitHub Desktop
3. Click "Add" → "Add Existing Repository"
4. Browse to: `D:\Documents\Weby\DnD_Iniciative_tracker`
5. Click "Publish repository"
6. Uncheck "Keep this code private" (or keep it checked, your choice)
7. Click "Publish Repository"

### Option B: Using Command Line
1. Go to [GitHub](https://github.com/new) and create a new repository
   - Name it: `dnd-initiative-tracker`
   - Don't initialize with README (we already have files)
   - Click "Create repository"

2. Copy the commands GitHub shows and run them:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dnd-initiative-tracker.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username!

---

## 🌐 Step 2: Deploy on Vercel

### 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Click "Sign Up"
- Choose "Continue with GitHub"
- Authorize Vercel to access your GitHub

### 2. Import Your Project
- Click "Add New..." → "Project"
- Find `dnd-initiative-tracker` in the list
- Click "Import"

### 3. Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave default)
- **Build Command**: `next build` (leave default)
- **Output Directory**: `.next` (leave default)

### 4. Add Environment Variables ⚠️ IMPORTANT!

Click "Environment Variables" and add these **EXACTLY**:

#### Variable 1:
- **Name**: `MONGODB_URI`
- **Value**: `mongodb+srv://dnduser:MFKfY49Xz1JtIs2r@dndtracker.eybuj8m.mongodb.net/dnd-tracker?retryWrites=true&w=majority&appName=DNDTracker`
- Click "Add"

#### Variable 2:
- **Name**: `JWT_SECRET`
- **Value**: `dnd-initiative-tracker-super-secret-jwt-key-for-authentication-2025`
- Click "Add"

#### Variable 3:
- **Name**: `NEXTAUTH_URL`
- **Value**: Leave EMPTY (Vercel sets this automatically)
- Or you can skip this one entirely

### 5. Deploy!
- Click "Deploy"
- Wait 1-2 minutes while Vercel builds your app
- You'll see "🎉 Congratulations!"

---

## 🎯 Step 3: Get Your URL

After deployment completes:
1. You'll see your live URL (something like `dnd-initiative-tracker.vercel.app`)
2. Click "Visit" to open your app
3. Go to `/admin` to register your DM account
4. Share the main URL with your players!

---

## 📱 Your App URLs

After deployment, you'll have:

- **Player View**: `https://your-app.vercel.app`
- **DM Dashboard**: `https://your-app.vercel.app/admin`

---

## 🔄 Updating Your Deployed App

Whenever you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically redeploy! ✨

---

## 🔐 Security Notes

✅ Your `.env.local` file is NOT uploaded to GitHub (it's in .gitignore)
✅ Your MongoDB password is only stored in Vercel's secure environment
✅ Players can't see your environment variables
✅ Only you (the DM) can register/login and manage battles

---

## ✅ Verification Checklist

After deployment, test these:

- [ ] Visit your Vercel URL
- [ ] See "No active battle" message on homepage
- [ ] Go to `/admin` and register a DM account
- [ ] Create a player group
- [ ] Start a battle
- [ ] Open homepage in another browser/incognito
- [ ] Verify players see the battle
- [ ] Verify NPCs show as "?"

---

## 🐛 Troubleshooting

### "Internal Server Error" after deployment
- Check Vercel logs (Functions tab in Vercel dashboard)
- Verify environment variables are set correctly
- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### "Cannot connect to database"
- Go to MongoDB Atlas → Network Access
- Make sure "0.0.0.0/0" is in the IP Access List
- Wait a few minutes for changes to take effect

### Changes not showing up
- Check Vercel dashboard for deployment status
- Verify your git push was successful
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## 💰 Costs

**Total: $0/month**

- ✅ Vercel Free tier: 100GB bandwidth
- ✅ MongoDB Atlas M0: 500MB storage
- ✅ No credit card required
- ✅ No expiration

Perfect for D&D groups! Your app can handle 100+ concurrent players easily.

---

## 🎲 You're All Set!

Once deployed:
1. Register your DM account at `your-app.vercel.app/admin`
2. Create player groups and start battles
3. Share `your-app.vercel.app` with your players
4. Track initiative from anywhere in the world!

Happy adventuring! ⚔️🐉
