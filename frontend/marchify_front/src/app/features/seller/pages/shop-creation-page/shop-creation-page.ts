import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopCreateRequest } from '../../../../core/models/shop-create-request';
import { HttpClient } from '@angular/common/http';
import { ShopService } from '../../../../core/services/shop-service';
import { LocationAdrs } from '../../../../core/services/location-adrs';



@Component({
  selector: 'app-shop-creation-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shop-creation-page.html',
  styleUrl: './shop-creation-page.css',
})
export class ShopCreationPage implements OnInit {
  private shopService = inject(ShopService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private locationService = inject(LocationAdrs);

  shopForm: FormGroup;
  isLoading = false;
  isLoadingLocation = false;
  errorMessage = '';
  successMessage = '';

  popularCategories = [
    'Fruits & Légumes',
    'Viandes & Poissons',
    'Produits Laitiers',
    'Boissons',
    'Épicerie',
    'Boulangerie',
    'Électronique',
    'Vêtements',
    'Maison & Jardin',
    'Santé & Beauté',
    'Autre',
  ];

  constructor() {
   this.shopForm = this.fb.group({
     name: ['', [Validators.required, Validators.minLength(2)]],
<<<<<<< HEAD
     marketName: [''], 
=======
     marketName: [''], // <-- Ajouté pour résoudre l'erreur
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
     address: ['', [Validators.required, Validators.minLength(5)]],
     category: ['', Validators.required],
     phone: ['', [Validators.required, Validators.pattern(/^[0-9\s]{8,}$/)]],
     description: [''],
   });

  }

  ngOnInit(): void {
    console.log('ShopCreationPage initialized');
  }

  async onGetLocation(): Promise<void> {
    this.isLoadingLocation = true;
    try {
      const { address, lat, lon } = await this.locationService.getAddress();
      this.shopForm.patchValue({ address });
      console.log(`Detected location: ${address} (${lat}, ${lon})`);
      this.successMessage = 'Localisation détectée avec succès !';
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      this.errorMessage = 'Impossible de détecter la localisation.';
    } finally {
      this.isLoadingLocation = false;
    }
  }

  onSubmit(): void {
    if (!this.shopForm.valid) {
      this.markAllFieldsAsTouched();
      return;
    }
    this.createShop();
  }

  private createShop(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

<<<<<<< HEAD
    const currentVendeurId = '68f743532df2f750af13a589'; 
=======
    const currentVendeurId = '68f743532df2f750af13a589'; // TODO: replace by real vendeur ID (auth later)
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21

    const shopRequest: ShopCreateRequest = {
      nom: this.shopForm.get('name')?.value,
      adresse: this.shopForm.get('address')?.value,
      localisation: { lat: 36.8065, lng: 10.1815 },
      categorie: this.shopForm.get('category')?.value,
      telephone: `+216 ${this.shopForm.get('phone')?.value}`,
      vendeurId: currentVendeurId,
    };

    console.log('Creating shop:', shopRequest);

    this.shopService.createShop(shopRequest).subscribe({
      next: (createdShop) => {
        this.isLoading = false;
        this.successMessage = 'Boutique créée avec succès!';
        console.log('Created shop:', createdShop);

        setTimeout(() => this.router.navigate(['/seller/dashboard']), 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la création.';
        console.error(error);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/seller/dashboard']);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.shopForm.controls).forEach((key) => {
      const control = this.shopForm.get(key);
      if (control) control.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.shopForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.shopForm.get(fieldName);
    if (!field || !field.errors) return '';
    if (field.errors['required']) return 'Ce champ est obligatoire';
    if (field.errors['minlength']) return 'Trop court';
    if (field.errors['pattern']) return 'Format invalide';
    return 'Champ invalide';
  }
}
