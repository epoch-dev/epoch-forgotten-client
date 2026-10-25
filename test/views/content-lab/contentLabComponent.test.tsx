import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { previewBundleFixture } from '../../fixtures/previewBundle';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;

const mocks = vi.hoisted(() => ({
    loadPreviewBundle: vi.fn(),
}));

vi.mock('../../../src/content/loader', () => ({
    loadPreviewBundle: mocks.loadPreviewBundle,
}));

vi.mock('../../../src/content/assets', () => ({
    checkAssetInventory: vi.fn(),
}));

vi.mock('../../../src/views/content-lab/SceneMapPreview', () => ({
    SceneMapPreview: () => <div />,
}));

import { ContentLabComponent } from '../../../src/views/content-lab/ContentLabComponent';

let container: HTMLDivElement;
let root: Root;

describe('ContentLabComponent', () => {
    beforeEach(() => {
        mocks.loadPreviewBundle.mockReset().mockResolvedValue({
            kind: 'loaded',
            bundle: previewBundleFixture,
        });
    });

    afterEach(async () => {
        if (root) {
            await act(async () => root.unmount());
        }
        container?.remove();
    });

    it('derives the first catalog entries and displays compiler report issues', async () => {
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);

        await act(async () => {
            root.render(<ContentLabComponent />);
            await Promise.resolve();
        });

        expect(container.textContent).toContain('Server report issues');
        expect(container.textContent).toContain('balance-budget');

        const scenes = Array.from(container.querySelectorAll('button')).find(
            (button) => button.textContent === 'Scenes',
        );
        if (!scenes) {
            throw new Error('Scenes navigation button was not rendered');
        }
        await act(async () => {
            scenes.click();
        });

        const sceneSelector = container.querySelector('select');
        expect(sceneSelector?.value).toBe('core:scene/test');
    });
});
