import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Panier } from '../../core/models/panier';
import { PanierService } from '../../core/services/panier';
import { DecimalPipe, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-panier-list',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './panier-list.html',
  styleUrl: './panier-list.css',
})
export class PanierList implements OnInit, OnDestroy {
  paniers: Panier[] = [];
  loading = true;
  error: string | null = null;
  private router = inject(Router);
  private authService = inject(AuthService);
  private authSubscription?: Subscription;

  // 🔹 clientId dynamique depuis auth
  private clientId: string | null = null;

  constructor(private panierService: PanierService) { }

  ngOnInit() {
    // 🔹 S'abonner aux changements d'état auth
    this.authSubscription = this.authService.authState$.subscribe((auth) => {
      if (auth.isLogged && auth.user?.id) {
        // Utilisateur connecté : charger son panier
        this.clientId = auth.user.id;
        // 🔹 Type guard: vérifier que clientId n'est pas null
        if (this.clientId) {
          this.loadPanier(this.clientId);
        }
      } else {
        // Utilisateur déconnecté : vider le panier local
        this.clientId = null;
        this.paniers = [];
        this.panierService.setCartCount(0);
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    // 🔹 Se désabonner pour éviter les fuites mémoire
    this.authSubscription?.unsubscribe();
  }

  loadPanier(clientId: string) {
    this.loading = true;
    this.panierService.getPanierByClientId(clientId).subscribe({
      next: (data: any) => {
        if (!data || !data.produits) {
          this.paniers = [];
          this.panierService.setCartCount(0);
        } else {
          const produits = data.produits.map((p: any) => {
            const produit = p.produit || p.produitId;
            return {
              produitId: produit._id || produit.id || p.produitId,
              nom: produit.nom,
              prixUnitaire: produit.prix,
              quantite: p.quantite,
              prixTotal: p.prixTotal || produit.prix * p.quantite,
              stock: produit.quantite,
            };
          });

          this.paniers = [
            {
              id: data.id,
              clientId: data.clientId,
              produits,
              total: produits.reduce(
                (sum: number, pp: any) => sum + pp.prixTotal,
                0
              ),
            },
          ];

          const count = produits.reduce(
            (sum: number, pp: any) => sum + pp.quantite,
            0
          );
          this.panierService.setCartCount(count);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.error = 'Erreur lors du chargement du panier';
        this.loading = false;
        this.panierService.setCartCount(0);
      },
    });
  }

  increaseQuantity(p: any) {
    if (p.stock != null && p.quantite >= p.stock) {
      alert(`Stock max atteint pour "${p.nom}" (${p.stock} en stock).`);
      return;
    }
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
    if (!confirm(`Voulez-vous vraiment supprimer "${p.nom}" du panier ?`)) {
      return;
    }

    if (!this.clientId) {
      alert('Vous devez être connecté pour modifier le panier.');
      return;
    }

    this.loading = true;
    this.panierService.supprimerProduit(this.clientId, p.produitId).subscribe({
      next: (res) => {
        console.log('Produit supprimé:', res);
        this.loadPanier(this.clientId!);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur suppression produit:', err);
        this.loading = false;
        alert('Erreur lors de la suppression du produit du panier.');
      },
    });
  }

  viderPanier() {
    if (!confirm('Voulez-vous vraiment vider votre panier ?')) {
      return;
    }

    if (!this.clientId) {
      alert('Vous devez être connecté pour vider le panier.');
      return;
    }

    this.loading = true;
    this.panierService.viderPanier(this.clientId).subscribe({
      next: (res) => {
        console.log('Panier vidé:', res);
        this.paniers = [];
        this.loading = false;
        this.panierService.setCartCount(0);
      },
      error: (err) => {
        console.error('Erreur vidage panier:', err);
        this.loading = false;
        alert('Erreur lors du vidage du panier.');
      },
    });
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

    const count = this.paniers[0].produits.reduce(
      (sum, p) => sum + p.quantite,
      0
    );
    this.panierService.setCartCount(count);
  }

  private saveQuantities() {
    if (!this.clientId) {
      alert('Vous devez être connecté pour modifier le panier.');
      return;
    }

    const panier = this.paniers[0];
    const updates = panier.produits.map((p) => ({
      produitId: p.produitId,
      quantite: p.quantite,
    }));

    this.panierService.modifierQuantites(this.clientId, updates).subscribe({
      next: () => console.log('Quantités mises à jour'),
      error: (err) => {
        console.error('Error updating quantities:', err);

        if (err.status === 400 && err.error?.message) {
          alert(`❌ ${err.error.message}`);
        } else {
          alert('Erreur lors de la mise à jour des quantités');
        }

        this.loadPanier(this.clientId!);
      },
    });
  }

  continuerAchats() {
    this.router.navigate(['/product-list']);
  }

  confirmerCommande() {
    if (!this.clientId) {
      alert('❌ Vous devez être connecté pour confirmer une commande.');
      this.router.navigate(['/login']);
      return;
    }

    if (this.paniers.length === 0 || this.paniers[0].produits.length === 0) {
      alert('❌ Votre panier est vide');
      return;
    }

    const adresseLivraison = {
      rue: '15 Avenue Habib Bourguiba',
      ville: 'Tunis',
      codePostal: '1000',
    };

    this.loading = true;

    this.panierService
      .confirmerCommande(this.clientId, adresseLivraison)
      .subscribe({
        next: (res) => {
          console.log('Commande confirmée:', res);
          this.loading = false;

          const commandeId = res.commande?.id || 'N/A';
          const total = this.getTotalWithTax();

          alert(
            `✅ Commande confirmée avec succès!\n\n` +
            `Numéro de commande: ${commandeId.substring(0, 8)}\n` +
            `Total: ${total.toFixed(2)} TND\n\n` +
            `Votre commande sera livrée sous peu.`
          );

          this.loadPanier(this.clientId!);
        },
        error: (err) => {
          console.error('Erreur confirmation:', err);
          this.loading = false;

          if (err.status === 400 && err.error.produits) {
            const produits = err.error.produits
              .map((p: any) => `• ${p.nom} (disponible: ${p.disponible})`)
              .join('\n');
            alert(
              `❌ Stock insuffisant:\n\n${produits}\n\n` +
              `Veuillez mettre à jour votre panier.`
            );
          } else if (
            err.status === 400 &&
            err.error.message === 'Le panier est vide'
          ) {
            alert('❌ Votre panier est vide.');
          } else if (err.error.message) {
            alert(`❌ ${err.error.message}`);
          } else {
            alert(
              '❌ Erreur lors de la confirmation de la commande. Veuillez réessayer.'
            );
          }
        },
      });
  }

  getTotalWithTax(): number {
    return this.paniers[0]?.total ? this.paniers[0].total * 1.19 : 0;
  }

  getTax(): number {
    return this.paniers[0]?.total ? this.paniers[0].total * 0.19 : 0;
  }
}
