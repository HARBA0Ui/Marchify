import { Component, Input,Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReviewService, Review } from '../../core/services/review.service';

@Component({
  selector: 'app-boutique-commentaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './boutique-commentaire.component.html',
  styleUrls: ['./boutique-commentaire.component.css']
})
export class BoutiqueCommentaireComponent implements OnInit {
  @Input() boutiqueId!: string | null;
  @Output() avgChanged = new EventEmitter<number>();

  reviews = signal<Review[]>([]);
  avgRating = signal(0);

  newComment: string = '';
  newRating = 5;

  userName = ''; 
  constructor(
    private reviewService: ReviewService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (!this.boutiqueId) {
      const idFromRoute = this.route.snapshot.paramMap.get('id');
      this.boutiqueId = idFromRoute;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = (user.nom ? user.nom : '') + (user.prenom ? ' ' + user.prenom : '');
      } catch {
        this.userName = '';
      }
    }

    if (this.boutiqueId) this.loadReviews();
    if (!this.boutiqueId) {
      this.route.params.subscribe(params => {
        this.boutiqueId = params['id'];
      });
    }
  
    if (this.boutiqueId) {
      this.loadReviews();
    }
  }

  loadReviews() {
    if (!this.boutiqueId) return;
    this.reviewService.getBoutiqueReviews(this.boutiqueId).subscribe({
      next: (data: any) => {
        this.reviews.set(data || []);
        this.calculateAvgRating();
      },
      error: (err: any) => console.error('Erreur chargement reviews:', err)
    });
  }

  calculateAvgRating() {
    const list = this.reviews();
    if (!list.length) {
      this.avgRating.set(0);
      this.avgChanged.emit(0);  
      return;
    }
  
    const sum = list.reduce((s: number, r: any) => s + (r.rating || 0), 0);
    const avg = Number((sum / list.length).toFixed(1));
  
    this.avgRating.set(avg);
    this.avgChanged.emit(avg);  
  }
  

  setRating(value: number) {
    this.newRating = value;
  }

  isCommentValid(): boolean {
    return this.newComment.trim().length >= 6;
  }

  addComment() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      // utilisateur non connecté -> redirection login
      this.router.navigate(['/login']);
      return;
    }

    if (!this.isCommentValid()) {
      alert('Le commentaire doit contenir au moins 6 caractères.');
      return;
    }

    if (!this.boutiqueId) {
      console.error('boutiqueId manquant');
      return;
    }

    const payload = {
      type: 'BOUTIQUE',
      boutiqueId: this.boutiqueId,
      rating: this.newRating,
      comment: this.newComment.trim(),
      authorName: this.userName // facultatif selon backend
    };

    this.reviewService.addReview(token, payload).subscribe({
      next: () => {
        // recharger et réinitialiser
        this.loadReviews();
        this.newComment = '';
        this.newRating = 5;
      },
      error: (err: any) => console.error('Erreur ajout review:', err)
    });
    
  }
  
}
