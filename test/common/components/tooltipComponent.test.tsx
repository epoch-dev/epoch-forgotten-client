import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { TooltipComponent } from '../../../src/common/components/TooltipComponent';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;

let container: HTMLDivElement;
let root: Root;

async function mount(): Promise<void> {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
        root.render(
            <TooltipComponent hint="More information">
                <span>Details</span>
            </TooltipComponent>,
        );
    });
}

describe('TooltipComponent', () => {
    afterEach(async () => {
        if (root) {
            await act(async () => root.unmount());
        }
        container?.remove();
    });

    it('provides a keyboard trigger, descriptive tooltip, and Escape dismissal', async () => {
        await mount();
        const trigger = container.firstElementChild;
        if (!(trigger instanceof HTMLDivElement)) {
            throw new Error('Tooltip trigger was not rendered');
        }

        await act(async () => {
            trigger.focus();
        });

        const tooltip = container.querySelector('[role="tooltip"]');
        if (!(tooltip instanceof HTMLDivElement)) {
            throw new Error('Tooltip was not shown on focus');
        }
        expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);

        await act(async () => {
            trigger.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
        });

        expect(container.querySelector('[role="tooltip"]')).toBeNull();
    });
});
