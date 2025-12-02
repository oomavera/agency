import HomeLandingPage from "@/components/HomeLandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "House Cleaning Lead System | Free Bookings Offer",
  description: "House cleaning ads landing page: claim free closed bookings, see how we fill schedules, and get qualified leads fast.",
  alternates: { canonical: "/housecleaning" },
};

export default function HouseCleaningPage() {
  return (
    <HomeLandingPage
      formPage="housecleaning"
      formRedirectPath="/Demonstration2"
      popupRedirectPath="/Demonstration2"
    />
  );
}
