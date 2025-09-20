'use server';

import { AuthTokenResponse, FormState, SignupFormSchema } from '@/app/lib/definitions';

import { redirect } from 'next/navigation';

import { createSession, deleteSession } from '../lib/session';

export async function signup(state: FormState, formData: FormData) {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Call the provider or db to create a user...
  const { name, email, password } = validatedFields.data;
  // e.g. Hash the user's password before storing it
  // const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Creating user with:', {
    username: name,
    email: email,
    password: password,
  });

  // 3. Insert the user into the database or call an Auth Library's API
  const baseURL = process.env.BASE_URL;
  const res = await fetch(`${baseURL}/api/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: name,
      email: email,
      password: password,
    }),
  });

  if (!res.ok) {
    console.error('Error response:', await res.text());
    return {
      message: 'An error occurred while creating your account.',
    };
  }
  const data = await res.json();

  const user = data;

  if (!user) {
    return {
      message: 'An error occurred while creating your account.',
    };
  }

  // 5. Redirect user
  redirect('/login');
}

export async function login(state: FormState, formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  if (typeof username !== 'string' || typeof password !== 'string') {
    return { message: 'Invalid form submission.' };
  }

  const baseURL = process.env.BASE_URL;
  const res = await fetch(`${baseURL}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      username: username,
      password: password,
    }),
  });

  if (!res.ok) {
    return { message: 'Invalid username or password.' };
  }

  const tokenJson: AuthTokenResponse = await res.json();

  if (!tokenJson.access_token) {
    return { message: 'Login failed: missing access token.' };
  }

  await createSession(tokenJson.access_token, tokenJson.expires_in);
  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

