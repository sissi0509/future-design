# Future-Design App

A small web app for teaching personal future thinking with optional AI support.

---

## 🚀 Quick Start

### 0. Prerequisites
- **Node.js 18+** and **npm**
- Access to our shared **Firebase** project (Firestore + Authentication enabled)

### 1. Install dependencies
```bash
# from repo root
cd admin && npm install
cd ../web_app && npm install
```

### 2. Firebase Setup
- The frontend (`web_app/`) uses **environment variables** for Firebase config.  
These are not committed to GitHub, so you need to create your own `.env.local` file, following the template in .env.example in web_app.


- The web app already contains the Firebase config in:
  ```
  web_app/src/config/Firebase.js
  ```
- **Authentication**: Email/Password sign-in is enabled  
- **Firestore**: Database created in Native mode  



> If anything breaks, contact the Firebase project owner to confirm access and rules.

### 3. Seed / Register Users
```bash
cd admin
# Initiate users information in users.json (email, password, groupNumber)
# Ensure serviceAccountKey.json exists 
node registerUser.js
```

**Example `users.json`:**
```json
[
  { "email": "user1@example.com", "password": "usedfortesting123", "groupNumber": 1 },
  { "email": "user2@example.com", "password": "usedfortesting123", "groupNumber": 2 }
]
```

**Service account key**  
- The admin scripts require: `admin/serviceAccountKey.json`  
- To set this up:
- **Download from: Firebase Console → **Project Settings → Service accounts → Generate new private key**  
Download the .json file

Rename it to serviceAccountKey.json

Place it inside the admin/ folder
For reference, see admin/serviceAccountKey.example.json to understand the expected format


### 4. Run the Web App
```bash
cd web_app
npm run dev
```
Open the printed URL (e.g. `http://localhost:5173`) and log in with a seeded user.

---

## 📂 Project Structure

```
repo/
├─ admin/
│  ├─ registerUser.js
│  ├─ serviceAccountKey.json   
│  └─ users.json               
└─ web_app/
   ├─ src/
   │  ├─ components/
   │  ├─ pages/
   │  └─ config/Firebase.js    # firebase config 
   ├─ package.json
   └─ ...
```

## 📤 Export Firestore Data to JSON

You can export Firestore collections into local `.json` files for analysis or backup.

### Step 1: Create a local project folder
Open your terminal and run:
```bash
mkdir firestore-export
cd firestore-export
npm init -y
npm install firebase-admin
```

### Step 2: Get Firebase Admin SDK Key
1. Go to your **Firebase Console → Project Settings → Service Accounts** tab.  
2. Click **Generate new private key** to download a `.json` file.  
3. Move this file into your `firestore-export` folder and rename it to `serviceAccountKey.json`.  

### Step 3: Create the export script
Create a file named `exportFirestore.js` inside the `firestore-export` folder:

```js
const admin = require("firebase-admin");
const fs = require("fs");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = {};
  snapshot.forEach(doc => {
    data[doc.id] = doc.data();
  });
  fs.writeFileSync(`${collectionName}.json`, JSON.stringify(data, null, 2));
  console.log(`Exported ${collectionName}.json`);
}

// Replace 'your-collection-name' with the actual collection name
exportCollection("your-collection-name");
```

### Step 4: Run the script
From the terminal inside the `firestore-export` folder, run:
```bash
node exportFirestore.js
```

✅ This will generate a file named `your-collection-name.json` in the folder.


