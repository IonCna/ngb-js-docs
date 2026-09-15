import type {Routes} from "ngjs-core/router";
import {MenuAbstractPageComponent} from "@/core/layouts/pages/menu-abstract-page/menu-abstract-page.component.ts";

export const routes: Routes = [
    {
        path: "",
        data: {
            title: "Alert",
            tabs: [
                { name: "Examples", to: "/components/alert/examples" },
                { name: "Api", to: "/components/alert/api" },
            ],
            externalLinks: {
                bootstrap: "components/alerts/",
                ngBootstrap: "components/alert/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
                data: {
                    sections: [
                        { id: "simple-alert", name: "Simple alert" },
                        { id: "alert-closeable", name: "Closeable alerts" },
                        { id: "self-closing-alert", name: "Self-closing alert" },
                        { id: "alert-custom", name: "Custom alert" },
                        { id: "alert-global", name: "Global configuration" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/alert/pages/alert-examples-page/alert-examples-page.component").then(m => m.AlertExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-alert", name: "NgbAlert" },
                        { id: "ngb-alert-config", name: "NgbAlertConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/alert/pages/alert-api-page/alert-api-page.component").then(m => m.AlertApiPageComponent),
            },
        ],
    },
]