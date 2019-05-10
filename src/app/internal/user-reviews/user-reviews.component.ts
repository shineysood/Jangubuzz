import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { SharedService } from "src/app/services/shared.service";

@Component({
  selector: "app-user-reviews",
  templateUrl: "./user-reviews.component.html",
  styleUrls: ["./user-reviews.component.css"]
})
export class UserReviewsComponent implements OnInit {
  reviews: Observable<any[]>;
  loading = true;
  users: Array<any> = [];

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private shared: SharedService
  ) {}

  ngOnInit() {
    this.users = this.shared.getUserList();
    this.getReviews();
  }

  getReviews() {
    var reviewsCollection = this.afs.collection(
      "user/" + this.afAuth.auth.currentUser.uid + "/review",
      ref => ref.orderBy("dateCreated", "desc")
    );
    this.reviews = reviewsCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          var data: any = a.payload.doc.data();
          var id = a.payload.doc.id;
          var user = this.afs
            .doc("user/" + data.userId)
            .snapshotChanges()
            .pipe(
              map(actions => {
                const ids = actions.payload.id;
                const user_doc = actions.payload.data();
                console.log("user in map: ", user_doc);
                return { ids, ...user_doc };
              })
            );

          return { id, ...data, user };
        })
      )
    );
  }

  // getUser(uid) {
  //   return this.shared.getUser(uid);
  //   console.log("id: ", uid)
  // }
}
