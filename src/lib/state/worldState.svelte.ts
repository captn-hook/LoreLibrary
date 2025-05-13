import { writable } from 'svelte/store';
import type { World } from '$lib/types/world';
import type { Collection } from '$lib/types/collection';
import type { Entry } from '$lib/types/entry';

export const world = writable<World | null>(null);
export const collections = writable<Collection[] | null>(null);
export const entry = writable<Entry | null>(null);