import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Role } from '../models/enum.role';
import { extractUserFromToken, JwtPayload } from './token.service';
import { StorageService } from './storage.service';

const AUTH_API = 'http://localhost:8080/api/auth/';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(AUTH_API + 'login', { email, password }, httpOptions)
      .pipe(
        map((response: any) => {
          if (!response) {
            console.warn('Login response is null or undefined');
            return { roles: [] };
          }

          console.log('Login response:', response);
          const processedResponse = { ...response };

          // Décoder le token pour extraire les informations utilisateur
          const token = response.accestoken;
          const decodedUser: JwtPayload | null = extractUserFromToken(token);
          console.log('User decoded from token:', decodedUser);

          // Initialiser les rôles à partir du token décodé si disponible
          processedResponse.roles = [];

          // Si le token contient un rôle (au singulier), l'utiliser
          if (decodedUser && decodedUser.role) {
            const roleFromToken = this.mapRoleFromBackend(
              String(decodedUser.role)
            );
            if (roleFromToken) {
              processedResponse.roles = [roleFromToken];
            }
          }
          // Si le token contient des rôles (au pluriel), les utiliser
          else if (decodedUser && decodedUser.roles) {
            processedResponse.roles = Array.isArray(decodedUser.roles)
              ? decodedUser.roles
                  .map((r) => this.mapRoleFromBackend(String(r)))
                  .filter((r) => r !== undefined)
              : [this.mapRoleFromBackend(String(decodedUser.roles))].filter(
                  (r) => r !== undefined
                );
          }
          // Sinon, utiliser les rôles de la réponse directe si disponibles
          else if (response.roles) {
            if (!Array.isArray(response.roles)) {
              processedResponse.roles =
                typeof response.roles === 'string'
                  ? this.parseRolesString(response.roles)
                  : [response.roles];
            }

            processedResponse.roles = processedResponse.roles
              .map((role: any) => {
                if (typeof role === 'object' && role !== null && role.name) {
                  return this.mapRoleFromBackend(role.name);
                }
                return this.mapRoleFromBackend(String(role));
              })
              .filter((role: Role | undefined) => role !== undefined);
          }

          console.log('Final roles after processing:', processedResponse.roles);

          // Sauvegarder les informations utilisateur, y compris les rôles extraits
          const userToSave = {
            ...response,
            roles: processedResponse.roles,
            email: decodedUser ? decodedUser.sub : null,
            userId: decodedUser ? decodedUser.userId : null,
          };

          this.storageService.saveUser(userToSave);

          return {
            ...processedResponse,
            decodedUser,
            email: decodedUser ? decodedUser.sub : null,
          };
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(email: string, password: string, role: string): Observable<any> {
    const validRoles = Object.values(Role);
    if (!validRoles.includes(role.toUpperCase() as Role)) {
      return throwError(() => new Error('Rôle invalide'));
    }

    return this.http
      .post(
        AUTH_API + 'register',
        { email, password, role: role.toUpperCase() },
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          responseType: 'text',
        }
      )
      .pipe(
        catchError((error) => {
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
    return of(true);
  }

  private parseRolesString(rolesStr: string): string[] {
    try {
      if (rolesStr.includes('[') || rolesStr.includes('{')) {
        const parsed = JSON.parse(rolesStr);
        return Array.isArray(parsed) ? parsed : [rolesStr];
      }
    } catch (e) {
      console.error('Error parsing roles string:', e);
    }
    return [rolesStr];
  }

  mapRoleFromBackend(backendRole: string): Role | undefined {
    if (!backendRole) {
      console.warn('Role is null or undefined');
      return undefined;
    }
    console.log('Mapping role:', backendRole);
    try {
      const normalizedRole = backendRole.toUpperCase();
      if (normalizedRole.startsWith('ROLE_')) {
        const roleWithoutPrefix = normalizedRole.substring(5);
        if (Object.values(Role).includes(roleWithoutPrefix as Role)) {
          return roleWithoutPrefix as Role;
        }
      }
      if (Object.values(Role).includes(normalizedRole as Role)) {
        return normalizedRole as Role;
      }
      switch (normalizedRole) {
        case 'DENTIST':
          return Role.DENTIST;
        case 'PATIENT':
          return Role.PATIENT;
        case 'ADMIN':
          return Role.ADMIN;
        default:
          console.warn(`Rôle inconnu reçu du backend: ${backendRole}`);
          return undefined;
      }
    } catch (e) {
      console.error('Error processing role:', e);
      return undefined;
    }
  }
}
