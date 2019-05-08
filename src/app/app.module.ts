import { CreateNewExperiencesComponent } from "./internal/create-new-experiences/create-new-experiences.component";
import { CardInfoComponent } from "./internal/card-info/card-info.component";
import { ProfileUpdateComponent } from "./internal/profile-update/profile-update.component";
import { PaymentComponent } from "./internal/payment/payment.component";
import { AccountComponent } from "./internal/account/account.component";
import { ExperiencesComponent } from "./internal/experiences/experiences.component";
import { ProfileComponent } from "./internal/profile/profile.component";
import { DashboardComponent } from "./internal/dashboard/dashboard.component";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { Ng2OrderModule } from "ng2-order-pipe";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./external/home/home.component";
import { NavbarComponent } from "./external/navbar/navbar.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SearchBarComponent } from "./external/search-bar/search-bar.component";
import { AngularFontAwesomeModule } from "angular-font-awesome";
import { LoginComponent } from "./external/login/login.component";
import { HelpComponent } from "./external/help/help.component";
import { ActivitiesComponent } from "./external/activities/activities.component";
import { ModalModule } from "ngx-bootstrap/modal";
import { FooterComponent } from "./external/footer/footer.component";
import {
  AngularFirestoreModule,
  FirestoreSettingsToken
} from "@angular/fire/firestore";
import { AngularFireModule } from "@angular/fire";
import { environment } from "src/environments/environment";
import { NewsletterComponent } from "./external/newsletter/newsletter.component";
import { PartnersComponent } from "./external/partners/partners.component";
import { ExperiencesNearYouComponent } from "./external/experiences-near-you/experiences-near-you.component";
import { ExploreSpacesServicesComponent } from "./external/explore-spaces-services/explore-spaces-services.component";
import { RegisterComponent } from "./external/register/register.component";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { ForgotPasswordComponent } from "./external/forgot-password/forgot-password.component";
import { PageNotFoundComponent } from "./external/page-not-found/page-not-found.component";
import { AuthGuardService } from "./services/authGuard.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { NgxSpinnerModule } from "ngx-spinner";
import { UniquePipe } from "./services/unique";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { SpaceAndServiceComponent } from "./external/space-and-service/space-and-service.component";
import { SettingsComponent } from "./internal/settings/settings.component";
import { SpacesComponent } from "./internal/spaces/spaces.component";
import { ShareProfileComponent } from "./internal/share-profile/share-profile.component";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { ExperienceComponent } from "./external/experience/experience.component";
import { HttpClientModule } from "@angular/common/http";
import { BuyTicketComponent } from "./internal/buy-ticket/buy-ticket.component";
import { ViewAllExperiencesComponent } from "./external/view-all-experiences/view-all-experiences.component";
import { orderByPipe } from "./services/orderBy.pipe";
import { CreateListingComponent } from "./internal/create-listing/create-listing.component";
import { CategoriesComponent } from "./internal/categories/categories.component";
import { AgmCoreModule } from "@agm/core";
import { AmazingTimePickerModule } from "amazing-time-picker";
import { ListSpaceComponent } from "./internal/list-space/list-space.component";
import { ListServiceComponent } from "./internal/list-service/list-service.component";
import { ListExperienceComponent } from "./internal/list-experience/list-experience.component";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import {
  AngularFireFunctionsModule,
  FunctionsRegionToken
} from "@angular/fire/functions";
import { ServiceBookingComponent } from "./internal/service-booking/service-booking.component";
import { SpaceBookingComponent } from "./internal/space-booking/space-booking.component";
import { UserBookingsComponent } from "./internal/user-bookings/user-bookings.component";
import { CreateTicketComponent } from "./internal/create-ticket/create-ticket.component";
import { TicketsComponent } from "./internal/tickets/tickets.component";
import { TicketTypeComponent } from "./internal/ticket-type/ticket-type.component";
import { Ng5SliderModule } from "ng5-slider";
import { CardStripeComponent } from "./internal/card-stripe/card-stripe.component";
import { JobsComponent } from "./internal/jobs/jobs.component";
import { ReviewsComponent } from "./external/reviews/reviews.component";
import { NgxInputStarRatingModule } from "ngx-input-star-rating";
import { SearchedItemsComponent } from "./external/searched-items/searched-items.component";
import { MessagesComponent } from "./internal/messages/messages.component";
import { ReviewFormComponent } from "./internal/review-form/review-form.component";
import { UserReviewsComponent } from "./internal/user-reviews/user-reviews.component";
import { UserListingComponent } from "./internal/user-listing/user-listing.component";
import { ChatComponent } from "./internal/chat/chat.component";
import { ChatBookingCardComponent } from "./internal/chat-booking-card/chat-booking-card.component";
import { ClickOutsideModule } from 'ng4-click-outside';

@NgModule({
  declarations: [
    orderByPipe,
    UniquePipe,
    AppComponent,
    HomeComponent,
    NavbarComponent,
    SearchBarComponent,
    LoginComponent,
    HelpComponent,
    ActivitiesComponent,
    FooterComponent,
    NewsletterComponent,
    PartnersComponent,
    ExperiencesNearYouComponent,
    ExploreSpacesServicesComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    PageNotFoundComponent,
    SpaceAndServiceComponent,
    DashboardComponent,
    SettingsComponent,
    ProfileComponent,
    ExperiencesComponent,
    SpacesComponent,
    AccountComponent,
    PaymentComponent,
    ProfileUpdateComponent,
    CardInfoComponent,
    ShareProfileComponent,
    CreateNewExperiencesComponent,
    ProfileUpdateComponent,
    AccountComponent,
    PaymentComponent,
    ExperienceComponent,
    BuyTicketComponent,
    ViewAllExperiencesComponent,
    CreateListingComponent,
    CategoriesComponent,
    ListSpaceComponent,
    ListServiceComponent,
    ListExperienceComponent,
    ServiceBookingComponent,
    SpaceBookingComponent,
    UserBookingsComponent,
    CreateTicketComponent,
    TicketsComponent,
    TicketTypeComponent,
    CardStripeComponent,
    JobsComponent,
    ReviewsComponent,
    SearchedItemsComponent,
    MessagesComponent,
    ReviewFormComponent,
    UserReviewsComponent,
    UserListingComponent,
    ChatComponent,
    ChatBookingCardComponent
  ],
  imports: [
    ClickOutsideModule,
    Ng5SliderModule,
    Ng2OrderModule,
    NgxInputStarRatingModule,
    AngularFireFunctionsModule,
    AmazingTimePickerModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyDURY1Pw5y-NxzrbNzp98hD_h0WWoKN8sI",
      libraries: ["places"]
    }),
    NgMultiSelectDropDownModule.forRoot(),
    HttpClientModule,
    SlickCarouselModule,
    NgxSpinnerModule,
    BsDatepickerModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFontAwesomeModule,
    ModalModule.forRoot(),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireModule.initializeApp(environment.firebase),
    HttpClientModule
  ],

  providers: [
    { provide: FirestoreSettingsToken, useValue: {} },
    { provide: FunctionsRegionToken, useValue: "us-central1" },
    AuthGuardService,
    AngularFireAuth,
    AngularFirestore
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
