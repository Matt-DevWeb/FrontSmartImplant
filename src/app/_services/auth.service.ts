import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

const AUTH_API = 'http://localhost:8080/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(AUTH_API + 'login', { email, password }, httpOptions);
  }

  register(email: string, password: string, role: string): Observable<any> {
    const validRoles = ['PATIENT', 'DENTIST', 'ADMIN'];
    if (!validRoles.includes(role.toUpperCase())) {
      return throwError(() => new Error('Rôle invalide'));
    }

    return this.http
      .post(
        AUTH_API + 'register',
        { email, password, role: role.toUpperCase() },
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          responseType: 'text', // Accepter une réponse textuelle
        }
      )
      .pipe(
        catchError((error) => {
          console.error("Erreur d'inscription", error);
          let errorMessage = 'Erreur serveur';
          if (error.error) {
            errorMessage =
              typeof error.error === 'string'
                ? error.error
                : JSON.stringify(error.error);
          } else {
            errorMessage = `Erreur Code: ${error.status}\nMessage: ${error.message}`;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(AUTH_API + 'logout', {}, httpOptions);
  }
}
