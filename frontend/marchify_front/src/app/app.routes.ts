import { Routes } from '@angular/router';
import { ShopCreationPage } from './features/seller/pages/shop-creation-page/shop-creation-page';
import { ProductAddPage } from './features/seller/pages/product-add-page/product-add-page';
import { ShopsList } from './layouts/shops-list/shops-list';

export const routes: Routes = [
    {
        path: 'seller/shop-creation',
        title: 'Shop Creation',
        component: ShopCreationPage
    },
    {
        path: 'seller/product-add',
        title: 'add product',
        component: ProductAddPage
    },
    {
        path: 'shop-list',
        title: 'Shops List',
        component: ShopsList
    }
    

    
];

