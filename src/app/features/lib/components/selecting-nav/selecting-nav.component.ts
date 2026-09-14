import { Component, ViewChild } from "ngjs-core";
import { NgbNav } from "ngb-js/nav";

@Component({
    selector: "docs-selecting-nav",
    controllerAs: "example",
    templateUrl: "./selecting-nav.component.html",
    styleUrl: "./selecting-nav.component.css",
})
export class SelectingNavComponent {
    @ViewChild("nav", { read: NgbNav, static: true })
    public nav!: NgbNav;

    public activeId = "selecting-first";

    public select(id: string) {
        this.nav.select(id);
    }
}
