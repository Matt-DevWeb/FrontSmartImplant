import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string; // email de l'utilisateur
  role?: string; // rôle au singulier (comme dans votre token)
  roles?: string[]; // tableau des rôles (au cas où)
  userId?: number; // ID de l'utilisateur
  iat: number; // timestamp d'émission
  exp: number; // timestamp d'expiration
}

export function extractUserFromToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
}
