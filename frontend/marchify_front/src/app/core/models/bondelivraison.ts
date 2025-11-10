import { Commande } from "./commande"

export interface BonDeLivraison {
    id:string
    dateCreation:Date
    commandeId:string
    status:DeliveryStatus
    livreurId:string
    commande:{
        id:string
        client:
        {
          nom:string
          prenom:string
          telephone:string
        }
        boutique:{
          nom:string
          telephone:string
        }
        produits:Array<{
          quantite:number
          prixTotal:number
          produit:{
            nom:string
            prix:number
          }
        }> 
    }
    livreur:{
      user:{
        nom:string  
        prenom:string
      }
    }
}

export enum DeliveryStatus {
  PENDING_PICKUP = 'PENDING_PICKUP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED'
}