import "server-only";
import { MongoClient } from "mongodb";
import { serverEnvironment } from "../environment/server";

declare global {
  var betterAuthMongoClient: MongoClient | undefined;
}

export const mongoClient =
  globalThis.betterAuthMongoClient ??
  new MongoClient(serverEnvironment.mongodbUri);

globalThis.betterAuthMongoClient = mongoClient;

export const database = mongoClient.db(serverEnvironment.mongodbDatabaseName);
