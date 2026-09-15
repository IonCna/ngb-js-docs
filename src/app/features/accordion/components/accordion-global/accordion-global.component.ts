import { Component, Inject, type OnDestroy } from "ngjs-core";
import { NgbAccordionConfig, NGB_ACCORDION_CONFIG } from "ngb-js/accordion/compat";

@Component({
    selector: "docs-accordion-global",
    controllerAs: "example",
    templateUrl: "accordion-global.component.html",
    styleUrl: "./accordion-global.component.css",
})
export class AccordionGlobalComponent implements OnDestroy {
    private readonly initialConfig: Pick<NgbAccordionConfig, "animation" | "closeOthers" | "destroyOnHide">;

    constructor(@Inject(NGB_ACCORDION_CONFIG) private readonly config: NgbAccordionConfig) {
        this.initialConfig = {
            animation: config.animation,
            closeOthers: config.closeOthers,
            destroyOnHide: config.destroyOnHide,
        };

        config.animation = false;
        config.closeOthers = true;
        config.destroyOnHide = false;
    }

    public ngOnDestroy() {
        this.config.animation = this.initialConfig.animation;
        this.config.closeOthers = this.initialConfig.closeOthers;
        this.config.destroyOnHide = this.initialConfig.destroyOnHide;
    }
}
