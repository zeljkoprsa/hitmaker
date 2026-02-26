import styled from '@emotion/styled';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 12px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  min-height: 44px;
  transition:
    background 150ms ease,
    border-color 150ms ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.25);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SignInView: React.FC<SignInViewProps> = ({ onClose }) => {
  const [view, setView] = useState<AuthView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      setGoogleLoading(false);
    }
  };

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

      {view !== 'forgot' && (
        <>
          <GoogleButton type="button" onClick={handleGoogleSignIn} disabled={googleLoading}>
            {googleLoading ? (
              <Spinner />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </GoogleButton>
          <Divider>or</Divider>
        </>
      )}

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

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link
            to="/privacy"
            target="_blank"
            style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', textDecoration: 'none' }}
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            target="_blank"
            style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', textDecoration: 'none' }}
          >
            Terms of Service
          </Link>
        </div>
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
