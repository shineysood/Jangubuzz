import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";

@Component({
  selector: "app-view-all-experiences",
  templateUrl: "./view-all-experiences.component.html",
  styleUrls: ["./view-all-experiences.component.css"]
})
export class ViewAllExperiencesComponent implements OnInit {
  experiences: Array<any> = [];
  listings;
  loading = true;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit() {
    window.scroll(0, 0);
    this.loading = true;
    this.afs
      .collection("listing", ref => ref.orderBy("dateCreated", "desc"))
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
