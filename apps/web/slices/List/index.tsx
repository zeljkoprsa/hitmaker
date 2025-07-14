import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";

/**
 * Props for `List`.
 */
export type ListProps = SliceComponentProps<Content.ListSlice>;

/**
 * Component for "List" Slices.
 */
const List = ({ slice }: ListProps) => {
  const listType = slice.primary.list_type || 'bullet';
  const items = ((slice.primary as any).list_items as any[]) || [];
  
  const ListContainer = listType === 'number' ? 'ol' : 'ul';
  const listStyles = listType === 'number' 
    ? "list-decimal pl-10 my-6 space-y-2 text-gray-200" 
    : "list-disc pl-10 my-6 space-y-2 text-gray-200";

  return (
    <section 
      className="my-6"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <ListContainer className={listStyles}>
        {items.map((item, index) => (
          <li key={index} className="text-lg leading-relaxed pl-2">
            <PrismicRichText field={item.item_text} />
          </li>
        ))}
      </ListContainer>
    </section>
  );
};

export default List;
