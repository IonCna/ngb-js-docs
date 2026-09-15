import { Component, Inject, type OnDestroy } from "ngjs-core";
import { NgbAlertConfig, NGB_ALERT_CONFIG } from "ngb-js/alert/compat";

@Component({
    selector: "docs-alert-global",
    controllerAs: "example",
    templateUrl: "./alert-global.component.html",
    styleUrl: "./alert-global.component.css",
})
export class AlertGlobalComponent implements OnDestroy {
    private readonly initialConfig: Pick<NgbAlertConfig, "animation" | "dismissible" | "type">;

    constructor(@Inject(NGB_ALERT_CONFIG) private readonly config: NgbAlertConfig) {
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
