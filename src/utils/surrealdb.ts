import Surreal, { ResponseError } from "surrealdb.js";

export type User = {
    username: string;
    email: string;
    password_hash: string;
};

let db: Surreal | undefined;

export async function initDatabase(): Promise<Surreal> {
    if (db) return db;
    db = new Surreal();

    try {
        await db.connect("http://127.0.0.1:8000/rpc", {
            auth: {
                username: "root",
                password: "root",
            },
            database: "test",
            namespace: "test",
        });

        return db;
    } catch (error) {
        if (error instanceof ResponseError) {
            if (error.message.includes("already exists")) {
                return db;
            }

            throw error;
        }
        throw error;
    }
}

export async function closeDatabase(): Promise<void> {
    if (!db) return;
    await db.close();
    db = undefined;
}

export async function getDatabase() {
    return db;
}
