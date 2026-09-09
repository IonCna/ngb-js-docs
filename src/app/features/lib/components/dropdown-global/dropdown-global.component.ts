import type { IComponentController, IComponentOptions } from "angular";
import { NgbDropdownConfig, NGB_DROPDOWN_CONFIG } from "ngb-js/dropdown";

export class DropdownGlobalComponent implements IComponentController {
    private readonly initialConfig: Pick<NgbDropdownConfig, "autoClose" | "container" | "placement">;

    constructor(private readonly config: NgbDropdownConfig) {
        this.initialConfig = {
            autoClose: config.autoClose,
            container: config.container,
            placement: config.placement,
        };

        config.autoClose = "outside";
        config.container = "body";
        config.placement = ["top-start", "bottom-start"];
    }

    public $onDestroy() {
        this.config.autoClose = this.initialConfig.autoClose;
        this.config.container = this.initialConfig.container;
        this.config.placement = this.initialConfig.placement;
    }

    static get $name() {
        return "docsDropdownGlobal"
    }

    static get $inject() {
        return [NGB_DROPDOWN_CONFIG]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: DropdownGlobalComponent,
            controllerAs: "example",
            templateUrl: "./dropdown-global.component.html", styleUrl: "./dropdown-global.component.css",
        }
    }
}
