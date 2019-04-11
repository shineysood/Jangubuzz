import { Component, OnInit } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFireFunctions } from "@angular/fire/functions";
import { FormBuilder, FormGroup } from "@angular/forms";
import * as moment from "moment";

@Component({
  selector: "app-service-booking",
  templateUrl: "./service-booking.component.html",
  styleUrls: ["./service-booking.component.css"]
})
export class ServiceBookingComponent implements OnInit {
  public service_book_form: FormGroup;
  listingId;
  userId;
  listing;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute,
    private fns: AngularFireFunctions,
    private router: Router,
    private fb: FormBuilder
  ) {
    window.scroll(0, 0);

    this.service_book_form = this.fb.group({
      startDate: [""],
      endDate: [""],
      startTime: [""],
      endTime: [""],
      bookingDetails: [""],
      email: [""]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.listingId = params.listingId;
      this.userId = params.userId;
    });
    if (
      this.afAuth.auth.currentUser &&
      !this.afAuth.auth.currentUser.isAnonymous
    ) {
      this.service_book_form.controls["email"].patchValue(
        this.afAuth.auth.currentUser.providerData[0].email
      );
    }
  }

  request_booking() {
    // start date and time
    var sd = new Date(
      this.service_book_form.controls["startDate"].value
    ).toDateString();
    var st = this.service_book_form.controls["startTime"].value;
    var startDate = moment(sd + " " + st).toDate();

    // end date and time
    var ed = new Date(
      this.service_book_form.controls["endDate"].value
    ).toDateString();
    var et = this.service_book_form.controls["endTime"].value;
    var endDate = moment(ed + " " + et).toDate();

    var body = {
      userId: this.userId,
      listingId: this.listingId,
      isApproval: false,
      startDate: startDate.toDateString(),
      endDate: endDate.toDateString()
    };
    console.log(body);
    // creating callable for the cloud functions
    const callable = this.fns.httpsCallable("on_booking_availability");
    var callable_subscriber = callable(body);

    // calling callable
    callable_subscriber.subscribe(data => {
      if (data.done) {
        // create a unique id for booking
        var booking_id = this.afs.createId();

        // getting the specific doc based on the booking id
        const book_doc: AngularFirestoreDocument = this.afs.doc(
          "user/" + body.userId + "/booking/" + booking_id
        );

        // getting listing from ID
        this.afs
          .doc("listing/" + this.listingId)
          .get()
          .subscribe(data => {
            this.listing = data.data();
            console.log(this.listing);

            var hours =
              this.service_book_form.controls["endTime"].value
                .toString()
                .split(":")[0] -
              this.service_book_form.controls["startTime"].value
                .toString()
                .split(":")[0];

            // write to the database
            book_doc
              .set(
                {
                  listingId: this.listingId,
                  userId: this.userId,
                  hostId: this.listing.userId,
                  startDate: body.startDate,
                  endDate: body.endDate,
                  hours: hours,
                  perHourPrice: +this.listing.perHourPrice,
                  minHour: +this.listing.minHour,
                  email: this.service_book_form.controls["startDate"].value.toString(),
                  currency: this.listing.currency,
                  policy: this.listing.policy,
                  description: this.listing.description,
                  dateCreated: this.listing.dateCreated,
                  listingType: this.listing.listingType,
                  isHostApproved: false,
                  isPaid: false,
                  isCanceled: false,
                  isIssues: false,
                  hostCanceled: false,
                  isPaymentError: false,
                  issues: "",
                  paymentError: ""
                },
                {
                  merge: true
                }
              )
              .then(result => {
                book_doc.snapshotChanges().subscribe(res => {
                  // console.log("res: ", res.payload.data());
                  if (res) {
                    alert("Booking Made Successfully");
                  } else {
                    alert("Something went wrong");
                    this.router.navigateByUrl("/");
                  }
                });
              });
          });
      } else {
        alert("Something went wrong");
      }
    });
  }

  set_temp() {
    var h =
      this.service_book_form.controls["endTime"].value
        .toString()
        .split(":")[0] -
      this.service_book_form.controls["startTime"].value
        .toString()
        .split(":")[0];

    console.log(h);
    // {
    //   listingId: this.listingId,
    //   userId: this.userId,
    //   hostId: listing.userId,
    //   startDate: body.startDate,
    //   endDate: body.endDate,
    //   hours: "",
    //   perHourPrice: "",
    //   minHour: "",
    //   perDayPrice: "",
    //   minDay: "",
    //   email: "",
    //   currency: "",
    //   policy: "",
    //   description: "",
    //   damageChargeDate: "",
    //   damageDeposit: "",
    //   cleaningFee: "",
    //   dateCreated: "",
    //   listingType: "",
    //   isHostApproved: false,
    //   isPaid: false,
    //   isCanceled: false,
    //   isDamagePaid: false,
    //   isIssues: false,
    //   hostCanceled: false,
    //   isPaymentError: false,
    //   isDamageError: false,
    //   issues: "",
    //   paymentError: "",
    //   damageError: ""
    // }
  }
}
