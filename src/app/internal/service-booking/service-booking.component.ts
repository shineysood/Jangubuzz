import { Component, OnInit } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFireFunctions } from "@angular/fire/functions";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import * as firebase from "firebase/app";
import Swal from "sweetalert2";

@Component({
  selector: "app-service-booking",
  templateUrl: "./service-booking.component.html",
  styleUrls: ["./service-booking.component.css"]
})
export class ServiceBookingComponent implements OnInit {
  public service_book_form: FormGroup;
  listingId;
  hostId;
  listing;
start_date: Date;
  minDate: Date;

  EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

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
      startDate: ["", Validators.required],
      endDate: ["", Validators.required],
      startTime: ["", Validators.required],
      endTime: ["", Validators.required],
      bookingDetails: ["", Validators.required],
      email: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(this.EMAIL_REGEX)
        ])
      ]
    });
  }

  ngOnInit() {
    this.minDate = new Date();
    this.route.params.subscribe(params => {
      this.listingId = params.listingId;
      this.hostId = params.hostId;
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


  onValueChange(value: Date) {
    this.start_date = value;
  }

  request_booking() {
    if (this.service_book_form.valid) {
      // start date and time
      var sd = new Date(
        this.service_book_form.controls["startDate"].value
      ).toDateString();
      var st = this.service_book_form.controls["startTime"].value;
      var startDate = moment(sd + " " + st + ":00")
        .toDate()
        .toDateString();

      // end date and time
      var ed = new Date(
        this.service_book_form.controls["endDate"].value
      ).toDateString();
      var et = this.service_book_form.controls["endTime"].value;
      var endDate = moment(ed + " " + et + ":00")
        .toDate()
        .toDateString();

      var body = {
        userId: this.hostId,
        listingId: this.listingId,
        isApproval: false,
        startDate: startDate,
        endDate: endDate
      };
      console.log(body);
      // creating callable for the cloud functions
      const callable = this.fns.httpsCallable("on_booking_availability");
      var callable_subscriber = callable(body);

      // calling callable
      callable_subscriber.subscribe(data => {
        console.log("data: after booking: ", data);
        if (data.done) {
          // create a unique id for booking
          var booking_id = this.afs.createId();

          // getting the specific doc based on the booking id
          const book_doc: AngularFirestoreDocument = this.afs.doc(
            "user/" +
              this.afAuth.auth.currentUser.uid +
              "/booking/" +
              booking_id
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

              if (hours < 0) {
                hours = -1 * hours;
              }

              console.log("hours :", hours);

              // write to the database
              book_doc
                .set(
                  {
                    listingId: this.listingId,
                    userId: this.afAuth.auth.currentUser.uid,
                    hostId: this.hostId,
                    startDate: body.startDate,
                    endDate: body.endDate,
                    hours: hours,
                    perHourPrice: +this.listing.perHourPrice,
                    minHour: +this.listing.minHour,
                    email: this.service_book_form.controls["email"].value,
                    currency: this.listing.currency,
                    policy: this.listing.policy,
                    description: this.service_book_form.controls['bookingDetails'].value,
                    dateCreated: firebase.firestore.Timestamp.fromDate(
                      new Date()
                    ),
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
                  console.log(result);
                  book_doc.snapshotChanges().subscribe(res => {
                    console.log("res: ", res.payload.data());
                    if (res) {
                      Swal.fire("", "Booking Made Successfully", "success");
                      if (this.afAuth.auth.currentUser) {
                        if (!this.afAuth.auth.currentUser.isAnonymous) {
                          this.router.navigateByUrl("/settings");
                        } else {
                          this.router.navigateByUrl("/");
                        }
                      } else {
                        this.router.navigateByUrl("/");
                      }
                    } else {
                      console.log("Something went wrong");
                      Swal.fire(
                        "OOPS !!!",
                        "Something went wrong, please try again",
                        "error"
                      );
                    }
                  });
                })
                .catch(err => {
                  console.log("error: ", err);
                });
            });
        } else {
          alert("Something went wrong");
        }
      });
    } else {
      Object.keys(this.service_book_form.controls).forEach(i =>
        this.service_book_form.controls[i].markAsTouched()
      );
    }
  }

  set_temp() {}
}
