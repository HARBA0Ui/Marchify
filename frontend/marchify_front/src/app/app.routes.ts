import { Routes } from '@angular/router';
import { ShopCreationPage } from './features/seller/pages/shop-creation-page/shop-creation-page';
import { ProductAddPage } from './features/seller/pages/product-add-page/product-add-page';
import { ShopsList } from './layouts/shops-list/shops-list';
import { Shop } from './layouts/shop/shop';
import { PanierList } from './layouts/panier-list/panier-list';
import { ProductList } from './layouts/product-list/product-list';
import { CommandeListVendor } from './features/vender/pages/commande-list-vendor/commande-list-vendor';
import { MissionList } from './features/delivery/pages/mission-list/mission-list';
import { ConfirmerLivraison } from './features/delivery/pages/confirmer-livraison/confirmer-livraison';
import { UploadPredict } from './features/ai-search/upload-predict/upload-predict';
import { PredictResults } from './features/ai-search/predict-results/predict-results';
import { MapComponent } from './map/map';
import { AuthComponent } from './features/auth/auth.component';
import { ProductEditSellerComponent } from './features/seller/pages/product-edit-seller/product-edit-seller.component';
import { RegisterComponent } from './features/register-component/register-component';
import { NotificationsList } from './layouts/notifications-list/notifications-list';

export const routes: Routes = [
  {
    path: 'seller/shop-creation',
    title: 'Shop Creation',
    component: ShopCreationPage,
  },
  {
    path: 'edit/:id',
    title: 'edit product',
    component: ProductEditSellerComponent,
  },
  {
    path: 'seller/product-add',
    title: 'add product',
    component: ProductAddPage,
  },
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
    path: 'bondelivraison',
    title: 'bondelivraison List',
    component: ConfirmerLivraison,
  },
  {
    path: 'login',
    title: 'login',
    component: AuthComponent,
  },
  {
    path: 'register',
    title: 'Inscription',
    component: RegisterComponent,
  },
  {
    path: 'delivery/map',
    title: 'Delivery Map',
    component: MapComponent,
  },
  {
    path: 'notifications',
    title: 'Notifications',
    component: NotificationsList,
  },
  {
    path: '*',
    redirectTo: 'product-list',
  },
];

