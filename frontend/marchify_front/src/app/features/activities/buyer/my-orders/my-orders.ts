import { Component, inject, OnInit } from '@angular/core';
import { Commande } from '../../../../core/models/commande';
import { CommandeService } from '../../../../core/services/commande-service';
import { CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { ShopService } from '../../../../core/services/shop-service';
import { Shop } from '../../../../core/models/shop';
import { Product } from '../../../../core/models/product';
import { ProductService } from '../../../../core/services/product-service';
import { PricePipe } from '../../../../price-pipe';

@Component({
  selector: 'app-my-orders',
  imports: [DatePipe,PricePipe],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
})
export class MyOrders implements OnInit {

  commandes: Commande[]=[];
  clientId='691259fb5e08abebfcab33f7'
  produits: Product[] = [];
  shops:Shop[]=[]

  expandedRowId: string | null = null;
  private commandeService: CommandeService=inject(CommandeService)
  private shopService: ShopService=inject(ShopService)
  private productService = inject(ProductService);
  



getProductName(produitId: string): string {
  const produit = this.produits.find(p => p.id === produitId);
  return produit ? produit.nom : 'Produit inconnu';
}


getProductPrice(produitId: string): number {
  const produit = this.produits.find(p => p.id === produitId);
  return produit ? produit.prix : 0;
}


toggleProducts(cmdId: string): void {
  this.expandedRowId = this.expandedRowId === cmdId ? null : cmdId;
}
ngOnInit(): void {
  this.commandeService.getCommandesByAcheteur(this.clientId)
    .subscribe({
      next: (res) => {
        this.commandes = res.commandes;
        const productIds = Array.from(new Set(
          this.commandes.flatMap(cmd => cmd.produits.map(p => p.produitId))
        ));

        // Fetch products by IDs
        this.productService.getProductsByIds(productIds).subscribe(products => {
          this.produits = products;  
        });

        // Fetch shops
        this.shopService.getAllShops().subscribe(shops => {
          this.shops = shops;
        });
      },
      error: (err) => console.error('Error fetching orders:', err)
    });
}


getBoutiqueName(boutiqueId: string): string {
  const shop = this.shops.find(s => s.id === boutiqueId);
  return shop ? shop.nom : 'Boutique inconnue';
}


getStatusClass(status: string): string {
  switch (status) {
    case 'PENDING':       return 'bg-yellow-100 text-yellow-800';
    case 'PROCESSING':    return 'bg-orange-100 text-orange-800';
    case 'READY':         return 'bg-blue-100 text-blue-800';
    case 'SHIPPED':       return 'bg-indigo-100 text-indigo-800';
    case 'DELIVERED':     return 'bg-green-100 text-green-800';
    case 'CANCELLED':     return 'bg-gray-100 text-gray-800 line-through';
    case 'RETURNED':      return 'bg-red-100 text-red-800';
    default:              return 'bg-gray-100 text-gray-600';
  }
}

getStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':       return 'En attente';
    case 'PROCESSING':    return 'En cours';
    case 'READY':         return 'Prête';
    case 'SHIPPED':       return 'Expédiée';
    case 'DELIVERED':     return 'Livrée';
    case 'CANCELLED':     return 'Annulée';
    case 'RETURNED':      return 'Retournée';
    default:              return status;
  }
}
}
