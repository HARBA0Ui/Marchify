import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth-service';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
registerForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private userService: AuthService) {
    this.registerForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      PWD: ['', [Validators.required, Validators.minLength(6)]],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
      role: ['CLIENT', Validators.required],
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    const user: User = this.registerForm.value;

    this.userService.register(user).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.errorMessage = '';
        this.registerForm.reset({ role: 'CLIENT' });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l’inscription.';
        this.successMessage = '';
      }
    });
  }
}
