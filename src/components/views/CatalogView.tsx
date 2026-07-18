import React, { useState } from 'react';

import { Lesson } from '../../core/types/LessonTypes';
import CatalogPanel from '../LeftSidebar/CatalogPanel';
import LessonEditor from '../LeftSidebar/LessonEditor';
import StageView from '../StageView';

/** Catalog as a center-stage view (JAK-50). Starting a run from a card
 *  switches to the metronome view via onStartRun (CatalogPanel calls its
 *  onClose when a session/workout/lesson run begins). Lesson authoring
 *  (spec #7) lives here too: New Lesson + per-row edit swap in the editor. */
export const CatalogView: React.FC<{ onStartRun: () => void }> = ({ onStartRun }) => {
  // undefined = catalog list; null = new lesson; lesson = editing that lesson
  const [editing, setEditing] = useState<Lesson | null | undefined>(undefined);

  const backToList = () => setEditing(undefined);

  if (editing !== undefined) {
    return (
      <StageView title={editing ? 'Edit Lesson' : 'New Lesson'} onBack={backToList}>
        <LessonEditor lesson={editing} onSave={backToList} onCancel={backToList} />
      </StageView>
    );
  }

  return (
    <StageView title="Catalog">
      <CatalogPanel
        onClose={onStartRun}
        onEditLesson={setEditing}
        onNewLesson={() => setEditing(null)}
      />
    </StageView>
  );
};

export default CatalogView;
