'use client';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { token } from '$lib/context/userContext.svelte.js';
import { get } from 'svelte/store';
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

  fetch(`${PUBLIC_API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to log in');
      }
      return response.json();
    })
    .then((data) => {
      if (browser) {
        token.set(data.token);
        localStorage.setItem('token', data.token);
        goto('/dashboard');
      }
    })
    .catch((error) => {
      console.error('Error during login:', error);
    });
}

// Signup function
export async function signup(username: string, password: string) {
  if (!PUBLIC_API_URL) {
    console.error('PUBLIC_API_URL is not initialized');
    return;
  }

  fetch(`${PUBLIC_API_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to sign up');
      }
      return response.json();
    })
    .then((data) => {
      if (browser) {
        token.set(data.token);
        localStorage.setItem('token', data.token);
        goto('/dashboard');
      }
    })
    .catch((error) => {
      console.error('Error during signup:', error);
    });
}

// Logout function
export function logout() {
  console.log('Logging out');
  if (browser) {
    token.set('');
    localStorage.removeItem('token');
    goto('/');
  }
}