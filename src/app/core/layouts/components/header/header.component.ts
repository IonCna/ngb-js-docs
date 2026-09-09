import angular, {type IComponentController, type IComponentOptions, type IDocumentService} from "angular";
import { NGB_MODAL, NgbModal } from "ngb-js/modal/compat"
import {ThemeService} from "@/core/services/theme.service"
import {ThemeEnumConstant, type Themes} from "@/core/constants/themes.constant.ts";
import { MenuService } from "@/core/services/menu.service"
import {
    MAX_RECENT_DOCUMENTS,
    SEARCH_RECENTS_STORAGE_KEY,
    SearchModalComponent,
} from "@/core/layouts/components/search-modal/search-modal.component"
import type { SearchResult } from "@/core/services/search.service"
import brandLogoDarkUrl from "@/assets/brand/ngb-js-logo-dark.png"
import brandLogoLightUrl from "@/assets/brand/ngb-js-logo-light.png"

export class HeaderComponent implements IComponentController{
    public readonly brandLogoDarkUrl = brandLogoDarkUrl
    public readonly brandLogoLightUrl = brandLogoLightUrl

    constructor(
        private modalService: NgbModal,
        public themeService: ThemeService,
        public themes: typeof Themes,
        public menuService: MenuService,
        private readonly $document: IDocumentService,
    ) {}

    private readonly handleSearchShortcut = (event: JQueryEventObject) => {
        if(!event.ctrlKey || event.key.toLowerCase() !== "k") return

        event.preventDefault()

        if(!this.modalService.hasOpenModals()) {
            this.openModal()
        }
    }

    public $onInit() {
        this.$document.on("keydown", this.handleSearchShortcut)
    }

    public $onDestroy() {
        this.$document.off("keydown", this.handleSearchShortcut)
    }

    public openModal() {
        this.modalService.open(SearchModalComponent.$name, {
            fullscreen: "md",
            size: "lg",
            scrollable: true,
            animation: false
        }).then(modalRef => {
            modalRef.result?.then(result => {
                if(result) this.saveRecentDocument(result as any)
            }, angular.noop)
        }, angular.noop)
    }

    private saveRecentDocument(document: SearchResult) {
        const storedDocuments = localStorage.getItem(SEARCH_RECENTS_STORAGE_KEY)
        let recentDocuments: SearchResult[] = []

        if(storedDocuments) {
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

    static get $name() {
        return "docsHeader"
    }

    static get $inject() {
        return [
            NGB_MODAL,
            ThemeService.$name,
            ThemeEnumConstant.$key,
            MenuService.$name,
            "$document"
        ]
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: HeaderComponent,
            templateUrl: "./header.component.html", styleUrl: "./header.component.css"
        }
    }
}
