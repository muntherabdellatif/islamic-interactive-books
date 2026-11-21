import type { BookType, BookTypeInfo } from "../../types/book";

export interface BookTypeFilterProps {
  types: readonly BookTypeInfo[];
  activeType: BookType | null;
  onSelectType: (type: BookType | null) => void;
}

export function BookTypeFilter({ types, activeType, onSelectType }: BookTypeFilterProps) {
  return (
    <div className="book-type-filter">
      <button type="button" className={activeType === null ? "active" : ""} onClick={() => onSelectType(null)}>
        جميع التصنيفات
      </button>
      {types.map((type) => (
        <button
          key={type.id}
          type="button"
          className={activeType === type.id ? "active" : ""}
          onClick={() => onSelectType(type.id)}
          title={type.interactiveIdeaAr}
        >
          {type.titleAr}
        </button>
      ))}
    </div>
  );
}
