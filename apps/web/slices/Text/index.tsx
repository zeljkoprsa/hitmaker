import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";

/**
 * Props for `Text`.
 */
export type TextProps = SliceComponentProps<Content.TextSlice>;

/**
 * Component for "Text" Slices.
 */
const Text = ({ slice }: TextProps) => {
  return (
    <section 
      className="my-6"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <PrismicRichText 
        field={slice.primary.content}
        components={{
          paragraph: ({ children }) => (
            <p className="text-lg mb-4 leading-relaxed text-gray-200">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      />
    </section>
  );
};

export default Text;
