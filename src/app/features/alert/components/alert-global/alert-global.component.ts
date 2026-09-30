import { Component, type OnDestroy } from "ngjs-core";
import { NgbAlertConfig } from "ngb-js/alert";

@Component({
    selector: "docs-alert-global",
    controllerAs: "example",
    templateUrl: "./alert-global.component.html",
    styleUrl: "./alert-global.component.css",
})
export class AlertGlobalComponent implements OnDestroy {
    private readonly initialConfig: Pick<NgbAlertConfig, "animation" | "dismissible" | "type">;

    constructor(private readonly config: NgbAlertConfig) {
        this.initialConfig = {
            animation: config.animation,
            dismissible: config.dismissible,
            type: config.type,
        };

        config.animation = false;
        config.dismissible = false;
        config.type = "success";
    }

    public ngOnDestroy() {
        this.config.animation = this.initialConfig.animation;
        this.config.dismissible = this.initialConfig.dismissible;
        this.config.type = this.initialConfig.type;
    }
}
