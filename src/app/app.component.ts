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
      const user = this.storageService.getUser();
      this.roles = user.roles;

      // Vérification des rôles pour afficher les boards correspondants
      this.showAdminBoard = this.roles.includes(Role.ADMIN);
      this.showDentistBoard = this.roles.includes(Role.DENTIST);
      this.showPatientBoard = this.roles.includes(Role.PATIENT);

      this.email = user.email;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (res: any) => {
        console.log(res);
        this.storageService.clean();
        window.location.reload();
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
}
