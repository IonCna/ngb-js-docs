import type {Routes} from "ngjs-core/router";

export const routes: Routes = [
    {
        path: "",
        data: {
            title: "Popover",
            tabs: [
                {name: "Examples", to: "/components/popover/examples"},
                {name: "Api", to: "/components/popover/api"},
            ],
            externalLinks: {
                bootstrap: "components/popovers/",
                ngBootstrap: "components/popover/overview",
            },
        },
        children: [
            {path: "", pathMatch: "full", redirectTo: "examples"},
            {
                path: "examples",
                data: {
                    sections: [
                        {id: "popover-placements", name: "Quick popovers"},
                        {id: "popover-template", name: "HTML and bindings"},
                        {id: "popover-triggers", name: "Custom triggers"},
                        {id: "popover-manual-control", name: "External controls"},
                        {id: "popover-autoclose", name: "Automatic closing"},
                        {id: "popover-context", name: "Template context"},
                        {id: "popover-custom-target", name: "Custom target"},
                        {id: "popover-delays", name: "Open and close delays"},
                        {id: "popover-events", name: "Visibility events"},
                        {id: "popover-body", name: "Body container"},
                        {id: "popover-custom-class", name: "Custom class"},
                        {id: "popover-global", name: "Global configuration"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/popover/pages/popover-examples-page/popover-examples-page.component").then(m => m.PopoverExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        {id: "ngb-popover", name: "NgbPopover"},
                        {id: "ngb-popover-config", name: "NgbPopoverConfig"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/popover/pages/popover-api-page/popover-api-page.component").then(m => m.PopoverApiPageComponent),
            },
        ],
    },
];
