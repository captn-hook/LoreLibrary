'use client';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { token } from '$lib/state/userState.svelte.js';
import {PUBLIC_API_URL} from '$env/static/public';

let currentPath: string[] = [];
let isRoot = false;

if (browser) {
  currentPath = window.location.pathname.split('/');
  isRoot = currentPath.length === 2 && currentPath[1] === '';
}

// Login function
export async function login(username: string, password: string) {
  if (!PUBLIC_API_URL) {
    console.error('PUBLIC_API_URL is not initialized');
    return;
  }
  try {
    const response = await fetch(`${PUBLIC_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.status !== 200) {
      console.error('Failed to log in');
      throw new Error('Failed to log in');
    }

    const data = await response.json();

    if (data.statusCode && data.statusCode !== 200) {
      console.error('Login failed:', data.message);
      return JSON.parse(data.body).message;
    }

    if (browser) {
      token.set(data.token);
      localStorage.setItem('token', data.token);
      goto('/dashboard');
    }
  } catch (error) {
    console.error('Error during login:', error);
    return "Error during login";
  }
}

// Signup function
export async function signup(username: string, email: string, password: string) {
  if (!PUBLIC_API_URL) {
    console.error('PUBLIC_API_URL is not initialized');
    return;
  }

  try {
    const response = await fetch(`${PUBLIC_API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      console.error(response);
      throw new Error('Failed to sign up');

    }

    const data = await response.json();

    if (data.statusCode && data.statusCode !== 200) {
      console.error('Signup failed:', data.message);
      return JSON.parse(data.body).message;
    }

    if (browser) {
      token.set(data.token);
      localStorage.setItem('token', data.token);
      goto('/dashboard');
    }
  } catch (error) {
    console.error('Error during signup:', error);
    return error;
  }
}

// Logout function
export function logout() {
  if (browser) {
    token.set('');
    localStorage.removeItem('token');
    goto('/');
  }
}