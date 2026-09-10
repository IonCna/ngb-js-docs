import { Component, Inject } from "ngjs-core";
import type { IComponentController, IComponentOptions } from "angular";
import { Subject, takeUntil } from "rxjs";
import { TitleService } from "@/core/services/title.service"
import { BOOTSTRAP_URL, NG_BOOTSTRAP_URL } from "@/core/tokens"
import type { HeadingExternalLinks, HeadingSection } from "@/core/models/title.model"

@Component({
    selector: "docs-page-outline",
    templateUrl: "./page-outline.component.html",
    styleUrl: "./page-outline.component.css",
    controllerAs: "$",
})
export class PageOutlineComponent implements IComponentController {
    private destroyRef = new Subject<void>()
    private externalLinks?: HeadingExternalLinks

    public title?: string
    public sections: HeadingSection[] = []

    constructor(
        private titleService: TitleService,
        @Inject(BOOTSTRAP_URL) private bootstrapUrl: string,
        @Inject(NG_BOOTSTRAP_URL) private ngBootstrapUrl: string,
    ) {}

    get bootstrapHref() {
        return this.externalLinks?.bootstrap
            ? `${this.bootstrapUrl}${this.externalLinks.bootstrap}`
            : undefined
    }

    get ngBootstrapHref() {
        return this.externalLinks?.ngBootstrap
            ? `${this.ngBootstrapUrl}${this.externalLinks.ngBootstrap}`
            : undefined
    }

    $postLink() {
        this.titleService.transition$.pipe(
            takeUntil(this.destroyRef),
        ).subscribe(data => {
            this.title = data.title
            this.sections = data.sections ?? []
            this.externalLinks = data.externalLinks
        })
    }

    $onDestroy() {
        this.destroyRef.next()
        this.destroyRef.complete()
    }

    static get $name() {
        return "docsPageOutline"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: PageOutlineComponent,
            templateUrl: "./page-outline.component.html", styleUrl: "./page-outline.component.css",
        }
    }
}
