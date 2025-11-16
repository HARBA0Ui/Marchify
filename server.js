import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import cartRoutes from "./routes/cart.routes.js";
import boutiqueRoutes from "./routes/boutique.routes.js";
import produitRoutes from "./routes/produit.routes.js";
import commandesRoutes from "./routes/commande.routes.js";
import livreurRoutes from "./routes/livreur.routes.js";
import bonDelivraison from "./routes/bonDeLivraison.routes.js";
import predictRoutes from "./routes/predict.routes.js";
import userRoutes from "./routes/user.routes.js";
import reviewRoutes from "./routes/review.routes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.json({ limit: "10mb" }));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/api/boutiques", boutiqueRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/commandes", commandesRoutes);
app.use("/api/livreur", livreurRoutes);
app.use("/api/bonDeLivraison", bonDelivraison);
app.use("/api/reviews", reviewRoutes);

// Start server

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
