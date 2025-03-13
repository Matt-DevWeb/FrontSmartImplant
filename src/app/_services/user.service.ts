import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/'; //  a modifier dans le back

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getPublicContent(): Observable<any> {
    return this.http.get(API_URL + 'all', { responseType: 'text' });
  }

  getDentistBoard(): Observable<any> {
    return this.http.get(API_URL + 'dentists', { responseType: 'text' });
  }

  getPatientBoard(): Observable<any> {
    return this.http.get(API_URL + 'patients', { responseType: 'text' });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(API_URL + 'admin', { responseType: 'text' });
  }

  updateUser(user: any): Observable<any> {
    // Tenter de récupérer l'ID de plusieurs façons
    const id = user.id || user.userId;

    if (!id) {
      throw new Error('ID utilisateur non défini');
    }

    // Déterminer le type d'utilisateur pour choisir le bon endpoint
    let endpoint = '';

    // Option 1: Si l'utilisateur a un rôle explicite
    if (user.role === 'DENTIST') {
      endpoint = `dentists/${id}`;
    } else if (user.role === 'PATIENT') {
      endpoint = `patients/${id}`;
    }
    // Option 2: Si l'info est dans un tableau de rôles
    else if (user.roles && Array.isArray(user.roles)) {
      if (user.roles.includes('DENTIST')) {
        endpoint = `dentists/${id}`;
      } else if (user.roles.includes('PATIENT')) {
        endpoint = `patients/${id}`;
      }
    }

    // Si on n'a pas pu déterminer le type, utiliser une logique par défaut
    if (!endpoint) {
      console.warn(
        "Type d'utilisateur non déterminé, utilisation de l'endpoint par défaut"
      );
      // Vous pourriez décider d'une stratégie par défaut ou lever une erreur
      endpoint = `users/${id}`; // Pour la compatibilité avec le code existant
    }

    return this.http.put(`${API_URL}${endpoint}`, user);
  }
}
