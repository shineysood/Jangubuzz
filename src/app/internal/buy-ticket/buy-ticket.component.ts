import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef
} from "@angular/core";
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
import {
  StripeCardComponent,
  ElementOptions,
  ElementsOptions,
  StripeService
} from "ngx-stripe";
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
  value: number = 0;
  options: Options;

  paid_obj = {
    userId: "",
    hostId: "",
    listingId: "",
    ticketId: "",
    totalTickets: 0,
    email: ""
  };

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

  ngOnInit() {
    if (this.afAuth.auth.currentUser) {
      this.ticket_form.controls["email"].patchValue(
        this.afAuth.auth.currentUser.email
      );
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

  get_ticket(template: TemplateRef<any>) {
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
            Swal.fire("Success", data.done, "success");
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
      this.paid_obj = {
        userId: this.afAuth.auth.currentUser.uid,
        hostId: this.hostId,
        listingId: this.listingid,
        ticketId: this.ticketId,
        totalTickets: this.value,
        email: this.ticket_form.controls["email"].value
      };
      this.modalRef = this.modalService.show(template);
    }
  }
}
