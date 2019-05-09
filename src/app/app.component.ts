import { Component, NgZone } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { AppService } from "./app.service";

declare const google: any;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  lat;
  lng;
  address;
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private ngZone: NgZone,
    private appService: AppService
  ) {}

  ngOnInit() {
    // if (!this.afAuth.auth.currentUser) {

    // }

    this.afAuth.authState.subscribe(user => {
      if (!user.isAnonymous) {
        console.log("user is there");
        this.appService.loggedIn(user);
      } else {
        console.log("user is not there");
        this.afAuth.auth.signInAnonymously();
        this.appService.loggedIn(this.afAuth.auth.currentUser);
      }
    });

    // this.locate();
  }

  locate() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;

          let geocoder = new google.maps.Geocoder();
          let latlng = new google.maps.LatLng(30.7063633, 76.7047791);
          let request = {
            latLng: latlng
          };

          geocoder.geocode(request, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
              if (results[0] != null) {
                this.ngZone.run(() => {
                  this.address = results[0].formatted_address;
                });

                console.log(this.address);
              } else {
                alert("No address available");
              }
            }
          });
        },
        error => {
          console.log(
            "Error code: " +
              error.code +
              "<br /> Error message: " +
              error.message
          );
        }
      );
    }
  }
}
