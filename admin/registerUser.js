const admin = require("firebase-admin");
const users = require("./users.json");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function upsertAuthUser({ email, password }) {
    try {
        const userRecord = await admin.auth().createUser({ email, password });
        console.log(`✅ Created new user: ${email}`);
        return userRecord;
    } catch (err) {
        if (err.code === "auth/email-already-exists") {
            console.log(`ℹ️ User already exists: ${email}`);
            return await admin.auth().getUserByEmail(email);
        }
        throw err;
    }
}

async function ensureMinimalSessionInfo({ uid, email, groupNumber }) {
    const ref = db.collection("sessionInfo").doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
        await ref.set({
            uid,
            email,
            groupNumber, // assigned at creation
        });
        console.log(`sessionInfo created for ${email}`);
    } else {
        const data = snap.data() || {};
        const updates = {};
        if (data.email !== email) updates.email = email;
        if (data.groupNumber === undefined && groupNumber !== undefined) {
            updates.groupNumber = groupNumber;
        }

        if (Object.keys(updates).length) {
            await ref.set(updates, { merge: true });
            console.log(`🔁 sessionInfo updated for ${email}:`, updates);
        } else {
            console.log(`✅ sessionInfo already OK for ${email}`);
        }
    }
}

async function run() {
    for (const user of users) {
        try {
            const userRecord = await upsertAuthUser(user);
            await ensureMinimalSessionInfo({
                uid: userRecord.uid,
                email: user.email,
                groupNumber: user.groupNumber,
            });
        } catch (err) {
            console.error(`❌ Failed to process ${user.email}:`, err.message);
        }
    }
    console.log("All users processed!");
}

run();
