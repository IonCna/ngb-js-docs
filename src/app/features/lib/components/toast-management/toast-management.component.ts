import { Component, Injectable, type OnDestroy } from "ngjs-core";

interface ManagedToast {
    id: number;
    body: string;
    className?: string;
    delay?: number;
}

@Injectable({ id: "docs.toast.service" })
export class DocsToastService {
    public readonly toasts: ManagedToast[] = [];
    private nextId = 0;

    public show(body: string, options: Omit<ManagedToast, "id" | "body"> = {}): void {
        this.toasts.push({ id: ++this.nextId, body, ...options });
    }

    public remove(toast: ManagedToast): void {
        const index = this.toasts.indexOf(toast);
        if (index >= 0) this.toasts.splice(index, 1);
    }

    public clear(): void {
        this.toasts.length = 0;
    }
}

@Component({
    selector: "docs-toast-management",
    controllerAs: "example",
    templateUrl: "./toast-management.component.html",
    styleUrl: "./toast-management.component.css",
})
export class ToastManagementComponent implements OnDestroy {
    constructor(public readonly toastService: DocsToastService) {}

    public showStandard(): void {
        this.toastService.show("I am a standard toast.");
    }

    public showSuccess(): void {
        this.toastService.show("Your changes were saved.", { className: "bg-success text-white", delay: 8000 });
    }

    public showDanger(): void {
        this.toastService.show("The operation could not be completed.", { className: "bg-danger text-white", delay: 10000 });
    }

    public ngOnDestroy(): void {
        this.toastService.clear();
    }
}
