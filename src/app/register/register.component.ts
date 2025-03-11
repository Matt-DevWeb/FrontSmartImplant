import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Role } from '../models/enum.role';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  form: any = {
    email: null,
    password: null,
    role: Role.PATIENT,
  };
  loading: boolean = false;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  roles = Object.values(Role).filter((role) => role !== Role.ADMIN);

  constructor(private authService: AuthService) {}
  ngOnInit(): void {}

  onSubmit(): void {
    this.loading = true;
    const { email, password, role } = this.form;

    this.authService.register(email, password, role).subscribe({
      next: (data) => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
        this.loading = false;
      },
    });
  }
}
