import { Component, OnInit, ViewChild } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { ActivatedRoute, Router } from "@angular/router";
import { firebase } from "@firebase/app";
import { HttpClient } from "@angular/common/http";
import {
  StripeCardComponent,
  ElementOptions,
  ElementsOptions,
  StripeService
} from "ngx-stripe";

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

  @ViewChild(StripeCardComponent) card: StripeCardComponent;

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

  //other optional options
  elementsOptions: ElementsOptions = {
    // locale: 'es'
  };

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute,
    private stripeService: StripeService,
    private router: Router
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
      if (this.afAuth.auth.currentUser) {
        this.getTickets(data.id);
      }
    });
  }

  getTickets(id) {
    this.afs
      .collection(
        "user/" +
          this.afAuth.auth.currentUser.uid +
          "/listing/" +
          id +
          "/ticket"
      )
      .snapshotChanges()
      .subscribe(tickets => {
        if (tickets.length !== 0) {
          console.log("tickets: ", tickets[0].payload.doc.data());
        }
      });
  }

  getServiceListing(id) {
    this.afs
      .doc("listing/" + id)
      .get()
      .subscribe(res => {
        this.listing = res.data();
        console.log(this.listing);
        this.loading = false;
        this;
        console.log(this.listing);
        this.listing.startDate = new Date(
          this.listing.startDate.seconds * 1000
        ).toString();
        this.listing.endDate = new Date(
          this.listing.endDate.seconds * 1000
        ).toString();
        this.listing.startDay = this.listing.startDate.split(" ")[0];
        this.listing.endDay = this.listing.endDate.split(" ")[0];

        // to get the owner of the listing
        var listing_user: AngularFirestoreDocument = this.afs.doc(
          "user/" + this.listing.userId
        );
        listing_user.snapshotChanges().subscribe(user => {
          this.listing_user = user.payload.data().name;
        });
      });
  }

  buy_ticket() {
    console.log(this.listingId);
    if (this.listing.isFree) {
      this.router.navigate(["experience/ticket/buy", this.listingId]);
    } else {
      console.log("hello paid");
    }
  }

  // buy_ticket() {
  //   this.stripeService.createToken(this.card.getCard(), { name })
  //       .subscribe(result => {

  //         if (result.token) {
  //   var token =
  //   // console.log("booking button is working");
  //   var body = {
  //       userId: this.afAuth.auth.currentUser.uid,
  //       hostId:"userid from experience",
  //       ticketId : "id of the ticket",
  //       listingId : "id of event",
  //       totalTickets: "number of tickets the user wants (int)",
  //       email: "email of the user",
  //       token: "token from stripe generated from the values of the card that is entered by the user"
  //   }
  //   this.http.post("https://us-central1-jangubuzz-e67f1.cloudfunctions.net/on_ticket_purchase", body).subscribe(data=>{
  //     console.log("====> buy tickets data: ",data)
  //   })
  //   // this.afAuth.auth.currentUser.getIdToken;
  // }
}
