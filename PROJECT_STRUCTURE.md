# 📁 Project Structure Overview

```
DnD_Initiative_tracker/
│
├── 📱 app/                          # Next.js App Router
│   ├── api/                         # Backend API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts       # User login endpoint
│   │   │   └── register/route.ts    # User registration endpoint
│   │   ├── battles/
│   │   │   ├── [id]/route.ts        # Update/delete specific battle
│   │   │   ├── active/route.ts      # Get active battle (public)
│   │   │   └── route.ts             # List/create battles
│   │   └── groups/
│   │       ├── [id]/route.ts        # Update/delete player group
│   │       └── route.ts             # List/create player groups
│   │
│   ├── admin/                       # DM Admin Section
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Main DM control panel
│   │   └── page.tsx                 # Login/Register page
│   │
│   ├── globals.css                  # Global styles (Tailwind)
│   ├── layout.tsx                   # Root layout component
│   └── page.tsx                     # 🎮 PUBLIC PLAYER VIEW (Homepage)
│
├── 🗄️ models/                       # MongoDB Data Models
│   ├── Battle.ts                    # Battle schema (combat tracker)
│   ├── PlayerGroup.ts               # Player group schema
│   └── User.ts                      # User (DM) schema
│
├── 🔧 lib/                          # Utility Libraries
│   ├── auth.ts                      # JWT token handling
│   └── db.ts                        # MongoDB connection
│
├── ⚙️ Configuration Files
│   ├── .env.local                   # 🔴 YOUR SECRETS (MongoDB, JWT)
│   ├── .env.local.example           # Template for environment vars
│   ├── .gitignore                   # Files to ignore in git
│   ├── next.config.js               # Next.js configuration
│   ├── package.json                 # Dependencies
│   ├── postcss.config.js            # PostCSS config (for Tailwind)
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── vercel.json                  # Vercel deployment config
│
├── 📚 Documentation
│   ├── README.md                    # Project overview
│   ├── QUICKSTART.md                # ⭐ START HERE!
│   ├── SETUP.md                     # Detailed setup guide
│   └── LICENSE                      # MIT License
│
├── 🛠️ Setup Scripts
│   ├── setup.bat                    # Windows batch setup script
│   └── setup.ps1                    # PowerShell setup script
│
└── 📦 Dependencies
    └── node_modules/                # Installed packages (auto-generated)
```

---

## 🎯 Key Files Explained

### Frontend (What Users See)

| File | Description | Who Sees It |
|------|-------------|-------------|
| `app/page.tsx` | **Player view** - Shows initiative order, hides NPCs | 👥 Players |
| `app/admin/page.tsx` | Login/Register page | 🎲 DM only |
| `app/admin/dashboard/page.tsx` | Full battle control panel | 🎲 DM only |
| `app/globals.css` | Styling (dark theme, cards, buttons) | Everyone |

### Backend (API Endpoints)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new DM account |
| `/api/auth/login` | POST | Login as DM |
| `/api/groups` | GET/POST | List or create player groups |
| `/api/groups/[id]` | PUT/DELETE | Update or delete a group |
| `/api/battles` | GET/POST | List or start a battle |
| `/api/battles/[id]` | PUT/DELETE | Update or end a battle |
| `/api/battles/active` | GET | Get current battle (public, no auth) |

### Database Models

| Model | Description | Fields |
|-------|-------------|--------|
| `User` | DM accounts | email, password, username |
| `PlayerGroup` | Groups of player characters | name, characters[], userId |
| `Battle` | Active combat tracker | name, characters[], currentTurnIndex, isActive |

### Configuration

| File | Purpose |
|------|---------|
| `.env.local` | **Your secrets** - MongoDB URI, JWT secret |
| `package.json` | Project dependencies (React, Next.js, etc.) |
| `tsconfig.json` | TypeScript compiler settings |
| `tailwind.config.js` | UI styling configuration |
| `vercel.json` | Deployment settings for Vercel |

---

## 🔄 Data Flow

### Player View (Public)
```
Browser → GET /api/battles/active → MongoDB → Returns battle data
         ↓
    Shows characters with initiative order
    (NPCs appear as "?" unless revealed)
    Auto-refreshes every 2 seconds
```

### DM Dashboard (Authenticated)
```
DM Browser → Login → JWT Token stored locally
           ↓
    All API calls include: Authorization: Bearer <token>
           ↓
    Server verifies token → Allows DM operations
           ↓
    Create groups, start battles, control combat
```

