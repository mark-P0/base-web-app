import "server-only";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { anonymous } from "better-auth/plugins";
import { serverEnvironment } from "../environment/server";
import { database, mongoClient } from "../mongodb/database";
import { transferAnonymousUserData } from "./transfer-anonymous-user-data";

function getSocialProviders() {
  const { googleCredentials } = serverEnvironment;

  if (!googleCredentials) {
    return {};
  }

  const socialProviders = {
    google: {
      clientId: googleCredentials.clientId,
      clientSecret: googleCredentials.clientSecret,
    },
  };

  return socialProviders;
}

export const auth = betterAuth({
  advanced: {
    database: {
      joins: true,
    },
  },
  baseURL: serverEnvironment.betterAuthUrl,
  database: mongodbAdapter(database, {
    client: mongoClient,
    transaction: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    anonymous({
      async onLinkAccount(args) {
        const { anonymousUser, newUser } = args;

        await transferAnonymousUserData({
          anonymousUserId: anonymousUser.user.id,
          newUserId: newUser.user.id,
        });
      },
    }),
  ],
  secret: serverEnvironment.betterAuthSecret,
  socialProviders: getSocialProviders(),
});
