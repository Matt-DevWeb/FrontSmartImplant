import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../_services/storage.service';
import { UserService } from '../_services/user.service';
import { jwtDecode } from 'jwt-decode';

// Interface commune pour les propriétés de base
interface User {
  id?: number;
  userId?: number;
  name?: string;
  firstName?: string;
  email?: string;
  password?: string;
  role?: string;
  roles?: string[];
  token?: string;
  decodedUser?: any;
  [key: string]: any;
}

// Interface spécifique pour les patients
interface Patient extends User {
  age?: number;
  dentist?: any;
  healthIssues?: string;
  socialSecurityNumber?: string;
  mutualMembershipNumber?: string;
  allergies?: string;
  currentMedications?: string;
  chronicIllnesses?: string;
}

// Interface spécifique pour les dentistes
interface Dentist extends User {
  phone?: string;
  address?: string;
  licenseNumber?: string;
  specialization?: string;
  clinicName?: string;
  patients?: any[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: User = {};
  showPasswordFields: boolean = false;
  password: string = '';
  confirmPassword: string = '';

  // Propriété pour déterminer quel type d'utilisateur on affiche
  isPatient: boolean = false;
  isDentist: boolean = false;

  constructor(
    private storageService: StorageService,
    private userService: UserService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.currentUser = this.storageService.getUser();
    console.log('Current user from storage:', this.currentUser);

    // Récupérer l'ID utilisateur
    let userId = null;
    let userRole = null;

    if (this.currentUser.userId) {
      userId = this.currentUser.userId;
    } else if (
      this.currentUser.decodedUser &&
      this.currentUser.decodedUser.userId
    ) {
      userId = this.currentUser.decodedUser.userId;
    } else if (this.currentUser['accestoken']) {
      try {
        const decoded = jwtDecode<any>(this.currentUser['accestoken']);
        console.log('Token décodé:', decoded);
        if (decoded && decoded.userId) {
          userId = decoded.userId;
          userRole = decoded.role;
          console.log('ID décodé du token:', userId);
          console.log('Rôle décodé du token:', userRole);
        }
      } catch (e) {
        console.error('Erreur de décodage token:', e);
      }
    }

    // Déterminer le type d'utilisateur
    if (
      userRole === 'PATIENT' ||
      (this.currentUser.roles && this.currentUser.roles.includes('PATIENT'))
    ) {
      this.isPatient = true;
    } else if (
      userRole === 'DENTIST' ||
      (this.currentUser.roles && this.currentUser.roles.includes('DENTIST'))
    ) {
      this.isDentist = true;
    }

    if (userId) {
      // Utiliser directement l'URL avec le bon endpoint basé sur le rôle
      let endpoint = '';
      if (
        userRole === 'PATIENT' ||
        (this.currentUser.roles && this.currentUser.roles.includes('PATIENT'))
      ) {
        endpoint = `patients/${userId}`;
      } else if (
        userRole === 'DENTIST' ||
        (this.currentUser.roles && this.currentUser.roles.includes('DENTIST'))
      ) {
        endpoint = `dentists/${userId}`;
      } else {
        endpoint = `users/${userId}`;
      }

      const url = `http://localhost:8080/api/${endpoint}`;
      console.log('Appel direct à URL:', url);

      // Appel HTTP direct pour tester la communication
      this.http.get(url).subscribe({
        next: (data: any) => {
          console.log('Données récupérées avec succès:', data);

          // Conserver le token et les rôles du localStorage
          const token = this.currentUser['accestoken'];
          const tokenType = this.currentUser['tokenType'];

          // Utiliser les rôles de plusieurs sources possibles
          let roles = this.currentUser.roles; // Garder les rôles existants si présents

          // Si pas de rôles, mais qu'on a un rôle unique dans la réponse
          if (!roles && data.role) {
            roles = [data.role];
          }
          // Si on a des authorities dans la réponse (format Spring Security)
          else if (
            !roles &&
            data.authorities &&
            Array.isArray(data.authorities)
          ) {
            roles = data.authorities.map(
              (auth: any) => auth.authority?.replace('ROLE_', '') // Supprimer le préfixe ROLE_ si présent
            );
          }

          // Fusion des données et nettoyage des propriétés Spring Security non nécessaires
          this.currentUser = {
            ...data,
            accestoken: token,
            tokenType: tokenType,
            roles: roles,
            userId: userId || data.id,
            // Supprimer les propriétés Spring Security qui ne sont pas utiles pour l'affichage
            authorities: undefined,
            accountNonExpired: undefined,
            credentialsNonExpired: undefined,
            accountNonLocked: undefined,
            enabled: undefined,
          };

          // Si besoin, extraire d'autres données importantes
          console.log('Profil utilisateur mis à jour:', this.currentUser);

          // Sauvegarder l'utilisateur avec toutes ses données dans le storage
          this.storageService.saveUser(this.currentUser);
        },
        error: (err) => {
          console.error('Erreur HTTP directe:', err);
        },
      });
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

    if (!this.currentUser.id && !this.currentUser.userId) {
      const user = this.storageService.getUser();

      if (user && user.decodedUser && user.decodedUser.userId) {
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

    if (!Number.isInteger(Number(this.currentUser.userId))) {
      console.error('ID utilisateur invalide:', this.currentUser.userId);
      alert('Erreur: ID utilisateur non valide pour la mise à jour.');
      return;
    }

    if (this.showPasswordFields) {
      if (this.password !== this.confirmPassword) {
        alert('Les mots de passe ne correspondent pas.');
        return;
      }
      this.currentUser.password = this.password;
    } else {
      delete this.currentUser.password;
    }

    this.userService.updateUser(this.currentUser).subscribe({
      next: (updatedUser) => {
        const token = this.currentUser.token;
        const roles = this.currentUser.roles;

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
