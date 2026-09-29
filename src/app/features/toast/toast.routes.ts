import type { Routes } from "ngjs-core/router";

export const routes: Routes = [{
    path: "",
    data: { title: "Toast", tabs: [{ name: "Examples", to: "/components/toast/examples" }, { name: "Api", to: "/components/toast/api" }], externalLinks: { bootstrap: "components/toasts/", ngBootstrap: "components/toast/overview" } },
    children: [
        { path: "", pathMatch: "full", redirectTo: "examples" },
        { path: "examples", data: { sections: [{ id: "inline-toast", name: "Declarative inline usage" }, { id: "template-header-toast", name: "Template header" }, { id: "closeable-toast", name: "Closeable toast" }, { id: "prevent-autohide-toast", name: "Prevent autohide" }, { id: "toast-management", name: "Management service" }] }, loadComponent: () => import("@/features/toast/pages/toast-examples-page/toast-examples-page.component").then(m => m.ToastExamplesPageComponent) },
        { path: "api", data: { sections: [{ id: "ngb-toast", name: "NgbToast" }, { id: "ngb-toast-header", name: "NgbToastHeader" }, { id: "ngb-toast-config", name: "NgbToastConfig" }] }, loadComponent: () => import("@/features/toast/pages/toast-api-page/toast-api-page.component").then(m => m.ToastApiPageComponent) },
    ],
}];
