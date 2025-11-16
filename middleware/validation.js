// middleware/validation.js
export const validateBoutique = (req, res, next) => {
  const { nom, adresse, categorie, telephone } = req.body;
  
  if (!nom || !adresse || !categorie || !telephone) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  next();
};

export const validateProduit = (req, res, next) => {
  const { nom, prix, categorie, quantite, boutiqueId } = req.body;
  
  if (!nom || !prix || !categorie || !quantite || !boutiqueId) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (prix <= 0) {
    return res.status(400).json({ message: 'Price must be greater than 0' });
  }
  
  next();
};