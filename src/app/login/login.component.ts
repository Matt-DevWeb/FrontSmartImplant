import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { StorageService } from '../_services/storage.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Role } from '../models/enum.role';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf],
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
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.roles = this.mapRoles(this.storageService.getUser().roles);
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
        this.reloadPage();
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
        this.loading = false;
      },
    });
  }

  reloadPage(): void {
    window.location.reload();
  }

  private mapRoles(rolesFromBackend: string[]): Role[] {
    return rolesFromBackend
      .map((role) => role.toUpperCase() as Role)
      .filter((role) => Object.values(Role).includes(role));
  }

  isDentist(): boolean {
    return this.roles.includes(Role.DENTIST);
  }

  isPatient(): boolean {
    return this.roles.includes(Role.PATIENT);
  }
}
