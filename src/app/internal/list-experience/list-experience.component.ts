import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
  Input
} from "@angular/core";
import * as moment from "moment";
import { FormGroup, FormBuilder } from "@angular/forms";
import { google } from "@google/maps";
import { MapsAPILoader } from "@agm/core";
import { ActivatedRoute } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFireStorage } from "@angular/fire/storage";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AmazingTimePickerService } from "amazing-time-picker";

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

  // for multiselect dropdown
  dropdownList: Array<any>;
  selectedItems = [];
  dropdownSettings = {};

  @ViewChild("search")
  public searchElementRef: ElementRef;

  public experience_form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private fb: FormBuilder,
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    public afd: AngularFireDatabase,
    public store: AngularFireStorage,
    private atp: AmazingTimePickerService
  ) {
    this.experience_form = this.fb.group({
      currency: [""],
      dateCreated: [""],
      description: [""],
      endDate: [""],
      geoPoint: [""],
      isCanceled: [""],
      isDraft: [""],
      isLive: [""],
      isFree: [""],
      listingImageUrl: [""],
      locationAddress: [""],
      locationBrokenAddress: [""],
      locationName: [""],
      locationShortAddress: [""],
      startTime: [""],
      endTime: [""],
      policy: [""],
      startDate: [""],
      startDay: [""],
      state: [""],
      title: [""],
      endDay: [""],
      recurrence: [""]
    });
  }

  ngOnInit() {
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

    this.experience_form.controls["currency"].patchValue("cad");
    this.experience_form.controls["policy"].patchValue("no");
    this.experience_form.controls["recurrence"].patchValue("recurrenceOnce");

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

          this.experience_form.controls["locationAddress"].patchValue(
            place.formatted_address
          );

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

  // methods for dropdown list
  onItemSelect(item: any) {
    this.selectedItems.push(item.value);
  }
  onSelectAll(items: any) {
    // console.log(items);
  }
  //end

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

  addExperience() {
    // get the firestore doc
    const listingDoc: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.userId + "/listing/" + this.listingId
    );

    var state = "";
    var locationBrokenAddress = this.locationBrokenAddess_temp;

    var l = [];

    for (var i = 0; i < locationBrokenAddress.length; i++) {
      l.push(locationBrokenAddress[i].long_name);
    }

    this.experience_form.controls["locationBrokenAddress"].patchValue(l);

    for (var i = 0; i < locationBrokenAddress.length; i++) {
      if (locationBrokenAddress[i].types[0] === "administrative_area_level_1") {
        state = locationBrokenAddress[i].long_name;
      }
    }

    var st, ci, co;
    for (var i = 0; i < locationBrokenAddress.length; i++) {
      if (locationBrokenAddress[i].types[0] === "administrative_area_level_2") {
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
      this.experience_form.controls["startDate"].value
    ).toDateString();
    var st = this.experience_form.controls["startTime"].value;
    var startDate = moment(sd + " " + st).toDate();

    var ed = new Date(
      this.experience_form.controls["endDate"].value
    ).toDateString();
    var et = this.experience_form.controls["endTime"].value;
    var endDate = moment(ed + " " + et).toDate();

    console.log(startDate, endDate);

    listingDoc
      .set(
        {
          categories: this.selectedItems,
          currency: this.experience_form.controls["currency"].value,
          dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
          description: this.experience_form.controls["description"].value,
          endDate: endDate.toString(),
          endDay: this.experience_form.controls["endDate"].value
            .toString()
            .split(" ")[0],
          geoPoint: this.geoPoint,
          isCanceled: false,
          isDraft: false,
          isLive: true,
          isFree: true,
          listingImageUrl: this.listing_event_image_url,
          listingType: this.listingType,
          locationAddress: this.experience_form.controls["locationAddress"]
            .value,
          locationBrokenAddress: this.experience_form.controls[
            "locationBrokenAddress"
          ].value,
          locationName: this.experience_form.controls["locationName"].value,
          locationShortAddress: short_add,
          policy: this.experience_form.controls["policy"].value,
          startDate: startDate.toString(),
          startDay: this.experience_form.controls["startDate"].value
            .toString()
            .split(" ")[0],
          state: state,
          title: this.experience_form.controls["title"].value,
          userId: this.userId,
          recurrence: this.experience_form.controls["recurrence"].value
        },
        {
          merge: true
        }
      )
      .then(data => {
        listingDoc.snapshotChanges().subscribe(data => {
          console.log(data.payload.data());
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  updateSpaceImage(event) {
    // create a new id for the listing
    this.listingId = this.afs.createId();
    this.pic_loader = true;
    this.store.storage
      .ref()
      .child("user")
      .child(this.userId)
      .child(this.listingId)
      .child("image.jpg")
      .put(event.target.files[0])
      .then(uploadSnap => {
        uploadSnap.ref.getDownloadURL().then(downloadURL => {
          this.listing_event_image_url = downloadURL;
          this.pic_loader = false;
        });
      });
  }

  set() {}
}
