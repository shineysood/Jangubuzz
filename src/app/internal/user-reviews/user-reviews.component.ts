import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Component({
  selector: "app-user-reviews",
  templateUrl: "./user-reviews.component.html",
  styleUrls: ["./user-reviews.component.css"]
})
export class UserReviewsComponent implements OnInit {
  reviews: Observable<any[]>;
  user_rev_temp;
  user: any;
  loading = true;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  ngOnInit() {
    this.getReviews();
  }

  getReviews() {
    var reviewsCollection = this.afs.collection(
      "user/" + this.afAuth.auth.currentUser.uid + "/review",
      ref => ref.orderBy("dateCreated", "desc")
    );
    this.reviews = reviewsCollection.stateChanges(["added"]).pipe(
      map(actions =>
        actions.map(a => {
          var data: any = a.payload.doc.data();
          var id = a.payload.doc.id;
          console.log(this.getUser(data.userId));
          return { id, ...data };
        })
      )
    );
  }

  getUser(uid) {
    return this.afs
      .doc("user/" + uid)
      .valueChanges()
      .subscribe(res => {
        return res;
      });
  }
}
