import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SelectTheme from '../../src/lib/components/editComponents/theme/selectTheme.svelte';
import StyleEditor from '../../src/lib/components/editComponents/theme/styleEditor.svelte';
import { expect, test } from 'vitest';
import '@testing-library/jest-dom';

describe('Theme Customization', () => {
    beforeEach((): void => {
        // Reset the document's theme before each test
        document.documentElement.removeAttribute('data-theme');
    });

    test('changes theme when a new theme is selected', async (): Promise<void> => {
        render(SelectTheme);

        // Verify initial theme
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();

        // Select a new theme
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        await userEvent.selectOptions(select, 'rose');

        // Verify the theme is updated
        expect(document.documentElement.getAttribute('data-theme')).toBe('rose');
    });

    test('updates CSS variables when customizer is used', async (): Promise<void> => {
        render(StyleEditor);

        // Verify initial CSS variable
        const rootStyles: CSSStyleDeclaration = getComputedStyle(document.documentElement);
        expect(rootStyles.getPropertyValue('--color-primary-500').trim()).toBe('');

        // Simulate changing a color in the customizer
        const colorInput = screen.getByLabelText(/color/i) as HTMLInputElement;
        await userEvent.type(colorInput, '#ff0000');

        // Verify the CSS variable is updated
        expect(getComputedStyle(document.documentElement).getPropertyValue('--color-primary-500').trim()).toBe('#ff0000');
    });

    test('reflects theme changes in the UI', async (): Promise<void> => {
        render(StyleEditor);

        // Simulate changing the theme
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        await userEvent.selectOptions(select, 'seafoam');

        // Verify the UI reflects the theme change
        const button = screen.getByRole('button');
        expect(button.classList.contains('preset-filled-surface-100-900')).toBe(true);
    });
});

