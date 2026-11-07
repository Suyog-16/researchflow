import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import paperRoutes from "./routes/paper.routes.js";




const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/papers", paperRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "ResearchFlow API is running"
    });
});

app.get("/api/health/db", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT NOW()"
        );

        res.status(200).json({
            status: "success",
            databaseTime: result.rows[0].now
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "error",
            message: "Database connection failed"
        });
    }
});

export default app;

