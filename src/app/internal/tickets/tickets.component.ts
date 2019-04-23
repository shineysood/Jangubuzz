import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";

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
      .collection("user/" + this.afAuth.auth.currentUser.uid + "/ticket")
      .snapshotChanges()
      .subscribe(data => {
        data.forEach((item, i) => {
          this.temp = item.payload.doc.data();
          var obj = {
            id: item.payload.doc.id,
            ticket: item.payload.doc.data(),
            dateCreated: this.temp.dateCreated.toDate().toString(),
            startDate: this.temp.startDate.toDate().toString()
          };
          this.tickets.push(obj);
        });
        console.log(this.tickets);
        this.loading = false;
      });
  }

  refund() {
    console.log("hello refund method")
  }
}
