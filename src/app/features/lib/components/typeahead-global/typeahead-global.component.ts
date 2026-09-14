import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
import { NgbTypeaheadConfig, NGB_TYPEAHEAD_CONFIG } from "ngb-js/typeahead";
import { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";

const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"];

@Component({
    selector: "docs-typeahead-global",
    controllerAs: "example",
    templateUrl: "./typeahead-global.component.html",
    styleUrl: "./typeahead-global.component.css",
})
export class TypeaheadGlobalComponent implements AfterViewInit, OnDestroy {
    public model = "";
    private readonly initialConfig: Pick<NgbTypeaheadConfig, "container" | "selectOnExact" | "showHint">;

    constructor(@Inject(NGB_TYPEAHEAD_CONFIG) private readonly config: NgbTypeaheadConfig) {
        this.initialConfig = {
            container: config.container,
            selectOnExact: config.selectOnExact,
            showHint: config.showHint,
        };
        config.container = "body";
        config.selectOnExact = true;
        config.showHint = true;
    }

    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term.length < 2 ? [] : STATES.filter(state => state.toLowerCase().startsWith(term.toLowerCase()))),
    );

    public ngAfterViewInit(): void { this.restoreConfig(); }
    public ngOnDestroy(): void { this.restoreConfig(); }
    private restoreConfig(): void {
        this.config.container = this.initialConfig.container;
        this.config.selectOnExact = this.initialConfig.selectOnExact;
        this.config.showHint = this.initialConfig.showHint;
    }
}
