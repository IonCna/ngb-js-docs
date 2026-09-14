import { Component } from "ngjs-core";

@Component({
    selector: "docs-rating-custom-template",
    controllerAs: "example",
    templateUrl: "./rating-custom-template.component.html",
    styleUrl: "./rating-custom-template.component.css",
})
export class RatingCustomTemplateComponent {
    public rating = 6;
    public setRating(rating: number) { this.rating = rating; }
}
