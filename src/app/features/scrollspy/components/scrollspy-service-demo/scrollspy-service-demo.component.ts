import { Component, ElementRef, type OnDestroy } from "ngjs-core";
import { NgbScrollSpyService } from "ngb-js/scrollspy";

@Component({
    selector: "docs-scrollspy-service-demo",
    controllerAs: "example",
    templateUrl: "./scrollspy-service-demo.component.html",
    styleUrl: "./scrollspy-service-demo.component.css",
})
export class ScrollspyServiceDemoComponent implements OnDestroy {
    public readonly fragments = ["service-introduction", "service-options", "service-finish"];
    public running = false;
    public observingFinish = true;
    private root?: HTMLElement;

    constructor(
        private readonly elementRef: ElementRef<HTMLElement>,
        public readonly scrollSpy: NgbScrollSpyService,
    ) {}

    public ngAfterViewInit(): void {
        this.root = this.elementRef.nativeElement.querySelector<HTMLElement>("[data-service-scrollspy]") ?? undefined;
        this.start();
    }

    public ngOnDestroy(): void {
        this.scrollSpy.stop();
    }

    public start(): void {
        if (!this.root) return;
        this.scrollSpy.start({
            root: this.root,
            fragments: this.fragments,
            rootMargin: "0px 0px -45%",
        });
        this.running = true;
        this.observingFinish = true;
    }

    public stop(): void {
        this.scrollSpy.stop();
        this.running = false;
    }

    public toggleFinish(): void {
        if (this.observingFinish) {
            this.scrollSpy.unobserve("service-finish");
        } else {
            this.scrollSpy.observe("service-finish");
        }
        this.observingFinish = !this.observingFinish;
    }
}
