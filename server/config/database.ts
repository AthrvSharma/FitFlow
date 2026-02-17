import mongoose from "mongoose";

export const connectDatabase = async (uri: string) => {
  if (!uri) {
    throw new Error("MONGODB_URI is required to start the server");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    autoIndex: true,
  });

  console.log("✅ Connected to MongoDB");
};
