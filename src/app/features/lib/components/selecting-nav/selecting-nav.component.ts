import type { IComponentController, IComponentOptions } from "angular";
import { NgbNav } from "ngb-js/nav";
import { ViewChild } from "ngjs-core";

export class SelectingNavComponent implements IComponentController {
    @ViewChild("nav", { read: NgbNav, static: true })
    public nav!: NgbNav;

    public activeId = "selecting-first";

    public select(id: string) {
        this.nav.select(id);
    }

    static get $name() {
        return "docsSelectingNav"
    }

    static get $factory(): IComponentOptions {
        return {
            controller: SelectingNavComponent,
            controllerAs: "example",
            templateUrl: "./selecting-nav.component.html", styleUrl: "./selecting-nav.component.css",
        }
    }
}
