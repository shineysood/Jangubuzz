import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";

@Component({
  selector: "app-searched-items",
  templateUrl: "./searched-items.component.html",
  styleUrls: ["./searched-items.component.css"]
})
export class SearchedItemsComponent implements OnInit {
  searchedItems = [];
  loading = true;
  no_list = false;
  temp = [];
  constructor(
    private route: ActivatedRoute,
    private afs: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.afs
        .collection("listing")
        .snapshotChanges()
        .subscribe(data => {
          this.temp = data;
          this.temp.forEach((item, i) => {
            if (
              this.temp[i].payload.doc.data().listingType ===
                params.listingType &&
              this.temp[i].payload.doc.data().locationAddress ===
                params.location
            ) {
              var obj = {
                id: this.temp[i].payload.doc.id,
                payload: this.temp[i].payload.doc.data(),
                type: this.temp[i].payload.doc.data().listingType
              };
              this.searchedItems.push(obj);
              this.loading = false;
            }
          });
          this.loading = false;
        });
    });
  }

  navigate_listing(id, type) {
    if (type === "eventListingType") {
      this.router.navigate(["listing/experience", id]);
    } else if (
      type === "eventSpaceListingType" ||
      type === "eventServiceListingType"
    ) {
      this.router.navigate(["listing/spaces-and-services", id]);
    }
  }
}
