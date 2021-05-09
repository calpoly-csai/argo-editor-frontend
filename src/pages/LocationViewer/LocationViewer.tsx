import "./LocationViewer.scss";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import NavBar from "../../components/NavBar/NavBar";
import { useTourLocation, useSaveTour, useTour } from "../../hooks/tour-graph";
import Api from "../../api";

import { Save, MoreHorizontal, X } from "react-feather";
import Overlay from "./components/Overlay";
import produce from "immer";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";

type OverlayUpdate = (overlay: Overlay) => void;

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

// Would fetch this from the server

export default function LocationViewer() {
  const [location, updateLocation] = useTourLocation();
  const save = useSaveTour();
  // const depthMap = useDepthMap(location.panorama);
  const locationRef = useRef<HTMLImageElement | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  function addOverlay(e: React.MouseEvent) {
    const el = e.target as Element;
    const bounds = el.getBoundingClientRect();
    let x = e.clientX - bounds.left - 150;
    x = clamp(x, 0, bounds.width);
    let y = e.clientY - bounds.top - 40;
    y = clamp(y, 0, bounds.height);

    const overlay: Overlay = {
      title: "",
      description: "",
      position: [x, y, 0],
      actions: [],
    };
    updateLocation((loc) => {
      loc.overlays.push(overlay);
      return loc;
    });
  }

  function getOverlayKey(overlayData: Overlay) {
    return `${overlayData.position[0]}${overlayData.position[1]}`;
  }

  function deleteOverlay(key: number) {
    updateLocation((loc) => {
      loc.overlays.splice(key, 1);
      return loc;
    });
  }

  function updateOverlay(key: number, update: OverlayUpdate) {
    updateLocation((loc) => {
      loc.overlays[key] = produce(loc.overlays[key], update);
      return loc;
    });
  }

  return (
    <article className="LocationViewer">
      <NavBar className="absolute" title={location.title}>
        <button className="nav-button wrapper">
          <Save onClick={save} />
        </button>
        <button className="nav-button wrapper">
          <MoreHorizontal onClick={() => setShowMenu(true)} />
        </button>
      </NavBar>
      <div className="content">
        <img
          src={location.panorama}
          alt="panorama"
          onClick={addOverlay}
          ref={locationRef}
        />
        <AnimatePresence>
          {location.overlays.map((data, index) => {
            return (
              <Overlay
                key={getOverlayKey(data)}
                data={data}
                onDelete={() => deleteOverlay(index)}
                onUpdate={(update) => updateOverlay(index, update)}
                wrapperRef={locationRef}
              />
            );
          })}
        </AnimatePresence>
      </div>
      <Dropdown showMenu={showMenu} onClose={() => setShowMenu(false)} />
    </article>
  );
}

/**
 *
 * @param imageUrl The Cloudinary resource URL from the tour graph.
 */
function useDepthMap(imageUrl: string) {
  const [depthMap, setDepthMap] = useState<number[][]>([[]]);
  useEffect(() => void Api.findDepth(imageUrl).then(setDepthMap));
  return depthMap;
}

interface DropdownProps {
  showMenu: boolean;
  onClose: () => void;
}

function Dropdown({ showMenu, onClose }: DropdownProps) {
  const { tourId, locationName } = useParams<{
    tourId: string;
    locationName: string;
  }>();
  const history = useHistory();
  const updateTour = useTour()[1];

  function deleteLocation() {
    updateTour((tour) => {
      delete tour.locations[locationName];
      return tour;
    });
    history.push("/tour/" + tourId);
  }
  return (
    <AnimatePresence>
      {showMenu && (
        <motion.div
          className="ContextMenu"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
        >
          <header>
            <button className="wrapper" onClick={onClose}>
              <X size={20} />
            </button>
          </header>
          <button className="wrapper" onClick={deleteLocation}>
            Delete
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
