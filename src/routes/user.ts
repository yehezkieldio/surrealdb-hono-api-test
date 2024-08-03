import { Hono } from "hono";
import { type User, getDatabase, initDatabase } from "../utils/surrealdb";

export const userRoutes = new Hono();

await initDatabase();
const surrealdb = await getDatabase();
if (!surrealdb) {
    console.error("Database not initialized");
    process.exit(1);
}

userRoutes.get("/", async (c) => {
    const users = await surrealdb.select<User>("users");
    users.sort((a, b) => a.username.localeCompare(b.username));

    return c.json(
        users.map((user) => {
            const { password_hash, id, ...rest } = user;
            return rest;
        }),
    );
});

export default userRoutes;
