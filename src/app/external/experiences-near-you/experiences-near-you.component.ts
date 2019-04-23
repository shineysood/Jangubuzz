import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";

@Component({
  selector: "app-experiences-near-you",
  templateUrl: "./experiences-near-you.component.html",
  styleUrls: ["./experiences-near-you.component.css"]
})
export class ExperiencesNearYouComponent implements OnInit {
  experiences: Array<any> = [];
  listings;
  loading = true;
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit() {
    this.loading = true;
    this.afs
      .collection("listing")
      .stateChanges() // for realtime updates
      .subscribe(listings => {
        this.listings = listings;
        this.listings.forEach((item, i) => {
          if (
            this.listings[i].payload.doc.data().listingType ===
            "eventListingType"
          ) {
            this.experiences.push({
              id: this.listings[i].payload.doc.id,
              payload: this.listings[i].payload.doc.data(),
              time: this.listings[i].payload.doc.data().dateCreated
            });
          }
          this.loading = false;
        });
      });
  }

  open_experience(id) {
    this.router.navigate(["listing/experience", id]);
  }
}
