import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-view-all-experiences",
  templateUrl: "./view-all-experiences.component.html",
  styleUrls: ["./view-all-experiences.component.css"]
})
export class ViewAllExperiencesComponent implements OnInit {
  experiences: Observable<any>;
  listings;
  loading = true;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    window.scroll(0, 0);
  }

  ngOnInit() {
    var experienceCollection = this.afs.collection("listing", ref =>
      ref.where("listingType", "==", "eventListingType").orderBy("dateCreated", "desc")
    );

    this.experiences = experienceCollection
      .stateChanges() // for realtime updates
      .pipe(
        map(actions =>
          actions.map(a => {
            const id = a.payload.doc.id;
            const data = a.payload.doc.data();
            return { id, ...data };
          })
        )
      );

    setTimeout(() => {
      this.loading = false;
    }, 1500);
    // .subscribe(listings => {
    //   this.listings = listings;
    //   this.listings.forEach((item, i) => {
    //     if (
    //       this.listings[i].payload.doc.data().listingType ===
    //       "eventListingType"
    //     ) {
    //       this.experiences.push({
    //         id: this.listings[i].payload.doc.id,
    //         payload: this.listings[i].payload.doc.data(),
    //         time: this.listings[i].payload.doc.data().dateCreated
    //       });
    //     }
    //     this.loading = false;
    //   });
    // });
  }

  open_experience(id) {
    this.router.navigate(["listing/experience", id]);
  }
}
