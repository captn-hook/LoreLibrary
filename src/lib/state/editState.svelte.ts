import {writable} from 'svelte/store';

export const showStyleControls = writable(false);
export const editComponentContents = writable<any[]>([])