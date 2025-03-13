import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub?: string;
  exp?: number;
  role?: string;
  roles?: string[] | string;
  userId?: number; // Assurez-vous que cette propriété est incluse
  iat: number; // timestamp d'émission
}

export function extractUserFromToken(token: string): JwtPayload | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    console.log('Token décodé complet:', decoded); // Ajoutez ce log pour le débogage
    return decoded;
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
}
