import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageService } from './_services/storage.service';
import { AuthService } from './_services/auth.service';
import { Role } from './models/enum.role'; // N'oublie pas d'importer ton Enum

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private roles: Role[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showDentistBoard = false;
  showPatientBoard = false;
  email?: string;
  title = 'SmartImplant';

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();

    if (this.isLoggedIn) {
      try {
        const user = this.storageService.getUser();
        console.log('User data:', user); // Pour déboguer la structure de l'objet utilisateur

        // Initialisation des rôles par défaut (aucun)
        this.roles = [];

        // Vérification que user existe et a une propriété roles
        if (user) {
          // Si les rôles existent sous forme de tableau
          if (Array.isArray(user.roles)) {
            this.roles = user.roles;
          }
          // Si les rôles existent sous une autre forme (peut-être un objet ou une chaîne)
          else if (user.roles) {
            console.log(
              'Roles exist but not as array, type:',
              typeof user.roles
            );
            // Tentative d'extraire ou convertir les rôles selon la structure reçue
            if (typeof user.roles === 'string') {
              this.roles = [user.roles]; // Conversion en tableau
            }
          }
          // Si aucune propriété roles n'existe mais qu'il y a un rôle unique
          else if (user.role) {
            this.roles = [user.role];
          }

          // Définir l'email de l'utilisateur
          this.email = user.email || '';
        }

        // Mise à jour des drapeaux d'affichage basés sur les rôles
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

  logout(): void {
    this.storageService.clean();
    window.location.reload();
  }
}
