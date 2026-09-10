import { Component } from "ngjs-core";
import type {IComponentOptions} from "angular";

@Component({
    selector: "docs-footer",
    templateUrl: "./footer.component.html",
    styleUrl: "./footer.component.css",
})
export class FooterComponent {
    static get $name() {
        return "docsFooter"
    }

    static get $factory(): IComponentOptions {
        return {
            controller: FooterComponent,
            templateUrl: "./footer.component.html", styleUrl: "./footer.component.css",
        }
    }
}
