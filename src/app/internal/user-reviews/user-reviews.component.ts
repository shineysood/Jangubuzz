import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";

@Component({
  selector: "app-user-reviews",
  templateUrl: "./user-reviews.component.html",
  styleUrls: ["./user-reviews.component.css"]
})
export class UserReviewsComponent implements OnInit {
  reviews = [];
  user_rev_temp;
  loading = true;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  ngOnInit() {
    this.getReviews();
  }

  getReviews() {
    this.afs
      .collection("user/" + this.afAuth.auth.currentUser.uid + "/review", ref => ref.orderBy("dateCreated", "desc"))
      .snapshotChanges()
      .subscribe(data => {
        this.user_rev_temp = data;
        this.user_rev_temp.forEach((item, i) => {
          var user: AngularFirestoreDocument = this.afs.doc(
            "user/" + this.user_rev_temp[i].payload.doc.data().userId
          );
          user.snapshotChanges().subscribe(data => {
            var obj = {
              userName: data.payload.data().name,
              imageUrl: data.payload.data().profileImageUrl,
              id: this.user_rev_temp[i].payload.doc.id,
              review: this.user_rev_temp[i].payload.doc.data(),
              dateCreated: this.user_rev_temp[i].payload.doc
                .data()
                .dateCreated.toDate()
                .toString()
            };
            this.reviews.push(obj);
          });
        });
        console.log(this.reviews);
        this.loading = false;
      });
  }
}
