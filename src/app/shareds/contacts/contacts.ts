import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  DEFAULT_SITE_SETTINGS,
  SiteSettings,
  buildSiteContactViewModel,
} from '@core/site-settings/site-settings.models';

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
  styleUrl: './contacts.css',
})
export class Contacts {
  private readonly formBuilder = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  @Input() siteSettings: SiteSettings = DEFAULT_SITE_SETTINGS;

  readonly messageMaxLength = 1000;

  readonly contactForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120), nameValidator]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
    phone: ['', [Validators.required, Validators.maxLength(15), phoneValidator]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(this.messageMaxLength)]],
    lgpdAccepted: [false, [Validators.requiredTrue]],
  });

  isSubmitting = false;
  isSubmitted = false;
  feedbackMessage = '';
  submittedMessage = '';
  errorMessage = '';

  get messageLength(): number {
    return this.contactForm.controls.message.value.length;
  }

  get contact() {
    return buildSiteContactViewModel(this.siteSettings);
  }

  formatPhoneInput(): void {
    const control = this.contactForm.controls.phone;
    const formatted = formatBrazilianPhone(control.value.replace(/\D/g, '').slice(0, 11));

    if (control.value !== formatted) {
      control.setValue(formatted, { emitEvent: false });
    }
  }

  sendAnotherMessage(): void {
    this.isSubmitted = false;
    this.feedbackMessage = '';
    this.submittedMessage = '';
    this.errorMessage = '';
    this.resetContactForm();
  }

  submitContact(): void {
    this.feedbackMessage = '';
    this.submittedMessage = '';
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
          this.submittedMessage = response.mensagem ?? 'Mensagem enviada com sucesso.';
          this.feedbackMessage = this.submittedMessage;
          this.isSubmitted = true;
          this.resetContactForm();
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

  private resetContactForm(): void {
    this.contactForm.reset({
      name: '',
      email: '',
      phone: '',
      message: '',
      lgpdAccepted: false,
    });
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

function nameValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value?.trim();
  if (!value) {
    return null;
  }

  const lettersOnly = value.replace(/[^\p{L}]/gu, '');

  return lettersOnly.length >= 3 && /^[\p{L}\p{M}' .-]+$/u.test(value) ? null : { name: true };
}

function phoneValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value?.trim();
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D/g, '');

  return digits.length === 10 || digits.length === 11 ? null : { phone: true };
}

function formatBrazilianPhone(digits: string): string {
  if (digits.length <= 2) {
    return digits;
  }

  const areaCode = digits.slice(0, 2);

  if (digits.length <= 6) {
    return `(${areaCode}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${areaCode}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${areaCode}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
