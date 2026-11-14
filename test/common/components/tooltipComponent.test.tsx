import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TooltipComponent } from '../../../src/common/components/TooltipComponent';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;

let container: HTMLDivElement;
let root: Root;

async function mount(onParentKeyDown = vi.fn()): Promise<HTMLButtonElement> {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
        root.render(
            <section onKeyDown={onParentKeyDown}>
                <TooltipComponent hint="Deals fire damage">
                    <button>Fireball</button>
                </TooltipComponent>
            </section>,
        );
    });
    return container.querySelector('button')!;
}

const getTooltip = () => container.querySelector('[role="tooltip"]');

const pressEscape = (target: HTMLElement) =>
    act(async () => {
        target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    });

describe('TooltipComponent', () => {
    afterEach(async () => {
        await act(async () => root.unmount());
        container.remove();
    });

    it('shows on focus, describes the focused control, and hides on blur', async () => {
        const button = await mount();

        await act(async () => button.focus());

        const tooltip = getTooltip();
        expect(tooltip?.textContent).toBe('Deals fire damage');
        expect(button.getAttribute('aria-describedby')).toBe(tooltip?.id);
        expect((tooltip as HTMLElement).style.top).toMatch(/px$/);

        await act(async () => button.blur());

        expect(getTooltip()).toBeNull();
        expect(button.hasAttribute('aria-describedby')).toBe(false);
    });

    it('dismisses a visible tooltip on Escape without letting it reach parents', async () => {
        const onParentKeyDown = vi.fn();
        const button = await mount(onParentKeyDown);
        await act(async () => button.focus());

        await pressEscape(button);

        expect(getTooltip()).toBeNull();
        expect(document.activeElement).toBe(button);
        expect(onParentKeyDown).not.toHaveBeenCalled();
    });

    it('lets Escape reach parent handlers when the tooltip is hidden', async () => {
        const onParentKeyDown = vi.fn();
        const button = await mount(onParentKeyDown);
        await act(async () => button.focus());
        await pressEscape(button);

        await pressEscape(button);

        expect(onParentKeyDown).toHaveBeenCalledTimes(1);
    });

    it('adds no tab stops of its own', async () => {
        const button = await mount();
        await act(async () => button.focus());

        expect(container.querySelectorAll('[tabindex]')).toHaveLength(0);
    });
});
