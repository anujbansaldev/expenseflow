import mongoose from "mongoose";

const uri = "mongodb://127.0.0.1:27017/expenseflow";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to Mongo.");

  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const c of collections) {
      if (c.name === "transactions") {
        console.log("Dropping existing indexes on transactions collection...");
        await mongoose.connection.db.collection("transactions").dropIndexes();
      }
    }
  } catch (e) {
    console.log("Index drop note:", e.message);
  }

  await mongoose.disconnect();
  console.log("Indexes cleaned successfully.");
}

run().catch(console.error);
