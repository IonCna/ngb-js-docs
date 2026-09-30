import { Component, ElementRef, Input, type AfterViewInit, type OnInit } from "ngjs-core";
import { Router } from "ngjs-core/router";
import type { NgbActiveModal } from "ngb-js/modal";
import { SearchService, type SearchResult } from "@/core/services/search.service"

export const SEARCH_RECENTS_STORAGE_KEY = "docs.search.recents"
export const MAX_RECENT_DOCUMENTS = 10

@Component({
    selector: "docs-search-modal",
    templateUrl: "./search-modal.component.html",
    styleUrl: "./search-modal.component.css",
})
export class SearchModalComponent implements OnInit, AfterViewInit {
    @Input() ngbActiveModal!: NgbActiveModal
    public query = ""
    public results: SearchResult[] = []
    public recentDocuments: SearchResult[] = []
    public activeDocumentId?: string

    constructor(
        private readonly searchService: SearchService,
        private readonly elementRef: ElementRef<HTMLElement>,
        private readonly router: Router,
    ) {}

    public ngOnInit() {
        this.recentDocuments = this.getRecentDocuments()
        this.activeDocumentId = this.recentDocuments[0]?.id
    }

    public ngAfterViewInit() {
        this.elementRef.nativeElement.classList.add("h-100", "d-flex", "flex-column", "overflow-hidden")
    }

    public search() {
        this.results = this.searchService.search(this.query)
        this.activeDocumentId = this.visibleDocuments[0]?.id
    }

    public handleKeydown(event: KeyboardEvent) {
        if(event.key === "Enter") {
            const activeDocument = this.visibleDocuments.find(document => document.id === this.activeDocumentId)

            if(!activeDocument) return

            event.preventDefault()
            this.selectDocument(activeDocument)
            return
        }

        if(event.key !== "ArrowDown" && event.key !== "ArrowUp") return

        const documents = this.visibleDocuments

        if(!documents.length) return

        event.preventDefault()

        const currentIndex = documents.findIndex(document => document.id === this.activeDocumentId)
        const nextIndex = event.key === "ArrowDown"
            ? (currentIndex + 1) % documents.length
            : (currentIndex <= 0 ? documents.length - 1 : currentIndex - 1)

        this.activeDocumentId = documents[nextIndex].id
        requestAnimationFrame(() => {
            this.elementRef.nativeElement.querySelector(".list-group-item.active")?.scrollIntoView({ block: "nearest" })
        })
    }

    public activateDocument(document: SearchResult) {
        this.activeDocumentId = document.id
    }

    public selectDocument(document: SearchResult) {
        this.ngbActiveModal.close(document)
        void this.router.navigateByUrl(document.url).then(() => {
            requestAnimationFrame(() => {
                globalThis.document
                    .getElementById(document.fragment)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
            })
        })
    }

    public clearRecentDocuments() {
        localStorage.removeItem(SEARCH_RECENTS_STORAGE_KEY)
        this.recentDocuments = []
        this.activeDocumentId = this.results[0]?.id
    }

    private get visibleDocuments(): SearchResult[] {
        const documents = this.query
            ? [...this.results, ...this.recentDocuments.slice(0, 2)]
            : this.recentDocuments
        const ids = new Set<string>()

        return documents.filter(document => {
            if(ids.has(document.id)) return false
            ids.add(document.id)
            return true
        })
    }

    private getRecentDocuments(): SearchResult[] {
        const storedDocuments = localStorage.getItem(SEARCH_RECENTS_STORAGE_KEY)

        if(!storedDocuments) return []

        try {
            const documents = JSON.parse(storedDocuments)
            return Array.isArray(documents) ? documents.slice(0, MAX_RECENT_DOCUMENTS) : []
        } catch {
            return []
        }
    }
}
