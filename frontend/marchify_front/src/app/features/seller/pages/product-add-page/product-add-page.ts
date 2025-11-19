import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UniteMesure } from '../../../../core/models/unite-mesure';
import { ProductService } from '../../../../core/services/product-service';
import { ShopService } from '../../../../core/services/shop-service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-product-add-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-add-page.html',
  styleUrl: './product-add-page.css',
})
export class ProductAddPage implements OnInit {
  private productService = inject(ProductService);
  private shopService = inject(ShopService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  productForm: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  showImageWarning = false;
  userShops: any[] = [];

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  shopId: string | null = null;
  vendeurId: string | null = null;

  UniteMesure = UniteMesure;

  popularCategories = [
    'Fruits & Légumes',
    'Viandes & Poissons',
    'Produits Laitiers',
    'Boissons',
    'Épicerie',
    'Boulangerie',
  ];

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      unit: ['', Validators.required],
      category: ['', Validators.required],
      description: [''],
      quantity: ['', [Validators.required, Validators.min(0)]],
      livrable: [true, Validators.required],
      shopId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || currentUser.role !== 'VENDEUR') {
      this.errorMessage = 'Vous devez être connecté en tant que vendeur';
      this.router.navigate(['/login']);
      return;
    }

    this.vendeurId = this.authService.getVendeurId();

    if (!this.vendeurId) {
      this.errorMessage = 'ID vendeur non trouvé. Veuillez vous reconnecter.';
      return;
    }

    this.route.queryParams.subscribe((params) => {
      if (params['shopId']) {
        this.shopId = params['shopId'];
        this.productForm.patchValue({ shopId: this.shopId });
      }
    });

    this.loadUserShops();
    this.initializeFormData();

    this.productForm
      .get('unit')
      ?.valueChanges.subscribe((unit) => this.toggleCustomUnitField(unit));
  }

  private loadUserShops(): void {
    if (!this.vendeurId) {
      this.errorMessage = 'ID vendeur non disponible';
      return;
    }

    this.shopService.getShopsByVendeurId(this.vendeurId).subscribe({
      next: (shops) => {
        this.userShops = shops;

        if (shops.length === 1 && !this.shopId) {
          this.shopId = shops[0].id;
          this.productForm.patchValue({ shopId: this.shopId });
        }
      },
      error: (err) => {
        console.error('❌ Error loading shops:', err);
        this.errorMessage = 'Erreur lors du chargement des boutiques';
      },
    });
  }

  private toggleCustomUnitField(unit: UniteMesure): void {
    const customUnitField = this.productForm.get('unitePersonnalisee');
    if (unit === UniteMesure.AUTRE) {
      customUnitField?.setValidators([
        Validators.required,
        Validators.minLength(1),
      ]);
    } else {
      customUnitField?.clearValidators();
      customUnitField?.setValue('');
    }
    customUnitField?.updateValueAndValidity();
  }

  private initializeFormData(): void {
    this.productForm.patchValue({
      unit: UniteMesure.KILOGRAMME,
      quantity: 1,
      price: 0.0,
      livrable: true,
    });
  }

  onFileChange(event: any): void {
    this.selectedFiles = Array.from(event.target.files || []);
    this.previewUrls = [];

    this.selectedFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        console.warn('⚠️ Invalid file type:', file.type);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        console.warn('⚠️ File too large:', file.size);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrls.push(e.target.result);
      reader.readAsDataURL(file);
    });

    console.log(`📸 ${this.selectedFiles.length} image(s) selected`);
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
    console.log('🗑️ Image removed');
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.createProduct();
    } else {
      this.markAllFieldsAsTouched();
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
    }
  }

  // ✅ Updated to send FormData with images
  private createProduct(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const selectedShopId = this.productForm.get('shopId')?.value;

    if (!selectedShopId) {
      this.isLoading = false;
      this.errorMessage = 'Veuillez sélectionner une boutique';
      return;
    }

    // ✅ Create FormData to send files to backend
    const formData = new FormData();

    // Add all form fields
    formData.append('nom', this.productForm.get('name')?.value);
    formData.append('prix', this.productForm.get('price')?.value.toString());
    formData.append('categorie', this.productForm.get('category')?.value);
    formData.append(
      'description',
      this.productForm.get('description')?.value || ''
    );
    formData.append(
      'quantite',
      this.productForm.get('quantity')?.value.toString()
    );
    formData.append('unite', this.productForm.get('unit')?.value);
    formData.append(
      'livrable',
      this.productForm.get('livrable')?.value.toString()
    );
    formData.append('boutiqueId', selectedShopId);

    // ✅ Add image files (backend expects 'imageFile')
    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file) => {
        formData.append('imageFile', file);
      });
      console.log(
        `📤 Uploading ${this.selectedFiles.length} image(s) to Cloudinary via backend`
      );
    } else {
      console.log('ℹ️ No images selected, backend will use default image');
    }

    console.log('📦 Creating product with FormData');

    // ✅ Send FormData to backend (backend handles Cloudinary upload)
    this.productService.createProduct(formData).subscribe({
      next: (createdProduct) => {
        this.isLoading = false;
        this.successMessage = 'Produit ajouté avec succès!';
        console.log('✅ Product created:', createdProduct);

        setTimeout(() => {
          this.router.navigate(['/seller/shop-product-seller', selectedShopId]);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Error creating product:', err);
        this.errorMessage =
          err.error?.message ||
          "Erreur lors de l'ajout du produit. Veuillez réessayer.";
      },
    });
  }

  onCancel(): void {
    if (this.shopId) {
      this.router.navigate(['/seller/shop-product-seller', this.shopId]);
    } else {
      this.router.navigate(['/seller/shop-list']);
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.values(this.productForm.controls).forEach((control) =>
      control.markAsTouched()
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field || !field.errors) return 'Champ invalide';
    if (field.errors['required']) return 'Ce champ est obligatoire';
    if (field.errors['minlength'])
      return `Doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
    if (field.errors['min'] && fieldName === 'price')
      return 'Le prix doit être supérieur à 0';
    if (field.errors['min'] && fieldName === 'quantity')
      return 'La quantité ne peut pas être négative';
    return 'Champ invalide';
  }

  shouldShowCustomUnitField(): boolean {
    return this.productForm.get('unit')?.value === UniteMesure.AUTRE;
  }

  getUnitLabel(unit: UniteMesure): string {
    const labels: Record<UniteMesure, string> = {
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
      [UniteMesure.AUTRE]: 'Autre',
    };
    return labels[unit] || unit;
  }
}
