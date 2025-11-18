import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Predict } from '../../../core/services/predict';
import { Router } from '@angular/router';

interface Vegetable {
  x: number;
  y: number;
  speed: number;
  icon: string;
  emoji: string;
  rotation: number;
  rotationSpeed: number;
  size: number;
}

@Component({
  selector: 'app-upload-predict',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './upload-predict.html',
  styleUrl: './upload-predict.css',
})
export class UploadPredict implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  imageBase64: string | null = null;
  loading = false;
  error: string | null = null;
  analysisComplete = false;

  // Game state
  gameScore = 0;
  gameLives = 3;
  gameOver = false;
  vegetables: Vegetable[] = [];
  gameInterval: any;
  animationFrame: any;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;

  vegetableTypes = [
    { icon: '🥕', name: 'carrot' },
    { icon: '🥬', name: 'lettuce' },
    { icon: '🍅', name: 'tomato' },
    { icon: '🥒', name: 'cucumber' },
    { icon: '🌽', name: 'corn' },
    { icon: '🥔', name: 'potato' },
    { icon: '🧅', name: 'onion' },
    { icon: '🥦', name: 'broccoli' },
  ];

  constructor(private predictService: Predict, private router: Router) {}

  ngAfterViewInit() {
    if (this.canvasRef) {
      this.initGame();
    }
  }

  ngOnDestroy() {
    this.stopGame();
  }

  initGame() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Set canvas size
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  startGame() {
    this.gameScore = 0;
    this.gameLives = 3;
    this.gameOver = false;
    this.vegetables = [];

    // Spawn vegetables periodically
    this.gameInterval = setInterval(() => {
      if (!this.gameOver && !this.analysisComplete) {
        this.spawnVegetable();
      }
    }, 800);

    // Animation loop
    this.animate();
  }

  spawnVegetable() {
    const vegType = this.vegetableTypes[Math.floor(Math.random() * this.vegetableTypes.length)];
    const vegetable: Vegetable = {
      x: Math.random() * (this.canvas.width - 60) + 30,
      y: -50,
      speed: 2 + Math.random() * 2,
      icon: vegType.icon,
      emoji: vegType.name,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 5,
      size: 40 + Math.random() * 20
    };
    this.vegetables.push(vegetable);
  }

  animate() {
    if (!this.ctx || this.analysisComplete) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw vegetables
    for (let i = this.vegetables.length - 1; i >= 0; i--) {
      const veg = this.vegetables[i];
      veg.y += veg.speed;
      veg.rotation += veg.rotationSpeed;

      // Draw vegetable
      this.ctx.save();
      this.ctx.translate(veg.x, veg.y);
      this.ctx.rotate((veg.rotation * Math.PI) / 180);
      this.ctx.font = `${veg.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(veg.icon, 0, 0);
      this.ctx.restore();

      // Check if missed (fell off screen)
      if (veg.y > this.canvas.height) {
        this.vegetables.splice(i, 1);
        this.gameLives--;
        if (this.gameLives <= 0) {
          this.gameOver = true;
          this.stopGame();
        }
      }
    }

    if (!this.gameOver) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
    }
  }

  onCanvasClick(event: MouseEvent) {
    if (this.gameOver || this.analysisComplete) return;

    const rect = this.canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Check if clicked on any vegetable
    for (let i = this.vegetables.length - 1; i >= 0; i--) {
      const veg = this.vegetables[i];
      const distance = Math.sqrt(
        Math.pow(clickX - veg.x, 2) + Math.pow(clickY - veg.y, 2)
      );

      if (distance < veg.size / 2) {
        // Hit!
        this.vegetables.splice(i, 1);
        this.gameScore += 10;
        this.createSliceEffect(veg.x, veg.y);
        break;
      }
    }
  }

  createSliceEffect(x: number, y: number) {
    // Visual feedback for slicing
    this.ctx.save();
    this.ctx.globalAlpha = 0.6;
    this.ctx.strokeStyle = '#F97A00';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 30, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  restartGame() {
    this.stopGame();
    this.startGame();
  }

  stopGame() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.error = null;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
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

  resetUpload() {
    this.imageBase64 = null;
    this.error = null;
  }

  onPredict() {
    if (!this.imageBase64) {
      this.error = 'Veuillez sélectionner une image';
      return;
    }

    this.loading = true;
    this.error = null;
    this.analysisComplete = false;
    
    // Start the game
    setTimeout(() => {
      if (this.canvasRef) {
        this.initGame();
        this.startGame();
      }
    }, 100);

    const pureBase64 = this.imageBase64.split(',')[1];

    this.predictService.getPredict(pureBase64).subscribe({
      next: (res) => {
        this.loading = false;
        this.analysisComplete = true;
        this.stopGame();

        if (res && (res.predictions || res.results)) {
          localStorage.setItem('predictResult', JSON.stringify(res));
          // Small delay to show final score
            this.router.navigate(['/predict-results']);
        } else {
          this.error = 'Réponse invalide du serveur';
        }
      },
      error: (err) => {
        this.loading = false;
        this.analysisComplete = true;
        this.stopGame();
        this.error = 'Erreur lors de la prédiction. Veuillez réessayer.';
        console.error('Prediction error:', err);
      },
    });
  }
}