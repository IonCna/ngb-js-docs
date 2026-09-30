import { Component } from "ngjs-core";

@Component({
    selector: "docs-rating-events",
    controllerAs: "example",
    templateUrl: "./rating-events.component.html",
    styleUrl: "./rating-events.component.css",
})
export class RatingEventsComponent {
    public selected = 0;
    public hovered = 0;
    public readonly = false;
    public setSelected(value: number) { this.selected = value; }
    public setHovered(value: number) { this.hovered = value; }
}
