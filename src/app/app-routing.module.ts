import { ShareProfileComponent } from "./internal/share-profile/share-profile.component";
import { SpacesComponent } from "./internal/spaces/spaces.component";
import { CreateNewExperiencesComponent } from "./internal/create-new-experiences/create-new-experiences.component";
import { ExperiencesComponent } from "./internal/experiences/experiences.component";
import { SettingsComponent } from "./internal/settings/settings.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./external/home/home.component";
import { ActivitiesComponent } from "./external/activities/activities.component";
import { HelpComponent } from "./external/help/help.component";
import { PageNotFoundComponent } from "./external/page-not-found/page-not-found.component";
import { AuthGuardService as AuthGuard } from "./services/authGuard.service";
import { SpaceAndServiceComponent } from "./external/space-and-service/space-and-service.component";
import { ExperienceComponent } from "./external/experience/experience.component";
import { ViewAllExperiencesComponent } from "./external/view-all-experiences/view-all-experiences.component";
import { CreateListingComponent } from "./internal/create-listing/create-listing.component";
import { ServiceBookingComponent } from "./internal/service-booking/service-booking.component";
import { SpaceBookingComponent } from "./internal/space-booking/space-booking.component";
import { BuyTicketComponent } from "./internal/buy-ticket/buy-ticket.component";
import { CreateTicketComponent } from "./internal/create-ticket/create-ticket.component";
import { SearchedItemsComponent } from "./external/searched-items/searched-items.component";
import { UserListingComponent } from "./internal/user-listing/user-listing.component";
import { MessagesComponent } from "./internal/messages/messages.component";
import { ChatComponent } from "./internal/chat/chat.component";

const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "activities", component: ActivitiesComponent },
  { path: "help", component: HelpComponent },
  {
    path: "listing/spaces-and-services/:id",
    component: SpaceAndServiceComponent
  },
  { path: "listing/experience/:id", component: ExperienceComponent },
  {
    path: "settings",
    // canActivate: [AuthGuard],
    component: SettingsComponent
  },
  {
    path: "user/listings",
    component: UserListingComponent
  },
  {
    path: "experiences",
    component: ViewAllExperiencesComponent
  },
  {
    path: "listing/:userId/:listingType",
    // canActivate: [AuthGuard],
    component: CreateListingComponent
  },
  {
    path: "ticket/buy/:ticketId/:hostId/:listingId",
    // canActivate: [AuthGuard],
    component: BuyTicketComponent
  },
  {
    path: "message/booking/:type/:bookingId/:isBooking/:userId",
    // canActivate: [AuthGuard],
    component: ChatComponent
  },
  {
    path: "chat/user/:userId/:isBooking",
    // canActivate: [AuthGuard],
    component: ChatComponent
  },
  {
    path: "message/host/booking/:type/:isBooking/:bookingId/:listingId",
    // canActivate: [AuthGuard],
    component: ChatComponent
  },
  {
    path: "messages",
    // canActivate: [AuthGuard],
    component: MessagesComponent
  },
  {
    path: "spaces",
    canActivate: [AuthGuard],
    component: SpacesComponent
  },
  {
    path: "profile/:uid",
    // canActivate: [AuthGuard],
    component: ShareProfileComponent
  },
  {
    path: "service/book/:hostId/:listingId",
    // canActivate: [AuthGuard],
    component: ServiceBookingComponent
  },
  {
    path: "space/book/:hostId/:listingId",
    // canActivate: [AuthGuard],
    component: ServiceBookingComponent
  },
  {
    path: "ticket/create/:listingId/:userId",
    // canActivate: [AuthGuard],
    component: CreateTicketComponent
  },
  {
    path: "listing/search/:location/:listingType",
    // canActivate: [AuthGuard],
    component: SearchedItemsComponent
  },
  { path: "**", component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
