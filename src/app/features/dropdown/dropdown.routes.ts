import type {Routes} from "ngjs-core/router";

export const routes: Routes = [
    {
        path: "",
        data: {
            title: "Dropdown",
            tabs: [
                {name: "Examples", to: "/components/dropdown/examples"},
                {name: "Api", to: "/components/dropdown/api"},
            ],
            externalLinks: {
                bootstrap: "components/dropdowns/",
                ngBootstrap: "components/dropdown/overview",
            },
        },
        children: [
            {path: "", pathMatch: "full", redirectTo: "examples"},
            {
                path: "examples",
                data: {
                    sections: [
                        {id: "simple-dropdown", name: "Simple dropdown"},
                        {id: "manual-dropdown", name: "Manual triggers"},
                        {id: "dropdown-button-groups", name: "Button groups"},
                        {id: "dropdown-disabled-items", name: "Disabled items"},
                        {id: "dropdown-form", name: "Dropdown form"},
                        {id: "dropdown-body", name: "Body container"},
                        {id: "dropdown-navbar", name: "Navbar positioning"},
                        {id: "dropdown-global", name: "Global configuration"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/dropdown/pages/dropdown-examples-page/dropdown-examples-page.component").then(m => m.DropdownExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        {id: "ngb-dropdown", name: "NgbDropdown"},
                        {id: "ngb-dropdown-anchor", name: "NgbDropdownAnchor"},
                        {id: "ngb-dropdown-toggle", name: "NgbDropdownToggle"},
                        {id: "ngb-dropdown-menu", name: "NgbDropdownMenu"},
                        {id: "ngb-dropdown-item", name: "NgbDropdownItem"},
                        {id: "ngb-dropdown-config", name: "NgbDropdownConfig"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/dropdown/pages/dropdown-api-page/dropdown-api-page.component").then(m => m.DropdownApiPageComponent),
            },
        ],
    },
];
