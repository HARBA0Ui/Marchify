import { Component, inject } from '@angular/core';
import { Panier } from '../../core/models/panier';
import { PanierService } from '../../core/services/panier';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panier-list',
  imports: [DecimalPipe],
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
    console.log('🔄 Loading paniers...');

    this.panierService.getPanier().subscribe({
      next: (data: any) => {
        console.log('✅ Data received:', data);
        this.paniers = data;
        this.loading = false;
        this.error = null;
      },
      error: (err: any) => {
        console.error('❌ Error loading panier:', err);
        this.error = 'Erreur lors du chargement du panier';
        this.loading = false;
        this.paniers = [];
      },
    });
  }

  confirmerCommande(): void {
    if (this.paniers && this.paniers.length > 0) {
      const panier = this.paniers[0];

      // Get client's address from panier or user data
      const adresseLivraison = {
        rue: '15 Avenue Habib Bourguiba', // TODO: Get from user profile or form
        ville: 'Tunis',
        codePostal: '1000',
      };

      this.panierService
        .confirmerCommande(panier.id, adresseLivraison)
        .subscribe({
          next: (response) => {
            console.log('✅ Commande créée:', response);
            alert('Commande confirmée avec succès ✅');

            // Clear panier after successful order
            this.viderPanier();

            // Optional: Navigate to orders page
            // this.router.navigate(['/commandes']);
          },
          error: (err) => {
            console.error('❌ Erreur lors de la confirmation:', err);
            alert('Erreur lors de la confirmation de la commande');
          },
        });
    } else {
      alert('Aucun panier à confirmer');
    }
  }

  increaseQuantity(product: any): void {
    if (this.paniers[0]?.id && product.produitId) {
      product.quantite++;

      // Update on server
      this.panierService
        .modifierQuantite(
          this.paniers[0].id,
          product.produitId,
          product.quantite
        )
        .subscribe({
          next: (updatedPanier) => {
            console.log('✅ Quantité mise à jour');
            this.updateTotals();
          },
          error: (err) => {
            console.error('❌ Erreur:', err);
            product.quantite--; // Revert on error
          },
        });
    }
  }

  decreaseQuantity(product: any): void {
    if (product.quantite > 1) {
      if (this.paniers[0]?.id && product.produitId) {
        product.quantite--;

        // Update on server
        this.panierService
          .modifierQuantite(
            this.paniers[0].id,
            product.produitId,
            product.quantite
          )
          .subscribe({
            next: (updatedPanier) => {
              console.log('✅ Quantité mise à jour');
              this.updateTotals();
            },
            error: (err) => {
              console.error('❌ Erreur:', err);
              product.quantite++; // Revert on error
            },
          });
      }
    }
  }

  removeProduct(product: any): void {
    if (this.paniers[0]?.id && product.produitId) {
      if (confirm('Voulez-vous vraiment retirer ce produit ?')) {
        this.panierService
          .retirerProduit(this.paniers[0].id, product.produitId)
          .subscribe({
            next: () => {
              console.log('✅ Produit retiré');
              const index = this.paniers[0].produits.indexOf(product);
              if (index > -1) {
                this.paniers[0].produits.splice(index, 1);
                this.updateTotals();
              }
            },
            error: (err) => {
              console.error('❌ Erreur:', err);
              alert('Erreur lors de la suppression du produit');
            },
          });
      }
    }
  }

  viderPanier(): void {
    if (this.paniers[0]?.id) {
      if (confirm('Voulez-vous vraiment vider le panier ?')) {
        this.panierService.viderPanier(this.paniers[0].id).subscribe({
          next: () => {
            console.log('✅ Panier vidé');
            this.paniers[0].produits = [];
            this.updateTotals();
          },
          error: (err) => {
            console.error('❌ Erreur:', err);
            alert('Erreur lors du vidage du panier');
          },
        });
      }
    }
  }

  continuerAchats(): void {
    this.router.navigate(['/produits']); // Adjust route as needed
  }

  updateTotals(): void {
    if (this.paniers[0]?.produits) {
      // Recalculate prixTotal for each product
      for (const p of this.paniers[0].produits) {
        p.prixTotal = p.prixUnitaire * p.quantite;
      }

      // Recalculate cart total
      this.paniers[0].total = this.paniers[0].produits.reduce(
        (sum, p) => sum + p.prixTotal,
        0
      );
    }
  }
}
