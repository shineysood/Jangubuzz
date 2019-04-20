import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { ActivatedRoute, Router } from "@angular/router";
import { firebase } from "@firebase/app";
import { HttpClient } from "@angular/common/http";
// import {
//   StripeCardComponent,
//   ElementOptions,
//   ElementsOptions,
//   StripeService
// } from "ngx-stripe";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

@Component({
  selector: "app-experience",
  templateUrl: "./experience.component.html",
  styleUrls: ["./experience.component.css"]
})
export class ExperienceComponent implements OnInit {
  book_flag = false;
  listing;
  startDate;
  loading = true;
  listing_user;
  listingId;
  tickets;
  ticket_listing;
  ticket_host;
  modalRef: BsModalRef;
  // @ViewChild(StripeCardComponent) card: StripeCardComponent;

  // cardOptions: ElementOptions = {
  //   style: {
  //     base: {
  //       iconColor: "#111",
  //       color: "#111",
  //       fontSize: "16px",
  //       "::placeholder": {
  //         color: "#00b3b3"
  //       }
  //     }
  //   }
  // };

  //other optional options
  // elementsOptions: ElementsOptions = {
  // locale: 'es'
  // };

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute,
    // private stripeService: StripeService,
    private router: Router,
    private modalService: BsModalService
  ) {
    window.scroll(0, 0);
  }

  ngOnInit() {
    if (this.afAuth.auth.currentUser) {
      if (!this.afAuth.auth.currentUser.isAnonymous) {
        this.book_flag = true;
      }
    }

    this.route.params.subscribe(data => {
      this.listingId = data.id;
      this.getServiceListing(data.id);
    });
  }

  getServiceListing(id) {
    this.afs
      .doc("listing/" + id)
      .get()
      .subscribe(res => {
        this.listing = res.data();
        this.ticket_host = res.data().userId;
        this.ticket_listing = res.id;
        this.loading = false;
        this.listing.startDate = this.listing.startDate.toDate().toString();
        this.listing.endDate = this.listing.endDate.toDate().toString();

        console.log(this.listing.startDate);
        console.log(this.listing);

        // this.listing.startDay = this.listing.startDate.toDattoString().split(" ")[0];
        // this.listing.endDay = this.listing.endDate.toString().split(" ")[0];

        // to get the owner of the listing
        var listing_user: AngularFirestoreDocument = this.afs.doc(
          "user/" + this.listing.userId
        );
        listing_user.snapshotChanges().subscribe(user => {
          this.listing_user = user.payload.data().name;
        });
      });
  }

  buy_ticket(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
}
