import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { RecordId } from "surrealdb.js";
import { z } from "zod";
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

userRoutes.get("/unsafe/all", async (c) => {
    const users = await surrealdb.select<User>("users");

    return c.json(users);
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

const validationCreateUser = zValidator(
    "json",
    z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
    }),
);

userRoutes.post("/", validationCreateUser, async (c) => {
    const body = c.req.valid("json");

    try {
        await surrealdb.create<User>("users", {
            username: body.username,
            email: body.email,
            password_hash: await Bun.password.hash(body.password),
        });
    } catch (error) {
        console.error(error);

        throw new HTTPException(400, {
            message: "Failed to create user, user already exists",
        });
    }

    return c.json({
        message: "User created",
    });
});

const validateUpdateUser = zValidator(
    "json",
    z.object({
        username: z.string(),
        email: z.string().email().optional(),
    }),
);

userRoutes.put("/:id", validateUpdateUser, async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");

    if (!id) {
        throw new HTTPException(400, {
            message: "Missing id",
        });
    }

    const data: Partial<User> = {
        username: body.username,
    };

    if (body.email) {
        data.email = body.email;
    }

    try {
        await surrealdb.merge<User>(new RecordId("users", id), data);
    } catch (error) {
        console.error(error);

        throw new HTTPException(400, {
            message: "Failed to update user",
        });
    }

    return c.json({
        message: "User updated",
    });
});

userRoutes.delete("/:id", async (c) => {
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

    try {
        await surrealdb.delete(new RecordId("users", id));
    } catch (error) {
        console.error(error);

        throw new HTTPException(400, {
            message: "Failed to delete user",
        });
    }

    return c.json({
        message: "User deleted",
    });
});

export default userRoutes;
