import { Component, OnInit, TemplateRef } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFireFunctions } from "@angular/fire/functions";
import { Options } from "ng5-slider";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import Swal from "sweetalert2";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";

@Component({
  selector: "app-buy-ticket",
  templateUrl: "./buy-ticket.component.html",
  styleUrls: ["./buy-ticket.component.css"]
})
export class BuyTicketComponent implements OnInit {
  temp;
  hostId;
  ticketId;
  listingid;
  ticket;
  loading;
  value: number = 1;
  options: Options;
  card_brand;
  card_last4;

  EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  public ticket_form: FormGroup;

  modalRef: BsModalRef;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute,
    private router: Router,
    private fns: AngularFireFunctions,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) {
    window.scroll(0, 0);

    this.ticket_form = this.fb.group({
      email: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(this.EMAIL_REGEX)
        ])
      ]
    });
  }

  getPaymentInfo() {
    const doc: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.afAuth.auth.currentUser.uid + "/private/payment"
    );

    doc.valueChanges().subscribe(card => {
      this.card_brand = card.paymentBrand;
      this.card_last4 = card.paymentLastFour;
    });
  }

  ngOnInit() {
    if (this.afAuth.auth.currentUser) {
      if (!this.afAuth.auth.currentUser.isAnonymous) {
        this.getPaymentInfo();
        this.ticket_form.controls["email"].patchValue(
          this.afAuth.auth.currentUser.email
        );
      }
    }

    this.loading = true;
    this.route.params.subscribe(data => {
      this.ticketId = data.ticketId;
      this.hostId = data.hostId;
      this.listingid = data.listingId;
      this.afs
        .doc(
          "user/" +
            data.hostId +
            "/listing/" +
            data.listingId +
            "/ticket/" +
            data.ticketId
        )
        .snapshotChanges()
        .subscribe(res => {
          this.temp = res.payload.data();
          var t = this.temp.saleEndDate.toDate().toString();
          var obj = {
            id: res.payload.id,
            ticket: res.payload.data(),
            saleEndDate: t
          };
          this.ticket = obj;
          this.options = {
            floor: 0,
            ceil: this.temp.perOrderMax
          };
          console.log("ticket: ", this.ticket);
          this.loading = false;
        });
    });
  }

  get_ticket() {
    if (this.ticket_form.valid) {
      if (!this.ticket.ticket.isPriced) {
        if (this.ticket_form.valid) {
          var obj = {
            userId: this.afAuth.auth.currentUser.uid,
            hostId: this.hostId,
            listingId: this.listingid,
            ticketId: this.ticketId,
            totalTickets: this.value,
            email: this.ticket_form.controls["email"].value
          };
          console.log(obj);

          const callable = this.fns.httpsCallable("on_ticket_get");
          const callable_subscriber = callable(obj);

          callable_subscriber.subscribe(data => {
            if (data.done) {
              Swal.fire("Success", "Your ticket is " + data.done, "success");
              if (!this.afAuth.auth.currentUser.isAnonymous) {
                this.router.navigateByUrl("/settings");
              } else {
                Swal.fire(
                  "Success",
                  "Ticket has sent to " +
                    this.ticket_form.controls["email"].value,
                  "success"
                );
                this.router.navigateByUrl("/");
              }
            } else if (data.error) {
              Swal.fire("OOPS !!!", data.done, "error");
            }
          });
        } else {
          Object.keys(this.ticket_form.controls).forEach(i =>
            this.ticket_form.controls[i].markAsTouched()
          );
        }
      } else {
        this.payment();
      }
    } else {
      Object.keys(this.ticket_form.controls).forEach(i =>
        this.ticket_form.controls[i].markAsTouched()
      );
    }
  }

  payment() {
    const doc: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.afAuth.auth.currentUser.uid + "/private/payment"
    );

    doc.valueChanges().subscribe(card => {
      var obj = {
        name: card.paymentName,
        number: card.paymentNumber,
        exp_month: card.paymentExpMonth,
        exp_year: card.paymentExpYear,
        cvc: card.paymentCVC
      };
      (<any>window).Stripe.card.createToken(obj, (status: number, res: any) => {
        console.log(res);
        if (status === 200) {
          var obj = {
            userId: this.afAuth.auth.currentUser.uid,
            hostId: this.hostId,
            listingId: this.listingid,
            ticketId: this.ticketId,
            totalTickets: this.value,
            email: this.ticket_form.controls["email"].value,
            token: res.id.toString()
          };
          const callable = this.fns.httpsCallable("on_ticket_test_purchase");
          const callable_subscriber = callable(obj);
          callable_subscriber.subscribe(data => {
            if (data.done) {
              Swal.fire("Success", "Your ticket is " + data.done, "success");
              if (!this.afAuth.auth.currentUser.isAnonymous) {
                this.router.navigateByUrl("/settings");
              } else {
                Swal.fire(
                  "Success",
                  "Ticket has sent to your email",
                  "success"
                );
              }
            } else if (data.error) {
              Swal.fire("OOPS !!!", data.done, "error");
            }
          });
        } else {
          Swal.fire(res.error.type, res.error.message, "error");
        }
      });
    });
  }

  edit_payment(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
}
