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

### Training pages (2- 5) with AI-chatbox inside
The training sequence (pages 2–5) may or may not include AI support, depending on the user’s group assignment.
- **AI Group Experience**
   - Users in the AI group see an AI Coach sidebar, which can be toggled on or off.
   - The chatbox is resizable for flexible use.
   - The AI Coach is pre-prompted with instructions, and users can start a conversation with six predefined starter bubbles.
   - Users can edit messages and create new conversation branches, supporting exploration of multiple ideas.
- **Accessibility Features**
  - All training and test questions include a Read Aloud button, enabling screen-reader style playback.

<img width="1920" height="1080" alt="Screenshot 2025-09-01 at 12 04 03 PM" src="https://github.com/user-attachments/assets/565b1869-6efd-48c1-ac6a-7871bc6b4c8f" />
<img width="1920" height="1080" alt="Screenshot 2025-09-01 at 12 04 24 PM" src="https://github.com/user-attachments/assets/47fb919b-5e18-4bd6-909e-22efc1d14f30" />
<img width="1920" height="1080" alt="Screenshot 2025-09-01 at 12 05 55 PM" src="https://github.com/user-attachments/assets/d6694a5a-668f-4f8d-97e4-a2bde588fe5c" />
<img width="1920" height="1080" alt="Screenshot 2025-09-01 at 12 06 17 PM" src="https://github.com/user-attachments/assets/d23e15fd-357c-4e9b-a770-01b7b86842bc" />

### Post-Test & Survey
These sections contain different question types:
-Open-ended text
-Single choice
-Multiple choice
-Likert scale
-Likert matirx
The **Next** button is enabled only after the current question is completed (choice selected or text word count validated).

<img width="1920" height="1080" alt="Screenshot 2025-09-01 at 12 06 45 PM" src="https://github.com/user-attachments/assets/82e4a657-cd3e-48db-9faf-de08b15e8e7f" />
<img width="1920" height="1080" alt="Screenshot 2025-09-01 at 12 07 04 PM" src="https://github.com/user-attachments/assets/144cf43b-213b-4947-a680-bf06201bd536" />
<img width="1920" height="1080" alt="Screenshot 2025-09-01 at 12 07 15 PM" src="https://github.com/user-attachments/assets/9812bfd9-3206-408c-a72e-7be115dbe8e9" />
<img width="1920" height="1080" alt="Screenshot 2025-09-01 at 12 07 19 PM" src="https://github.com/user-attachments/assets/ea50a715-b667-4dce-b7c4-128befafa15a" />
<img width="1920" height="1080" alt="Screenshot 2025-09-01 at 12 07 36 PM" src="https://github.com/user-attachments/assets/9dafab99-870a-4f0e-b83b-c87e97122ea6" />


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

### 3. Register Users  

The **admin scripts** let you register users in Firebase with a pre-assigned `groupNumber` and optional `trainingSeed` data.  

- `groupNumber` → assigns which experimental condition a user belongs to.  
- `previousResponses` 
  - pre-populated prompts and answers, generated from the **Qualtrics pre-survey** before users arrive at this app.  
  - These values can be shown again in training to **refresh the user’s memory** and scaffold their reflection.  

```bash
cd admin
# Register users listed in users.json
# Ensure serviceAccountKey.json exists
node registerUser.js
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

## 🔑 Editing Prompts & Questions  

All AI prompts, starter bubbles, and training questions, post-test, and survey items are stored as **data modules** (not hardcoded in components).  

- Location:  
  ```
  web_app/src/data/questions/
  ```
- Examples:  
- `training/aiPrompts.js` → AI system prompts and starter bubbles.  
- `training/goal.js`, `plan.js`, `strategy.js`, `warmup.js`, `instruction.js` → Training stage questions and instructions.  
- `postTest.js` → Post-test question set.  
- `survey.js` → Survey items.  

This separation makes it easy for collaborators to **update study content** without touching React components.  


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

During development, I addressed several technical challenges:

- **Rich AI Chatbox**
  - Designed an AI Coach (pre-prompted with guardrails) that supports starter bubbles, branching edits, and a resizable, toggleable sidebar.
  - Enables users to explore multiple futures by revising conversations, rather than being locked into linear chat.

- **High-Volume Logging & Analytics**
  - **Bundled fine-grained logs** capture keystrokes, clicks, **copy-paste actions**, resizes, and scrolls, then aggregate before writing to Firebase to prevent quota issues.
  - **Stage-level summaries** capture each long conversation or set of answers as a single consolidated log per stage, so researchers can review full results without piecing together micro-logs.

- **Reliability & Error Handling**  
  - **Safe delivery:** All logs go through `safeLogToFirebase`, with retries and batching to prevent data loss.  
  - **Error tracking:** Instead of `console.log` or `console.error`, client errors are captured with `logClientError()` and stored in Firebase, giving researchers/admins visibility into client-side issues.  

- **Reliable Data Storage**  
  - **LocalStorage drafts** prevent data loss on refresh or navigation.  
  - **App-wide registry flush** ensures all responses are uploaded to Firebase on logout for permanent storage.  

- **Accessibility**  
  - Integrated **Read Aloud (text → speech)** and **Speak (speech → text input)** across training, post-test, and survey.  
  - Supports users who prefer listening, rely on voice input, or need alternative ways to interact with text.  

- **Data-Driven Content Architecture**  
  - All questions, AI prompts, and starter bubbles are stored in separate **data modules** (not hardcoded in components).  
  - Makes it easy to update or swap study content without redeploying the app.  
  - Ensures a clean separation between **logic** (React + Firebase) and **content** (JSON/JS data).  

✅ Together, these solutions created a stable, research-ready platform for running controlled AI vs non-AI studies.  


---

## 🙏 Acknowledgements
- **Gati Aher**, Ph.D. student, Carnegie Mellon University  
- **Professor Nikolas Martelaro**, Augmented Design Capability Studio (HCI Institute @ CMU)  
- **Professor Scupelli**, Learning Environments Lab (Design School @ CMU)  

---



