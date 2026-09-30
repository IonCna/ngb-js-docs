import {Component, Input} from "ngjs-core";

@Component({
    selector: "docs-copy-button",
    templateUrl: "./copy-button.component.html",
    styleUrl: "./copy-button.component.css",
})
export class CopyButtonComponent {
    @Input({ required: true })
    public value!: string;

    @Input({ binding: "@" })
    public ariaLabel?: string;

    @Input({ binding: "@" })
    public buttonClass?: string;

    public copied = false;

    public copy() {
        window.navigator.clipboard.writeText(this.value).then(() => {
            setTimeout(() => {
                this.copied = true
            })

            setTimeout(() => {
                this.copied = false
            })
        });
    }
}
