import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { RecordId } from "surrealdb.js";
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

    return c.json(
        users.map((user) => {
            return {
                id: user.id.id,
                username: user.username,
                email: user.email,
            };
        }),
    );
});

userRoutes.get("/:id", async (c) => {
    const id = c.req.param("id");

    if (!id) {
        throw new HTTPException(400, {
            message: "Missing id",
        });
    }

    const user = await surrealdb.select<User>(new RecordId("users", id));

    if (!user) {
        throw new HTTPException(404, {
            message: "User not found",
        });
    }

    return c.json({
        id: user.id.id,
        username: user.username,
        email: user.email,
    });
});

export default userRoutes;
