import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export const name = writable('WINNER');
export const token = writable<string | null>(browser ? (localStorage.getItem('token') || null) : null);
export const showLogin = writable(false);
 