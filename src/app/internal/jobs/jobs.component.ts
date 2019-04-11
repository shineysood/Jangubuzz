import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
  ) { }

  ngOnInit() {
    // const jobs_doc: AngularFi/restoreDocument = this.afs.doc("user/+"{userId}+"/listing/{listingId}/job")
  }

}
