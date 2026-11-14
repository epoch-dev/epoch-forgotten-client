import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import style from '../../../src/views/content-lab/ContentLabComponent.module.scss';
import { PreviewItemCard } from '../../../src/views/content-lab/PreviewCards';

describe('PreviewCards', () => {
    it('binds preview cards to the Content Lab CSS module class', () => {
        const html = renderToStaticMarkup(
            <PreviewItemCard
                definition={{
                    id: 'core:item/test-potion',
                    label: 'Test Potion',
                    imageUri: 'items/potion.png',
                    rarity: 'Common',
                    type: 'Consumable',
                    price: 12,
                }}
            />,
        );

        expect(style.contentLabCard).toBeTruthy();
        expect(html).toContain(`class="${style.contentLabCard}"`);
        expect(html).not.toContain('class="contentLabCard"');
    });
});
