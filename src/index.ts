import { Hono } from "hono";
import { logger } from "hono/logger";
import { userRoutes } from "./routes/user";

const app = new Hono();

app.use(logger());

app.get("/", (c) => c.text("Hello, world!"));
app.route("/user", userRoutes);

console.log("Server started at http://localhost:3000");

export default app;
