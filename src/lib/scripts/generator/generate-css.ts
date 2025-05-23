// Utility: Generate CSS
// Generates the theme CSS for live previews.

import { formatEdges, formatBackgrounds, formatColors, formatSpacing, formatTypography } from '$lib/scripts/generator/format-output';
import {
	// settingsCore,
	settingsColors,
	settingsBackgrounds,
	settingsTypography,
	settingsSpacing,
	settingsEdges
} from '$lib/state/generator.svelte';
import { oklch, formatHex } from 'culori';

export function generatePreviewCss() {
	const typographyCss = formatTypography(settingsTypography);

	const spacingCss = formatSpacing(settingsSpacing);

	const edgesCss = formatEdges(settingsEdges);

	const backgroundsCss = formatBackgrounds(settingsBackgrounds);

	const colorsCss = formatColors(settingsColors);

	const themeCss = `
${typographyCss}
${spacingCss}
${edgesCss}
${backgroundsCss}
${colorsCss}
`.trim();
	// See root +layout.svelte to reference where this attribute is used
	return `[data-theme="generated"] {\n${themeCss}\n}`;
}


export function updateSettingsFromCurrentStyles() {
    const rootStyles = getComputedStyle(document.documentElement);

    function oklchToHex(oklchValue: string): string {
        try {
            const color = oklch(oklchValue);
            const hex = formatHex(color);
            return hex;
        } catch (error) {
            console.warn(`Failed to convert oklch to hex. Input: ${oklchValue}`, error);
            return '#000001'; // Fallback to black
        }
    }

    // Update settingsColors
    Object.keys(settingsColors).forEach((key) => {
        const typedKey = key as keyof typeof settingsColors;
        let value = rootStyles.getPropertyValue(key).trim();
        if (value) {
            if (value.startsWith('oklch(')) {
                value = oklchToHex(value);
            }
            settingsColors[typedKey] = value;
        }
    });

    // Update settingsBackgrounds
    Object.keys(settingsBackgrounds).forEach((key) => {
        const typedKey = key as keyof typeof settingsBackgrounds;
        let value = rootStyles.getPropertyValue(key).trim();
        if (value) {
            if (value.startsWith('oklch(')) {
                value = oklchToHex(value);
            }
            settingsBackgrounds[typedKey] = value;
        }
    });

    // Update settingsTypography
    Object.keys(settingsTypography).forEach((key) => {
        const typedKey = key as keyof typeof settingsTypography;
        let value = rootStyles.getPropertyValue(key).trim();
        if (value) {
            settingsTypography[typedKey] = value;
        }
    });

    // Update settingsSpacing
    Object.keys(settingsSpacing).forEach((key) => {
        const typedKey = key as keyof typeof settingsSpacing;
        let value = rootStyles.getPropertyValue(key).trim();
        if (value) {
            settingsSpacing[typedKey] = value;
        }
    });

    // Update settingsEdges
    Object.keys(settingsEdges).forEach((key) => {
        const typedKey = key as keyof typeof settingsEdges;
        let value = rootStyles.getPropertyValue(key).trim();
        if (value) {
            settingsEdges[typedKey] = value;
        }
    });

    console.log('Theme settings updated from current styles.');
}
