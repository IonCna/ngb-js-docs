import { Component } from "ngjs-core";
import { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";

interface State { id: number; name: string }
const STATES: State[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"].map((name, id) => ({ id, name }));

@Component({
    selector: "docs-non-editable-typeahead",
    controllerAs: "example",
    templateUrl: "./non-editable-typeahead.component.html",
    styleUrl: "./non-editable-typeahead.component.css",
})
export class NonEditableTypeaheadComponent {
    public model: State | null = null;
    public readonly formatter = (state: State): string => state.name;
    public readonly search: OperatorFunction<string, State[]> = text$ => text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term.length < 2 ? [] : STATES.filter(state => state.name.toLowerCase().includes(term.toLowerCase()))),
    );
}
