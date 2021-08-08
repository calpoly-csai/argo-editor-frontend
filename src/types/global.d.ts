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
  overlays: OverlayData[];
};

type OverlayData = {
  title: string;
  description: string;
  position: [number, number, number];
  actions: OverlayAction[];
};

type OverlayAction = ActionBase &
  (LinkAction | PathAction | PortalAction | InfoAction);

interface ActionBase {
  title: string;
}

interface LinkAction {
  type: "external-link";
  title: string;
  link: string;
}

interface PathAction {
  type: "path";
  video: string;
  destination: string;
}

interface PortalAction {
  type: "portal";
  destination: string;
}

interface InfoAction {
  type: "info";
  information: string;
}
