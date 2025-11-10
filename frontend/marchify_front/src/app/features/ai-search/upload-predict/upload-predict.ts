import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Predict } from '../../../core/services/predict';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-predict',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './upload-predict.html',
  styleUrl: './upload-predict.css',
})
export class UploadPredict {
  imageBase64: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(private predictService: Predict, private router: Router) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.error = null;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
        console.log('Image loaded:', this.imageBase64);
      };
      reader.onerror = () => {
        this.error = "Erreur lors du chargement de l'image";
      };
      reader.readAsDataURL(file);
    }
  }

  onCapture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    input.onchange = (event: any) => this.onFileSelected(event);
    input.click();
  }
  onPredict() {
    if (!this.imageBase64) {
      this.error = 'Veuillez sélectionner une image';
      return;
    }

    this.loading = true;
    this.error = null;

    // ✅ Remove the "data:image/jpeg;base64," prefix — only send the raw base64
    const pureBase64 = this.imageBase64.split(',')[1];

    this.predictService.getPredict(pureBase64).subscribe({
      next: (res) => {
        this.loading = false;
        console.log('Prediction response:', res);

        if (res && (res.predictions || res.results)) {
          localStorage.setItem('predictResult', JSON.stringify(res));
          this.router.navigate(['/predict-results']); // ✅ re-enable navigation
        } else {
          this.error = 'Réponse invalide du serveur';
          console.error('Invalid response structure:', res);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors de la prédiction. Veuillez réessayer.';
        console.error('Prediction error:', err);
      },
    });
  }
}
