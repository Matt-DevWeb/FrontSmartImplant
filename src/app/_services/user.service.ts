import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

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
      endpoint = `users/${id}`;
    }

    const fullUrl = `${API_URL}${endpoint}`;
    console.log('URL de mise à jour:', fullUrl);
    console.log('Données envoyées au serveur:', user);

    return this.http.put(fullUrl, user).pipe(
      tap((response) => console.log('Réponse de la mise à jour:', response)),
      catchError((error) => {
        console.error('Erreur de mise à jour détaillée:', error);
        return throwError(() => error);
      })
    );
  }

  getUserDetails(user: any): Observable<any> {
    const id = user.id || user.userId;
    if (!id) {
      throw new Error('ID utilisateur non défini');
    }
    let endpoint = '';
    if (
      user.role === 'DENTIST' ||
      (user.roles && user.roles.includes('DENTIST'))
    ) {
      endpoint = `dentists/${id}`;
    } else if (
      user.role === 'PATIENT' ||
      (user.roles && user.roles.includes('PATIENT'))
    ) {
      endpoint = `patients/${id}`;
    } else {
      endpoint = `users/${id}`;
    }

    const fullUrl = `${API_URL}${endpoint}`;
    console.log('URL complète de la requête:', fullUrl);

    // Ajout des headers de debug CORS
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });

    return this.http.get(fullUrl, { headers }).pipe(
      tap((response) => console.log('Réponse brute du serveur:', response)),
      catchError((error) => {
        console.error('Erreur HTTP détaillée:', error);
        return throwError(() => error);
      })
    );
  }
}
