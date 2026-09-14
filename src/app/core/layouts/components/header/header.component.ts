import { Component, DOCUMENT, Inject, type OnDestroy, type OnInit } from "ngjs-core";
import { NGB_MODAL, NgbModal } from "ngb-js/modal/compat"
import { ThemeService } from "@/core/services/theme.service"
import { type Themes } from "@/core/constants/themes.constant.ts";
import { THEMES_ENUM } from "@/core/tokens"
import { MenuService } from "@/core/services/menu.service"
import {
    MAX_RECENT_DOCUMENTS,
    SEARCH_RECENTS_STORAGE_KEY,
    SearchModalComponent,
} from "@/core/layouts/components/search-modal/search-modal.component"
import type { SearchResult } from "@/core/services/search.service"
import brandLogoDarkUrl from "@/assets/brand/ngb-js-logo-dark.png"
import brandLogoLightUrl from "@/assets/brand/ngb-js-logo-light.png"

@Component({
    selector: "docs-header",
    templateUrl: "./header.component.html",
    styleUrl: "./header.component.css",
})
export class HeaderComponent implements OnInit, OnDestroy {
    public readonly brandLogoDarkUrl = brandLogoDarkUrl
    public readonly brandLogoLightUrl = brandLogoLightUrl

    constructor(
        @Inject(NGB_MODAL) private readonly modalService: NgbModal,
        public readonly themeService: ThemeService,
        @Inject(THEMES_ENUM) public readonly themes: typeof Themes,
        public readonly menuService: MenuService,
        @Inject(DOCUMENT) private readonly document: Document,
    ) {}

    private readonly handleSearchShortcut = (event: KeyboardEvent) => {
        if (!event.ctrlKey || event.key.toLowerCase() !== "k") return

        event.preventDefault()

        if (!this.modalService.hasOpenModals()) {
            this.openModal()
        }
    }

    public ngOnInit() {
        this.document.addEventListener("keydown", this.handleSearchShortcut)
    }

    public ngOnDestroy() {
        this.document.removeEventListener("keydown", this.handleSearchShortcut)
    }

    public openModal() {
        void this.modalService.open(SearchModalComponent, {
            fullscreen: "md",
            size: "lg",
            scrollable: true,
            animation: false,
        }).then(modalRef => {
            modalRef.result?.then(
                result => {
                    if (result) this.saveRecentDocument(result as SearchResult)
                },
                () => {},
            )
        }, () => {})
    }

    private saveRecentDocument(document: SearchResult) {
        const storedDocuments = localStorage.getItem(SEARCH_RECENTS_STORAGE_KEY)
        let recentDocuments: SearchResult[] = []

        if (storedDocuments) {
            try {
                const documents = JSON.parse(storedDocuments)
                recentDocuments = Array.isArray(documents) ? documents : []
            } catch {
                recentDocuments = []
            }
        }

        const updatedDocuments = [
            document,
            ...recentDocuments.filter(recent => recent.id !== document.id),
        ].slice(0, MAX_RECENT_DOCUMENTS)

        localStorage.setItem(SEARCH_RECENTS_STORAGE_KEY, JSON.stringify(updatedDocuments))
    }
}
