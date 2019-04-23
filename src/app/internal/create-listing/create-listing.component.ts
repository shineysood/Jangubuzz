import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-create-listing",
  templateUrl: "./create-listing.component.html",
  styleUrls: ["./create-listing.component.css"]
})
export class CreateListingComponent implements OnInit {
  userId;
  listingType;
  
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(data => {
      this.userId = data.userId;
      this.listingType = data.listingType;
    });
  }
}
