import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";

/**
 * Props for `Image`.
 */
export type ImageProps = SliceComponentProps<Content.ImageSlice>;

/**
 * Component for "Image" Slices.
 */
const Image: FC<ImageProps> = ({ slice }) => {
  const { image, caption, size = 'medium' } = slice.primary;
  
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'w-full',
  };
  
  if (!image?.url) {
    return null;
  }

  return (
    <section 
      className="my-8"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <figure className={`mx-auto ${sizeClasses[size]}`}>
        <PrismicNextImage 
          field={image} 
          className="rounded-md"
          imgixParams={{ auto: ['compress'], fit: 'max' }}
        />
        
        {caption && (
          <figcaption className="text-sm text-gray-400 text-center mt-2 italic">
            {caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
};

export default Image;
