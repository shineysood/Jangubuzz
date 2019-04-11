import { Component, OnInit, Input } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { BsModalService } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";

@Component({
  selector: "app-categories",
  templateUrl: "./categories.component.html",
  styleUrls: ["./categories.component.css"]
})
export class CategoriesComponent implements OnInit {
  @Input() modalRef_categories: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {}

  hide_modal() {
    this.modalRef_categories.hide();
  }

  // can put the condition here for checking the user type... may be modify later
  create_listing(type: String) {
    var userId = this.afAuth.auth.currentUser.uid;
    var listingType = type;
    this.router.navigate(["listing", userId, listingType]);
    this.hide_modal();
  }
}
