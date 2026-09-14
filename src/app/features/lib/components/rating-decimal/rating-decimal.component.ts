import { Component, type TemplateRef } from "ngjs-core";

@Component({
    selector: "docs-rating-decimal",
    controllerAs: "example",
    templateUrl: "./rating-decimal.component.html",
    styleUrl: "./rating-decimal.component.css",
})
export class RatingDecimalComponent {
    public rating = 3.14;
    public heartTemplate?: TemplateRef<unknown>;
    public readonly ariaValueText = (current: number, max: number) => `${current} out of ${max} hearts`;
}
