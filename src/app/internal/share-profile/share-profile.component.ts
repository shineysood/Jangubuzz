import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-share-profile",
  templateUrl: "./share-profile.component.html",
  styleUrls: ["./share-profile.component.css"]
})
export class ShareProfileComponent implements OnInit {
  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log(window.location.href.toString());
  }
}
