import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "ResearchFlow API is running"
    });
});
// GET all users
app.get("/api/users", (req, res) => {
    const users = [
        { id: 1, name: "Suyog", role: "Student" },
        { id: 2, name: "Ram", role: "Developer" },
        { id: 3, name: "Hari", role: "Researcher" }
    ];

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

export default app;