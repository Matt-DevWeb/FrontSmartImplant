import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // Détection initiale de connexion
  private loggedIn = new BehaviorSubject<boolean>(this.isLoggedInCheck());
  // Expose l'état d'authentification sous forme d'observable
  authStatus$ = this.loggedIn.asObservable();

  // Détection initiale des rôles
  private userRoles = new BehaviorSubject<string[]>(
    this.getUserRolesInternal()
  );
  // Expose les rôles sous forme d'observable
  userRoles$ = this.userRoles.asObservable();

  constructor() {}

  clean(): void {
    window.sessionStorage.clear();
  }

  public saveUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Mise à jour des BehaviorSubjects
    this.loggedIn.next(true);
    this.userRoles.next(this.getUserRolesInternal());
  }

  public getUser(): any {
    const userString = localStorage.getItem(USER_KEY);
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    return null;
  }

  // Méthode interne pour extraire les rôles depuis l'objet utilisateur
  private getUserRolesInternal(): string[] {
    const user = this.getUser();
    if (user) {
      // Cas 1 : roles est un tableau
      if (user.roles && Array.isArray(user.roles)) {
        return user.roles;
      }
      // Cas 2 : role est une chaîne unique
      if (user.role) {
        return [user.role];
      }
      // Cas 3 : On peut aussi consulter decodedUser si présent
      if (user.decodedUser && user.decodedUser.role) {
        return [user.decodedUser.role];
      }
      console.log("Structure de l'utilisateur stocké:", user);
    }
    return [];
  }

  // Méthode publique pour récupérer les rôles (si besoin d'appeler directement)
  public getUserRoles(): string[] {
    return this.getUserRolesInternal();
  }

  // Vérifie si un utilisateur est stocké
  private isLoggedInCheck(): boolean {
    return localStorage.getItem(USER_KEY) !== null;
  }

  public isLoggedIn(): boolean {
    return this.isLoggedInCheck();
  }

  public signOut(): void {
    localStorage.removeItem(USER_KEY);
    // Mise à jour des BehaviorSubjects lors de la déconnexion
    this.loggedIn.next(false);
    this.userRoles.next([]);
  }
}
