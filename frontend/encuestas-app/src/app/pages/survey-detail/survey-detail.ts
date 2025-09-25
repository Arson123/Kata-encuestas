import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { SurveysService } from '../../services/surveys.service';
import { QuestionsService } from '../../services/questions.service';
import { OptionsService } from '../../services/options.service';

@Component({
  selector: 'app-survey-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
  ],
  templateUrl: './survey-detail.html',
  styleUrls: ['./survey-detail.scss'],
})
export class SurveyDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private surveys = inject(SurveysService);
  private questionsApi = inject(QuestionsService);
  private optionsApi = inject(OptionsService);

  id = '';
  loading = signal(false);
  survey: any = null;
  questions: any[] = [];
  optionsByQ: Record<string, any[]> = {};

  scaleForm = this.fb.group({
    title: ['¿Qué tan probable es que nos recomiendes?', [Validators.required]],
    scaleMin: [0, [Validators.required]],
    scaleMax: [10, [Validators.required]],
  });

  singleForm = this.fb.group({
    title: ['¿Cómo nos encontraste?', [Validators.required]],
  });

  optionForm = this.fb.group({
    questionId: ['', [Validators.required]],
    order: [1, [Validators.required]],
    label: ['Google', [Validators.required]],
    value: ['google', [Validators.required]],
  });

  displayedColumns = ['order', 'type', 'title', 'actions'];
  displayedOptColumns = ['order', 'label', 'value'];

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  load() {
    this.loading.set(true);
    this.surveys.get(this.id).subscribe((s) => (this.survey = s));
    this.questionsApi.listBySurvey(this.id).subscribe({
      next: (qs) => {
        this.questions = qs.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
        this.questions
          .filter((q) => q.type === 'SINGLE')
          .forEach((q) => {
            this.optionsApi
              .list(q.id)
              .subscribe(
                (os) =>
                  (this.optionsByQ[q.id] = os.sort(
                    (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
                  ))
              );
          });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  publish() {
    if (this.survey?.status === 'PUBLISHED') return;
    this.loading.set(true);
    this.surveys.patchStatus(this.id, 'PUBLISHED').subscribe({
      next: () => this.load(),
      error: () => this.loading.set(false),
    });
  }

  addScale() {
    if (this.scaleForm.invalid) return;
    const { title, scaleMin, scaleMax } = this.scaleForm.getRawValue();
    const payload = { type: 'SCALE', title, required: true, order: 1, scaleMin, scaleMax };
    this.questionsApi.create(this.id, payload).subscribe(() => {
      this.scaleForm.reset({ title: '', scaleMin: 0, scaleMax: 10 });
      this.load();
    });
  }

  addSingle() {
    if (this.singleForm.invalid) return;
    const { title } = this.singleForm.getRawValue();
    const payload = { type: 'SINGLE', title, order: 2 };
    this.questionsApi.create(this.id, payload).subscribe(() => {
      this.singleForm.reset({ title: '' });
      this.load();
    });
  }

  addOption() {
    if (this.optionForm.invalid) return;
    const { questionId, order, label, value } = this.optionForm.getRawValue();
    this.optionsApi
      .create(questionId!, { order: Number(order), label: label!, value: value! } as any)
      .subscribe(() => {
        this.optionForm.patchValue({ order: Number(order) + 1 });
        this.load();
      });
  }

  opts(qid: string) {
    return this.optionsByQ[qid] || [];
  }
}
