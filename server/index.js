import app from "./src/app.js";
import { seedDatabase } from "./src/config/seed.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Check and seed initial data if needed
    await seedDatabase();
  } catch (err) {
    console.warn("Seeding warning:", err);
  }

  app.listen(PORT, () => {
    console.log(`ResearchFlow Server running on http://localhost:${PORT}`);
  });
}

startServer();
