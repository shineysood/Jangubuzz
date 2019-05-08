import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";

@Component({
  selector: "app-card-stripe",
  templateUrl: "./card-stripe.component.html",
  styleUrls: ["./card-stripe.component.css"]
})
export class CardStripeComponent implements OnInit {
  public payment_form: FormGroup;
  @Input() modalRef: BsModalRef;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private fb: FormBuilder
  ) {
    window.scroll(0, 0);

    this.payment_form = this.fb.group({
      name: ["", Validators.required],
      number: ["", Validators.required],
      year: ["", Validators.required],
      month: ["", Validators.required],
      cvc: ["", Validators.required]
    });
  }

  ngOnInit() {}

  save_card() {
    var obj = {
      name: this.payment_form.controls["name"].value,
      number: this.payment_form.controls["number"].value,
      exp_month: this.payment_form.controls["month"].value,
      exp_year: this.payment_form.controls["year"].value,
      cvc: this.payment_form.controls["cvc"].value
    };

    const payment_doc: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.afAuth.auth.currentUser.uid + "/private/payment"
    );

    (<any>window).Stripe.card.createToken(obj, (status: number, res: any) => {
      if (status === 200) {
        payment_doc
          .set(
            {
              paymentName: obj.name,
              paymentNumber: obj.number,
              paymentCVC: obj.cvc,
              paymentExpMonth: +obj.exp_month,
              paymentExpYear: obj.exp_year,
              paymentLastFour: res.card.last4,
              paymentBrand: res.card.brand,
              dateModified: firebase.firestore.Timestamp.fromDate(new Date())
            },
            { merge: true }
          )
          .then(result => {
            this.modalRef.hide();
          });
      } else {
        console.log("something went wrong");
      }
    });
  }
}
