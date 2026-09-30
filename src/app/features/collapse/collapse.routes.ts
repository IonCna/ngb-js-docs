import type {Routes} from "ngjs-core/router";

export const routes: Routes = [
    {
        path: "",
        data: {
            title: "Collapse",
            tabs: [
                { name: "Examples", to: "/components/collapse/examples" },
                { name: "Api", to: "/components/collapse/api" },
            ],
            externalLinks: {
                bootstrap: "components/collapse/",
                ngBootstrap: "components/collapse/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
                data: {
                    sections: [
                        { id: "simple-collapse", name: "Simple collapse" },
                        { id: "horizontal-collapse", name: "Horizontal collapse" },
                        { id: "navbar-collapse", name: "Responsive navbar" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/collapse/pages/collapse-examples-page/collapse-examples-page.component").then(m => m.CollapseExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-collapse", name: "NgbCollapse" },
                        { id: "ngb-collapse-config", name: "NgbCollapseConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/collapse/pages/collapse-api-page/collapse-api-page.component").then(m => m.CollapseApiPageComponent),
            },
        ],
    },
]