import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
  Input
} from "@angular/core";
import * as moment from "moment";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { google } from "@google/maps";
import { MapsAPILoader } from "@agm/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFireStorage } from "@angular/fire/storage";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AmazingTimePickerService } from "amazing-time-picker";
import Swal from "sweetalert2";
import ImageCompressor from "image-compressor.js";

declare var google: any;

@Component({
  selector: "app-list-experience",
  templateUrl: "./list-experience.component.html",
  styleUrls: ["./list-experience.component.css"]
})
export class ListExperienceComponent implements OnInit {
  @Input() userId;
  @Input() listingType;

  expanded = false;
  ar = [];
  geoPoint: any;
  public latitude: number;
  public longitude: number;
  public zoom: number;
  pic_loader = false;
  listingId;
  listing_event_image_url;
  locationBrokenAddess_temp;
  temp;
  categories = [];
  step = "basic";

  // for multiselect dropdown
  dropdownList: Array<any>;
  selectedItems = [];
  dropdownSettings = {};

  @ViewChild("search")
  public searchElementRef: ElementRef;

  public experience_form_basic: FormGroup;
  public experience_form_additional: FormGroup;
  minDate: Date;

  constructor(
    private route: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private fb: FormBuilder,
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    public afd: AngularFireDatabase,
    public store: AngularFireStorage,
    private atp: AmazingTimePickerService,
    private router: Router
  ) {
    this.experience_form_basic = this.fb.group({
      currency: [""],
      description: ["", Validators.required],
      policy: [""],
      title: ["", Validators.required]
    });

    this.experience_form_additional = this.fb.group({
      recurrence: [""],
      startDate: ["", Validators.required],
      locationAddress: ["", Validators.required],
      locationName: ["", Validators.required],
      startTime: ["", Validators.required],
      endTime: ["", Validators.required],
      endDate: ["", Validators.required]
    });
  }

  ngOnInit() {
    this.minDate = new Date();
    // to get categories list
    this.afs
      .collection("categories")
      .snapshotChanges()
      .subscribe(categories => {
        this.dropdownList = [];
        categories.forEach((item, i) => {
          var obj = {
            id: i,
            value: categories[i].payload.doc.id
          };
          this.dropdownList.push(obj);
        });
        console.log(this.dropdownList);
        setTimeout(() => {}, 2000);

        // settings for multiselect dropdown
        this.dropdownSettings = {
          singleSelection: false,
          // idField: "id",
          textField: "value",
          selectAllText: "Select All",
          unSelectAllText: "UnSelect All",
          itemsShowLimit: 6,
          allowSearchFilter: false,
          limitSelection: 3
        };
      });

    this.selectedItems = [];
    // end

    this.experience_form_basic.controls["currency"].patchValue("cad");
    this.experience_form_basic.controls["policy"].patchValue("no");
    this.experience_form_additional.controls["recurrence"].patchValue(
      "recurrenceOnce"
    );
  }

  loadGoogleMaps() {
    //set google maps defaults
    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement,
        {
          types: ["address"]
        }
      );
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          console.log("place: ", place);

          this.experience_form_additional.controls[
            "locationAddress"
          ].patchValue(place.formatted_address);

