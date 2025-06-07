import React from 'react';

interface BlogHeaderProps {
  title: string;
  date: string;
  readingTime: number;
  description?: string;
}

const BlogHeader: React.FC<BlogHeaderProps> = ({ title, date, readingTime, description }) => {
  return (
    <div className="mb-16">
      <div className="flex gap-3 text-[#666666] text-base mb-8">
        <time>{new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</time>
        <span>|</span>
        <div>{readingTime} min read</div>
      </div>
      <h1 className="text-white mb-4 text-5xl">{title}</h1>
      {description && (
        <div className="border-b border-[#333333] pb-8">
          <p className="text-[26px] mt-2 text-[#D9D9D9] italic">{description}</p>
        </div>
      )}
    </div>
  );
};

export default BlogHeader;