---

## 🎮 User Flows

### DM Workflow
1. **Register** at `/admin` → Creates account in MongoDB
2. **Create Player Group** → Stored in `PlayerGroup` collection
3. **Start Battle** → Creates `Battle` document, sets `isActive: true`
4. **Manage Combat**:
   - Update initiatives → Updates `Battle.characters[]`
   - Add NPCs → Appends to `characters[]`
   - Toggle reveal → Updates `character.isRevealed`
   - Next turn → Increments `currentTurnIndex`
5. **End Battle** → Sets `isActive: false`

### Player Workflow
1. **Open homepage** (`/`) → Fetches active battle
2. **View auto-updates** → SWR polls every 2 seconds
3. **See initiative order** → Sorted by initiative value
4. **Hidden NPCs** → Shown as "?" until DM reveals

---

## 🔐 Security Features

- ✅ **Passwords hashed** with bcrypt (never stored in plain text)
- ✅ **JWT authentication** for DM endpoints
- ✅ **Public endpoint** (`/api/battles/active`) doesn't require auth
- ✅ **User isolation** - DMs can only see their own groups/battles
- ✅ **Environment variables** for secrets (not in code)

---

## 🚀 Deployment Architecture

### Development (Local)
```
Your Computer
├── Next.js Dev Server (localhost:3000)
└── MongoDB Atlas (cloud database)
```

### Production (Vercel)
```
Vercel Edge Network
├── Serverless Functions (API routes)
├── Static Files (React pages)
└── MongoDB Atlas (same cloud database)
```

**Key Point**: Same MongoDB works for both dev and production!

---

## 📦 Dependencies Breakdown

### Core Framework
- `next` - React framework with server-side rendering
- `react` & `react-dom` - UI library
- `typescript` - Type safety

### Database & Auth
- `mongoose` - MongoDB object modeling
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation

### UI & Styling
- `tailwindcss` - Utility-first CSS
- `autoprefixer` & `postcss` - CSS processing

### Data Fetching
- `swr` - React hooks for data fetching with auto-refresh

---

## 🎨 Styling Guide

All styles use Tailwind CSS classes:

```css
/* Defined in globals.css */
.btn-primary      /* Purple button */
.btn-secondary    /* Gray button */
.btn-danger       /* Red button */
.input-field      /* Form input */
.card             /* Container with border and shadow */
.initiative-card  /* Character card with hover effect */
```

**Color Scheme**:
- Primary: Purple (`#8b5cf6`)
- Background: Dark blue gradient
- Cards: Semi-transparent gray with blur
- Text: White/gray

---

## 💡 Tips for Customization

### Change Colors
Edit `tailwind.config.js`:
```js
colors: {
  primary: '#8b5cf6',    // Change to any hex color
  secondary: '#ec4899',
  dark: '#1e1b4b',
}
```

### Adjust Auto-Refresh Rate
Edit `app/page.tsx`:
```ts
refreshInterval: 2000,  // Change to milliseconds (2000 = 2 seconds)
```

### Add More Fields to Characters
1. Update `models/Battle.ts` (add field to schema)
2. Update `app/admin/dashboard/page.tsx` (add input field)
3. Update `app/page.tsx` (display the field)

---

## 🐛 Debugging Tips

### View API Responses
Open browser console (F12) → Network tab → Click API call

### Check Database
MongoDB Atlas → Browse Collections → View your data

### Server Logs
Terminal running `npm run dev` shows all API calls and errors

### Common Issues
- "Cannot connect to database" → Check `.env.local`
- "Unauthorized" → Clear localStorage and log in again
- "Port in use" → Kill the process or use different port

---

## 📈 Scaling Considerations

This setup handles:
- ✅ **100+ players** viewing simultaneously
- ✅ **Unlimited battles** (stored in database)
- ✅ **Multiple DMs** (each with their own data)
- ✅ **500MB data** (free MongoDB tier)

To scale beyond:
- Upgrade MongoDB Atlas tier (still free up to 5GB)
- Add Redis for faster polling (Vercel KV)
- Use WebSockets for real-time updates (Pusher, Ably)

---

## 🎲 Have fun with your D&D sessions!

Need help? Check:
- `QUICKSTART.md` - Fast setup guide
- `SETUP.md` - Detailed documentation
- `README.md` - Project overview
