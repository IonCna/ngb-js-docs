import { Component } from "ngjs-core";
import { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";

const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"];

@Component({
    selector: "docs-formatted-typeahead",
    controllerAs: "example",
    templateUrl: "./formatted-typeahead.component.html",
    styleUrl: "./formatted-typeahead.component.css",
})
export class FormattedTypeaheadComponent {
    public model = "";
    public readonly formatter = (result: string): string => result.toUpperCase();
    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term ? STATES.filter(state => state.toLowerCase().includes(term.toLowerCase())) : []),
    );
}
