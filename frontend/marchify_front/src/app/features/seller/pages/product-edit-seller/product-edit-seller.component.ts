import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product-service';
import { Product } from '../../../../core/models/product'; 

@Component({
  selector: 'app-product-edit-seller',
  imports: [ReactiveFormsModule],
  templateUrl: './product-edit-seller.component.html',
  styleUrl: './product-edit-seller.component.css',
})
export class ProductEditSellerComponent implements OnInit {
  productId!: string;
  productForm!: FormGroup;
  loading = true;

  isLoading = false;
  successMessage = '';
  product?: Product;

  // Image handling properties
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  currentImageUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadProduct();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      nom: ['', Validators.required],
      prix: [0, [Validators.required, Validators.min(0.01)]],
      categorie: ['', Validators.required],
      description: [''],
      quantite: [0, [Validators.required, Validators.min(0)]],
      unite: ['KILOGRAMME', Validators.required],
      livrable: [true],
      Ispinned: [false],
    });
  }

  loadProduct(): void {
    this.productService.getProductById(this.productId).subscribe({
      next: (data: any) => {
        this.product = data;
        this.productForm.patchValue(data);

        // Store current image URL
        if (data.image) {
          this.currentImageUrl = data.image;
        }

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement produit:', err);
        this.loading = false;
      },
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
    if (this.productForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';

    // Create FormData for multipart upload
    const formData = new FormData();

    // Append all form fields
    formData.append('nom', this.productForm.get('nom')?.value);
    formData.append('prix', this.productForm.get('prix')?.value.toString());
    formData.append('categorie', this.productForm.get('categorie')?.value);
    formData.append(
      'description',
      this.productForm.get('description')?.value || ''
    );
    formData.append(
      'quantite',
      this.productForm.get('quantite')?.value.toString()
    );
    formData.append('unite', this.productForm.get('unite')?.value);
    formData.append(
      'livrable',
      this.productForm.get('livrable')?.value.toString()
    );
    formData.append(
      'Ispinned',
      this.productForm.get('Ispinned')?.value.toString()
    );

    // Append new images if any
    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file) => {
        formData.append('imageFile', file);
      });
      console.log(`📤 Uploading ${this.selectedFiles.length} new image(s)`);
    } else {
      // Keep existing image
      if (this.currentImageUrl) {
        formData.append('existingImage', this.currentImageUrl);
      }
    }

    this.productService.updateProduct(this.productId, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Produit modifié avec succès ✅';

        setTimeout(() => {
          if (this.product?.boutiqueId) {
            this.router.navigate([
              '/seller/shop-products',
              this.product.boutiqueId,
            ]);
          } else {
            this.router.navigate(['/seller/shops']);
          }
        }, 1500);
      },
      error: (err: any) => {
        console.error('Erreur mise à jour produit:', err);
        this.isLoading = false;
        this.successMessage = '';
      },
    });
  }

  onCancel(): void {
    if (this.product?.boutiqueId) {
      this.router.navigate(['/seller/shop-list', this.product.boutiqueId]);
    } else {
      this.router.navigate(['/seller/shop-list']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ce champ est obligatoire';
    if (field.errors['min']) return 'La valeur doit être supérieure à 0';
    if (field.errors['minlength']) return 'Trop court';

    return 'Champ invalide';
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.productForm.controls).forEach((key) => {
      const control = this.productForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}