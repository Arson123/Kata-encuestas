import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import dayjs from 'dayjs';
import { SurveysService } from '../../services/surveys.service';
import { ExportsService } from '../../services/exports.service';

@Component({
  selector: 'app-surveys',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './surveys.html',
  styleUrls: ['./surveys.scss'],
})
export class Surveys implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(SurveysService);
  private exportsApi = inject(ExportsService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  loading = signal(false);
  rows: any[] = [];
  displayedColumns = ['title', 'status', 'createdAt', 'actions'];

  form = this.fb.group({
    title: ['Encuesta NPS', [Validators.required, Validators.minLength(3)]],
    description: ['Demo'],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (rows) => {
        this.rows = rows;
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.showError(e, 'No se pudo listar');
      },
    });
  }

  create() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.api.create(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open('Encuesta creada', 'OK', { duration: 2000 });
        this.form.reset({ title: '', description: '' });
        this.load();
      },
      error: (e) => {
        this.loading.set(false);
        this.showError(e, 'No se pudo crear la encuesta');
      },
    });
  }

  publish(row: any) {
    if (row.status === 'PUBLISHED' || this.loading()) return;
    this.loading.set(true);
    this.api.patchStatus(row.id, 'PUBLISHED').subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open('Publicada', 'OK', { duration: 2000 });
        this.load();
      },
      error: (e) => {
        this.loading.set(false);
        this.showError(e, 'No se pudo publicar');
      },
    });
  }

  goDetail(row: any) {
    this.router.navigate(['/surveys', row.id]);
  }
  goPublic(row: any) {
    this.router.navigate(['/public', row.publicId]);
  }
  goResults(row: any) {
    this.router.navigate(['/results', row.id]);
  }

  exportCsv(row: any) {
    this.exportsApi.responsesCsv(row.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `responses_${row.id}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (e) => this.showError(e, 'No se pudo exportar CSV'),
    });
  }

  fmt(d: string) {
    return dayjs(d).format('YYYY-MM-DD HH:mm');
  }

  private showError(e: any, fallback: string) {
    const msg = e?.error?.message || e?.message || fallback;
    console.error('[Surveys]', e);
    this.snack.open(String(msg), 'OK', { duration: 3000 });
  }
}
