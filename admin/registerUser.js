const admin = require("firebase-admin");
const users = require("./users.json");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createUserAndSession(userData) {
    try {
        // 1. Create Auth user
        const userRecord = await admin.auth().createUser({
            email: userData.email,
            password: userData.password,
        });

        console.log(`✅ Created user: ${userData.email}`);

        // 2. Create Firestore sessionInfo doc
        const sessionDoc = {
            uid: userRecord.uid,
            groupNumber: userData.groupNumber,
            welcomeCompleted: false,
            preTestCompleted: false,
            trainingCompleted: false,
            postTestCompleted: false,
            surveyCompleted: false
        };

        await db.collection("sessionInfo").doc(userRecord.uid).set(sessionDoc);
        console.log(` sessionInfo created for ${userData.email}`);
    } catch (err) {
        console.error(` Failed to create ${userData.email}:`, err.message);
    }
}

async function run() {
    for (const user of users) {
        await createUserAndSession(user);
    }

    console.log("All users processed!");
}

run();
