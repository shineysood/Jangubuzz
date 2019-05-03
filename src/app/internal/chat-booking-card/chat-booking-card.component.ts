import { Component, OnInit, Input } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";

@Component({
  selector: "app-chat-booking-card",
  templateUrl: "./chat-booking-card.component.html",
  styleUrls: ["./chat-booking-card.component.css"]
})
export class ChatBookingCardComponent implements OnInit {
  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth) {}

  ngOnInit() {}
}
