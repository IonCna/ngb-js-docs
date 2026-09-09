import type { IComponentController, IComponentOptions } from "angular";
import { NgbAlertConfig, NGB_ALERT_CONFIG } from "ngb-js/alert/compat";

export class AlertGlobalComponent implements IComponentController {
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

    $onDestroy() {
        this.config.animation = this.initialConfig.animation;
        this.config.dismissible = this.initialConfig.dismissible;
        this.config.type = this.initialConfig.type;
    }

    static get $name() {
        return "docsAlertGlobal"
    }

    static get $inject() {
        return [NGB_ALERT_CONFIG]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: AlertGlobalComponent,
            controllerAs: "example",
            templateUrl: "./alert-global.component.html", styleUrl: "./alert-global.component.css",
        }
    }
}
