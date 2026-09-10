import type { Language } from "@/core/constants/language.constant"
import type { SearchDocument } from "@/core/constants/search-documents.constant"

/** Normaliza texto a términos de búsqueda (camelCase → palabras, sin puntuación). */
export function tokenize(text: string): string[] {
    return text
        .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2")
        .toLowerCase()
        .replace(/[^\p{L}\s]/gu, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
}

/** Índice invertido término → ids de documento, para el idioma dado. */
export function buildSearchIndex(
    language: Language,
    documents: SearchDocument[],
): Map<string, Set<string>> {
    const data = new Map<string, Set<string>>()

    for (const current of documents) {
        const context = current.translations[language]

        for (const chunk of tokenize(Object.values(context).join(" "))) {
            if (!chunk) continue

            const existing = data.get(chunk)

            if (existing) existing.add(current.id)
            else data.set(chunk, new Set<string>([current.id]))
        }
    }

    return data
}
