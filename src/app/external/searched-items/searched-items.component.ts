import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";

@Component({
  selector: "app-searched-items",
  templateUrl: "./searched-items.component.html",
  styleUrls: ["./searched-items.component.css"]
})
export class SearchedItemsComponent implements OnInit {
  constructor(private route: ActivatedRoute, private afs: AngularFirestore) {
    this.route.params.subscribe(data => {
      // console.log("=====>", data);
    });
  }

  ngOnInit() {}

  search(location, listingType) {
    console.log(location, listingType);
  }
}
