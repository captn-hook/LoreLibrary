import { writable } from 'svelte/store';
import type { World } from '$lib/types/world';

export const world = writable<World | null>(null);
export const worlds = writable([]);