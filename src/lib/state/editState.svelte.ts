import {writable} from 'svelte/store';

export const editContent = writable<boolean>(false);
export const showStyleControls = writable<boolean>(false);
export const editComponentContents = writable<any[]>([])
export const showCreateCollection = writable<boolean>(false);
export const showCreateEntry = writable<boolean>(false);