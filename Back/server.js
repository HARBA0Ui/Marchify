import express from "express";
import dotenv from "dotenv";


// Routes
import cartRoutes from "./routes/cart.routes.js"
import boutiqueRoutes from "./routes/boutique.routes.js";
import produitRoutes from "./routes/produit.routes.js";
import userRoutes from "./routes/user.routes.js"

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use("/api/boutiques", boutiqueRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
