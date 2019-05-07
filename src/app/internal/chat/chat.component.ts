import { Component, OnInit } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router, ActivatedRoute } from "@angular/router";
import * as firebase from "firebase/app";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"]
})
export class ChatComponent implements OnInit {
  chat_receiver;
  user_temp;
  chat_receiver_id;
  messages_obs: Observable<any[]>;
  message_temp;
  bookingId;
  book_card = {};
  booking_user_id;
  listing_card = {};
  temp;
  count;
  messages = [];

  chat_class;

  public chat_form: FormGroup;

  // for jobs
  job_host_id;
  job_listingId;
  job_bookingId;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.chat_form = this.fb.group({
      message: ["", Validators.required]
    });
  }

  ngAfterViewChecked(): void {
    //Called after every check of the component's view. Applies to components only.
    //Add 'implements AfterViewChecked' to the class.
    document.getElementById("message_box").focus();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.isBooking === "yes" && params.type === "user") {
        console.log("creating card", params.bookingId);

        const doc: AngularFirestoreDocument = this.afs.doc(
          "user/" + params.userId + "/booking/" + params.bookingId
        );

        doc.snapshotChanges().subscribe(data => {
          this.getMessages(data.payload.data().hostId);

          this.getUser(data.payload.data().hostId);

          const book_ref_doc: AngularFirestoreDocument = this.afs.doc(
            "user/" +
              data.payload.data().userId +
              "/message/" +
              data.payload.data().hostId
          );
          var threadId = this.afs.createId();
          const book_ref_doc1: AngularFirestoreDocument = this.afs.doc(
            "user/" +
              data.payload.data().userId +
              "/message/" +
              data.payload.data().hostId +
              "/thread/" +
              threadId
          );

          book_ref_doc.set(
            {
              userId: data.payload.data().hostId,
              dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
              dateModified: firebase.firestore.Timestamp.fromDate(new Date())
            },
            { merge: true }
          );

          book_ref_doc1.set(
            {
              message: "",
              bookingId: params.bookingId,
              listingId: data.payload.data().listingId,
              hostId: data.payload.data().hostId,
              userId: data.payload.data().userId,
              dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
              dateModified: firebase.firestore.Timestamp.fromDate(new Date()),
              isBooking: true,
              isHome: true
            },
            { merge: true }
          );
        });
      } else if (params.isBooking === "yes" && params.type === "host") {
        console.log("host message to user: ", params);
        const doc_job: AngularFirestoreDocument = this.afs.doc(
          "user/" +
            this.afAuth.auth.currentUser.uid +
            "/listing/" +
            params.listingId +
            "/job/" +
            params.bookingId
        );

        doc_job.valueChanges().subscribe(booking => {
          const host_book_reference1: AngularFirestoreDocument = this.afs.doc(
            "user/" + booking.hostId + "/message/" + booking.userId
          );

          host_book_reference1.set(
            {
              userId: booking.userId,
              dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
              dateModified: firebase.firestore.Timestamp.fromDate(new Date())
            },
            { merge: true }
          );

          const threadId = this.afs.createId();
          const host_book_reference2: AngularFirestoreDocument = this.afs.doc(
            "user/" +
              booking.hostId +
              "/message/" +
              booking.userId +
              "/thread/" +
              threadId
          );

          host_book_reference2.set(
            {
              message: "",
              dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
              bookingId: params.bookingId,
              listingId: params.listingId,
              userId: booking.userId,
              hostId: booking.hostId,
              isBooking: true,
              isHome: true
            },
            { merge: true }
          );

          this.getUser(booking.userId);
          this.getMessages(booking.userId);
        });
      } else if (params.isBooking === "no") {
        this.getUser(params.userId);
        this.getMessages(params.userId);
      }
    });
  }

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

  getMessages(hostId) {
    this.messages_obs = this.afs
      .collection(
        "user/" +
          this.afAuth.auth.currentUser.uid +
          "/message/" +
          hostId +
          "/thread",
        ref => ref.orderBy("dateCreated", "asc")
      )
      .valueChanges();

    this.messages_obs.subscribe(messages => {
      this.count = messages.length;
      this.message_temp = messages;
      this.message_temp.forEach((item, i) => {
        if (this.message_temp[i].isBooking) {
          this.bookingId = this.message_temp[i].bookingId;
          this.booking_user_id = this.message_temp[i].userId;
        }

        var obj = {
          id: this.message_temp[i].id,
          message: this.message_temp[i],
          time: this.message_temp[i].dateCreated.toDate().toString()
        };
        this.messages.push(obj);
      });

      if (this.messages[0].message.isBooking) {
        if (
          this.messages[0].message.userId === this.afAuth.auth.currentUser.uid
        ) {
          console.log("userrrrrrrr");

          this.getBooking(this.booking_user_id, this.bookingId);
        } else if (
          this.messages[0].message.hostId === this.afAuth.auth.currentUser.uid
        ) {
          console.log("hostttttttttt");
          this.getHostJob(
            this.messages[0].message.hostId,
            this.messages[0].message.listingId,
            this.messages[0].message.bookingId
          );
        }
      }
    });
  }

  send() {
    const doc1: AngularFirestoreDocument = this.afs.doc(
      "user/" +
        this.afAuth.auth.currentUser.uid +
        "/message/" +
        this.chat_receiver.uid
    );

    const threadId = this.afs.createId();
    const doc2: AngularFirestoreDocument = this.afs.doc(
      "user/" +
        this.afAuth.auth.currentUser.uid +
        "/message/" +
        this.chat_receiver.uid +
        "/thread/" +
        threadId
    );

    doc1.set(
      {
        userId: this.chat_receiver.uid,
        dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
        dateModified: firebase.firestore.Timestamp.fromDate(new Date())
      },
      { merge: true }
    );

    doc2.set(
      {
        message: this.chat_form.controls["message"].value,
        dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
        isHome: true
      },
      { merge: true }
    );

    this.chat_form.reset();
    document.getElementById("message_box").focus();
  }

  getHostJob(hostId, listingId, bookingId) {
    const doc: AngularFirestoreDocument = this.afs.doc(
      "user/" + hostId + "/listing/" + listingId + "/job/" + bookingId
    );

    doc.snapshotChanges().subscribe(res => {
      this.book_card = res.payload.data();
      console.log("=====> job book card: ", this.book_card);
      this.afs
        .doc(
          "user/" +
            res.payload.data().hostId +
            "/listing/" +
            res.payload.data().listingId
        )
        .snapshotChanges()
        .subscribe(data => {
          console.log("listing card: ", data.payload.data());
          this.temp = data.payload.data();
          this.listing_card = {
            title: this.temp.title,
            date: this.temp.dateCreated.toDate().toString(),
            policy: this.temp.policy,
            service: this.temp.service,
            perHourPrice: this.temp.perHourPrice,
            listingImageUrl: this.temp.listingImageUrl,
            address: this.temp.locationShortAddress,
            listingType: this.temp.listingType,
            name:
              this.temp.listingType === "eventServiceListingType"
                ? this.temp.service
                : this.temp.locationName
          };
        });
    });
  }

  getBooking(userId, bookingId) {
    console.log("yessss", bookingId, userId);
    const doc: AngularFirestoreDocument = this.afs.doc(
      "user/" + userId + "/booking/" + bookingId
    );

    doc.snapshotChanges().subscribe(res => {
      this.book_card = res.payload.data();
      console.log("=====> book card: ", this.book_card);
      this.afs
        .doc(
          "user/" +
            res.payload.data().hostId +
            "/listing/" +
            res.payload.data().listingId
        )
        .snapshotChanges()
        .subscribe(data => {
          console.log("listing card: ", data.payload.data());
          this.temp = data.payload.data();
          this.listing_card = {
            title: this.temp.title,
            date: this.temp.dateCreated.toDate().toString(),
            policy: this.temp.policy,
            service: this.temp.service,
            perHourPrice: this.temp.perHourPrice,
            listingImageUrl: this.temp.listingImageUrl,
            address: this.temp.locationShortAddress,
            listingType: this.temp.listingType,
            name:
              this.temp.listingType === "eventServiceListingType"
                ? this.temp.service
                : this.temp.locationName
          };
        });
    });
  }
}
