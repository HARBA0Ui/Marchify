import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';

interface Produit {
  id: string;
  nom: string;
  description?: string;
  prix?: number;
  image?: string;
  boutiqueId?: string;
  unite?: string;
}

@Component({
  selector: 'app-detail-produit',
  standalone: true,
  templateUrl: './detail-produit.component.html',
  styleUrl: './detail-produit.component.css',
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe
  ]
})
export class DetailProduitComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reviewService = inject(ReviewService);
  private http = inject(HttpClient);
  public router = inject(Router); // ✅ Changed to public so template can access
  private authService = inject(AuthService);

  produit: Produit = { id: '', nom: '', description: '', prix: 0 };
  reviews: Review[] = [];
  newRating: number = 0;
  newComment: string = '';
  userName = '';
  userId: string | null = null;

  // ✅ Add computed property for authentication status
  get isAuthenticated(): boolean {
    return this.userId !== null;
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.id) {
      this.userId = currentUser.id;
      this.userName = (currentUser.nom ? currentUser.nom : '') + 
                     (currentUser.prenom ? ' ' + currentUser.prenom : '');
    }

    const produitId = this.route.snapshot.paramMap.get('id');
    if (produitId) {
      this.loadProduit(produitId);
      this.loadReviews(produitId);
    }
  }

  loadProduit(id: string) {
    this.http.get<Produit>(`http://localhost:3000/api/produits/${id}`)
      .subscribe({
        next: res => this.produit = res,
        error: err => console.error('Erreur chargement produit', err)
      });
  }

  loadReviews(produitId: string) {
    this.reviewService.getProductReviews(produitId)
      .subscribe({
        next: res => {
          this.reviews = (res || []).map(r => ({
            ...r,
            auteur: r.auteur || { id: '', nom: 'Anonyme', prenom: '' }
          }));
        },
        error: err => console.error('Erreur chargement avis', err)
      });
  }

  setRating(value: number) {
    this.newRating = value;
  }

  isCommentValid(): boolean {
    return this.newComment.trim().length >= 6;
  }

  submitReview() {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.newRating) {
      return alert('Veuillez donner une note');
    }

    if (!this.isCommentValid()) {
      return alert('Le commentaire doit contenir au moins 6 caractères.');
    }

    const payload = {
      type: 'PRODUIT',
      produitId: this.produit.id,
      rating: this.newRating,
      comment: this.newComment.trim(),
      authorName: this.userName,
      userId: currentUser.id
    };

    this.reviewService.addReview(payload).subscribe({
      next: () => {
        alert('Avis ajouté !');
        this.newRating = 0;
        this.newComment = '';
        this.loadReviews(this.produit.id);
      },
      error: (err: any) => {
        console.error('Erreur lors de l\'ajout', err);
        alert('Erreur lors de l\'ajout');
      }
    });
  }

  trackByReviewId(index: number, review: Review) {
    return review.id;
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((a, b) => a + b.rating, 0);
    return Math.round(sum / this.reviews.length);
  }
}
