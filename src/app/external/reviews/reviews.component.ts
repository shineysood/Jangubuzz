import { Component, OnInit, Input } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { BsModalRef } from "ngx-bootstrap/modal";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { SharedService } from "src/app/services/shared.service";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Component({
  selector: "app-reviews",
  templateUrl: "./reviews.component.html",
  styleUrls: ["./reviews.component.css"]
})
export class ReviewsComponent implements OnInit {
  @Input() review_obj;
  // temp_reviews;
  reviews: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private shared: SharedService
  ) {}

  ngOnInit() {
    this.getReviews(this.review_obj.hostId, this.review_obj.listingId);
  }

  getReviews(hostId, listingId) {
    var reviewsCollections = this.afs.collection(
      "user/" + hostId + "/listing/" + listingId + "/review",
      ref => ref.orderBy("dateCreated", "desc")
    );

    this.reviews = reviewsCollections.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const id = a.payload.doc.id;
          const data = a.payload.doc.data();
          return { id, ...data };
        })
      )
    );
  }

  getUser(uid) {
    return this.shared.getUser(uid);
  }
}
