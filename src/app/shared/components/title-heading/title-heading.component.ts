import { Component, type OnDestroy, type OnInit } from "ngjs-core";
import { Subject, takeUntil } from "rxjs";
import { TitleService } from "@/core/services/title.service"

@Component({
    selector: "docs-title-heading",
    controllerAs: "$",
    templateUrl: "./title-heading.component.html",
    styleUrl: "./title-heading.component.css",
})
export class TitleHeadingComponent implements OnInit, OnDestroy {
    private readonly destroyRef = new Subject<void>();
    public title?: string
    public tabs?: unknown[]
    public visible = false

    public constructor(public readonly titleService: TitleService) {}

    public ngOnInit() {
        this.titleService.transition$.pipe(
            takeUntil(this.destroyRef)
        ).subscribe(data => {
            this.title = data.title;
            this.tabs = data.tabs;
            this.visible = data.header
        })
    }

    public ngOnDestroy() {
        this.destroyRef.next();
        this.destroyRef.complete();
    }
}
