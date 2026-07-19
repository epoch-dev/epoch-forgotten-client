import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { QuestJournalEntryDto } from '../../../src/common/api/.generated';
import { QuestJournalEntryDtoStatusEnum } from '../../../src/common/api/.generated';
import QuestItem from '../../../src/views/journal/components/QuestItem';

const baseEntry = {
    questId: 'prologue:quest/main',
    label: 'Main Quest',
    main: true,
    journalHint: 'Ask around the village.',
    stages: [
        {
            id: 'stage-1',
            objective: 'Find the herbalist',
            description: 'Someone in the village knows more.',
            status: 'active',
            goals: [
                {
                    id: 'goal-1',
                    kind: 'item',
                    label: 'Herb bundle',
                    progress: 0,
                    target: 1,
                    complete: false,
                },
            ],
        },
        {
            id: 'stage-final',
            objective: 'Return home',
            description: 'Bring the herbs back.',
            status: 'completed',
            goals: [],
        },
    ],
} satisfies Omit<QuestJournalEntryDto, 'status' | 'currentStageId' | 'finalStageId'>;

describe('QuestItem', () => {
    it('renders discovered entries as hints without stage history', () => {
        const html = renderToStaticMarkup(
            <QuestItem
                quest={{
                    ...baseEntry,
                    status: QuestJournalEntryDtoStatusEnum.Discovered,
                }}
            />,
        );

        expect(html).toContain('Ask around the village.');
        expect(html).not.toContain('Find the herbalist');
        expect(html).not.toContain('Rewards:');
    });

    it('renders active entries from currentStageId only', () => {
        const html = renderToStaticMarkup(
            <QuestItem
                quest={{
                    ...baseEntry,
                    status: QuestJournalEntryDtoStatusEnum.Active,
                    currentStageId: 'stage-1',
                }}
            />,
        );

        expect(html).toContain('Find the herbalist');
        expect(html).not.toContain('Return home');
        expect(html).toContain('Herb bundle');
    });

    it('renders completed history with all stages', () => {
        const html = renderToStaticMarkup(
            <QuestItem
                quest={{
                    ...baseEntry,
                    status: QuestJournalEntryDtoStatusEnum.Completed,
                    finalStageId: 'stage-final',
                }}
            />,
        );

        expect(html).toContain('Return home');
        expect(html).toContain('Find the herbalist');
    });
});
