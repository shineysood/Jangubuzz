import { Component, OnInit, TemplateRef } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { AngularFireFunctions } from "@angular/fire/functions";
import * as firebase from "firebase/app";
import { TimeFrameItem } from "../../../../../../Cedric/Cedric_Bitcef/src/assets/charting_library/charting_library.min.d";

@Component({
  selector: "app-space-and-service",
  templateUrl: "./space-and-service.component.html",
  styleUrls: ["./space-and-service.component.css"]
})
export class SpaceAndServiceComponent implements OnInit {
  listing;
  startDate;
  loading = true;
  listing_user;
  listing_id;
  online_user;
  comment;
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute,
    private fns: AngularFireFunctions,
    private router: Router
  ) {
    window.scroll(0, 0);
  }

  ngOnInit() {
    if (this.afAuth.auth.currentUser) {
      var online_user_doc: AngularFirestoreDocument = this.afs.doc(
        "user/" + this.afAuth.auth.currentUser.uid
      );
      online_user_doc.snapshotChanges().subscribe(data => {
        this.online_user = data.payload.data();
      });
    }

    this.route.params.subscribe(data => {
      this.listing_id = data.id;
      this.getListingBookings(this.listing_id);
      this.get_comments();
      this.getServiceListing(data.id);
    });
  }

  book_service() {
    var userId = this.afAuth.auth.currentUser.uid;
    var listingId = this.listing_id;
    this.router.navigate(["service/book", userId, listingId]);
  }

  book_space() {
    var userId = this.afAuth.auth.currentUser.uid;
    var listingId = this.listing_id;
    this.router.navigate(["space/book", userId, listingId]);
  }

  getServiceListing(id) {
    this.afs
      .doc("listing/" + id)
      .get()
      .subscribe(res => {
        this.listing = res.data();
        this.loading = false;
        console.log(this.listing);
        this.listing.startDate = new Date(
          this.listing.startDate.seconds * 1000
        ).toString();
        this.listing.endDate = new Date(
          this.listing.endDate.seconds * 1000
        ).toString();

        // to get the owner of the listing
        var listing_user: AngularFirestoreDocument = this.afs.doc(
          "user/" + this.listing.userId
        );
        listing_user.snapshotChanges().subscribe(user => {
          this.listing_user = user.payload.data().name;
        });
      });
  }

  comments() {
    if (this.afAuth.auth.currentUser) {
      var comment_id = this.afs.createId();
      const comment_doc: AngularFirestoreDocument = this.afs.doc(
        "user/" +
          this.afAuth.auth.currentUser.uid +
          "/listing/" +
          this.listing_id +
          "/comment/" +
          comment_id
      );

      comment_doc
        .set(
          {
            message: this.comment,
            listingId: this.listing_id,
            dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
            dateModified: firebase.firestore.Timestamp.fromDate(new Date()),
            userId: this.afAuth.auth.currentUser.uid,
            baseUserId: this.listing.userId
          },
          { merge: true }
        )
        .then(data => {
          comment_doc.snapshotChanges().subscribe(res => {
            console.log("comment: ", res.payload.data());
          });
        });
    }
  }

  getListingBookings(id) {
    console.log(this.afAuth.auth.currentUser.uid, id);
    if (this.afAuth.auth.currentUser) {
      this.afs
        .collection(
          "user/" + this.afAuth.auth.currentUser.uid + "/listing/" + id + "/job"
        )
        .snapshotChanges()
        .subscribe(data => {
          data.forEach((item, i) => {
            console.log(data[i].payload.doc.data());
          });
        });
    }
  }

  get_comments() {
    this.afs
      .collection("comments/")
      .snapshotChanges()
      .subscribe(res => {
        res.forEach((item, i) => {
          console.log(res[i].payload.doc.data());
        });
      });
  }

  

  reply_comments(listing_id, comment_id) {
    if (this.afAuth.auth.currentUser) {
      const reply_id = this.afs.createId();
      const reply_doc: AngularFirestoreDocument = this.afs.doc(
        "user/listing/" +
          listing_id +
          "comment/" +
          comment_id +
          "reply/" +
          reply_id
      );

      reply_doc
        .set(
          {
            message: "",
            listingId: "",
            commentId: "",
            dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
            userId: "user id that makes the comment",
            baseUserId: "uid of the user that created the listing"
          },
          { merge: true }
        )
        .then(res => {
          console.log("res: ", res);
          reply_doc.snapshotChanges().subscribe(data => {
            console.log(data.payload.data());
          });
        });
    }
  }
}
