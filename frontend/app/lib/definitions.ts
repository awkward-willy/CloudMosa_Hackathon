import { z } from 'zod';

export const SignupFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }).trim(),
  email: z.email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .trim(),
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

// Standard OAuth password grant style response shape (adjust to backend spec)
export interface AuthTokenResponse {
  access_token: string;
  token_type?: string; // e.g. "bearer"
  expires_in?: number; // seconds
  refresh_token?: string; // if backend provides
  scope?: string;
}