          this.locationBrokenAddess_temp = place.address_components;

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
  }

  addExperienceBasic() {
    if (this.experience_form_basic.valid) {
      this.listingId = this.afs.createId();
      // get the firestore doc
      const listingDoc: AngularFirestoreDocument = this.afs.doc(
        "user/" + this.userId + "/listing/" + this.listingId
      );

      listingDoc
        .set(
          {
            title: this.experience_form_basic.controls["title"].value,
            description: this.experience_form_basic.controls["description"]
              .value,
            policy: this.experience_form_basic.controls["policy"].value,
            listingType: this.listingType,
            currency: this.experience_form_basic.controls["currency"].value,
            userId: this.afAuth.auth.currentUser.uid
          },
          { merge: true }
        )
        .then(res => {
          listingDoc.snapshotChanges().subscribe(data => {
            console.log(data.payload.data());
          });
          this.step = "additional";
          this.loadGoogleMaps();
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      Object.keys(this.experience_form_basic.controls).forEach(i =>
        this.experience_form_basic.controls[i].markAsTouched()
      );
    }
  }

  // check_time() {
  //   var t = new Date().toString();
  //   console.log(t)
  //   // var startTime = this.experience_form_additional.controls["startTime"].value;
  // }

  // methods for dropdown list
  onItemSelect(item: any) {
    this.selectedItems.push(item.value);
  }
  onItemDeselect(item: any) {
    var index = this.selectedItems.indexOf(item.value);
    this.selectedItems.splice(index, 1);
  }
  // end of dropdown methods

  setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
    this.geoPoint = new firebase.firestore.GeoPoint(
      this.latitude,
      this.longitude
    );
    console.log(this.geoPoint);
  }

  addExperienceAdditional() {
    if (this.experience_form_additional.valid) {
      // get the firestore doc
      const listingDoc: AngularFirestoreDocument = this.afs.doc(
        "user/" + this.userId + "/listing/" + this.listingId
      );

      var state = "";
      var locationBrokenAddress = this.locationBrokenAddess_temp;

      var l = [];

      for (var i = 0; i < locationBrokenAddress.length; i++) {
        if (locationBrokenAddress[i].types[0] === "locality") {
          l.push(locationBrokenAddress[i].long_name);
        } else if (
          locationBrokenAddress[i].types[0] === "administrative_area_level_1"
        ) {
          l.push(locationBrokenAddress[i].long_name);
        } else if (locationBrokenAddress[i].types[0] === "country") {
          l.push(locationBrokenAddress[i].long_name);
        }
      }

      for (var i = 0; i < locationBrokenAddress.length; i++) {
        if (
          locationBrokenAddress[i].types[0] === "administrative_area_level_1"
        ) {
          state = locationBrokenAddress[i].long_name;
        }
      }

      var st, ci, co;
      for (var i = 0; i < locationBrokenAddress.length; i++) {
        if (locationBrokenAddress[i].types[0] === "locality") {
          ci = locationBrokenAddress[i].long_name;
        } else if (
          locationBrokenAddress[i].types[0] === "administrative_area_level_1"
        ) {
          st = locationBrokenAddress[i].long_name;
        } else if (locationBrokenAddress[i].types[0] === "country") {
          co = locationBrokenAddress[i].long_name;
        }
      }
      var short_add = ci + ", " + st + ", " + co;

      var sd = new Date(
        this.experience_form_additional.controls["startDate"].value
      ).toDateString();
      var st = this.experience_form_additional.controls["startTime"].value;
      var startDate = moment(sd + " " + st + ":00").toDate();

      var ed = new Date(
        this.experience_form_additional.controls["endDate"].value
      ).toDateString();
      var et = this.experience_form_additional.controls["endTime"].value;
      var endDate = moment(ed + " " + et + ":00").toDate();

      console.log(startDate, endDate);

      listingDoc
        .set(
          {
            categories: this.selectedItems,
            dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
            endDate: firebase.firestore.Timestamp.fromDate(endDate),
            geoPoint: this.geoPoint,
            isCanceled: false,
            isDraft: false,
            isLive: true,
            isFree: true,
            listingImageUrl: this.listing_event_image_url,
            locationAddress: this.experience_form_additional.controls[
              "locationAddress"
            ].value,
            locationBrokenAddress: l,
            locationName: this.experience_form_additional.controls[
              "locationName"
            ].value,
            locationShortAddress: short_add,
            startDate: firebase.firestore.Timestamp.fromDate(startDate),
            state: state,
            recurrence: this.experience_form_additional.controls["recurrence"]
              .value
          },
          {
            merge: true
          }
        )
        .then(data => {
          listingDoc.snapshotChanges().subscribe(data => {
            console.log(data.payload.data());
            Swal.fire("", "Listed successfully", "success");
            const id = data.payload.id;
            this.router.navigate(["listing/experience", id]);
          });
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      console.log("else part og this ksdmlkdsm");
      Object.keys(this.experience_form_additional.controls).forEach(i =>
        this.experience_form_additional.controls[i].markAsTouched()
      );
    }
  }

  updateSpaceImage(event) {
    this.pic_loader = true;
    var that = this;
    new ImageCompressor(event.target.files[0], {
      quality: 0.6,
      success(result) {
        var image = <File>result;
        that.store.storage
          .ref()
          .child("user")
          .child(that.userId)
          .child(that.listingId)
          .child("image.jpg")
          .put(image)
          .then(uploadSnap => {
            uploadSnap.ref.getDownloadURL().then(downloadURL => {
              that.listing_event_image_url = downloadURL;
              that.pic_loader = false;
            });
          });
      },
      error(e) {
        console.log(e.message);
      }
    });
  }

  // set(event) {
  //   console.log("called", event.target.files[0]);
  // }
}
