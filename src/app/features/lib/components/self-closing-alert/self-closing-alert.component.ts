import type { INgbAlert } from "ngb-js/alert";
import type { IComponentController, IComponentOptions, IPromise, ITimeoutService } from "angular";
import { ViewChild } from "ngjs-core";

export class SelfClosingAlertComponent implements IComponentController {
    private readonly initialSeconds = 5;
    private timer?: IPromise<void>;

    @ViewChild("alert")
    private alert?: INgbAlert;

    public remaining = this.initialSeconds;
    public visible = true;

    constructor(private readonly $timeout: ITimeoutService) {}

    $onInit() {
        this.startTimer();
    }

    $onDestroy() {
        this.cancelTimer();
    }

    public restart() {
        this.cancelTimer();
        this.remaining = this.initialSeconds;
        this.visible = true;
        this.startTimer();
    }

    public onClosed() {
        this.visible = false;
        this.cancelTimer();
    }

    private startTimer() {
        this.timer = this.$timeout(() => {
            this.remaining--;

            if (this.remaining <= 0) {
                if (this.alert) {
                    this.alert.close();
                } else {
                    this.visible = false;
                }
                return;
            }

            this.startTimer();
        }, 1000);
    }

    private cancelTimer() {
        if (this.timer) {
            this.$timeout.cancel(this.timer);
            this.timer = undefined;
        }
    }

    static get $name() {
        return "docsSelfClosingAlert"
    }

    static get $inject() {
        return ["$timeout"]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: SelfClosingAlertComponent,
            controllerAs: "example",
            templateUrl: "./self-closing-alert.component.html", styleUrl: "./self-closing-alert.component.css",
        }
    }
}
