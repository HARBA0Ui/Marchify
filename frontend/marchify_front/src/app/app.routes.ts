import { Routes } from '@angular/router';
import { ShopCreationPage } from './features/seller/pages/shop-creation-page/shop-creation-page';
import { ProductAddPage } from './features/seller/pages/product-add-page/product-add-page';
import { ShopsList } from './layouts/shops-list/shops-list';
import { Shop } from './layouts/shop/shop';
import { PanierList } from './layouts/panier-list/panier-list';
import { ProductList } from './layouts/product-list/product-list';
import { CommandeListVendor } from './features/vender/pages/commande-list-vendor/commande-list-vendor';
import { MissionList } from './features/delivery/pages/mission-list/mission-list';
<<<<<<< HEAD
import { UploadPredict } from './features/ai-search/upload-predict/upload-predict';
import { PredictResults } from './features/ai-search/predict-results/predict-results';
=======
<<<<<<< HEAD
import { AuthComponent } from './features/auth/auth.component';
import { ShopsListSellerComponent } from './features/seller/pages/shops-list-seller/shops-list-seller.component';
import { ShopProductsSellerComponent } from './features/seller/pages/shop-products-seller/shop-products-seller.component';
import { ProductEditSellerComponent } from './features/seller/pages/product-edit-seller/product-edit-seller.component';

export const routes: Routes = [
  //3ami el vendeur 
  {path: 'seller/shop-creation',title: 'Shop Creation',component: ShopCreationPage,},
  {path: 'seller/product-add',title: 'add product',component: ProductAddPage,},
  { path: 'seller/product-add/:shopId', title: 'Ajouter un produit', component: ProductAddPage },
  { path: 'seller/shops', title: 'Mes Boutiques', component: ShopsListSellerComponent },
  { path: 'seller/shop-products/:id', title: 'Produits de la Boutique', component: ShopProductsSellerComponent },
  { path: 'seller/product-edit/:id', title: 'Modifier Produit', component: ProductEditSellerComponent },

=======
import { MapComponent } from './map/map';
>>>>>>> 92b29753a0da1a57e47e0dfbc5dfa925306739de

export const routes: Routes = [
  {
    path: 'seller/shop-creation',
    title: 'Shop Creation',
    component: ShopCreationPage,
  },
  {
    path: 'seller/product-add',
    title: 'add product',
    component: ProductAddPage,
  },
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
  {
    path: 'shop-list',
    title: 'Shops List',
    component: ShopsList,
  },
  {
    path: 'shop/:id',
    title: 'Shop Details',
    component: Shop,
  },
  {
    path: 'panier-list',
    title: 'panier list',
    component: PanierList,
  },
  {
    path: 'product-list',
    title: 'Product List',
    component: ProductList,
<<<<<<< HEAD
  },
  {
    path: 'commande-list-vendor',
    title: 'Commande List Vendor',
    component: CommandeListVendor,
  },
  {
    path: 'delivery/missions',
    title: 'Delivery Missions',
    component: MissionList,
  },
  {
    path: 'ai-search/upload-predict',
    title: 'AI Search - Upload & Predict',
    component: UploadPredict,
  },
  {
    path: 'predict-results',
    title: 'Prediction Results',
    component: PredictResults,
=======
  }, {
<<<<<<< HEAD
    path:"commande-list-vendor",
    title:"Commande List Vendor",
=======
    path: "commande-list-vendor",
    title: "Commande List Vendor",
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
    component: CommandeListVendor
  }, {
    path: 'delivery/missions',
    title: 'Delivery Missions',
    component: MissionList,
<<<<<<< HEAD
  },{
    path:'login',title:'login' ,component:AuthComponent
>>>>>>> 92b29753a0da1a57e47e0dfbc5dfa925306739de
  }

=======
  },
  {
    path: 'delivery/map',
    title: 'Delivery Map',
    component: MapComponent,
  }
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
];

