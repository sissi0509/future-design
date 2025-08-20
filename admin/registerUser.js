// seedUsers.js
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

// drop undefineds so Firestore won't complain
function stripUndefined(obj) {
    if (obj == null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(stripUndefined);
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === undefined) continue;
        out[k] = typeof v === "object" ? stripUndefined(v) : v;
    }
    return out;
}

async function ensureMinimalSessionInfo({ uid, email, groupNumber, trainingSeed }) {
    const ref = db.collection("sessionInfo").doc(uid);
    const snap = await ref.get();

    // assume trainingSeed already has the final structure you want
    // {
    //   expect: { prompt: "...", answers: ["...", "...", "...", "..."] },
    //   avoid:  { prompt: "...", answers: ["...", "...", "...", "..."] },
    //   advice: { prompt: "...",  answer:  "..." }
    // }
    const patch = stripUndefined({
        uid,
        email,
        groupNumber,
        progress: {
            training: {
                seed: trainingSeed
            }
        }
    });

    await ref.set(patch, { merge: true });

    if (!snap.exists) {
        console.log(`✅ sessionInfo created for ${email}`);
    } else {
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
    process.exit(0);
}

run();
