import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestoreDocument } from "@angular/fire/firestore";
import * as firebase from "firebase/app";
import { Router } from "@angular/router";

@Component({
  selector: "app-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.css"]
})
export class MessagesComponent implements OnInit {
  messages = [];
  message_temp;
  threads = [];
  thread_temp;
  user_temp;
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit() {
    this.getMessages();
  }

  getMessages() {
    this.afs
      .collection("user/" + this.afAuth.auth.currentUser.uid + "/message")
      .snapshotChanges()
      .subscribe(data => {
        this.thread_temp = data;
        this.thread_temp.forEach((item, i) => {
          this.afs
            .doc("user/" + this.thread_temp[i].payload.doc.data().userId)
            .snapshotChanges()
            .subscribe(user => {
              this.user_temp = user;
              // console.log(this.thread_temp[i].payload.doc.data())
              var obj = {
                userName: this.user_temp.payload.data().name,
                imageUrl: this.user_temp.payload.data().profileImageUrl,
                id: this.thread_temp[i].payload.doc.id,
                thread: this.thread_temp[i].payload.doc.data(),
                time: this.thread_temp[i].payload.doc
                  .data()
                  .dateModified.toDate()
                  .toString()
              };
              this.threads.push(obj);
            });
          console.log("threads: ", this.threads);
        });
      });
  }

  chat(userId) {
    var isBooking = "no";
    this.router.navigate(["chat/user", userId, isBooking]);
  }
}
