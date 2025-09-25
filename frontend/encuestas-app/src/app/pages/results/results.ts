import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { ResultsService } from '../../services/results.service';

type ScaleAgg = { avg: number; n: number; min: number; max: number };
type SingleAgg = { optionId: string; label: string; count: number; percent: number };
type Summary = {
  responsesTotal: number;
  lastResponseAt: string;
  perQuestion: Record<string, ScaleAgg | SingleAgg[]>;
};
type Point = { t: string; responses: number };

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatListModule],
  templateUrl: './results.html',
  styleUrls: ['./results.scss'],
})
export class Results implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ResultsService);

  id = '';
  loading = signal(false);
  summary: Summary | null = null;
  points: Point[] = [];

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.summary(this.id).subscribe({
      next: (s) => {
        this.summary = s as Summary;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.api.timeseries(this.id, 'hour').subscribe((p) => (this.points = p as Point[]));
  }

  get perQuestionEntries(): Array<{ key: string; value: ScaleAgg | SingleAgg[] }> {
    if (!this.summary) return [];
    return Object.entries(this.summary.perQuestion).map(([key, value]) => ({ key, value }));
  }

  isScale(v: ScaleAgg | SingleAgg[]): v is ScaleAgg {
    return !Array.isArray(v);
  }
  isSingle(v: ScaleAgg | SingleAgg[]): v is SingleAgg[] {
    return Array.isArray(v);
  }
}
