import express from "express";
import recipesRoutes from "./routes/recipes.routes.js";
import mealplannerRoutes from "./routes/mealplanner.routes.js";
import tagsRoutes from "./routes/tags.routes.js";

const app = express();

app.use(express.json());

app.use("/api/recipes", recipesRoutes);
app.use("/api/mealplanner", mealplannerRoutes);
app.use("/api/tags", tagsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
