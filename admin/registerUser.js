const admin = require("firebase-admin");
const users = require("./users.json");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createUserAndSession(userData) {
    let userRecord;

    try {
        // Try to create the user
        userRecord = await admin.auth().createUser({
            email: userData.email,
            password: userData.password,
        });

        console.log(`✅ Created new user: ${userData.email}`);
    } catch (err) {
        if (err.code === "auth/email-already-exists") {
            console.log(`ℹ️ User already exists: ${userData.email}`);

            //  Fetch existing user
            userRecord = await admin.auth().getUserByEmail(userData.email);
        } else {
            console.error(`❌ Failed to create user ${userData.email}:`, err.message);
            return; // Skip to next user
        }
    }

    //  Check if sessionInfo doc exists
    const sessionRef = db.collection("sessionInfo").doc(userRecord.uid);
    const sessionSnap = await sessionRef.get();

    if (!sessionSnap.exists) {
        // Create sessionInfo only if missing
        const sessionDoc = {
            uid: userRecord.uid,
            groupNumber: userData.groupNumber,
            welcomeCompleted: false,
            preTestCompleted: false,
            trainingCompleted: false,
            postTestCompleted: false,
            surveyCompleted: false
        };

        await sessionRef.set(sessionDoc);
        console.log(`📄 sessionInfo created for ${userData.email}`);
    } else {
        console.log(`✅ sessionInfo already exists for ${userData.email}, skipping creation.`);
    }
}

async function run() {
    for (const user of users) {
        await createUserAndSession(user);
    }

    console.log("🎉 All users processed!");
}

run();
