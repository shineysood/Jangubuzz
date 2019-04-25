import { Component, OnInit, Input } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { BsModalRef } from "ngx-bootstrap/modal";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import * as firebase from "firebase/app";

@Component({
  selector: "app-reviews",
  templateUrl: "./reviews.component.html",
  styleUrls: ["./reviews.component.css"]
})
export class ReviewsComponent implements OnInit {
  @Input() modalRef: BsModalRef;
  @Input() review_obj;

  public review_form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    this.review_form = this.fb.group({
      message: [""],
      rating: [""]
    });
  }

  ngOnInit() {
    console.log(this.review_obj);
  }

  review() {
    var reviewId = this.afs.createId();
    const review_doc: AngularFirestoreDocument = this.afs.doc(
      "user/" +
        this.afAuth.auth.currentUser.uid +
        "/booking/" +
        this.review_obj.bookingId +
        "/review/" +
        reviewId
    );

    review_doc
      .set(
        {
          message: this.review_form.controls["message"].value,
          bookingId: this.review_obj.bookingId,
          listingId: this.review_obj.listingId,
          hostId: this.review_obj.hostId,
          userId: this.afAuth.auth.currentUser.uid,
          dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
          rating: parseFloat(this.review_form.controls["rating"].value)
        },
        { merge: true }
      )
      .then(res => {
        console.log("done");
      })
      .catch(err => {
        console.log("error: ", err);
      });
  }
}
