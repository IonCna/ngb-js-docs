import { Component, Input } from "ngjs-core";

@Component({
    selector: "docs-example-section",
    controllerAs: "example",
    templateUrl: "./example-section.component.html",
    styleUrl: "./example-section.component.css",
})
export class ExampleSectionComponent {
    @Input({ binding: "@" }) fragment!: string;
    @Input({ binding: "@" }) title!: string;
    @Input({ binding: "@" }) description!: string;
    @Input() htmlCode = "";
    @Input() tsCode?: string;
    @Input() cssCode?: string;

    public codeCollapsed = true;
    public activeTab = "html";

    public toggleCode() {
        this.codeCollapsed = !this.codeCollapsed;
    }

    public get hasAdditionalCode() {
        return Boolean(this.tsCode || this.cssCode);
    }

    public get activeCode() {
        if (this.activeTab === "typescript") return this.tsCode ?? "";
        if (this.activeTab === "css") return this.cssCode ?? "";
        return this.htmlCode;
    }
}
