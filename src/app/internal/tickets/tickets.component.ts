import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";

@Component({
  selector: "app-tickets",
  templateUrl: "./tickets.component.html",
  styleUrls: ["./tickets.component.css"]
})
export class TicketsComponent implements OnInit {
  loading = true;
  tickets = [];
  temp;
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  ngOnInit() {
    this.loading = true;
    this.getUserTickets();
  }

  getUserTickets() {
    this.afs
      .collection("user/" + this.afAuth.auth.currentUser.uid + "/ticket", ref => ref.orderBy("dateCreated", "desc"))
      .snapshotChanges()
      .subscribe(data => {
        data.forEach((item, i) => {
          this.temp = item.payload.doc.data();

          var flag_refund;

          if (
            this.temp.isPriced &&
            this.temp.status === "purchased" &&
            this.temp.totalTickets === this.temp.ticketsLeft &&
            this.temp.policy !== "no"
          ) {
            flag_refund = 1;
          } else {
            flag_refund = 0;
          }

          var obj = {
            purchaseId: item.payload.doc.id,
            ticket: item.payload.doc.data(),
            dateCreated: this.temp.dateCreated.toDate().toString(),
            startDate: this.temp.startDate.toDate().toString(),
            flag_refund: flag_refund
          };
          this.tickets.push(obj);
        });
        console.log(this.tickets);
        this.loading = false;
      });
  }

  refund(id) {
    this.loading = true;
    const ticket_Doc_Refund: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.afAuth.auth.currentUser.uid + "/ticket/" + id
    );

    ticket_Doc_Refund
      .set(
        {
          status: "requested"
        },
        { merge: true }
      )
      .then(data => {
        this.tickets = [];
        this.getUserTickets();
        ticket_Doc_Refund.snapshotChanges().subscribe(data1 => {
          console.log("====> refund ticket", data1.payload.data());
          this.loading = false;
        });
      })
      .catch(err => {
        this.loading = false;
        console.log("error: ", err);
      });
  }
}
