import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: "app-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.css"]
})
export class SearchBarComponent implements OnInit {
  items = [];
  temp = [];
  locations = [];

  public searchForm: FormGroup;
  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private router: Router
  ) {
    window.scroll(0, 0);

    this.searchForm = this.fb.group({
      location: ["", Validators.required],
      listingType: ["", Validators.required]
    });
  }

  ngOnInit() {
    this.getListing();
  }

  getListing() {
    this.afs
      .collection("listing")
      .snapshotChanges()
      .subscribe(data => {
        this.temp = data;
        // console.log(data[0].payload.doc.data())
        // console.log(this.temp[0].payload.doc.data().title.indexOf(searchText));
        this.temp.forEach((item, i) => {
          var obj = {
            id: this.temp[i].payload.doc.id,
            location: this.temp[i].payload.doc.data().locationAddress,
            state: this.temp[i].payload.doc.data().state
          };
          this.items.push(obj);
        });
      });
  }

  search() {
    if (this.searchForm.valid) {
      var location = this.searchForm.controls["location"].value;
      var listingType = this.searchForm.controls["listingType"].value;
      console.log(location);
      this.router.navigate(["listing/search", location, listingType]);
    } else {
      // Object.keys(this.searchForm.controls).forEach(i =>
      //   this.searchForm.controls[i].markAsTouched()
      // );
      alert("Please enter listing type and listing location");
    }
  }
}
