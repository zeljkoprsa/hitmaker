import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps, PrismicRichText } from "@prismicio/react";

/**
 * Props for `Quote`.
 */
export type QuoteProps = SliceComponentProps<Content.QuoteSlice>;

/**
 * Component for "Quote" Slices.
 */
const Quote: FC<QuoteProps> = ({ slice }) => {
  return (
    <section 
      className="my-10"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <blockquote className="border-l-4 border-gray-600 pl-6 py-2 my-8">
        <div className="text-xl italic font-light text-gray-100">
          <PrismicRichText field={slice.primary.quote_text} />
        </div>
        
        {slice.primary.attribution && (
          <footer className="mt-2 text-right text-gray-400">
            — {slice.primary.attribution}
          </footer>
        )}
      </blockquote>
    </section>
  );
};

export default Quote;
