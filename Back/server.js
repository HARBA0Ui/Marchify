import express from "express";
import dotenv from "dotenv";
import cors from "cors";


// Routes
import cartRoutes from "./routes/cart.routes.js"
import boutiqueRoutes from "./routes/boutique.routes.js";
import produitRoutes from "./routes/produit.routes.js";
import userRoutes from "./routes/user.routes.js"
import commandesRoutes from "./routes/commande.routes.js"
import livreurRoutes from "./routes/livreur.routes.js"
import bonDelivraison from "./routes/bonDeLivraison.routes.js"

dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);


// Routes
app.use("/api/boutiques", boutiqueRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/commandes", commandesRoutes);
app.use("/api/livreur", livreurRoutes);
app.use("/api/bonDeLivraison", bonDelivraison);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
