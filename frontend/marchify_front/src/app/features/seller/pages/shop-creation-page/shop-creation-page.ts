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
  private actroute = inject(ActivatedRoute);
  private locationService = inject(LocationAdrs);

  shopForm: FormGroup;
  isLoading = false;
  isLoadingLocation = false;
  errorMessage = '';
  successMessage = '';

  // Popular categories for suggestions
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
      marketName: [''],
      address: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      category: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\s]{8,}$/)]],
    });
  }

  ngOnInit(): void {
    console.log('ShopCreationPageComponent initialized');
  }

  async onGetLocation(): Promise<void> {
    this.isLoadingLocation = true;
    try {
      const { address, lat, lon } = await this.locationService.getAddress();

      this.shopForm.patchValue({ address });

      // store coordinates if needed
      console.log(`Detected location: ${address} (${lat}, ${lon})`);

      this.successMessage = 'Localisation détectée avec succès !';
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      this.errorMessage =
        'Impossible de détecter la localisation. Veuillez entrer manuellement.';
    } finally {
      this.isLoadingLocation = false;
    }
  }

  onSubmit(): void {
    if (this.shopForm.valid) {
      this.createShop();
    } else {
      this.markAllFieldsAsTouched();
    }
  }


  private createShop(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Get current vendeur ID (in real app, from auth service)
    const currentVendeurId = 'vd1'; // Example vendeur ID

    // Prepare the shop creation request
    const shopRequest: ShopCreateRequest = {
      nom: this.shopForm.get('name')?.value,
      adresse: this.shopForm.get('address')?.value,
      localisation: { lat: 36.8065, lng: 10.1815 }, // Default Tunis coordinates
      categorie: this.shopForm.get('category')?.value,
      telephone: `+216 ${this.shopForm.get('phone')?.value}`,
      vendeurId: currentVendeurId,
    };

    console.log('Creating shop with data:', shopRequest);

    // Use the ShopService to create the shop
    this.shopService.createShop(shopRequest).subscribe({
      next: (createdShop) => {
        this.isLoading = false;
        this.successMessage = 'Boutique créée avec succès!';
        console.log('Shop created successfully:', createdShop);

        // Redirect to seller dashboard after success
        setTimeout(() => {
          this.router.navigate(['/seller/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          'Erreur lors de la création de la boutique. Veuillez réessayer.';
        console.error('Shop creation error:', error);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/seller/dashboard']);
  }

  // -----------------------
  // helper methods
  // -----------------------
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

    if (!field || !field.errors) return 'Invalid field';

    if (field.errors['required']) return 'Ce champ est obligatoire';
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `Doit contenir au moins ${requiredLength} caractères`;
    }
    if (field.errors['pattern'] && fieldName === 'phone')
      return 'Numéro de téléphone invalide';

    return 'Champ invalide';
  }
}
