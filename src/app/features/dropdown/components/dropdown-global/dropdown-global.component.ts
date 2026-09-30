import { Component, type OnDestroy } from "ngjs-core";
import { NgbDropdownConfig } from "ngb-js/dropdown";

@Component({
    selector: "docs-dropdown-global",
    controllerAs: "example",
    templateUrl: "./dropdown-global.component.html",
    styleUrl: "./dropdown-global.component.css",
})
export class DropdownGlobalComponent implements OnDestroy {
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

    public ngOnDestroy() {
        this.config.autoClose = this.initialConfig.autoClose;
        this.config.container = this.initialConfig.container;
        this.config.placement = this.initialConfig.placement;
    }
}
