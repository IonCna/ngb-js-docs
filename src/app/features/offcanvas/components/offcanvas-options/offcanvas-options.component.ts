import { Component, Inject } from "ngjs-core";
import { OffcanvasDemoContentComponent } from "@/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component"
import { NgbOffcanvas, type NgbOffcanvasOptions, NGB_OFFCANVAS } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-options",
    controllerAs: "example",
    templateUrl: "./offcanvas-options.component.html",
    styleUrl: "./offcanvas-options.component.css",
})
export class OffcanvasOptionsComponent {
    constructor(@Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas) {}

    public openCustomPanel() {
        this.open({ panelClass: "panel" });
    }

    public openStaticBackdrop() {
        this.open({
            backdrop: "static",
            backdropClass: "backdrop",
            keyboard: false,
        });
    }

    public openStart() {
        this.open({ position: "start" });
    }

    public openEnd() {
        this.open({ position: "end" });
    }

    public openTop() {
        this.open({ position: "top" });
    }

    public openBottom() {
        this.open({ position: "bottom" });
    }

    public openScrollableBody() {
        this.open({ scroll: true, backdrop: false });
    }

    private open(options: NgbOffcanvasOptions) {
        this.offcanvas.open(OffcanvasDemoContentComponent, options);
    }
}
