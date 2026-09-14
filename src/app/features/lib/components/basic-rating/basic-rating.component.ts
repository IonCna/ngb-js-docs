import { Component } from "ngjs-core";

@Component({
    selector: "docs-basic-rating",
    controllerAs: "example",
    templateUrl: "./basic-rating.component.html",
    styleUrl: "./basic-rating.component.css",
})
export class BasicRatingComponent {
    public rating = 3;
    public setRating(rating: number) { this.rating = rating; }
}
