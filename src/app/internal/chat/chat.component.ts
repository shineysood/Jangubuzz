import { Component, OnInit } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router, ActivatedRoute } from "@angular/router";
import * as firebase from "firebase/app";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"]
})
export class ChatComponent implements OnInit {
  chat_receiver;
  user_temp;
  chat_receiver_id;
  messages = [];
  message_temp;
  message;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe(params => {
      this.chat_receiver_id = params.hostId;
      this.getUser(params.hostId);
      this.getMessages(params.hostId, params.hostId);
    });
  }

  ngOnInit() {}

  getUser(id) {
    this.afs
      .doc("user/" + id)
      .snapshotChanges()
      .subscribe(user => {
        this.chat_receiver = user.payload.data();
        this.chat_receiver.uid = user.payload.id;
        console.log("chat user: ", this.chat_receiver);
      });
  }

  // user/{userId}/message/{hostId from booking}/thread/{threadId}

  getMessages(hostId, threadId) {
    this.afs
      .collection(
        "user/" +
          this.afAuth.auth.currentUser.uid +
          "/message/" +
          hostId +
          "/thread/"
      )
      .snapshotChanges()
      .subscribe(messages => {
        this.message_temp = messages;
        this.message_temp.forEach((item, i) => {
          if (this.message_temp[i].payload.doc.data().isBooking) {
            console.log("hello");
          }

          var obj = {
            id: this.message_temp[i].payload.doc.id,
            message: this.message_temp[i].payload.doc.data(),
            time: this.message_temp[i].payload.doc
              .data()
              .dateCreated.toDate()
              .toString()
          };
          this.messages.push(obj);
        });
        console.log("====> chat messages: ", this.messages);
      });
  }

  send(id) {
    const doc1: AngularFirestoreDocument = this.afs.doc(
      "user/" +
        this.afAuth.auth.currentUser.uid +
        "/message/" +
        this.chat_receiver_id
    );

    const threadId = this.afs.createId();
    const doc2: AngularFirestoreDocument = this.afs.doc(
      "user/" +
        this.afAuth.auth.currentUser.uid +
        "/message/" +
        this.chat_receiver_id +
        "/thread/" +
        threadId
    );

    doc1.set(
      {
        userId: this.chat_receiver_id,
        dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
        dateModified: firebase.firestore.Timestamp.fromDate(new Date())
      },
      { merge: true }
    );

    doc2.set(
      {
        message: this.message,
        dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
        isHome: true
      },
      { merge: true }
    );

    this.message = "";
    document.getElementById("message_box").focus();
  }
}
