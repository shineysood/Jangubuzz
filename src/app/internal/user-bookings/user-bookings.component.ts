import { Component, OnInit, TemplateRef } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
import { Router } from '@angular/router';

@Component({
  selector: "app-user-bookings",
  templateUrl: "./user-bookings.component.html",
  styleUrls: ["./user-bookings.component.css"]
})
export class UserBookingsComponent implements OnInit {
  modalRef: BsModalRef;
  user_bookings = [];
  review_flag = true;
  temp_book;
  review_obj;
  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private modalService: BsModalService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.afAuth.auth.currentUser) {
      if (!this.afAuth.auth.currentUser.isAnonymous) {
        this.getUserBookings().subscribe(data => {
          this.temp_book = data;
          this.temp_book.forEach((item, i) => {
            if (
              this.temp_book[i].payload.doc.data().isHostApproved &&
              this.temp_book[i].payload.doc.data().isPaid &&
              !this.temp_book[i].payload.doc.data().isIssues &&
              !this.temp_book[i].payload.doc.data().isPaymentError
            ) {
              if (
                moment(new Date()).isAfter(
                  this.temp_book[i].payload.doc.data().endDate.toDate()
                )
              ) {
                this.review_flag = true;
              }
            } else {
              this.review_flag = false;
            }
            var obj = {
              id: data[i].payload.doc.id,
              payload: data[i].payload.doc.data()
            };
            this.user_bookings.push(obj);
          });
          console.log(this.user_bookings);
        });
      }
    }
  }

  getUserBookings() {
    return this.afs
      .collection("user/" + this.afAuth.auth.currentUser.uid + "/booking")
      .snapshotChanges();
  }

  cancel_booking(bookingId, userId) {
    console.log(userId, bookingId);
    const book_Doc: AngularFirestoreDocument = this.afs.doc(
      "user/" + userId + "/booking/" + bookingId
    );

    book_Doc
      .set(
        {
          isCanceled: true
        },
        { merge: true }
      )
      .then(data => {
        console.log("done");
      })
      .catch(err => {
        console.log("error: ", err);
      });
  }

  review(template: TemplateRef<any>, bookingId, listingId, hostId) {
    this.review_obj = {
      bookingId: bookingId,
      listingId: listingId,
      hostId: hostId,
      type: "user"
    };
    this.modalRef = this.modalService.show(template);
  }

  message(userId, hostId, bookingId, listingId) {
    var isBooking = "yes";
    this.router.navigate(["message/host", bookingId, isBooking, userId]);
  }
}
