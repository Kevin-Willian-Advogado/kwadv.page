import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

interface ContactSubmitResponse {
  mensagem?: string;
  error?: string;
  erro?: string;
  message?: string;
}

interface ContactSubmitPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
  lgpdAccepted: boolean;
}

const SUPABASE_BASE_URL = 'https://wwwntzwmvjvivputmlqg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_EREcwSKRXkRIRknqHOMh0g_FyIU7He0';

@Component({
  selector: 'app-contacts',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacts.html',
})
export class Contacts {
  private readonly formBuilder = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  readonly contactForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(160)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
    phone: ['', [Validators.required, Validators.maxLength(60), phoneValidator]],
    message: ['', [Validators.required, Validators.maxLength(4000)]],
    lgpdAccepted: [false, [Validators.requiredTrue]],
  });

  isSubmitting = false;
  feedbackMessage = '';
  errorMessage = '';

  submitContact(): void {
    this.feedbackMessage = '';
    this.errorMessage = '';
    this.contactForm.markAllAsTouched();

    if (this.contactForm.invalid) {
      this.errorMessage = 'Revise os campos antes de enviar.';
      return;
    }

    this.isSubmitting = true;

    this.http
      .post<ContactSubmitResponse>(
        `${SUPABASE_BASE_URL}/functions/v1/mensagens-contato`,
        this.buildPayload(),
        { headers: this.getHeaders() },
      )
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: (response) => {
          this.feedbackMessage = response.mensagem ?? 'Mensagem enviada com sucesso.';
          this.contactForm.reset({
            name: '',
            email: '',
            phone: '',
            message: '',
            lgpdAccepted: false,
          });
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'Nao foi possivel enviar sua mensagem.';
          console.error('Erro ao enviar contato:', error);
        },
      });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
    });
  }

  private buildPayload(): ContactSubmitPayload {
    const rawValue = this.contactForm.getRawValue();

    return {
      name: rawValue.name.trim(),
      email: rawValue.email.trim().toLowerCase(),
      phone: rawValue.phone.trim(),
      message: rawValue.message.trim(),
      lgpdAccepted: rawValue.lgpdAccepted,
    };
  }

  private extractErrorMessage(error: unknown): string {
    if (!error || typeof error !== 'object') {
      return '';
    }

    const record = error as Record<string, unknown>;
    const nested = record['error'];

    if (typeof nested === 'string' && nested.trim()) {
      return nested.trim();
    }

    if (nested && typeof nested === 'object') {
      const nestedRecord = nested as Record<string, unknown>;
      const nestedMessage = [
        nestedRecord['message'],
        nestedRecord['error'],
        nestedRecord['erro'],
      ]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .join(' ');

      if (nestedMessage) {
        return nestedMessage;
      }
    }

    return [
      record['message'],
      record['error'],
      record['erro'],
    ]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .join(' ');
  }
}

function phoneValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value?.trim();
  if (!value) {
    return null;
  }

  return /^[+()\d\s-]{8,60}$/.test(value) ? null : { phone: true };
}
