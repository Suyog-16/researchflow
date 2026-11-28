import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import paperRoutes from "./routes/paper.routes.js";
import collectionRoutes from "./routes/collection.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API Routes
app.use("/api/papers", paperRoutes);
app.use("/api/collections", collectionRoutes);

// Root route - provides friendly landing page and endpoint directory
app.get("/", (req, res) => {
  if (req.accepts("html")) {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>ResearchFlow Backend API</title>
          <style>
            body {
              background: #0d0d10;
              color: #f4f4f6;
              font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace;
              padding: 2.5rem;
              line-height: 1.6;
            }
            .card {
              max-width: 600px;
              background: #141419;
              border: 1px solid #26262e;
              border-radius: 6px;
              padding: 1.5rem 2rem;
            }
            h1 { color: #f59e0b; margin-top: 0; font-size: 1.25rem; }
            a { color: #38bdf8; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .badge {
              display: inline-block;
              background: rgba(34, 197, 94, 0.15);
              color: #4ade80;
              border: 1px solid rgba(34, 197, 94, 0.3);
              padding: 0.15rem 0.5rem;
              border-radius: 3px;
              font-size: 0.75rem;
              margin-bottom: 1rem;
            }
            ul { padding-left: 1.2rem; }
            li { margin: 0.4rem 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">● API Online</span>
            <h1>ResearchFlow Backend Server</h1>
            <p style="color: #a1a1aa; font-size: 0.9rem;">
              The REST API is running on port 5000 and connected to PostgreSQL.
            </p>
            <p style="font-weight: bold; margin-top: 1.5rem;">Available Endpoints:</p>
            <ul>
              <li><a href="/api/papers">/api/papers</a> &mdash; All research papers, notes & highlights</li>
              <li><a href="/api/collections">/api/collections</a> &mdash; Research collections and counts</li>
              <li><a href="/api/health">/api/health</a> &mdash; API health status</li>
              <li><a href="/api/health/db">/api/health/db</a> &mdash; PostgreSQL connection check</li>
            </ul>
            <p style="margin-top: 1.5rem; font-size: 0.85rem; color: #71717a;">
              Frontend Web Application: <a href="http://localhost:5173" target="_blank">http://localhost:5173</a>
            </p>
          </div>
        </body>
      </html>
    `);
  } else {
    res.status(200).json({
      name: "ResearchFlow API",
      status: "online",
      frontend: "http://localhost:5173",
      endpoints: {
        papers: "/api/papers",
        collections: "/api/collections",
        health: "/api/health",
        databaseHealth: "/api/health/db",
      },
    });
  }
});

// Health check endpoints
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "ResearchFlow API is running",
  });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      status: "success",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database health check error:", error);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

export default app;
