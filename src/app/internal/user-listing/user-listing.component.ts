import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";

@Component({
  selector: "app-user-listing",
  templateUrl: "./user-listing.component.html",
  styleUrls: ["./user-listing.component.css"]
})
export class UserListingComponent implements OnInit {
  user_listings = [];
  all_listings;
  experiences = [];
  services = [];
  spaces = [];

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    window.scroll(0, 0);
  }

  ngOnInit() {
    this.getListing();
  }

  getListing() {
    this.afs
      .collection("listing")
      .snapshotChanges()
      .subscribe(list => {
        this.all_listings = list;
        list.forEach((item, i) => {
          if (
            this.all_listings[i].payload.doc.data().userId ===
            this.afAuth.auth.currentUser.uid
          ) {
            if (
              this.all_listings[i].payload.doc.data().listingType ===
              "eventListingType"
            ) {
              var exp_listing = {
                id: this.all_listings[i].payload.doc.id,
                payload: this.all_listings[i].payload.doc.data()
              };
              this.experiences.push(exp_listing);
            } else if (
              this.all_listings[i].payload.doc.data().listingType ===
              "eventServiceListingType"
            ) {
              var service_listing = {
                id: this.all_listings[i].payload.doc.id,
                payload: this.all_listings[i].payload.doc.data()
              };
              this.services.push(service_listing);
            } else if (
              this.all_listings[i].payload.doc.data().listingType ===
              "eventSpaceListingType"
            ) {
              var space_listing = {
                id: this.all_listings[i].payload.doc.id,
                payload: this.all_listings[i].payload.doc.data()
              };
              this.services.push(space_listing);
            }
          }
        });
      });
  }

  navigate(id, type) {
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
