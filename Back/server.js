import express from "express";
import dotenv from "dotenv";

// Routes
import boutiqueRoutes from "./routes/boutique.routes.js";
import produitRoutes from "./routes/produit.routes.js";

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use("/api/boutiques", boutiqueRoutes);
app.use("/api/produits", produitRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
