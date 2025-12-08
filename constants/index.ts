export const SIDEBAR_LINKS = [
  {
    label: "Home",
    route: "/",
    icon: "home",
  },
  {
    label: "Upcoming",
    route: "/upcoming",
    icon: "event_upcoming",
  },
  {
    label: "Previous",
    route: "/previous",
    icon: "history",
  },
  {
    label: "Recordings",
    route: "/recordings",
    icon: "videocam",
  },
  {
    label: "Personal Room",
    route: "/personal-room",
    icon: "person",
  },
  {
    label: "API Docs",
    route: "/docs",
    icon: "api",
  },
] as const;

export const avatarImages = [
  "/images/avatar-1.jpeg",
  "/images/avatar-2.jpeg",
  "/images/avatar-3.png",
  "/images/avatar-4.png",
  "/images/avatar-5.png",
] as const;
