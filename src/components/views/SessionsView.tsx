import React, { useState } from 'react';

import { PracticeSession } from '../../core/types/SessionTypes';
import SessionEditor from '../LeftSidebar/SessionEditor';
import SessionList from '../LeftSidebar/SessionList';
import StageView from '../StageView';

/** My Sessions as a center-stage view (JAK-50). Owns the list ↔ editor
 *  sub-view (the composer stays nested here). Starting a session switches to
 *  the metronome view via onStartRun. */
export const SessionsView: React.FC<{ onStartRun: () => void }> = ({ onStartRun }) => {
  const [editing, setEditing] = useState<PracticeSession | null | undefined>(undefined);
  // undefined = list; null = new; session = editing that session
  const isEditor = editing !== undefined;

  const backToList = () => setEditing(undefined);

  if (isEditor) {
    return (
      <StageView title={editing ? 'Edit Session' : 'New Session'} onBack={backToList}>
        <SessionEditor session={editing ?? null} onSave={backToList} onCancel={backToList} />
      </StageView>
    );
  }

  return (
    <StageView title="My Sessions">
      <SessionList
        onEdit={s => setEditing(s)}
        onNew={() => setEditing(null)}
        onClose={onStartRun}
      />
    </StageView>
  );
};

export default SessionsView;
