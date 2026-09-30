import { Component, ElementRef, Input, type AfterViewInit } from "ngjs-core";
import { NgbOffcanvasRef } from "ngb-js/offcanvas"

type MenuModes = "desktop" | "mobile";

@Component({
    selector: "docs-menu",
    templateUrl: "./menu.component.html",
    styleUrl: "./menu.component.css",
})
export class MenuComponent implements AfterViewInit {
    @Input({ binding: "@" }) mode: MenuModes = "desktop";
    @Input() ngbActiveOffcanvas?: NgbOffcanvasRef;

    constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

    ngAfterViewInit() {
        if (this.mode === "mobile") {
            this.elementRef.nativeElement.classList.add("h-100", "d-flex", "flex-column");
        }
    }
}
