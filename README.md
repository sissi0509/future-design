# Fullstack Web App with GenAI Chatbot for Future Thinking Research
<img width="1633" height="964" alt="Screenshot 2025-09-02 at 2 06 10 PM" src="https://github.com/user-attachments/assets/d2fa1a93-bf7e-4f1f-a887-49532a85e4c8" />

This web application (React + Firebase) supports online user studies on how GenAI helps college students plan for their future. It includes a branching conversational GenAI chatbot (Gemini 2.5-flash), xAPI logs of student behavior, and multiple pages of survey questions.

This project was created by **Xi Zhao** (M.S. student, Northeastern University) for **[Gati Aher](https://gatiaher.github.io/)** (Ph.D. student, Carnegie Mellon University), as part of research advised by:  
- Professor **[Nikolas Martelaro](https://nikmartelaro.com/)** (Augmented Design Capability Studio, HCI Institute @ CMU)  
- Professor **[Peter Scupelli](https://learningenvironmentslab.org/peter-scupelli/)** (Learning Environments Lab, Design School @ CMU)  

---
## Table of Contents
- [Technical Highlights](#-technical-highlights)
  - [Front-End](#-front-end)
  - [Back-End & Infrastructure](#️-back-end--infrastructure)
  - [Reliability & Error Handling](#️-reliability--error-handling)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Editing Prompts & Questions](#-editing-prompts--questions)
- [Export Firestore Data to JSON](#-export-firestore-data-to-json)
- [Screenshots](#%EF%B8%8F-screenshots)
  - [Login Page](#login-page)
  - [Welcome Page](#welcome-page)
  - [Consent Form Page](#cosent-form-page)
  - [Training Page 1 - Warmup](#training-page-1---warmup-page)
  - [Training Pages (2–5)](#training-pages-2--5-with-ai-chatbox-inside)
  - [Post-Test & Survey](#post-test--survey)
  - [QR-Code Page](#qr-code-page)
- [Acknowledgements](#-acknowledgements)



---
## 🧩 Technical Highlights

During development, I solved several technical challenges to make the platform research-ready.  

### 🎨 Front-End 
- **Rich AI Chatbox**
   - **Resizable, toggleable sidebar** for flexible layouts.
   - Pre-prompted AI Coach with **starter bubbles** to guide users.
   ![sidebar](https://github.com/user-attachments/assets/f79141b0-7533-44a3-957b-7814d1758770)
  - **Branching edits** let users fork conversations and explore multiple futures.
  - ![branch](https://github.com/user-attachments/assets/8c8e6a08-2d3a-4cc9-8fd9-2b2d3b4f90ed)
 
- **Accessibility**
  - Integrated **Read Aloud (text → speech)** and **Speak (speech → text input)** across training, post-test, and survey.
  - Supports users who prefer listening, rely on voice input, or need alternative ways to interact with text.
    ![speak](https://github.com/user-attachments/assets/8d63f61b-f13e-4f5b-86ec-62fe64310c8a)

- **Data-Driven Content Architecture**
  - All questions, AI prompts, and starter bubbles stored in separate **data modules** (not hardcoded in components).
  - Makes it easy to update or swap study content without redeploying the app.

### ⚙️ Back-End & Infrastructure 
- **High-Volume Logging & Analytics (xAPI-based)**
  - Implemented logging with the **[xAPI (Experience API)](https://xapi.com/)** standard for more structured tracking of learning interactions.  
  - **Bundled fine-grained logs** capture keystrokes, clicks, copy-paste actions, resizes, and scrolls, then aggregate before writing to Firebase to prevent quota issues.  
  - **Stage-level summaries** capture each long conversation or set of answers as a single consolidated xAPI statement per stage, making it easy to review full sessions.

    
### ⚙️ Reliability & Error Handling

- **LocalStorage Drafts**  
  - Automatically save user input (answers, reflections, chat text) into `localStorage`.  
  - Restores progress instantly after a refresh, tab close, or temporary network loss.  
  - Prevents users from losing work mid-session, ensuring smoother study participation. 

- **App-Wide Registry Flush**  
  - Global “answers registry” keeps track of all responses during a session.  
  - On **logout**, the registry uploads all past responses in bulk to Firebase.  
  - Guarantees that answers remain safely stored even if the user logs out before finishing the study.  


- **Safe Logging with Retries (`safeLogToFirebase`)**  
  - Logs (xAPI statements, client errors) are written to Firestore through a wrapper.  
  - If a write fails, the event is added to a **localStorage queue**.  
  - A background task (`logAutoFlush`) retries every 15s and on reconnect, ensuring no logs are lost.  

- **Structured Error Tracking (`logClientError()`)**    
  - Captures error with message, stack, user info, and timestamp, then saves them in Firebase.  
  - Provides researchers/admins **visibility into client-side issues**, making real-world debugging possible.  

 
✅ Together, these solutions created a stable, research-ready platform for running controlled AI vs non-AI studies.

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

---
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
## 🖼️ Screenshots
### Login Page
<img width="1562" height="1010" alt="Screenshot 2025-08-27 at 1 37 45 PM" src="https://github.com/user-attachments/assets/d1a1e2c1-4cd9-4161-b2bd-3dcd27b14adc" />

After login, the user’s email appears at the top-right corner of every subsequent page.

### Welcome Page
<img width="1212" height="420" alt="Screenshot 2025-09-02 at 6 26 59 PM" src="https://github.com/user-attachments/assets/7b265e6c-f969-4c52-b1d6-be5a37a24fdb" />


### Cosent Form Page
<img width="1105" height="639" alt="Screenshot 2025-09-02 at 6 27 26 PM" src="https://github.com/user-attachments/assets/90a343db-3c38-48af-8fc8-f92f62a433f1" />


### Training page 1 - warmup page
Most question pages include two accessibility features:
- Read Aloud button (reads the text aloud to users)
- Speak button (converts speech into text input)
These buttons are available in the Training, Post-Test, and Survey sections.

<img width="1469" height="919" alt="Screenshot 2025-09-02 at 8 20 22 PM" src="https://github.com/user-attachments/assets/aa51a81c-b52b-4fbb-8521-4a1883599ec0" />


### Training pages (2- 5) with AI-chatbox inside
The training sequence (pages 2–5) may or may not include AI support, depending on the user’s group assignment.
- **AI Group Experience**
   - Users in the AI group see an AI Coach sidebar, which can be toggled on or off.
   - The chatbox is resizable for flexible use.
   - The AI Coach is pre-prompted with instructions, and users can start a conversation with six predefined starter bubbles.
   - Users can edit messages and create new conversation branches, supporting exploration of multiple ideas.
- **Accessibility Features**
  - All training and test questions include a Read Aloud button, enabling screen-reader style playback.

<img width="1461" height="917" alt="Screenshot 2025-09-02 at 8 21 45 PM" src="https://github.com/user-attachments/assets/79770b49-c80e-4031-8251-5cdcc0df6d05" />
<img width="1464" height="904" alt="Screenshot 2025-09-02 at 8 23 02 PM" src="https://github.com/user-attachments/assets/9d104fa2-83ef-4ef7-9a67-99c13358892a" />
<img width="1469" height="913" alt="Screenshot 2025-09-02 at 8 24 04 PM" src="https://github.com/user-attachments/assets/626ab6ef-6537-4c39-b74a-cfe5077113dc" />
<img width="1465" height="916" alt="Screenshot 2025-09-02 at 8 24 45 PM" src="https://github.com/user-attachments/assets/86426f97-269f-4327-bb61-53526514e518" />


### Post-Test & Survey
These sections contain different question types:
-Open-ended text
-Multiple choice
-Likert scale
-Likert matirx
The **Next** button is enabled only after the current question is completed (choice selected or text word count validated).

<img width="1073" height="541" alt="Screenshot 2025-09-02 at 8 26 56 PM" src="https://github.com/user-attachments/assets/d3e81996-6516-43ad-837b-d6f27586c325" />

<img width="1067" height="386" alt="Screenshot 2025-09-02 at 8 27 40 PM" src="https://github.com/user-attachments/assets/f2992596-af7f-48db-bac3-d83ec12fcdb6" />

<img width="1057" height="336" alt="Screenshot 2025-09-02 at 8 28 22 PM" src="https://github.com/user-attachments/assets/711ab97c-84d8-4853-8b63-58dd3ea44af5" />

<img width="1077" height="761" alt="Screenshot 2025-09-02 at 8 28 59 PM" src="https://github.com/user-attachments/assets/0a42bdbb-06dd-4829-8f62-aae395d9ccc9" />

<img width="1074" height="358" alt="Screenshot 2025-09-02 at 8 29 32 PM" src="https://github.com/user-attachments/assets/114b5e28-12f4-45ec-abc9-bdcf16381c38" />


### QR-Code page
<img width="1062" height="453" alt="Screenshot 2025-09-02 at 8 31 51 PM" src="https://github.com/user-attachments/assets/eb6ed053-e1b1-4ead-88a4-6b99c3560995" />



---

## 🙏 Acknowledgements
- **Gati Aher**, Ph.D. student, Carnegie Mellon University  
- **Professor Nikolas Martelaro**, Augmented Design Capability Studio (HCI Institute @ CMU)  
- **Professor Scupelli**, Learning Environments Lab (Design School @ CMU)  

---



