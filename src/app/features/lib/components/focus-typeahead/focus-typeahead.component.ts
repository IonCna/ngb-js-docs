import { Component, type OnDestroy } from "ngjs-core";
import { debounceTime, distinctUntilChanged, map, merge, type OperatorFunction, Subject } from "rxjs";

const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

@Component({
    selector: "docs-focus-typeahead",
    controllerAs: "example",
    templateUrl: "./focus-typeahead.component.html",
    styleUrl: "./focus-typeahead.component.css",
})
export class FocusTypeaheadComponent implements OnDestroy {
    public model = "";
    public readonly focus$ = new Subject<string>();
    public readonly search: OperatorFunction<string, string[]> = text$ => merge(
        text$.pipe(debounceTime(200), distinctUntilChanged()),
        this.focus$,
    ).pipe(
        map(term => (term ? STATES.filter(state => state.toLowerCase().includes(term.toLowerCase())) : STATES).slice(0, 10)),
    );
    public ngOnDestroy(): void { this.focus$.complete(); }
}
