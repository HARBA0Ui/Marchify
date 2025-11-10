import express from "express";
import dotenv from "dotenv";
import cors from "cors";

<<<<<<< HEAD
// Routes
import cartRoutes from "./routes/cart.routes.js";
import boutiqueRoutes from "./routes/boutique.routes.js";
import produitRoutes from "./routes/produit.routes.js";
import userRoutes from "./routes/user.routes.js";
import commandesRoutes from "./routes/commande.routes.js";
import livreurRoutes from "./routes/livreur.routes.js";
=======

// Routes
import cartRoutes from "./routes/cart.routes.js"
import boutiqueRoutes from "./routes/boutique.routes.js";
import produitRoutes from "./routes/produit.routes.js";
import userRoutes from "./routes/user.routes.js"
import commandesRoutes from "./routes/commande.routes.js"
import livreurRoutes from "./routes/livreur.routes.js"
<<<<<<< HEAD
import predictRoutes from "./routes/predict.routes.js"
=======

>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
>>>>>>> 92b29753a0da1a57e47e0dfbc5dfa925306739de

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.json({ limit: "10mb" }));


app.use(
  cors({
<<<<<<< HEAD
    origin: "http://localhost:4200",
=======
    origin: true,
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
    credentials: true,
  })
);

<<<<<<< HEAD
=======

>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
// Routes
app.use("/api/boutiques", boutiqueRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/commandes", commandesRoutes);
app.use("/api/livreur", livreurRoutes);

<<<<<<< HEAD
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
=======

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
