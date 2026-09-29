import { Component } from "ngjs-core";
import { debounceTime, map, type OperatorFunction } from "rxjs";

interface State { name: string }
const STATES: State[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"].map(name => ({ name }));

@Component({
    selector: "docs-exact-typeahead",
    controllerAs: "example",
    templateUrl: "./exact-typeahead.component.html",
    styleUrl: "./exact-typeahead.component.css",
})
export class ExactTypeaheadComponent {
    public model?: State;
    public readonly formatter = (state: State): string => state.name;
    public readonly search: OperatorFunction<string, State[]> = text$ => text$.pipe(
        debounceTime(200),
        map(term => term ? STATES.filter(state => state.name.toLowerCase().includes(term.toLowerCase())) : []),
    );
}
