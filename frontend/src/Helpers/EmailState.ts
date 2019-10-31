import { Set } from 'immutable';

export type EmailValidation<T> = 'email' | 'privacy' | T;

export interface EmailState<T> {
  email: string;
  isPrivacyPolicyAccepted: boolean;
  validationMessages: Set<EmailValidation<T>>;
}
