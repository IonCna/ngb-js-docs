import type {Routes} from "ngjs-core/router";

export const routes: Routes = [
    {
        path: "",
        data: {
            title: "Accordion",
            tabs: [
                { name: "Examples", to: "/components/accordion/examples" },
                { name: "Api", to: "/components/accordion/api" },
            ],
            externalLinks: {
                bootstrap: "components/accordion/",
                ngBootstrap: "components/accordion/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
                data: {
                    sections: [
                        { id: "accordion-simple", name: "Basic accordion" },
                        { id: "one-panel-accordion", name: "One panel at a time" },
                        { id: "accordion-toggle-panels", name: "Programmatic controls" },
                        { id: "accordion-custom-header", name: "Custom headers" },
                        { id: "accordion-content", name: "Preserve content" },
                        { id: "accordion-global", name: "Global configuration" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/accordion/pages/accordion-examples-page/accordion-examples-page.component").then(m => m.AccordionExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-accordion", name: "NgbAccordion" },
                        { id: "ngb-accordion-item", name: "NgbAccordionItem" },
                        { id: "ngb-accordion-header", name: "NgbAccordionHeader" },
                        { id: "ngb-accordion-button", name: "NgbAccordionButton" },
                        { id: "ngb-accordion-toggle", name: "NgbAccordionToggle" },
                        { id: "ngb-accordion-body", name: "NgbAccordionBody" },
                        { id: "ngb-accordion-config", name: "NgbAccordionConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/accordion/pages/accordion-api-page/accordion-api-page.component").then(m => m.AccordionApiPageComponent),
            },
        ],
    },
]