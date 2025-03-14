import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { StorageService } from '../_services/storage.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Role } from '../models/enum.role';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form: any = {
    email: null,
    password: null,
  };
  loading: boolean = false;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: Role[] = [];

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      const storedRoles = this.storageService.getUser().roles;
      this.roles = this.mapRoles(storedRoles);
    }
  }

  onSubmit(): void {
    this.loading = true;
    const { email, password } = this.form;

    this.authService.login(email, password).subscribe({
      next: (data) => {
        this.storageService.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.mapRoles(this.storageService.getUser().roles);
        this.loading = false;
        this.redirectByRole();
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
        this.loading = false;
      },
    });
  }

  private redirectByRole(): void {
    if (this.roles.includes(Role.DENTIST)) {
      this.router.navigate(['/dentist']);
    } else if (this.roles.includes(Role.PATIENT)) {
      this.router.navigate(['/patient']);
    } else if (this.roles.includes(Role.ADMIN)) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  private mapRoles(rolesFromBackend: string[]): Role[] {
    if (!Array.isArray(rolesFromBackend)) {
      console.error('Les rôles reçus ne sont pas valides:', rolesFromBackend);
      return [];
    }

    return rolesFromBackend
      .map((role) => (role ? (role.toUpperCase() as Role) : null))
      .filter(
        (role): role is Role =>
          role !== null && Object.values(Role).includes(role)
      );
  }

  // Pour l'affichage conditionnel dans le template
  isDentist(): boolean {
    return this.roles.includes(Role.DENTIST);
  }

  isPatient(): boolean {
    return this.roles.includes(Role.PATIENT);
  }
}
