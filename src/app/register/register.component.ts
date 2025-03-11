import { Component } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Role } from '../models/enum.role';

@Component({
  selector: 'app-register',
  imports: [FormsModule, NgClass, NgIf],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  form: any = {
    email: null,
    password: null,
    role: Role.PATIENT, // Valeur par défaut à "PATIENT"
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  // Exclure "ADMIN" du tableau des rôles pour le formulaire d'inscription
  roles = Object.values(Role).filter((role) => role !== Role.ADMIN);

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    const { email, password, role } = this.form;

    this.authService.register(email, password, role).subscribe({
      next: (data) => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      },
    });
  }
}
