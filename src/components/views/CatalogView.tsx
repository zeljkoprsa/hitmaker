import React, { useState } from 'react';

import { LessonDraft } from '../../context/LessonsContext';
import { Lesson } from '../../core/types/LessonTypes';
import CatalogPanel from '../LeftSidebar/CatalogPanel';
import ImportLessonPanel from '../LeftSidebar/ImportLessonPanel';
import LessonEditor from '../LeftSidebar/LessonEditor';
import StageView from '../StageView';

/** Catalog as a center-stage view (JAK-50). Starting a run from a card
 *  switches to the metronome view via onStartRun (CatalogPanel calls its
 *  onClose when a session/workout/lesson run begins). Lesson authoring
 *  (spec #7) lives here too: New Lesson + per-row edit swap in the editor,
 *  and markdown import (spec #8) parses into a draft that opens in it. */
type Mode =
  | { kind: 'list' }
  | { kind: 'import' }
  | { kind: 'edit'; lesson: Lesson | null; draft?: LessonDraft };

export const CatalogView: React.FC<{ onStartRun: () => void }> = ({ onStartRun }) => {
  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  const backToList = () => setMode({ kind: 'list' });

  if (mode.kind === 'import') {
    return (
      <StageView title="Import Lesson" onBack={backToList}>
        <ImportLessonPanel
          onDraft={draft => setMode({ kind: 'edit', lesson: null, draft })}
          onCancel={backToList}
        />
      </StageView>
    );
  }

  if (mode.kind === 'edit') {
    return (
      <StageView
        title={mode.lesson ? 'Edit Lesson' : mode.draft ? 'Review Import' : 'New Lesson'}
        onBack={backToList}
      >
        <LessonEditor
          lesson={mode.lesson}
          draft={mode.draft}
          onSave={backToList}
          onCancel={backToList}
        />
      </StageView>
    );
  }

  return (
    <StageView title="Catalog">
      <CatalogPanel
        onClose={onStartRun}
        onEditLesson={lesson => setMode({ kind: 'edit', lesson })}
        onNewLesson={() => setMode({ kind: 'edit', lesson: null })}
        onImportLesson={() => setMode({ kind: 'import' })}
      />
    </StageView>
  );
};

export default CatalogView;
