import styled from '@emotion/styled';
import React, { useState } from 'react';

import { useAuth } from '../../context/AuthContext';

interface UpgradePromptProps {
  featureName: string;
  onBack: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  text-align: center;
  min-height: 300px;
  gap: 16px;
`;

const LockIcon = styled.div`
  font-size: 40px;
  line-height: 1;
  margin-bottom: 4px;
`;

const FeatureName = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
`;

const Description = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
`;

const Price = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.metronome.primary};
`;

const PriceSub = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.regular};
  color: rgba(255, 255, 255, 0.4);
`;

const UpgradeButton = styled.button<{ isLoading: boolean }>`
  width: 100%;
  background: ${({ theme }) => theme.colors.metronome.accent};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: #fff;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: ${({ isLoading }) => (isLoading ? 'default' : 'pointer')};
  padding: 14px;
  min-height: 48px;
  opacity: ${({ isLoading }) => (isLoading ? 0.7 : 1)};
  transition:
    opacity 150ms ease,
    transform 150ms ease;
  margin-top: 8px;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      opacity: 1;
    }
    &:active {
      opacity: 0.85;
      transform: scale(0.98);
    }
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 8px;
  min-height: 44px;
  transition: color 150ms ease;

  &:hover {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.error};
`;

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ featureName, onBack }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id ?? '',
          email: user?.email ?? '',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to start checkout');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <LockIcon>🔒</LockIcon>
      <FeatureName>{featureName}</FeatureName>
      <Description>Unlock {featureName} and the full practice workflow with Hitmaker Pro.</Description>
      <Price>
        $4.99<PriceSub>/mo</PriceSub>
      </Price>
      <UpgradeButton isLoading={isLoading} onClick={handleUpgrade} disabled={isLoading}>
        {isLoading ? 'Redirecting…' : 'Upgrade to Pro'}
      </UpgradeButton>
      {error && <ErrorText>{error}</ErrorText>}
      <BackButton onClick={onBack}>Maybe later</BackButton>
    </Container>
  );
};

export default UpgradePrompt;
