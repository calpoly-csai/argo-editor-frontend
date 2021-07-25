type TourGraph = {
  title: string;
  description: string;
  startingLocation: string;
  locations: {
    [location: string]: TourLocation;
  };
};

type TourLocation = {
  title: string;
  description: string;
  panorama: string;
  overlays: Overlay[];
};

type Overlay = {
  title: string;
  description: string;
  position: [number, number, number];
  actions: OverlayAction[];
};

type OverlayAction = {
  type: "external-link" | "path" | "portal";
  [other: string];
};
