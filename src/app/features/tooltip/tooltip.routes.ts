import type { Routes } from "ngjs-core/router";

export const routes: Routes = [{
    path: "",
    data: { title: "Tooltip", tabs: [{ name: "Examples", to: "/components/tooltip/examples" }, { name: "Api", to: "/components/tooltip/api" }], externalLinks: { bootstrap: "components/tooltips/", ngBootstrap: "components/tooltip/overview" } },
    children: [
        { path: "", pathMatch: "full", redirectTo: "examples" },
        { path: "examples", data: { sections: [{ id: "tooltip-placements", name: "Quick and easy tooltips" }, { id: "tooltip-template", name: "HTML and bindings" }, { id: "tooltip-triggers", name: "Custom and manual triggers" }, { id: "tooltip-autoclose", name: "Automatic closing" }, { id: "tooltip-context", name: "Context and manual triggers" }, { id: "tooltip-custom-target", name: "Custom target" }, { id: "tooltip-delays", name: "Open and close delays" }, { id: "tooltip-body", name: "Append to body" }, { id: "tooltip-custom-class", name: "Custom class" }, { id: "tooltip-global", name: "Global configuration" }] }, loadComponent: () => import("@/features/tooltip/pages/tooltip-examples-page/tooltip-examples-page.component").then(m => m.TooltipExamplesPageComponent) },
        { path: "api", data: { sections: [{ id: "ngb-tooltip", name: "NgbTooltip" }, { id: "ngb-tooltip-config", name: "NgbTooltipConfig" }] }, loadComponent: () => import("@/features/tooltip/pages/tooltip-api-page/tooltip-api-page.component").then(m => m.TooltipApiPageComponent) },
    ],
}];
