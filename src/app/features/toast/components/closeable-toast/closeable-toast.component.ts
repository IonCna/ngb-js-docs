import { Component, type OnDestroy } from "ngjs-core";

@Component({
    selector: "docs-closeable-toast",
    controllerAs: "example",
    templateUrl: "./closeable-toast.component.html",
    styleUrl: "./closeable-toast.component.css",
})
export class CloseableToastComponent implements OnDestroy {
    public visible = true;
    private reopenTimer?: ReturnType<typeof setTimeout>;

    public close(): void {
        this.visible = false;
        this.reopenTimer = setTimeout(() => {
            this.visible = true;
        }, 3000);
    }

    public ngOnDestroy(): void {
        if (this.reopenTimer) clearTimeout(this.reopenTimer);
    }
}
