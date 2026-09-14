import { Component, type TemplateRef } from "ngjs-core";
import { debounceTime, map, type OperatorFunction } from "rxjs";

interface Country { name: string; flag: string; region: string }
const COUNTRIES: Country[] = [
    { name: "Mexico", flag: "🇲🇽", region: "North America" },
    { name: "Argentina", flag: "🇦🇷", region: "South America" },
    { name: "Brazil", flag: "🇧🇷", region: "South America" },
    { name: "Canada", flag: "🇨🇦", region: "North America" },
    { name: "Colombia", flag: "🇨🇴", region: "South America" },
    { name: "Germany", flag: "🇩🇪", region: "Europe" },
    { name: "Japan", flag: "🇯🇵", region: "Asia" },
    { name: "Spain", flag: "🇪🇸", region: "Europe" },
];

@Component({
    selector: "docs-template-results-typeahead",
    controllerAs: "example",
    templateUrl: "./template-results-typeahead.component.html",
    styleUrl: "./template-results-typeahead.component.css",
})
export class TemplateResultsTypeaheadComponent {
    public model?: Country;
    public resultTemplate?: TemplateRef<unknown>;
    public readonly formatter = (country: Country): string => country.name;
    public readonly search: OperatorFunction<string, Country[]> = text$ => text$.pipe(
        debounceTime(200),
        map(term => term ? COUNTRIES.filter(country => country.name.toLowerCase().includes(term.toLowerCase())).slice(0, 8) : []),
    );
}
