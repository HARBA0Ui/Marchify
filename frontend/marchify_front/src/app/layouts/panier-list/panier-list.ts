import { Component, inject } from '@angular/core';
import { Panier } from '../../core/models/panier';
import { PanierService } from '../../core/services/panier';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-panier-list',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './panier-list.html',
  styleUrl: './panier-list.css',
})
export class PanierList {
  paniers: Panier[] = [];
  loading = true;
  error: string | null = null;
  private router = inject(Router);

  constructor(private panierService: PanierService) {}

  ngOnInit() {
    const clientId = '68f743532df2f750af13a584';
    this.loadPanier(clientId);
  }

  loadPanier(clientId: string) {
    this.panierService.getPanierByClientId(clientId).subscribe({
      next: (data: any) => {
        if (!data || !data.produits) {
          this.paniers = [];
        } else {
          this.paniers = [
            {
              id: data.id,
              clientId: data.clientId,
              produits: data.produits.map((p: any) => {
                const produit = p.produit || p.produitId;
                return {
                  produitId: produit._id || produit.id || p.produitId,
                  nom: produit.nom,
                  prixUnitaire: produit.prix,
                  quantite: p.quantite,
                  prixTotal: p.prixTotal || produit.prix * p.quantite,
                };
              }),
              total: data.produits.reduce(
                (sum: number, p: any) =>
                  sum +
                  (p.prixTotal ||
                    (p.produit?.prix || p.produitId?.prix) * p.quantite),
                0
              ),
            },
          ];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  increaseQuantity(p: any) {
    p.quantite++;
    this.updateTotals();
    this.saveQuantities();
  }

  decreaseQuantity(p: any) {
    if (p.quantite <= 1) return;
    p.quantite--;
    this.updateTotals();
    this.saveQuantities();
  }

  removeProduct(p: any) {
    if (confirm(`Voulez-vous vraiment supprimer "${p.nom}" du panier ?`)) {
      const panier = this.paniers[0];
      panier.produits = panier.produits.filter(
        (prod) => prod.produitId !== p.produitId
      );
      this.updateTotals();
      // TODO: Call API to remove product from cart
      console.log('Product removed:', p.produitId);
    }
  }

  private updateTotals() {
    if (!this.paniers[0]?.produits) return;
    for (const p of this.paniers[0].produits) {
      p.prixTotal = p.prixUnitaire * p.quantite;
    }
    this.paniers[0].total = this.paniers[0].produits.reduce(
      (sum, p) => sum + p.prixTotal,
      0
    );
  }

  private saveQuantities() {
    const panier = this.paniers[0];
    const updates = panier.produits.map((p) => ({
      produitId: p.produitId,
      quantite: p.quantite,
    }));
    this.panierService.modifierQuantites(panier.id, updates).subscribe({
      next: () => console.log('Quantités mises à jour'),
      error: (err) => console.error(err),
    });
  }

  continuerAchats() {
    this.router.navigate(['/product-list']);
  }

  confirmerCommande() {
    const panier = this.paniers[0];
    const adresseLivraison = {
      rue: '15 Avenue Habib Bourguiba',
      ville: 'Tunis',
      codePostal: '1000',
    };
    this.panierService
      .confirmerCommande(panier.id, adresseLivraison)
      .subscribe({
        next: (res) => {
          alert('Commande confirmée ✅');
          this.loadPanier(panier.clientId);
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la confirmation');
        },
      });
  }

  // Helper method to safely get total
  getTotalWithTax(): number {
    return this.paniers[0]?.total ? this.paniers[0].total * 1.19 : 0;
  }

  getTax(): number {
    return this.paniers[0]?.total ? this.paniers[0].total * 0.19 : 0;
  }
}