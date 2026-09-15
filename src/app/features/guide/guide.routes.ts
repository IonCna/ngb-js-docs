import type { Routes } from "ngjs-core/router";

export const routes: Routes = [
    {
        path: "",
        children: [
            { path: "", pathMatch: "full", redirectTo: "introduction" },
            {
                path: "introduction",
                loadComponent: () => import("@/features/guide/pages/introduction-page/introduction-page.component").then(m => m.IntroductionPageComponent),
                data: {
                    header: false,
                    title: "Introduction",
                    sections: [
                        { id: "origin", name: "Origin" },
                        { id: "what-is-ngbjs", name: "What is NgbJS?" },
                        { id: "who-is-it-for", name: "Who is it for?" },
                        { id: "project-status", name: "Project status" },
                        { id: "installation", name: "Installation" },
                        { id: "acknowledgements", name: "Acknowledgements" },
                    ],
                },
                title: "Ngb-Js | Introduction",
            },
            {
                path: "philosophy",
                loadComponent: () => import("@/features/guide/pages/philosophy-page/philosophy-page.component").then(m => m.PhilosophyPageComponent),
                data: {
                    header: false,
                    title: "Philosophy",
                    sections: [
                        { id: "parity-is-priority", name: "Parity is Priority" },
                        { id: "what-parity-means", name: "What parity means" },
                        { id: "familiar-by-design", name: "Familiar by design" },
                        { id: "a-migration-bridge", name: "A migration bridge" },
                        { id: "when-parity-is-hard", name: "When parity is hard" },
                    ],
                },
                title: "Ngb-Js | Philosophy",
            },
            {
                path: "why-ngbjs",
                loadComponent: () => import("@/features/guide/pages/why-ngbjs-page/why-ngbjs-page.component").then(m => m.WhyNgbJsPageComponent),
                data: {
                    header: false,
                    title: "Why NgbJS?",
                    sections: [
                        { id: "the-legacy-reality", name: "The legacy reality" },
                        { id: "before-and-after", name: "Before and after" },
                        { id: "what-it-unlocks", name: "What NgbJS unlocks" },
                        { id: "when-to-use-ngbjs", name: "When to use NgbJS" },
                        { id: "a-bridge-not-a-destination", name: "A bridge, not a destination" },
                    ],
                },
                title: "Why NgbJS?",
            },
        ],
    },
];
