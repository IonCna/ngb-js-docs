import type { IComponentController, IComponentOptions } from "angular";
import { NgbAccordionConfig, NGB_ACCORDION_CONFIG } from "ngb-js/accordion/compat";

export class AccordionGlobalComponent implements IComponentController {
    private readonly initialConfig: Pick<NgbAccordionConfig, "animation" | "closeOthers" | "destroyOnHide">;

    constructor(private readonly config: NgbAccordionConfig) {
        this.initialConfig = {
            animation: config.animation,
            closeOthers: config.closeOthers,
            destroyOnHide: config.destroyOnHide,
        };

        config.animation = false;
        config.closeOthers = true;
        config.destroyOnHide = false;
    }

    $onDestroy() {
        this.config.animation = this.initialConfig.animation;
        this.config.closeOthers = this.initialConfig.closeOthers;
        this.config.destroyOnHide = this.initialConfig.destroyOnHide;
    }

    static get $name() {
        return "docsAccordionGlobal"
    }

    static get $inject() {
        return [NGB_ACCORDION_CONFIG]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: AccordionGlobalComponent,
            controllerAs: "example",
            templateUrl: "./accordion-global.component.html", styleUrl: "./accordion-global.component.css",
        }
    }
}
