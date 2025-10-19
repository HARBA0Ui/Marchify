import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UniteMesure } from '../../../../core/models/unite-mesure';
import { ProductService } from '../../../../core/services/product-service';
import { ShopService } from '../../../../core/services/shop-service';
import { ProductCreateRequest } from '../../../../core/models/product-create-request';

@Component({
  selector: 'app-product-add-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-add-page.html',
  styleUrl: './product-add-page.css',
})
export class ProductAddPage implements OnInit {
  private productService = inject(ProductService);
  private shopService = inject(ShopService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  productForm: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  showImageWarning: boolean = false;
  userShops: any[] = [];
  
  // Loading and error states
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Use enum directly
  UniteMesure = UniteMesure;

  // Popular categories
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
    'Autre'
  ];

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      unit: ['', Validators.required],
      category: ['', Validators.required],
      description: [''],
      quantity: ['', [Validators.required, Validators.min(0)]],
      livrable: [true, Validators.required] // Add this line - default to true
    });
  }

  ngOnInit(): void {
    console.log('ProductAddPageComponent initialized');
    this.loadUserShops();
    this.initializeFormData();
    
    // Watch for unit changes to show/hide custom unit field
    this.productForm.get('unit')?.valueChanges.subscribe(unit => {
      this.toggleCustomUnitField(unit);
    });
  }

  private loadUserShops(): void {
    // Get current vendeur ID (in real app, from auth service)
    const currentVendeurId = 'vd1'; // Example vendeur ID
    
    this.shopService.getShopsByVendeurId(currentVendeurId).subscribe({
      next: (shops) => {
        this.userShops = shops;
        console.log('User shops loaded:', this.userShops);
      },
      error: (error) => {
        console.error('Error loading shops:', error);
        this.errorMessage = 'Erreur lors du chargement des boutiques';
      }
    });
  }

  private toggleCustomUnitField(unit: UniteMesure): void {
    const customUnitField = this.productForm.get('unitePersonnalisee');
    if (unit === UniteMesure.AUTRE) {
      customUnitField?.setValidators([Validators.required, Validators.minLength(1)]);
    } else {
      customUnitField?.clearValidators();
      customUnitField?.setValue('');
    }
    customUnitField?.updateValueAndValidity();
  }

  private initializeFormData(): void {
    // Initialize any default form values here
    this.productForm.patchValue({
      unit: UniteMesure.KILOGRAMME, // Default unit
      quantity: 1, // Default quantity
      price: 0.0, // Default price
      livrable: true // Default livrable to true
    });
  }

  onFileChange(event: any): void {
    this.selectedFiles = [];
    this.previewUrls = [];

    if (event.target.files?.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
      this.createImagePreviews();
    }
  }

  private createImagePreviews(): void {
    this.selectedFiles.forEach((file) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Veuillez sélectionner des images valides';
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Les images ne doivent pas dépasser 5MB';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrls.push(e.target.result);
        this.showImageWarning = false;
        this.errorMessage = '';
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.previewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.createProduct();
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  onAddWithoutImage(): void {
    if (this.productForm.valid) {
      this.createProduct(true);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private createProduct(skipImage: boolean = false): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Handle image - convert base64 to file path or use default
    const imageUrl = !skipImage && this.previewUrls.length > 0 
      ? `product-${Date.now()}.jpg` // In real app, you'd upload and get URL
      : 'default-product.jpg';

    const productRequest: ProductCreateRequest = {
      nom: this.productForm.get('name')?.value,
      prix: parseFloat(this.productForm.get('price')?.value),
      categorie: this.productForm.get('category')?.value,
      description: this.productForm.get('description')?.value || '',
      image: imageUrl,
      quantite: parseInt(this.productForm.get('quantity')?.value),
      unite: this.productForm.get('unit')?.value,
      livrable: true,
      boutiqueId: this.productForm.get('shopId')?.value
    };

    console.log('Creating product with data:', productRequest);

    // Use the ProductService to create the product
    this.productService.createProduct(productRequest).subscribe({
      next: (createdProduct) => {
        this.isLoading = false;
        this.successMessage = 'Produit ajouté avec succès!';
        console.log('Product created successfully:', createdProduct);
        
        // Redirect after success
        setTimeout(() => {
          this.router.navigate(['/seller/products']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de l\'ajout du produit. Veuillez réessayer.';
        console.error('Product creation error:', error);
      }
    });

    if (skipImage) {
      this.showImageWarning = true;
    }
  }

  onCancel(): void {
    this.router.navigate(['/seller/dashboard']);
  }

  // -----------------------
  // helper methods
  // -----------------------
  private markAllFieldsAsTouched(): void {
    Object.keys(this.productForm.controls).forEach((key) => {
      const control = this.productForm.get(key);
      if (control) control.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);

    if (!field || !field.errors) return 'Invalid field';

    if (field.errors['required']) return 'Ce champ est obligatoire';
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `Doit contenir au moins ${requiredLength} caractères`;
    }
    if (field.errors['min'] && fieldName === 'price')
      return 'Le prix doit être supérieur à 0';
    if (field.errors['min'] && fieldName === 'quantity')
      return 'La quantité ne peut pas être négative';

    return 'Champ invalide';
  }

  // Helper to check if custom unit field should be shown
  shouldShowCustomUnitField(): boolean {
    return this.productForm.get('unit')?.value === UniteMesure.AUTRE;
  }

  // Helper to get unit display label
  getUnitLabel(unit: UniteMesure): string {
    const unitLabels = {
      [UniteMesure.GRAMME]: 'Gramme (g)',
      [UniteMesure.KILOGRAMME]: 'Kilogramme (kg)',
      [UniteMesure.LITRE]: 'Litre (l)',
      [UniteMesure.MILLILITRE]: 'Millilitre (ml)',
      [UniteMesure.PIECE]: 'Pièce',
      [UniteMesure.BOITE]: 'Boîte',
      [UniteMesure.SAC]: 'Sac',
      [UniteMesure.CARTON]: 'Carton',
      [UniteMesure.METRE]: 'Mètre (m)',
      [UniteMesure.CENTIMETRE]: 'Centimètre (cm)',
      [UniteMesure.AUTRE]: 'Autre'
    };
    return unitLabels[unit] || unit;
  }
}

