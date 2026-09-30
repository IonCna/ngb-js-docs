import type {Routes} from "ngjs-core/router";

export const routes: Routes = [
    {
        path: "",
        data: {
            title: "Progress bar",
            tabs: [
                {name: "Examples", to: "/components/progressbar/examples"},
                {name: "Api", to: "/components/progressbar/api"},
            ],
            externalLinks: {
                bootstrap: "components/progress/",
                ngBootstrap: "components/progressbar/overview",
            },
        },
        children: [
            {path: "", pathMatch: "full", redirectTo: "examples"},
            {
                path: "examples",
                data: {
                    sections: [
                        {id: "simple-progressbar", name: "Simple progress bars"},
                        {id: "contextual-text-progressbar", name: "Contextual text"},
                        {id: "striped-progress-bar", name: "Striped bars"},
                        {id: "custom-labels-progressbar", name: "Custom labels"},
                        {id: "progress-height", name: "Custom height"},
                        {id: "progress-bars-stacked", name: "Stacked bars"},
                        {id: "progressbar-global", name: "Global configuration"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/progressbar/pages/progressbar-examples-page/progressbar-examples-page.component").then(m => m.ProgressbarExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        {id: "ngb-progressbar", name: "NgbProgressbar"},
                        {id: "ngb-progressbar-stacked", name: "NgbProgressbarStacked"},
                        {id: "ngb-progressbar-config", name: "NgbProgressbarConfig"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/progressbar/pages/progressbar-api-page/progressbar-api-page.component").then(m => m.ProgressbarApiPageComponent),
            },
        ],
    },
];
