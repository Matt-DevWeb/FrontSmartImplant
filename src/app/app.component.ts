import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { StorageService } from './_services/storage.service';
import { AuthService } from './_services/auth.service';
import { Role } from './models/enum.role';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private roles: Role[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showDentistBoard = false;
  showPatientBoard = false;
  email?: string;
  title = 'SmartImplant';

  private authSubscription: Subscription | null = null;
  private rolesSubscription: Subscription | null = null;

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Abonnement pour l'état de connexion
    this.authSubscription = this.storageService.authStatus$.subscribe(
      (isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;
        if (isLoggedIn) {
          const user = this.storageService.getUser();
          this.email = user.email || user.sub;
        } else {
          this.showAdminBoard = false;
          this.showDentistBoard = false;
          this.showPatientBoard = false;
          this.email = undefined;
        }
      }
    );

    // Abonnement pour les rôles
    this.rolesSubscription = this.storageService.userRoles$.subscribe(
      (roles: string[]) => {
        console.log('Roles updated:', roles);
        this.showAdminBoard = roles.includes(Role.ADMIN);
        this.showDentistBoard = roles.includes(Role.DENTIST);
        this.showPatientBoard = roles.includes(Role.PATIENT);
      }
    );

    // Appel initial si besoin (en cas d'initialisation sans abonnement préalable)
    this.isLoggedIn = this.storageService.isLoggedIn();

    if (this.isLoggedIn) {
      try {
        const user = this.storageService.getUser();
        console.log('User data:', user);

        // Extraction et normalisation des rôles
        if (user) {
          if (Array.isArray(user.roles)) {
            this.roles = user.roles;
          } else if (user.roles) {
            if (typeof user.roles === 'string') {
              this.roles = [user.roles];
            }
          } else if (user.role) {
            this.roles = [user.role];
          }
          this.email = user.email || '';
        }

        this.showAdminBoard = this.roles.includes(Role.ADMIN);
        this.showDentistBoard = this.roles.includes(Role.DENTIST);
        this.showPatientBoard = this.roles.includes(Role.PATIENT);

        console.log('Roles after processing:', this.roles);
        console.log('Show boards:', {
          admin: this.showAdminBoard,
          dentist: this.showDentistBoard,
          patient: this.showPatientBoard,
        });
      } catch (error) {
        console.error('Error while processing user data:', error);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.rolesSubscription) {
      this.rolesSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // La méthode signOut() dans StorageService est appelée directement dans AuthService.logout()
        // Les observables mettront à jour la navbar.
        window.location.reload();
      },
      error: (err) => {
        console.error('Logout error:', err);
      },
    });
  }
}
