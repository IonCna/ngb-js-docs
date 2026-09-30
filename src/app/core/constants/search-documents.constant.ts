import { documents as rawDocuments } from "@/assets/documents/index.json"
import type { Language } from "@/core/constants/language.constant"

export interface SearchDocumentTranslation {
    title: string
    content: string
}

export interface SearchDocument {
    id: string
    url: string
    fragment: string
    translations: Record<Language, SearchDocumentTranslation>
}

export const documents = rawDocuments as SearchDocument[]
