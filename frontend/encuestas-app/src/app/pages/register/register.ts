import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  hide = signal(true);
  loading = signal(false);
  apiError = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['ADMIN', [Validators.required]],
  });

  submit() {
    this.apiError.set('');
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const { email, password, role } = this.form.getRawValue();
    this.auth.register(email!, password!, role!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/surveys']);
      },
      error: (e) => {
        this.loading.set(false);
        this.apiError.set(e?.error?.message || 'No se pudo registrar');
      },
    });
  }
}
