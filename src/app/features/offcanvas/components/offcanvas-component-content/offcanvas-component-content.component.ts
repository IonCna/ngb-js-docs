import { Component } from "ngjs-core";
import { OffcanvasDemoContentComponent } from "@/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component"
import { NgbOffcanvas } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-component-content",
    controllerAs: "example",
    templateUrl: "./offcanvas-component-content.component.html",
    styleUrl: "./offcanvas-component-content.component.css",
})
export class OffcanvasComponentContentComponent {
    public lastResult = "No result yet";

    constructor(private readonly offcanvas: NgbOffcanvas) {}

    public async open() {
        const offcanvasRef = await this.offcanvas.open(OffcanvasDemoContentComponent);

        offcanvasRef.closed.subscribe((result) => {
            this.lastResult = `Closed with: ${result}`;
        });

        offcanvasRef.dismissed.subscribe((reason) => {
            this.lastResult = `Dismissed with: ${reason}`;
        });
    }
}
