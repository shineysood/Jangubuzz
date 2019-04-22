import { Component, OnInit, Input, ViewChild } from "@angular/core";
import {
  StripeCardComponent,
  ElementOptions,
  ElementsOptions,
  StripeService
} from "ngx-stripe";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFireFunctions } from "@angular/fire/functions";
import Swal from "sweetalert2";

@Component({
  selector: "app-card-stripe",
  templateUrl: "./card-stripe.component.html",
  styleUrls: ["./card-stripe.component.css"]
})
export class CardStripeComponent implements OnInit {
  public payment_form: FormGroup;

  @ViewChild(StripeCardComponent) card: StripeCardComponent;

  @Input() modalRef: BsModalRef;
  @Input() paid_obj;

  cardOptions: ElementOptions = {
    style: {
      base: {
        iconColor: "#111",
        color: "#111",
        fontSize: "16px",
        "::placeholder": {
          color: "#00b3b3"
        }
      }
    }
  };

  // other optional options
  elementsOptions: ElementsOptions = {
    // locale: 'es'
  };

  constructor(
    private stripeService: StripeService,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute,
    private router: Router,
    private fns: AngularFireFunctions,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) {
    window.scroll(0, 0);

    this.payment_form = this.fb.group({
      name: [""]
    });
  }

  ngOnInit() {
    console.log(this.paid_obj);
  }

  payment() {
    const name = this.payment_form.controls["name"].value;
    console.log(name);
    this.stripeService
      .createToken(this.card.getCard(), { name })
      .subscribe(result => {
        if (result.token) {
          console.log("token: ", result.token);
          var obj = {
            userId: this.paid_obj.userId,
            hostId: this.paid_obj.hostId,
            listingId: this.paid_obj.listingid,
            ticketId: this.paid_obj.ticketId,
            totalTickets: this.paid_obj.totalTickets,
            email: this.paid_obj.email,
            token: result.token.id.toString()
          };

          const callable = this.fns.httpsCallable("on_ticket_purchase");
          const callable_subscriber = callable(obj);

          callable_subscriber.subscribe(data => {
            this.modalRef.hide();
            console.log(data);
            if (data.done) {
              Swal.fire("Success", data.done, "success");
            } else if (data.error) {
              Swal.fire("OOPS !!!", data.error, "error");
            }
          });
        } else if (result.error) {
          Swal.fire(result.error.type, result.error.message, "error");
        }
      });
  }
}
