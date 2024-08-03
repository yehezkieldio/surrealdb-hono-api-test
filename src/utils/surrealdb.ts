import Surreal, { ResponseError } from "surrealdb.js";

export type User = {
    username: string;
    email: string;
    password_hash: string;
};

interface TableInfo {
    events: Record<string, string>;
    fields: Record<string, string>;
    indexes: Record<string, string>;
    lives: Record<string, string>;
    tables: Record<string, string>;
}

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

        const userInfo = await db.query<TableInfo[]>("INFO FOR TABLE users;");

        if (Object.keys(userInfo[0].indexes).length === 0) {
            await db.query("DEFINE INDEX IF NOT EXISTS userUsernameIndex ON users COLUMNS username UNIQUE;");
            await db.query("DEFINE INDEX IF NOT EXISTS userEmailIndex ON users COLUMNS email UNIQUE;");
        }

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
