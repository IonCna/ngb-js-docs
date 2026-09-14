import { Component } from "ngjs-core";
import type { IFormController } from "angular";

@Component({
    selector: "docs-rating-form",
    controllerAs: "example",
    templateUrl: "./rating-form.component.html",
    styleUrl: "./rating-form.component.css",
})
export class RatingFormComponent {
    public rating: number | null = null;
    public disabled = false;
    public form?: IFormController;

    public setRating(rating: number) { this.rating = rating; }
    public clear() { this.rating = null; }
}
