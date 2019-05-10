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
  listings: Observable<any[]>;
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

    this.listings = listingCollection.stateChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );

    setTimeout(() => {
      this.loading = false;
    }, 3000);
  }

  open_experience(id) {
    this.router.navigate(["listing/experience", id]);
  }
}
