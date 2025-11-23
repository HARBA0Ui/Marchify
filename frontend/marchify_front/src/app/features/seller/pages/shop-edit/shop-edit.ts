import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopService } from '../../../../core/services/shop-service';
import { Shop } from '../../../../core/models/shop';


@Component({
  selector: 'app-shop-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './shop-edit.html',
  styleUrl: './shop-edit.css',
})
export class ShopEdit implements OnInit {
  private fb = inject(FormBuilder);
  private shopService = inject(ShopService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  shopForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  shopId: string | null = null;

  categories = [
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

  ngOnInit() {
    this.shopId = this.route.snapshot.paramMap.get('id');
    if (!this.shopId) {
      this.errorMessage = 'ID de la boutique manquant.';
      return;
    }

    this.shopForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      adresse: ['', [Validators.required, Validators.minLength(5)]],
      categorie: ['', Validators.required],
      telephone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9\s]{8,}$/)],
      ],
      localisation: this.fb.group({
        lat: [null],
        lng: [null],
      }),
    });

    this.isLoading = true;
    this.shopService.getShopById(this.shopId).subscribe({
      next: (shop: Shop) => {
        this.shopForm.patchValue({
          nom: shop.nom,
          adresse: shop.adresse,
          categorie: shop.categorie,
          telephone: shop.telephone.replace('+216 ', ''),
          localisation: shop.localisation || { lat: null, lng: null },
        });
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage =
          'Impossible de récupérer les informations de la boutique.';
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.shopForm.invalid || !this.shopId) {
      this.markAllFieldsAsTouched();
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare the new shop data (ensure téléphone has country code)
    const formValue = this.shopForm.value;
    formValue.telephone = `+216 ${formValue.telephone}`;

    this.shopService.updateShop(this.shopId, formValue).subscribe({
      next: (updatedShop) => {
        this.isLoading = false;
        this.successMessage = 'Boutique modifiée avec succès !';
        setTimeout(() => {
          this.router.navigate(['/seller/shop-list']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la modification de la boutique.';
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/seller/shop-list']);
  }

  markAllFieldsAsTouched() {
    Object.values(this.shopForm.controls).forEach((control) =>
      control.markAsTouched()
    );
  }

  isFieldInvalid(field: string): boolean {
    const control = this.shopForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  getFieldError(fieldName: string): string {
    const field = this.shopForm.get(fieldName);
    if (!field || !field.errors) return '';
    if (field.errors['required']) return 'Ce champ est obligatoire';
    if (field.errors['minlength'])
      return `Minimum ${field.errors['minlength'].requiredLength} caractères requis`;
    if (field.errors['pattern']) return 'Format invalide';
    return 'Champ invalide';
  }
}
