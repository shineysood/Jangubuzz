import { Component, OnInit, TemplateRef } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { AngularFireFunctions } from "@angular/fire/functions";
import { BsModalService } from "ngx-bootstrap/modal";

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
    this.route.params.subscribe(data => {
      this.listing_id = data.id;
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
}
