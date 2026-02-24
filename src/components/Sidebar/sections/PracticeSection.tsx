import styled from '@emotion/styled';
import React from 'react';

import { SectionHeader } from '../styles';

const PlaceholderCard = styled.div`
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  text-align: center;
`;

const ComingSoon = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.25);
  font-style: italic;
`;

const PracticeSection: React.FC = () => {
  return (
    <>
      <SectionHeader>Practice Sessions</SectionHeader>
      <PlaceholderCard>
        <ComingSoon>Coming soon</ComingSoon>
      </PlaceholderCard>
    </>
  );
};

export default PracticeSection;
