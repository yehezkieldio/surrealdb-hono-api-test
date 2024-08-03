import { type User, getDatabase, initDatabase } from "./surrealdb";

const users: User[] = [
    {
        username: "alice",
        email: "alice@gmail.com",
        password_hash: await Bun.password.hash("alice"),
    },
    {
        username: "bob",
        email: "bob@gmail.com",
        password_hash: await Bun.password.hash("bob"),
    },
];

await initDatabase();
const surrealdb = await getDatabase();
if (!surrealdb) {
    console.error("Database not initialized");
    process.exit(1);
}

for (const user of users) {
    await surrealdb.insert<User>("users", user);
    console.log(`Inserted user ${user.username}`);
}

console.log("Done inserting users");
process.exit(0);
