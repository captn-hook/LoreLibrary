import { skeleton } from '@skeletonlabs/tw-plugin';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	plugins: [
		skeleton(),      // Skeleton UI core
		typography       // Tailwind Typography plugin
	],
};
