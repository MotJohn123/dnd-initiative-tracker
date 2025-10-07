# 🎯 D&D Initiative Tracker - System Overview

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         PLAYERS (PUBLIC)                         │
│                    Browser: localhost:3000/                      │
└───────────────┬─────────────────────────────────────────────────┘
                │
                │ HTTP GET (every 2 seconds)
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PUBLIC API ENDPOINT (NO AUTH)                   │
│                 GET /api/battles/active                          │
│                                                                   │
│  Returns:                                                         │
│  - Current battle data                                           │
│  - Characters sorted by initiative                               │
│  - NPCs shown as "?" if not revealed                            │
└───────────────┬─────────────────────────────────────────────────┘
                │
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                            │
│                   (MongoDB Atlas - Free)                         │
│                                                                   │
│  Collections:                                                     │
│  ├── users (DM accounts)                                         │
│  ├── playergroups (Character groups)                             │
│  └── battles (Combat trackers)                                   │
└───────────────▲─────────────────────────────────────────────────┘
                │
                │ Read/Write
                │ (JWT Auth Required)
                │
┌───────────────┴─────────────────────────────────────────────────┐
│                      DM API ENDPOINTS                            │
│                  (Requires JWT Token)                            │
│                                                                   │
│  POST   /api/auth/register    - Create DM account               │
│  POST   /api/auth/login       - Login & get JWT                 │
│  GET    /api/groups           - List player groups              │
│  POST   /api/groups           - Create player group             │
│  PUT    /api/groups/[id]      - Update group                    │
│  DELETE /api/groups/[id]      - Delete group                    │
│  GET    /api/battles          - List battles                    │
│  POST   /api/battles          - Start new battle                │
│  PUT    /api/battles/[id]     - Update battle                   │
│  DELETE /api/battles/[id]     - End battle                      │
└───────────────▲─────────────────────────────────────────────────┘
                │
                │ HTTP Requests with JWT
                │ Authorization: Bearer <token>
                │
┌───────────────┴─────────────────────────────────────────────────┐
│                          DM DASHBOARD                            │
│              Browser: localhost:3000/admin/dashboard             │
│                                                                   │
│  Features:                                                        │
│  ├── Create player groups                                        │
│  ├── Start battles                                               │
│  ├── Add/remove characters                                       │
│  ├── Set initiatives                                             │
│  ├── Toggle NPC visibility                                       │
│  └── Advance turns                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### Example 1: Player Viewing Initiative
```
1. Player opens localhost:3000
2. Browser fetches GET /api/battles/active
3. Server queries MongoDB for active battle
4. Server filters NPCs (hides unrevealed ones)
5. Returns JSON with character list
6. Browser displays initiative order
7. Repeats every 2 seconds (SWR auto-refresh)
```

### Example 2: DM Starting a Battle
```
1. DM logs in at /admin
2. Server generates JWT token
3. Browser stores token in localStorage
4. DM clicks "Start New Battle"
5. Browser sends POST /api/battles with JWT
6. Server verifies JWT
7. Server creates new Battle document in MongoDB
8. Returns battle data to DM
9. Players see it automatically (next poll)
```

### Example 3: DM Adding an NPC
```
1. DM clicks "+ Add NPC"
2. Enters name and initiative
3. Browser sends PUT /api/battles/[id] with:
   - JWT token in header
   - Updated characters array in body
4. Server verifies JWT
5. Server updates Battle document
6. Returns updated battle
7. DM sees change immediately
8. Players see it in next auto-refresh (2 sec)
```

---

## 📊 Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "dm@example.com",
  "password": "$2a$10$hashed...",  // bcrypt hash
  "username": "DungeonMaster",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### PlayerGroups Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users)",
  "name": "The Adventurers",
  "characters": [
    {
      "name": "Aragorn",
      "imageUrl": "https://example.com/aragorn.jpg"
    },
    {
      "name": "Legolas",
      "imageUrl": ""
    }
  ],
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### Battles Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users)",
  "name": "Goblin Ambush",
  "isActive": true,
  "currentTurnIndex": 2,
  "characters": [
    {
      "id": "pc-1-1234567890",
      "name": "Aragorn",
      "isNPC": false,
      "isRevealed": true,
      "initiative": 18,
      "imageUrl": "https://example.com/aragorn.jpg",
      "isLair": false
    },
    {
      "id": "npc-1-1234567891",
      "name": "Goblin Chief",
      "isNPC": true,
      "isRevealed": false,  // Shows as "?" to players
      "initiative": 15,
      "imageUrl": "",
      "isLair": false
    },
    {
      "id": "lair-1-1234567892",
      "name": "Lair Action",
      "isNPC": true,
      "isRevealed": true,
      "initiative": 20,
      "imageUrl": "",
      "isLair": true
    }
  ],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:15:00Z"
}
```

---

## 🎮 User Interface Flow

### DM Workflow
```
                    ┌─────────────┐
                    │ /admin      │
                    │ (Login)     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────────────┐
                    │ /admin/dashboard    │
                    │                     │
                    │ - No active battle  │
                    │ [Start New Battle]  │
                    └──────┬──────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │ Select Player Group        │
              │ ├─ The Adventurers (3)    │
              │ └─ Dragon Slayers (4)     │
              └──────┬─────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────┐
    │ Active Battle: Goblin Ambush           │
    │                                         │
    │ ┌───────────────────────────────────┐ │
    │ │ Aragorn        [18] [Revealed] [X]│ │
    │ │ Goblin Chief   [15] [Hidden]   [X]│ │
    │ │ Legolas        [14] [Revealed] [X]│ │
    │ └───────────────────────────────────┘ │
    │                                         │
    │ [+ Add NPC] [+ Lair] [Next Turn] [End]│
    └─────────────────────────────────────────┘
