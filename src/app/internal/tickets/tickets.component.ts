import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";

@Component({
  selector: "app-tickets",
  templateUrl: "./tickets.component.html",
  styleUrls: ["./tickets.component.css"]
})
export class TicketsComponent implements OnInit {
  tickets = [];
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  ngOnInit() {
    this.getUserTickets();
  }

  getUserTickets() {
    this.afs
      .collection("user/" + this.afAuth.auth.currentUser.uid + "/ticket")
      .snapshotChanges()
      .subscribe(data => {
        data.forEach((item, i) => {
          var obj = {
            id: item.payload.doc.id,
            ticket: item.payload.doc.data()
          };
          this.tickets.push(obj);
        });
        console.log(this.tickets);
      });
  }
}
