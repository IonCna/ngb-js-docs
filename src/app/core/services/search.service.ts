import { Inject, Injectable } from "ngjs-core"
import { Language } from "@/core/constants/language.constant"
import type { SearchDocument } from "@/core/constants/search-documents.constant"
import { tokenize } from "@/core/search-index"
import { INDEXING, LANGUAGE, SEARCH_DOCUMENTS } from "@/core/tokens"

const MAX_RESULTS = 8

export interface SearchResult {
    id: string
    url: string
    fragment: string
    title: string
    content: string
}

@Injectable({ id: "docs.search.service" })
export class SearchService {
    private readonly documentsById: Map<string, SearchDocument>

    constructor(
        @Inject(INDEXING) private readonly index: Map<string, Set<string>>,
        @Inject(SEARCH_DOCUMENTS) documents: SearchDocument[],
        @Inject(LANGUAGE) private readonly language: Language,
    ) {
        this.documentsById = new Map(documents.map(document => [document.id, document]))
    }

    public search(query: string): SearchResult[] {
        const terms = tokenize(query)

        if(terms.length !== 1) return []

        const [term] = terms
        const documentIds = new Set<string>(this.index.get(term))

        for (const [indexedTerm, ids] of this.index) {
            if(indexedTerm === term || !indexedTerm.startsWith(term)) continue

            for (const id of ids) {
                documentIds.add(id)
            }
        }

        return [...documentIds].flatMap(id => {
            const document = this.documentsById.get(id)

            if(!document) return []

            const translation = document.translations[this.language]

            return [{
                id: document.id,
                url: document.url,
                fragment: document.fragment,
                title: translation.title,
                content: translation.content,
            }]
        }).slice(0, MAX_RESULTS)
    }
}