```

### Player Workflow
```
          ┌─────────────────────────┐
          │ /                       │
          │ (Homepage - Auto-loads) │
          └────────┬────────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │ ⚔️ Initiative Tracker    │
        │                          │
        │ Goblin Ambush            │
        │                          │
        │ ┌──────────────────────┐ │
        │ │ Aragorn        18 ✓ │ │  ← Current turn
        │ │ ?              15    │ │  ← Hidden NPC
        │ │ Legolas        14    │ │
        │ └──────────────────────┘ │
        │                          │
        │ Updates every 2 seconds  │
        └──────────────────────────┘
```

---

## 🔐 Authentication Flow

```
DM Registration/Login
        │
        ▼
┌───────────────────┐
│ 1. Enter email &  │
│    password       │
└────────┬──────────┘
         │
         ▼
┌───────────────────────────┐
│ 2. Server hashes password │
│    (bcrypt)               │
└────────┬──────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Server generates JWT  │
│    {userId, email}       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ 4. Browser stores token in   │
│    localStorage              │
└────────┬─────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 5. All API calls include:      │
│    Authorization: Bearer <JWT>  │
└─────────────────────────────────┘
```

---

## 🎯 Key Features Illustrated

### 1. Hidden NPCs
```
DM View:
┌─────────────────────┐
│ Goblin Chief    15 │ [🔒 Hidden] [X]
└─────────────────────┘

Player View:
┌─────────────────────┐
│ ?              15   │
└─────────────────────┘

After DM clicks "Reveal":
┌─────────────────────┐
│ Goblin Chief    15 │
└─────────────────────┘
```

### 2. Turn Tracking
```
Characters sorted by initiative (descending):
┌─────────────────────────────┐
│ Lair Action     20          │  Index 0
│ Aragorn         18  ← TURN  │  Index 1 (current)
│ Goblin Chief    15          │  Index 2
│ Legolas         14          │  Index 3
└─────────────────────────────┘

DM clicks "Next Turn":
┌─────────────────────────────┐
│ Lair Action     20          │  Index 0
│ Aragorn         18          │  Index 1
│ Goblin Chief    15  ← TURN  │  Index 2 (current)
│ Legolas         14          │  Index 3
└─────────────────────────────┘
```

### 3. Initiative Sorting
```
Before sorting (random order):
- Legolas (14)
- Goblin (15)
- Aragorn (18)

After automatic sort:
- Aragorn (18)  ← Highest goes first
- Goblin (15)
- Legolas (14)
```

---

## 🚀 Deployment Overview

### Local Development
```
Your Computer
├─ npm run dev (Port 3000)
│  ├─ Next.js Server
│  ├─ API Routes
│  └─ React Pages
│
└─ MongoDB Atlas (Cloud)
   └─ Free M0 Cluster (500MB)
```

### Production on Vercel
```
Vercel Global CDN
├─ Serverless Functions
│  ├─ API routes auto-deployed
│  └─ Scales to zero when idle
│
├─ Static Assets
│  ├─ React pages pre-rendered
│  └─ Cached globally
│
└─ MongoDB Atlas (Same DB)
   └─ Connects via MONGODB_URI env var
```

**Deployment Steps**:
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy! (30 seconds)

---

## 💰 Cost Breakdown

| Service | Tier | Cost | Limits |
|---------|------|------|--------|
| **Vercel** | Hobby | **FREE** | 100GB bandwidth/mo |
| **MongoDB Atlas** | M0 | **FREE** | 500MB storage |
| **Total** | | **$0/month** | Perfect for D&D groups |

Handles:
- ✅ 100+ concurrent players
- ✅ Unlimited battles
- ✅ Multiple DM accounts
- ✅ 1000s of characters

---

## 🔧 Customization Points

Want to modify the app? Here's where to look:

| What to Change | File to Edit |
|----------------|--------------|
| **Colors/Theme** | `tailwind.config.js` |
| **Auto-refresh rate** | `app/page.tsx` (refreshInterval) |
| **Add character fields** | `models/Battle.ts` |
| **Change UI layout** | `app/admin/dashboard/page.tsx` |
| **Add new API endpoint** | Create in `app/api/` |
| **Database schema** | `models/*.ts` |

---

## 🐛 Troubleshooting Guide

| Problem | Check | Solution |
|---------|-------|----------|
| Can't connect to DB | `.env.local` | Verify MONGODB_URI is correct |
| "Unauthorized" errors | Browser console | Clear localStorage, re-login |
| Changes don't appear | Terminal | Restart `npm run dev` |
| Port 3000 in use | Command line | Kill process or use `-p 3001` |
| NPCs not hiding | Battle data | Check `isRevealed` field |

---

## 📚 Technology Stack

```
Frontend Layer
├─ React 18
├─ Next.js 14 (App Router)
├─ TypeScript
├─ Tailwind CSS
└─ SWR (data fetching)

Backend Layer
├─ Next.js API Routes
├─ JWT Authentication
└─ bcrypt (password hashing)

Database Layer
├─ MongoDB Atlas
└─ Mongoose (ODM)

Hosting
├─ Vercel (frontend + API)
└─ MongoDB Atlas (database)
```

---

## 🎓 Learning Resources

Want to understand or modify the code?

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **MongoDB**: https://docs.mongodb.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

## 🎲 Roll for Initiative!

Your D&D Initiative Tracker is ready to use!

See **QUICKSTART.md** for setup instructions.
