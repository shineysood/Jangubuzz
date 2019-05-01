import { Component, OnInit, Input } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { BsModalRef } from "ngx-bootstrap/modal";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";

@Component({
  selector: "app-reviews",
  templateUrl: "./reviews.component.html",
  styleUrls: ["./reviews.component.css"]
})
export class ReviewsComponent implements OnInit {
  @Input() review_obj;
  temp_reviews;
  reviews = [];

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {
    this.getReviews(this.review_obj.hostId, this.review_obj.listingId);
  }

  getReviews(hostId, listingId) {
    this.afs
      .collection("user/" + hostId + "/listing/" + listingId + "/review")
      .snapshotChanges()
      .subscribe(res => {
        this.temp_reviews = res;
        this.temp_reviews.forEach((item, i) => {
          var user: AngularFirestoreDocument = this.afs.doc(
            "user/" + this.temp_reviews[i].payload.doc.data().userId
          );
          user.snapshotChanges().subscribe(data => {
            var obj = {
              userName: data.payload.data().name,
              imageUrl: data.payload.data().profileImageUrl,
              id: this.temp_reviews[i].payload.doc.id,
              review: this.temp_reviews[i].payload.doc.data(),
              dateCreated: this.temp_reviews[i].payload.doc
                .data()
                .dateCreated.toDate()
                .toString()
            };
            this.reviews.push(obj);
          });
        });
        console.log(this.reviews);
      });
  }
}
