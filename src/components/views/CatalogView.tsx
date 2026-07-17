import React from 'react';

import CatalogPanel from '../LeftSidebar/CatalogPanel';
import StageView from '../StageView';

/** Catalog as a center-stage view (JAK-50). Starting a run from a card
 *  switches to the metronome view via onStartRun (CatalogPanel calls its
 *  onClose when a session/workout/lesson run begins). */
export const CatalogView: React.FC<{ onStartRun: () => void }> = ({ onStartRun }) => (
  <StageView title="Catalog">
    <CatalogPanel onClose={onStartRun} />
  </StageView>
);

export default CatalogView;
