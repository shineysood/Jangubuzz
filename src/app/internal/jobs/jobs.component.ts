import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestoreDocument } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { Input } from "@angular/core";

@Component({
  selector: "app-jobs",
  templateUrl: "./jobs.component.html",
  styleUrls: ["./jobs.component.css"]
})
export class JobsComponent implements OnInit {
  jobs = [];
  @Input() listingId;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private fns: AngularFireFunctions
  ) {}

  ngOnInit() {
    this.getJobs(this.afAuth.auth.currentUser.uid, this.listingId);
  }

  getJobs(userId, listingId) {
    // this.jobs = [];
    console.log(userId, listingId);
    this.afs
      .collection("user/" + userId + "/listing/" + listingId + "/job")
      .snapshotChanges()
      .subscribe(jobs => {
        jobs.forEach((item, i) => {
          var job = {
            id: item.payload.doc.id,
            job: item.payload.doc.data()
          };
          this.jobs.push(job);
        });
        console.log("====> jobs: ", this.jobs);
      });
  }

  approve_booking() {
    // on_booking_availability
  }
}
