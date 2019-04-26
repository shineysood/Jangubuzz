import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import * as moment from "moment";
import Swal from "sweetalert2";

@Component({
  selector: "app-create-ticket",
  templateUrl: "./create-ticket.component.html",
  styleUrls: ["./create-ticket.component.css"]
})
export class CreateTicketComponent implements OnInit {
  listingId;
  listing;
  hostId;
  temp;
  public ticket_form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {
    window.scroll(0, 0);

    this.ticket_form = this.fb.group({
      title: ["", Validators.required],
      ticketType: [""],
      price: ["", Validators.required],
      maxPerOrder: ["", Validators.required],
      ticketsAvailable: ["", Validators.required],
      passOn: [""],
      description: ["", Validators.required],
      endTime: ["", Validators.required],
      endDate: ["", Validators.required]
    });
  }

  ngOnInit() {
    this.ticket_form.controls["ticketType"].patchValue("paid");
    this.ticket_form.controls["price"].patchValue(0);
    this.ticket_form.controls["maxPerOrder"].patchValue(0);
    this.ticket_form.controls["ticketsAvailable"].patchValue(0);
    this.ticket_form.controls["passOn"].patchValue("passOn");

    this.route.params.subscribe(res => {
      this.listingId = res.listingId;
      this.hostId = res.userId;

      this.afs
        .doc("listing/" + res.listingId)
        .snapshotChanges()
        .subscribe(res => {
          this.listing = res.payload.data();
        });
    });
  }

  createTicket() {
    if (this.ticket_form.valid) {
      // create id
      var ticketId = this.afs.createId();

      var ticket_doc: AngularFirestoreDocument = this.afs.doc(
        "user/" +
          this.afAuth.auth.currentUser.uid +
          "/listing/" +
          this.listingId +
          "/ticket/" +
          ticketId
      );

      var passOn;
      if (this.ticket_form.controls["passOn"].value === "passOn") {
        passOn = true;
      } else if (this.ticket_form.controls["passOn"].value === "notPassOn") {
        passOn = false;
      }

      var price;
      var isPriced;
      if (this.ticket_form.controls["ticketType"].value === "paid") {
        isPriced = true;
        price = parseFloat(this.ticket_form.controls["price"].value);
      } else if (this.ticket_form.controls["ticketType"].value === "free") {
        isPriced = false;
        price = parseFloat("0");
      }

      var endDate = new Date(
        this.ticket_form.controls["endDate"].value
      ).toDateString();
      var endTime = this.ticket_form.controls["endTime"].value;
      var endSale = moment(endDate + " " + endTime + ":00").toDate();

      // write to the database
      ticket_doc
        .set(
          {
            title: this.ticket_form.controls["title"].value,
            isPriced: isPriced,
            passOn: passOn,
            currency: this.listing.currency,
            policy: this.listing.policy,
            price: price,
            perOrderMax: +this.ticket_form.controls["maxPerOrder"].value,
            numberOfTickets: +this.ticket_form.controls["ticketsAvailable"]
              .value,
            ticketsLeft: +this.ticket_form.controls["ticketsAvailable"].value,
            description: this.ticket_form.controls["description"].value,
            listingId: this.listingId,
            isClosed: false,
            saleEndDate: firebase.firestore.Timestamp.fromDate(endSale),
            dateCreated: firebase.firestore.Timestamp.fromDate(new Date())
          },
          { merge: true }
        )
        .then(data => {
          ticket_doc.snapshotChanges().subscribe(res => {
            console.log(res.payload.data());
          });
          Swal.fire("", "Ticket created successfully", "success");
          this.router.navigateByUrl("/settings");
        })
        .catch(err => {
          console.log(err);
          Swal.fire(err.error.code, err.error.message, "error");
        });
    } else {
      Object.keys(this.ticket_form.controls).forEach(i =>
        this.ticket_form.controls[i].markAsTouched()
      );
    }
  }
}
