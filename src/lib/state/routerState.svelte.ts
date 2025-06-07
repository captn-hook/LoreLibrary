import {writable} from 'svelte/store';
import {RouterItem} from '../types/routerItem';

export const routerItems = writable<RouterItem[]>([]);