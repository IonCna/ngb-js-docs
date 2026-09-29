import { Component } from "ngjs-core";
import closeableHtml from "@/features/toast/components/closeable-toast/closeable-toast.component.html?raw"
import closeableTs from "@/features/toast/components/closeable-toast/closeable-toast.component.ts?raw"
import inlineHtml from "@/features/toast/components/inline-toast/inline-toast.component.html?raw"
import inlineTs from "@/features/toast/components/inline-toast/inline-toast.component.ts?raw"
import managementHtml from "@/features/toast/components/toast-management/toast-management.component.html?raw"
import managementTs from "@/features/toast/components/toast-management/toast-management.component.ts?raw"
import preventAutohideHtml from "@/features/toast/components/prevent-autohide-toast/prevent-autohide-toast.component.html?raw"
import preventAutohideTs from "@/features/toast/components/prevent-autohide-toast/prevent-autohide-toast.component.ts?raw"
import templateHeaderHtml from "@/features/toast/components/template-header-toast/template-header-toast.component.html?raw"
import templateHeaderTs from "@/features/toast/components/template-header-toast/template-header-toast.component.ts?raw"

@Component({
    selector: "docs-toast-examples-page",
    controllerAs: "$",
    templateUrl: "./toast-examples-page.component.html",
    styleUrl: "./toast-examples-page.component.css",
})
export class ToastExamplesPageComponent {
    public readonly examples = {
        inline: { html: inlineHtml, typescript: inlineTs },
        templateHeader: { html: templateHeaderHtml, typescript: templateHeaderTs },
        closeable: { html: closeableHtml, typescript: closeableTs },
        preventAutohide: { html: preventAutohideHtml, typescript: preventAutohideTs },
        management: { html: managementHtml, typescript: managementTs },
    }
}
