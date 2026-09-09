import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
import { NgbScrollSpyService } from "ngb-js/scrollspy";

export class ScrollspyServiceDemoComponent implements IComponentController {
    public readonly fragments = ["service-introduction", "service-options", "service-finish"];
    public running = false;
    public observingFinish = true;
    private root?: HTMLElement;

    constructor(
        private readonly $element: IAugmentedJQuery,
        public readonly scrollSpy: NgbScrollSpyService,
    ) {}

    public $postLink(): void {
        this.root = this.$element[0].querySelector<HTMLElement>("[data-service-scrollspy]") ?? undefined;
        this.start();
    }

    public $onDestroy(): void {
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

    static get $name() { return "docsScrollspyServiceDemo" }
    static get $inject() { return ["$element", "NgbScrollSpyService"] }
    static get $factory(): IComponentOptions {
        return {
            controller: ScrollspyServiceDemoComponent,
            controllerAs: "example",
            templateUrl: "./scrollspy-service-demo.component.html", styleUrl: "./scrollspy-service-demo.component.css",
        }
    }
}
