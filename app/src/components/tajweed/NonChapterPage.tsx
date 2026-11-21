import type { TajweedDataset } from "../../services/tajweedDataService";
import type { DocumentSectionEntity, PersonEntity } from "../../types/entities";
import { entitiesOnPage } from "../../services/tajweedSelectors";
import { BookIntro } from "./BookIntro";
import { DocumentSectionCard, PersonCard } from "./InfoCards";

export interface NonChapterPageProps {
  dataset: TajweedDataset;
  pageNumber: number;
  onShowChapter: (chapterId: string) => void;
}

export function NonChapterPage({ dataset, pageNumber, onShowChapter }: NonChapterPageProps) {
  const pageEntities = entitiesOnPage(dataset, pageNumber);
  const persons = pageEntities.filter((entity): entity is PersonEntity => entity.type === "person");
  const docSections = pageEntities.filter(
    (entity): entity is DocumentSectionEntity => entity.type === "document_section",
  );
  const isTitlePage = docSections.some((doc) => doc.metadata.kind === "title_page");

  if (!persons.length && !docSections.length && !isTitlePage) {
    return <div className="empty-panel-note">لا توجد كيانات مفهرسة على هذه الصفحة بعد.</div>;
  }

  return (
    <>
      {isTitlePage ? <BookIntro dataset={dataset} onShowChapter={onShowChapter} /> : null}
      {persons.length ? (
        <div className="panel-section">
          <div className="panel-section-title">أعلام</div>
          {persons.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : null}
      {docSections.length ? (
        <div className="panel-section">
          <div className="panel-section-title">محتوى هذا القسم</div>
          {docSections.map((docSection) => (
            <DocumentSectionCard key={docSection.id} docSection={docSection} />
          ))}
        </div>
      ) : null}
    </>
  );
}
