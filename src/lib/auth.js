import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

const mongodbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/intelli-submit";
const client = new MongoClient(mongodbUri);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "default_development_secret_32_characters_long_min",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: mongodbAdapter(client.db("intelli-submit")),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "author",
        input: true,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_google_client_secret",
    },
  },
});

