import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Component({
  selector: "app-experiences-near-you",
  templateUrl: "./experiences-near-you.component.html",
  styleUrls: ["./experiences-near-you.component.css"]
})
export class ExperiencesNearYouComponent implements OnInit {
  experiences: Array<any> = [];
  // listings: Observable<any[]>;
  listings= [];
  loading = true;
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit() {
    this.loading = true;
    var listingCollection = this.afs.collection("listing", ref =>
      ref.where("listingType", "==", "eventListingType")
    );

    listingCollection
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

    // this.listings = listingCollection.stateChanges(["added"]).pipe(
    //   map(actions =>
    //     actions.map(a => {
    //       console.log(a)
    //       const data = a.payload.doc.data();
    //       const id = a.payload.doc.id;
    //       return { id, ...data };
    //     })
    //   )
    // );
  }

  open_experience(id) {
    this.router.navigate(["listing/experience", id]);
  }
}
