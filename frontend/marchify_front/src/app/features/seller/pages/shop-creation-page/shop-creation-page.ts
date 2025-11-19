import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShopCreateRequest } from '../../../../core/models/shop-create-request';
import { ShopService } from '../../../../core/services/shop-service';
import { LocationAdrs } from '../../../../core/services/location-adrs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-shop-creation-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shop-creation-page.html',
  styleUrl: './shop-creation-page.css',
})
export class ShopCreationPage implements OnInit {
  private shopService = inject(ShopService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private locationService = inject(LocationAdrs);
  private authService = inject(AuthService);

  shopForm: FormGroup;
  isLoading = false;
  isLoadingLocation = false;
  errorMessage = '';
  successMessage = '';

  // ✅ Changed to vendeurId
  currentVendeurId: string | null = null;

  popularCategories = [
    'Fruits & Légumes',
    'Viandes & Poissons',
    'Produits Laitiers',
    'Boissons',
    'Épicerie',
    'Boulangerie',
  ];

  constructor() {
    this.shopForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      marketName: [''],
      address: ['', [Validators.required, Validators.minLength(5)]],
      category: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\s]{8,}$/)]],
      description: [''],
    });
  }

  ngOnInit(): void {
    console.log('🚀 ShopCreationPage initialized');

    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'Vous devez être connecté pour créer une boutique.';
      console.error('❌ User not logged in');
      this.router.navigate(['/login']);
      return;
    }

    if (currentUser.role !== 'VENDEUR') {
      this.errorMessage = 'Seuls les vendeurs peuvent créer une boutique.';
      console.error('❌ User is not a vendor');
      this.router.navigate(['/login']);
      return;
    }

    // ✅ Get vendeurId from the user object (included in login response)
    this.currentVendeurId = this.authService.getVendeurId();

    if (!this.currentVendeurId) {
      this.errorMessage = 'ID vendeur non trouvé. Veuillez vous reconnecter.';
      console.error('❌ Vendeur ID not found in user object');
      return;
    }

    console.log('✅ Current vendeur ID:', this.currentVendeurId);
  }

  async onGetLocation(): Promise<void> {
    this.isLoadingLocation = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { address, lat, lon } = await this.locationService.getAddress();

      this.shopForm.patchValue({ address });

      console.log(`📍 Detected location: ${address} (${lat}, ${lon})`);
      this.successMessage = 'Localisation détectée avec succès !';

      setTimeout(() => (this.successMessage = ''), 3000);
    } catch (error) {
      console.error('❌ Erreur de géolocalisation:', error);
      this.errorMessage = 'Impossible de détecter la localisation.';
      setTimeout(() => (this.errorMessage = ''), 3000);
    } finally {
      this.isLoadingLocation = false;
    }
  }

  onSubmit(): void {
    if (!this.shopForm.valid) {
      this.markAllFieldsAsTouched();
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    if (!this.currentVendeurId) {
      this.errorMessage =
        'Impossible de créer la boutique : vendeur non identifié.';
      console.error('❌ Vendeur ID is missing');
      return;
    }

    this.createShop();
  }

  private createShop(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // ✅ Using vendeurId instead of userId
    const shopRequest: ShopCreateRequest = {
      nom: this.shopForm.get('name')?.value,
      adresse: this.shopForm.get('address')?.value,
      localisation: { lat: 36.8065, lng: 10.1815 }, // TODO: Use real location
      categorie: this.shopForm.get('category')?.value,
      telephone: `+216 ${this.shopForm.get('phone')?.value}`,
      vendeurId: this.currentVendeurId!, // ✅ Now using the correct vendeurId
    };

    console.log('🏪 Creating shop:', shopRequest);

    this.shopService.createShop(shopRequest).subscribe({
      next: (createdShop) => {
        this.isLoading = false;
        this.successMessage = 'Boutique créée avec succès !';
        console.log('✅ Created shop:', createdShop);

        // Redirect to shop list after 1.5 seconds
        setTimeout(() => {
          this.router.navigate(['/seller/shop-list']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error creating shop:', error);

        // Check for specific error messages
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Erreur lors de la création de la boutique.';
        }
      },
    });
  }

  onCancel(): void {
    console.log('❌ Shop creation cancelled');
    this.router.navigate(['/seller/shop-list']);
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
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `Minimum ${requiredLength} caractères requis`;
    }
    if (field.errors['pattern']) return 'Format invalide (ex: 98 123 456)';

    return 'Champ invalide';
  }
}
