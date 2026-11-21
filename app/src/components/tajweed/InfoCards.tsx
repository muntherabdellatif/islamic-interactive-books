import type { DefinitionEntity, DocumentSectionEntity, PersonEntity } from "../../types/entities";
import { DOC_SECTION_KIND_AR, PERSON_ROLE_AR } from "../../constants/tajweedLabels";

export function DefinitionCard({ definition }: { definition: DefinitionEntity }) {
  return (
    <div className="card definition-card" data-entity-id={definition.id}>
      <div className="term">{definition.metadata.term}</div>
      <div>{definition.metadata.definition_ar}</div>
    </div>
  );
}

export function PersonCard({ person }: { person: PersonEntity }) {
  const initial = person.metadata.name_ar.trim()[0] ?? "?";
  const roleLabel = PERSON_ROLE_AR[person.metadata.role] ?? person.metadata.role;
  return (
    <div className="card person-card" data-entity-id={person.id}>
      <div className="person-avatar">{initial}</div>
      <div>
        <div className="person-name">{person.metadata.name_ar}</div>
        <div className="person-role">
          {roleLabel}
          {person.metadata.dates ? ` · ${person.metadata.dates}` : ""}
        </div>
      </div>
    </div>
  );
}

export function DocumentSectionCard({ docSection }: { docSection: DocumentSectionEntity }) {
  const kindLabel = DOC_SECTION_KIND_AR[docSection.metadata.kind] ?? docSection.metadata.kind;
  return (
    <div className="card doc-section-card" data-entity-id={docSection.id}>
      <div className="kind">{kindLabel}</div>
      <div className="doc-section-title">{docSection.label_ar}</div>
      <div className="doc-section-summary">{docSection.metadata.summary_ar}</div>
    </div>
  );
}
