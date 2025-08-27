# Fullstack Web App with GenAI Chatbot for Future Thinking Research

This project was created by **Xi Zhao** (M.S. student, Northeastern University) for **Gati Aher** (Ph.D. student, Carnegie Mellon University), as part of research advised by:  
- Professor **Nikolas Martelaro** (Augmented Design Capability Studio, HCI Institute @ CMU)  
- Professor **Scupelli** (Learning Environments Lab, Design School @ CMU)  
---
## 🖼️ Screenshots
### Login Page
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 37 45 PM" src="https://github.com/user-attachments/assets/d1a1e2c1-4cd9-4161-b2bd-3dcd27b14adc" />
After login, the user’s email appears at the top-right corner of every subsequent page.

### Welcome Page
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 38 12 PM" src="https://github.com/user-attachments/assets/3b8aa404-b04c-41de-a40b-64af4d62dc26" />

### Cosent Form Page
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 38 20 PM" src="https://github.com/user-attachments/assets/34072357-1b5b-4df0-ad00-361fd4d566b3" />

### Training page 1 - warmup page
Most question pages include two accessibility features:
- Read Aloud button (reads the text aloud to users)
- Speak button (converts speech into text input)
  
These buttons are available in the Training, Post-Test, and Survey sections.
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 38 28 PM" src="https://github.com/user-attachments/assets/ee9577fb-abfd-45e4-a1a8-a8ca115fc106" />

### Training page 2- 5
The remaining training pages may or may not include AI support, depending on the user’s group assignment.
- Users in the AI group see the AI Coach sidebar, which can be toggled on or off.
- All training and test questions also include a Read Aloud button that can read the text to users for accessibility.
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 38 43 PM" src="https://github.com/user-attachments/assets/d55fccf8-61dd-4dcb-a534-4793a789b614" />
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 38 56 PM" src="https://github.com/user-attachments/assets/8514b3f7-7261-4077-a96c-d039ecf18985" />
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 39 21 PM" src="https://github.com/user-attachments/assets/85d355b8-0fc0-4835-bded-8f1516cdfe8e" />

### AI-chatbox
Messages in the AI chatbox can be edited, allowing users to create new conversation branches.

### Post-Test & Survey
These sections contain different question types:
-Open-ended text
-Single choice
-Multiple choice
-Likert scale
-Multi-Likert
The **Next** button is enabled only after the current question is completed (choice selected or text word count validated).
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 39 32 PM" src="https://github.com/user-attachments/assets/a5d57850-6e2d-4167-b8a9-7568e5cdda48" />
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 40 30 PM" src="https://github.com/user-attachments/assets/2d0c1b2b-c8c3-4d3d-898a-0b1d7ad4e9f2" />
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 40 41 PM" src="https://github.com/user-attachments/assets/122279fc-0b0b-47b8-9cc1-84a90dbe9ad4" />
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 40 50 PM" src="https://github.com/user-attachments/assets/ea054a9d-20f4-4759-adda-5e8a5b428f3b" />
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 40 59 PM" src="https://github.com/user-attachments/assets/bdcde988-247b-459b-bfee-81cfad2f5730" />
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 41 12 PM" src="https://github.com/user-attachments/assets/943aceb2-872d-407e-a1ff-fec8350b5085" />


## QR-Code page
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 41 20 PM" src="https://github.com/user-attachments/assets/653141b7-af56-44cf-bc73-ac291530b670" />

---

## 🚀 Quick Start

### 0. Prerequisites
- **Node.js 20+** and **npm**
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
  - Go to: **Firebase Console → Project Settings → Service accounts → Generate new private key**  
  - Download the .json file
  - Rename it to serviceAccountKey.json
  - Place it inside the admin/ folder
  - For reference, see admin/serviceAccountKey.example.json to understand the expected format


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

### Step 3: Copy the export script  
To keep the repo clean, copy the provided script from `admin/` into your local folder:  
```bash
cp ../admin/exportFirestore.js .
```  

This script lets you export any Firestore collection to a `.json` file.  
Edit the script to replace `"your-collection-name"` with the collection you want to export.  

### Step 4: Run the script  
Inside the `firestore-export` folder, run:  
```bash
node exportFirestore.js
```  

✅ This will generate a file named `<collection>.json` in the same folder.  



---
## 🧩 Problem + Solution  

During development, several technical challenges had to be solved:  

- **Rich AI Chatbox** → Needed branching conversations so users could edit past messages and fork new branches.  
- **High-Volume Logging** → Required detailed xAPI logs (keystrokes, clicks) *and* summary/bundled logs to avoid hitting Firebase quota limits.  
- **Reliable Data Storage** → Users often refresh or navigate away, so I combined:  
  - **LocalStorage drafts** for resilience  
  - **App-wide registry flush** to Firebase on logout for permanent storage    
- **Accessibility** → Integrated *Read Aloud* (text → speech) and *Speak* (speech → text input) across training, post-test, and survey pages.  

✅ Together, these solutions created a stable, research-ready platform for running controlled AI vs non-AI studies.  


---

## 🙏 Acknowledgements
- **Gati Aher**, Ph.D. student, Carnegie Mellon University  
- **Professor Nikolas Martelaro**, Augmented Design Capability Studio (HCI Institute @ CMU)  
- **Professor Scupelli**, Learning Environments Lab (Design School @ CMU)  

---



