import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  UntypedFormControl,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { PublicService } from '../../services/public.service';

@Component({
  selector: 'app-public-survey',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSliderModule,
  ],
  templateUrl: './public-survey.html',
  styleUrls: ['./public-survey.scss'],
})
export class PublicSurvey implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(PublicService);
  private fb = inject(UntypedFormBuilder);

  publicId = '';
  surveyId = '';
  title = '';
  questions: any[] = [];
  responseId = signal('');
  loading = signal(false);

  form: UntypedFormGroup = this.fb.group({});

  ngOnInit() {
    this.publicId = this.route.snapshot.paramMap.get('publicId') || '';
    this.api.meta(this.publicId).subscribe((m) => {
      this.surveyId = m.id;
      this.title = m.title;
    });
    this.api.tree(this.publicId).subscribe((qs) => {
      this.questions = qs;
      const group: Record<string, UntypedFormControl> = {};
      qs.forEach((q) => (group[q.id] = new UntypedFormControl(null)));
      this.form = this.fb.group(group);
    });
  }

  control(id: string): UntypedFormControl {
    return this.form.get(id) as UntypedFormControl;
  }

  value(id: string): any {
    const c = this.form.get(id);
    return c ? c.value : null;
  }

  submit() {
    if (!this.surveyId || !this.questions?.length) return;
    const answers = this.questions.map((q) => {
      const v = this.value(q.id);
      if (q.type === 'SCALE') return { type: 'SCALE', questionId: q.id, value: Number(v ?? 0) };
      if (q.type === 'SINGLE') return { type: 'SINGLE', questionId: q.id, optionIds: v ? [v] : [] };
      return {};
    });
    this.loading.set(true);
    this.api.submit({ surveyId: this.surveyId, answers, meta: { source: 'frontend' } }).subscribe({
      next: (r) => {
        this.responseId.set(r.id);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
