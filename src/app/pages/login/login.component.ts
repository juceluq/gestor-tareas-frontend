import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLogin: boolean = true;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }


  ngOnInit(): void {
    if (this.authService.getCookie('authToken')) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleForm() {
    this.isLogin = !this.isLogin;

    if (!this.isLogin) {
      this.loginForm.addControl('confirmPassword', this.fb.control('', Validators.required));
    } else {
      this.loginForm.removeControl('confirmPassword');
    }
  }


  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { username, password, confirmPassword } = this.loginForm.value;

    if (!this.isLogin && password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    const request$ = this.isLogin
      ? this.authService.login(username, password)
      : this.authService.register(username, password);

    request$.subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => this.handleAuthError(err)
    });
  }

  private handleAuthError(err: any): void {
    const defaultLoginMsg = 'Ocurrió un error inesperado al intentar iniciar sesión.';
    const defaultRegisterMsg = 'Ocurrió un error inesperado al intentar registrarse.';

    if (this.isLogin) {
      this.errorMessage =
        err.status === 401
          ? err.error?.message || 'Error de login: credenciales incorrectas.'
          : err.error?.message || defaultLoginMsg;
    } else {
      if (err.status === 400) {
        this.errorMessage = err.error?.message || 'El nombre de usuario ya está en uso.';
      } else {
        this.errorMessage = err.error?.message || defaultRegisterMsg;
      }
    }
  }
}
