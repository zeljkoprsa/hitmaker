import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {
  minimal?: boolean;
}

const Footer: React.FC<FooterProps> = ({ minimal = false }) => {
  return (
    <footer className={`${minimal ? '' : 'mt-24'} bg-useless-dark ${!minimal ? 'border-t border-gray-800' : ''}`}>
      <div className={`${minimal ? 'max-w-2xl' : 'max-w-xl'} mx-auto px-4 sm:px-6 py-12`}>
        {minimal ? (
          <div className="flex justify-between items-center">
            <Link href="/" className="md:-ml-16">
              <Image
                src="/images/tryuseless-logo.png"
                alt="tryuseless"
                width={125}
                height={20}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
            </Link>
            {/* share functionality removed */}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center">
            {new Date().getFullYear()} · useless is nothing
          </p>
        )}
      </div>
    </footer>
  );
};

export default Footer;
