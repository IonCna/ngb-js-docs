import {Component, inject, Inject, type OnDestroy, type OnInit} from "ngjs-core";
import { Subject, takeUntil } from "rxjs";
import { TitleService } from "@/core/services/title.service"
import { BOOTSTRAP_URL, NG_BOOTSTRAP_URL } from "@/core/tokens"
import type { HeadingExternalLinks, HeadingSection } from "@/core/models/title.model"

@Component({
    selector: "docs-page-outline",
    templateUrl: "./page-outline.component.html",
    styleUrl: "./page-outline.component.css",
})
export class PageOutlineComponent implements OnInit, OnDestroy {
    private readonly destroyRef = new Subject<void>()
    private externalLinks?: HeadingExternalLinks
    private titleService = inject(TitleService)

    public title?: string
    public sections: HeadingSection[] = []

    constructor(
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

    public ngOnInit() {
        this.titleService.transition$.pipe(
            takeUntil(this.destroyRef),
        ).subscribe(data => {
            this.title = data.title
            this.sections = data.sections ?? []
            this.externalLinks = data.externalLinks
        })
    }

    public ngOnDestroy() {
        this.destroyRef.next()
        this.destroyRef.complete()
    }
}
