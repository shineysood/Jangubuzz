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
  loading = true;
  users = [];

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  ngOnInit() {
    this.getUserList();
    this.getReviews();
  }

  getUserList() {
    this.afs
      .collection("user")
      .stateChanges(["added"])
      .subscribe(users => {
        users.forEach(item => {
          var d: any = item;
          var user = {
            id: d.payload.doc.id,
            name: d.payload.doc.data().name,
            imageUrl: d.payload.doc.data().profileImageUrl
          };
          this.users.push(user);
        });
      });
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
          return { id, ...data };
        })
      )
    );
  }

  getUser(uid) {
    var user = this.users.filter((item, i) => {
      return item.id === uid;
    });
    return user[0];
  }
}
