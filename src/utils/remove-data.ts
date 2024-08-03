import { getDatabase, initDatabase } from "./surrealdb";

await initDatabase();
const surrealdb = await getDatabase();
if (!surrealdb) {
    console.error("Database not initialized");
    process.exit(1);
}

await surrealdb.delete("users");
console.log("Deleted all users");
process.exit(0);
