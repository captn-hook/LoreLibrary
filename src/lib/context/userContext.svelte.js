import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export const name = writable('WINNER');
export const token = writable(browser ? localStorage.getItem('token') || '' : '');

// Subscribe to the token store to keep localStorage in sync
if (browser) {
    token.subscribe((value) => {
        if (value) {
            localStorage.setItem('token', value);
        } else {
            localStorage.removeItem('token');
        }
    });
}

// Login function
export function login(tokenValue) {
    console.log('Logging in with token:', tokenValue);
    if (browser) {
        token.set(tokenValue);
        goto('/dashboard');
    }
}

// Logout function
export function logout() {
    console.log('Logging out');
    if (browser) {
        token.set('');
        goto('/');
    }
}