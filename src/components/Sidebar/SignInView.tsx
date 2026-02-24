import styled from '@emotion/styled';
import React, { useState } from 'react';

import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';

type AuthView = 'signin' | 'signup' | 'forgot';

interface SignInViewProps {
  onClose: () => void;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 4px;
  margin-bottom: 4px;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  background: ${({ active }) => (active ? 'rgba(255,255,255,0.08)' : 'none')};
  border: none;
  padding: 8px;
  color: ${({ active }) =>
    active ? 'var(--color-text-primary, #dddddd)' : 'rgba(255,255,255,0.4)'};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  transition:
    color 150ms ease,
    background-color 150ms ease;
  min-height: 36px;

  &:hover {
    color: var(--color-text-primary, #dddddd);
  }
`;

const ViewTitle = styled.h3`
  margin: 0 0 16px;
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    color: rgba(255, 255, 255, 0.6);
    font-size: ${({ theme }) => theme.typography.fontSizes.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  }

  input {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: ${({ theme }) => theme.borders.radius.md};
    padding: 10px 12px;
    color: ${({ theme }) => theme.colors.metronome.primary};
    font-size: ${({ theme }) => theme.typography.fontSizes.sm};
    font-family: ${({ theme }) => theme.typography.fontFamily.base};
    outline: none;
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
    min-height: 44px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.25);
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.metronome.accent};
      box-shadow: 0 0 0 2px rgba(246, 65, 5, 0.15);
    }
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.metronome.accent} 0%,
    #d63a04 100%
  );
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 12px;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 150ms ease;
  box-shadow: 0 4px 12px rgba(246, 65, 5, 0.25);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 8px 0;
  text-align: center;
  transition: color 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

const ErrorBox = styled.div`
  background: rgba(255, 77, 79, 0.08);
  border: 1px solid rgba(255, 77, 79, 0.25);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: var(--color-error, #ff4d4f);
  padding: 10px 12px;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
`;

const MessageBox = styled.div`
  background: rgba(82, 196, 26, 0.08);
  border: 1px solid rgba(82, 196, 26, 0.25);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: var(--color-success, #52c41a);
  padding: 10px 12px;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
`;

const Spinner = styled.span`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  display: inline-block;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SignInView: React.FC<SignInViewProps> = ({ onClose }) => {
  const [view, setView] = useState<AuthView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleViewChange = (newView: AuthView) => {
    setView(newView);
    setError(null);
    setMessage(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast('Successfully signed in', 'success');
        onClose();
      } else if (view === 'signup') {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && data.session === null) {
          setMessage('Check your email for the confirmation link.');
          showToast('Account created! Please verify your email.', 'info');
        } else {
          showToast('Account created successfully', 'success');
          onClose();
        }
      } else if (view === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        });
        if (error) throw error;
        setMessage('Check your email for the password reset link.');
        showToast('Password reset link sent', 'success');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (view === 'signup') return 'Create Account';
    if (view === 'forgot') return 'Reset Password';
    return 'Welcome Back';
  };

  const getSubmitLabel = () => {
    if (loading) return <Spinner />;
    if (view === 'signup') return 'Create Account';
    if (view === 'forgot') return 'Send Reset Link';
    return 'Sign In';
  };

  return (
    <>
      {view !== 'forgot' && (
        <Tabs>
          <Tab active={view === 'signin'} onClick={() => handleViewChange('signin')}>
            Sign In
          </Tab>
          <Tab active={view === 'signup'} onClick={() => handleViewChange('signup')}>
            Sign Up
          </Tab>
        </Tabs>
      )}

      <ViewTitle>{getTitle()}</ViewTitle>

      <Form onSubmit={handleAuth}>
        <InputGroup>
          <label htmlFor="sidebar-email">Email</label>
          <input
            id="sidebar-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoComplete="email"
          />
        </InputGroup>

        {view !== 'forgot' && (
          <InputGroup>
            <label htmlFor="sidebar-password">Password</label>
            <input
              id="sidebar-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
            />
          </InputGroup>
        )}

        {error && <ErrorBox>{error}</ErrorBox>}
        {message && <MessageBox>{message}</MessageBox>}

        <SubmitButton type="submit" disabled={loading}>
          {getSubmitLabel()}
        </SubmitButton>
      </Form>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        {view === 'signin' && (
          <LinkButton onClick={() => handleViewChange('forgot')}>Forgot password?</LinkButton>
        )}
        {view === 'forgot' && (
          <LinkButton onClick={() => handleViewChange('signin')}>Back to sign in</LinkButton>
        )}
      </div>
    </>
  );
};

export default SignInView;
