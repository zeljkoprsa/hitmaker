import { FC, ReactNode } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `Heading`.
 */
export type HeadingProps = SliceComponentProps<Content.HeadingSlice>;

/**
 * Component for "Heading" Slices.
 */
const Heading = ({ slice }: HeadingProps) => {
  const level = slice.primary.level || 'h2';
  const headingText = slice.primary.heading_text || '';
  
  const baseStyle = "font-bold text-white mt-10 mb-6";
  const styles = {
    h2: `text-3xl ${baseStyle}`,
    h3: `text-2xl ${baseStyle}`,
    h4: `text-xl ${baseStyle}`,
  };
  
  const HeadingTag = ({ children, className }: { children: React.ReactNode, className: string }) => {
    switch (level) {
      case 'h3':
        return <h3 className={className}>{children}</h3>;
      case 'h4':
        return <h4 className={className}>{children}</h4>;
      case 'h2':
      default:
        return <h2 className={className}>{children}</h2>;
    }
  };

  return (
    <section 
      className="my-4"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <HeadingTag className={styles[level]}>
        {headingText}
      </HeadingTag>
    </section>
  );
};

export default Heading;
