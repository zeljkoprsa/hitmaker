import React, { useEffect, useState } from 'react';

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, description, url }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: description,
        url: url || window.location.href,
      });
    }
  };

  if (!isClient || typeof navigator === 'undefined' || !navigator.share) {
    return null;
  }

  return (
    <button 
      onClick={handleShare}
      className="text-[#D9D9D9] hover:text-white transition-colors text-xl"
      aria-label="Share this article"
    >
      Share
    </button>
  );
};

export default ShareButton;

