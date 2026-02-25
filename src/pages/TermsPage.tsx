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

const TermsPage: React.FC = () => (
  <Page>
    <Nav>
      <BackLink to="/">← Back to Hitmaker</BackLink>
    </Nav>
    <Content>
      <Title>Terms of Service</Title>
      <LastUpdated>Last updated: February 25, 2026</LastUpdated>

      <Section>
        <SectionTitle>Acceptance of Terms</SectionTitle>
        <Body>
          By accessing or using Hitmaker (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of
          Service. If you do not agree to these terms, please do not use the Service.
        </Body>
      </Section>

      <Section>
        <SectionTitle>Description of Service</SectionTitle>
        <Body>
          Hitmaker is a professional metronome web application designed to assist musicians with
          tempo practice and rhythm training. The Service is provided as-is and may be updated,
          modified, or discontinued at any time.
        </Body>
      </Section>

      <Section>
        <SectionTitle>Account Registration</SectionTitle>
        <Body>
          You may use Hitmaker without an account. Creating an account allows your preferences and
          practice sessions to be saved and synced across devices. You are responsible for
          maintaining the confidentiality of your account credentials and for all activity that
          occurs under your account.
        </Body>
        <Body>
          You must be at least 13 years old to create an account. By registering, you confirm that
          you meet this requirement.
        </Body>
      </Section>

      <Section>
        <SectionTitle>Acceptable Use</SectionTitle>
        <Body>You agree not to:</Body>
        <List>
          <li>Use the Service for any unlawful purpose</li>
          <li>Attempt to gain unauthorized access to any part of the Service</li>
          <li>Interfere with or disrupt the integrity or performance of the Service</li>
          <li>Create accounts by automated means or under false pretenses</li>
          <li>Reverse engineer or attempt to extract the source code of the Service</li>
        </List>
      </Section>

      <Section>
        <SectionTitle>Intellectual Property</SectionTitle>
        <Body>
          All content, design, and code comprising the Service is the property of Hitmaker and is
          protected by applicable intellectual property laws. You may not copy, modify, distribute,
          or create derivative works without prior written consent.
        </Body>
      </Section>

      <Section>
        <SectionTitle>Disclaimer of Warranties</SectionTitle>
        <Body>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either
          express or implied. We do not warrant that the Service will be uninterrupted, error-free,
          or free of harmful components.
        </Body>
      </Section>

      <Section>
        <SectionTitle>Limitation of Liability</SectionTitle>
        <Body>
          To the fullest extent permitted by law, Hitmaker shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of or
          inability to use the Service, even if we have been advised of the possibility of such
          damages.
        </Body>
      </Section>

      <Section>
        <SectionTitle>Termination</SectionTitle>
        <Body>
          We reserve the right to suspend or terminate your access to the Service at our discretion,
          without notice, for conduct that we believe violates these Terms or is otherwise harmful
          to other users, us, or third parties.
        </Body>
        <Body>
          You may delete your account at any time. Upon deletion, your personal data will be removed
          in accordance with our{' '}
          <Link to="/privacy" style={{ color: '#f64105', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          .
        </Body>
      </Section>

      <Section>
        <SectionTitle>Changes to These Terms</SectionTitle>
        <Body>
          We may revise these Terms from time to time. The updated version will be indicated by the
          &ldquo;Last updated&rdquo; date above. Continued use of the Service after changes take effect
          constitutes your acceptance of the revised Terms.
        </Body>
      </Section>

      <Section>
        <SectionTitle>Contact</SectionTitle>
        <Body>
          Questions about these Terms? Contact us at{' '}
          <ContactLink href="mailto:hi@tryuseless.com">hi@tryuseless.com</ContactLink>.
        </Body>
      </Section>
    </Content>
  </Page>
);

export default TermsPage;
