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