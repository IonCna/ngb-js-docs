import type { INgbAlert } from "ngb-js/alert";
import { Component, type OnDestroy, type OnInit, ViewChild } from "ngjs-core";

@Component({
    selector: "docs-self-closing-alert",
    controllerAs: "example",
    templateUrl: "./self-closing-alert.component.html",
    styleUrl: "./self-closing-alert.component.css",
})
export class SelfClosingAlertComponent implements OnInit, OnDestroy {
    private readonly initialSeconds = 5;
    private timer?: ReturnType<typeof setTimeout>;

    @ViewChild("alert")
    private alert?: INgbAlert;

    public remaining = this.initialSeconds;
    public visible = true;

    public ngOnInit() {
        this.startTimer();
    }

    public ngOnDestroy() {
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
        this.timer = setTimeout(() => {
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
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }
}
