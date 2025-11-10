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
  showImageWarning = false;
  userShops: any[] = [];

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  UniteMesure = UniteMesure;

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
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      unit: ['', Validators.required],
      category: ['', Validators.required],
      description: [''],
      quantity: ['', [Validators.required, Validators.min(0)]],
      livrable: [true, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUserShops();
    this.initializeFormData();
    this.productForm
      .get('unit')
      ?.valueChanges.subscribe((unit) => this.toggleCustomUnitField(unit));
  }

  private loadUserShops(): void {
    const currentVendeurId = '68f743532df2f750af13a589';
    // replace with real auth ID
    this.shopService.getShopsByVendeurId(currentVendeurId).subscribe({
      next: (shops) => (this.userShops = shops),
      error: () =>
        (this.errorMessage = 'Erreur lors du chargement des boutiques'),
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
      if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024)
        return;
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrls.push(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  onSubmit(): void {
    if (this.productForm.valid) this.createProduct();
    else this.markAllFieldsAsTouched();
  }

  private createProduct(skipImage = false): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const imageUrl =
      !skipImage && this.previewUrls.length > 0
        ? `product-${Date.now()}.jpg` // later: integrate real upload
        : 'default-product.jpg';

    const productRequest: ProductCreateRequest = {
      nom: this.productForm.get('name')?.value,
      prix: parseFloat(this.productForm.get('price')?.value),
      categorie: this.productForm.get('category')?.value,
      description: this.productForm.get('description')?.value || '',
      image: imageUrl,
      quantite: parseInt(this.productForm.get('quantity')?.value),
      unite: this.productForm.get('unit')?.value,
      livrable: this.productForm.get('livrable')?.value,
      boutiqueId: '6910e1f5ae7a23b03295a328',

    };

    this.productService.createProduct(productRequest).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Produit ajouté avec succès!';
        setTimeout(() => this.router.navigate(['/seller/products']), 1500);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage =
          "Erreur lors de l'ajout du produit. Veuillez réessayer.";
      },
    });

    if (skipImage) this.showImageWarning = true;
  }

  onCancel(): void {
    this.router.navigate(['/seller/dashboard']);
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

