const admin = require("firebase-admin");
const users = require("./users.json");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
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

async function ensureMinimalSessionInfo({ uid, email, groupNumber, trainingSeed }) {
    const ref = db.collection("sessionInfo").doc(uid);
    const snap = await ref.get();

    const seed = trainingSeed || {};
    const patch = {
        uid,
        email,
        groupNumber,
        progress: {
            training: {
                // Preset “previous info” used by Revision
                seed: {
                    question: seed.question || null,
                    answer: seed.answer || "",
                    minWords: Number.isFinite(seed.minWords) ? seed.minWords : 30,
                    maxWords: Number.isFinite(seed.maxWords) ? seed.maxWords : 400,
                },
                evaluationCompleted: false,
                revisionCompleted: false,
            },
        },
    };

    if (!snap.exists) {
        await ref.set(patch, { merge: true });
        console.log(`sessionInfo created for ${email}`);
    } else {
        await ref.set(patch, { merge: true });
        console.log(`🔁 sessionInfo updated for ${email} (seed & training flags)`);
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
                trainingSeed: user.trainingSeed,
            });
        } catch (err) {
            console.error(`❌ Failed to process ${user.email}:`, err.message);
        }
    }
    console.log("All users processed!");
}

run();
