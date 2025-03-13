import { Component, OnInit } from '@angular/core';
import { StorageService } from '../_services/storage.service';
import { UserService } from '../_services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

interface Patient {
  id?: number;
  userId?: number;
  name?: string;
  firstName?: string;
  email?: string;
  password?: string;
  role?: string;
  roles?: string[];
  age?: number;
  dentist?: any;
  healthIssues?: string;
  socialSecurityNumber?: string;
  mutualMembershipNumber?: string;
  allergies?: string;
  currentMedications?: string;
  chronicIllnesses?: string;
  token?: string;
  decodedUser?: any;
}

@Component({
  selector: 'app-profile',
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: Patient = {};
  showPasswordFields: boolean = false;
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private storageService: StorageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.storageService.getUser();

    // Ajouter des logs pour le débogage
    console.log('Current user from storage:', this.currentUser);

    // Solution temporaire : Si userId est disponible dans le token mais pas dans l'objet user
    if (this.currentUser && !this.currentUser.id && !this.currentUser.userId) {
      console.warn("ID manquant, recherche dans d'autres propriétés...");

      // Tenter de récupérer l'ID depuis l'objet token si disponible
      // Récupérer le token depuis le service de stockage
      const userData = this.storageService.getUser();
      if (userData && userData.token) {
        try {
          const decoded = jwtDecode<any>(userData.token);
          if (decoded && decoded.userId) {
            console.log('ID trouvé dans le token:', decoded.userId);
            this.currentUser.userId = decoded.userId;
          }
        } catch (e) {
          console.error('Erreur lors du décodage manuel du token', e);
        }
      }
    }
  }

  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    if (!this.showPasswordFields) {
      this.password = '';
      this.confirmPassword = '';
    }
  }

  updateProfile(): void {
    if (!this.currentUser) {
      return;
    }

    // Modification critique : s'assurer que userId est un nombre
    if (!this.currentUser.id && !this.currentUser.userId) {
      const user = this.storageService.getUser();

      if (user && user.decodedUser && user.decodedUser.userId) {
        // Utilisez directement la propriété userId du token, qui est un nombre
        this.currentUser.userId = user.decodedUser.userId;
        console.log('ID récupéré du token:', this.currentUser.userId);
      } else if (this.currentUser.token) {
        try {
          const decoded = jwtDecode<any>(this.currentUser.token);
          if (decoded && decoded.userId) {
            console.log('ID décodé depuis le token:', decoded.userId);
            this.currentUser.userId = decoded.userId;
          }
        } catch (e) {
          console.error('Erreur de décodage token:', e);
        }
      }
    }

    // Vérification finale que userId est bien un nombre
    if (!Number.isInteger(Number(this.currentUser.userId))) {
      console.error('ID utilisateur invalide:', this.currentUser.userId);
      alert('Erreur: ID utilisateur non valide pour la mise à jour.');
      return;
    }

    // Gestion du mot de passe
    if (this.showPasswordFields) {
      if (this.password !== this.confirmPassword) {
        alert('Les mots de passe ne correspondent pas.');
        return;
      }
      this.currentUser.password = this.password;
    } else {
      // Ne pas envoyer de password si les champs ne sont pas affichés
      delete this.currentUser.password;
    }

    this.userService.updateUser(this.currentUser).subscribe({
      next: (updatedUser) => {
        // Préserver le token et autres infos d'authentification
        const token = this.currentUser.token;
        const roles = this.currentUser.roles;

        // Mettre à jour le stockage avec les nouvelles infos
        this.storageService.saveUser({
          ...updatedUser,
          token,
          roles,
        });

        alert('Profil mis à jour avec succès');
      },
      error: (err) => {
        console.error('Erreur de mise à jour:', err);
        alert('Erreur lors de la mise à jour du profil');
      },
    });
  }
}
