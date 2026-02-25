import styled from '@emotion/styled';
import React from 'react';
import { Link } from 'react-router-dom';

const Page = styled.div`
  min-height: 100dvh;
  background: #242424;
  color: rgba(255, 255, 255, 0.85);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
`;

const Nav = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const BackLink = styled(Link)`
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 150ms ease;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const Content = styled.div`
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 24px 80px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
`;

const LastUpdated = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 40px;
`;

const Section = styled.section`
  margin-bottom: 36px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 12px;
`;

const Body = styled.p`
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const List = styled.ul`
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 12px;
  padding-left: 20px;

  li {
    margin-bottom: 6px;
  }
`;

const ContactLink = styled.a`
  color: #f64105;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const PrivacyPage: React.FC = () => (
  <Page>
    <Nav>
      <BackLink to="/">← Back to Hitmaker</BackLink>
    </Nav>
    <Content>
      <Title>Privacy Policy</Title>
      <LastUpdated>Last updated: February 25, 2026</LastUpdated>

      <Section>
        <SectionTitle>Overview</SectionTitle>
        <Body>
          Hitmaker (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a professional metronome web application. This policy
          explains what information we collect, why we collect it, and how we handle it. We keep
          things simple: we collect only what&apos;s necessary to provide the service.
        </Body>
      </Section>

      <Section>
        <SectionTitle>Information We Collect</SectionTitle>
        <Body>
          <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Account information</strong> — When
          you create an account, we collect your email address and a hashed password (if using
          email/password sign-in). If you sign in with Google, we receive your name, email address,
          and profile picture from Google.
        </Body>
        <Body>
          <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Usage data</strong> — We collect
          anonymous usage events (e.g. features used, session duration) to understand how the app is
          being used and to improve it. This data is not linked to personally identifiable
          information.
        </Body>
        <Body>
          <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Preferences</strong> — Tempo, time
          signature, subdivision, and other settings are stored so your preferences persist across
          sessions.
        </Body>
      </Section>

      <Section>
        <SectionTitle>How We Use Your Information</SectionTitle>
        <List>
          <li>To authenticate you and maintain your session</li>
          <li>To sync your preferences across devices</li>
          <li>To improve the app based on aggregated usage patterns</li>
          <li>To send transactional emails (e.g. password reset), never marketing</li>
        </List>
        <Body>We do not sell your personal data to third parties.</Body>
      </Section>

      <Section>
        <SectionTitle>Third-Party Services</SectionTitle>
        <Body>We use the following third-party services to operate Hitmaker:</Body>
        <List>
          <li>
            <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Supabase</strong> — Authentication
            and database storage. Your account data is stored on Supabase&apos;s infrastructure. See{' '}
            <ContactLink
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Supabase&apos;s Privacy Policy
            </ContactLink>
            .
          </li>
          <li>
            <strong style={{ color: 'rgba(255,255,255,0.85)' }}>PostHog</strong> — Anonymous product
            analytics. Events are processed on EU-based infrastructure. See{' '}
            <ContactLink
              href="https://posthog.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              PostHog&apos;s Privacy Policy
            </ContactLink>
            .
          </li>
          <li>
            <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Google OAuth</strong> — Optional
            sign-in method. Only used if you choose &ldquo;Continue with Google&rdquo;. See{' '}
            <ContactLink
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google&apos;s Privacy Policy
            </ContactLink>
            .
          </li>
        </List>
      </Section>

      <Section>
        <SectionTitle>Cookies &amp; Storage</SectionTitle>
        <Body>
          We use browser cookies and local storage solely for authentication (session tokens) and
          storing your preferences locally. We do not use advertising or tracking cookies.
        </Body>
      </Section>

      <Section>
        <SectionTitle>Data Retention</SectionTitle>
        <Body>
          Your account data is retained for as long as your account is active. You may request
          deletion at any time by contacting us, after which your personal data will be removed
          within 30 days.
        </Body>
      </Section>

      <Section>
        <SectionTitle>Your Rights</SectionTitle>
        <Body>Depending on your location, you may have the right to:</Body>
        <List>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and associated data</li>
          <li>Object to or restrict certain processing</li>
        </List>
        <Body>
          To exercise any of these rights, contact us at{' '}
          <ContactLink href="mailto:hi@tryuseless.com">hi@tryuseless.com</ContactLink>.
        </Body>
      </Section>

      <Section>
        <SectionTitle>Changes to This Policy</SectionTitle>
        <Body>
          We may update this policy from time to time. Significant changes will be communicated via
          the app or by email. Continued use of Hitmaker after changes take effect constitutes
          acceptance of the updated policy.
        </Body>
      </Section>

      <Section>
        <SectionTitle>Contact</SectionTitle>
        <Body>
          Questions about this policy? Reach us at{' '}
          <ContactLink href="mailto:hi@tryuseless.com">hi@tryuseless.com</ContactLink>.
        </Body>
      </Section>
    </Content>
  </Page>
);

export default PrivacyPage;
