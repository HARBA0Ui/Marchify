import { Routes } from '@angular/router';
import { ShopCreationPage } from './features/seller/pages/shop-creation-page/shop-creation-page';
import { ProductAddPage } from './features/seller/pages/product-add-page/product-add-page';
import { ShopsList } from './layouts/shops-list/shops-list';
import { Shop } from './layouts/shop/shop';
import { PanierList } from './layouts/panier-list/panier-list';
import { ProductList } from './layouts/product-list/product-list';
import { Component } from '@angular/core';
import { CommandeListVendor } from './features/vender/pages/commande-list-vendor/commande-list-vendor';

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
  }, {
    path:"commande-list-vendor",
    title:"Commande List Vendor",
    component: CommandeListVendor
  },
];

