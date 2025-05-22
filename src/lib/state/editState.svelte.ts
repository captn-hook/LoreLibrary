import {writable} from 'svelte/store';

export const editContent = writable<boolean>(false);
export const showStyleControls = writable<boolean>(false);
export const editComponentContents = writable<any[]>([])
