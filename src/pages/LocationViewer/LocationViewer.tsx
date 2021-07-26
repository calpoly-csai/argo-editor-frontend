import "./LocationViewer.scss";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";

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

  const depthMap = useDepthMap(location.panorama);
  const [showMenu, setShowMenu] = useState(false);
  const locationRef = useRef<HTMLImageElement | null>(null);
  const panoramaDimensions = [
    locationRef.current?.width || 1,
    locationRef.current?.height || 1,
  ] as [number, number];

  function addOverlay(e: React.MouseEvent) {
    const el = e.target as Element;
    const bounds = el.getBoundingClientRect();
    let x = e.clientX - bounds.left - 150;
    x = clamp(x, 0, bounds.width);
    let y = e.clientY - bounds.top - 40;
    y = clamp(y, 0, bounds.height);

    if (locationRef.current && depthMap) {
      console.log("mounted overlay");
      const { width, height } = locationRef.current;
      let mapX = Math.floor(x * (depthMap.length / width));
      let mapY = Math.floor(y * (depthMap[0].length / height));
      let depth = depthMap[mapX][mapY];
      let norm_x = x / width;
      let norm_y = y / height;
      const overlay: Overlay = {
        title: "",
        description: "",
        position: [norm_x, norm_y, depth],
        actions: [],
      };
      updateLocation((loc) => {
        loc.overlays.push(overlay);
        return loc;
      });
    } else {
      toast.warn("Loading depth map...");
    }
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

  function updateOverlayPosition(key: number, x: number, y: number) {
    if (!depthMap) return;
    updateOverlay(key, (overlay) => {
      const [w, h] = panoramaDimensions;
      x = clamp(x, 0, w);
      y = clamp(y, 0, h);
      overlay.position[0] = x;
      overlay.position[1] = y;
      const mapX = Math.floor(x * (depthMap.length / w));
      const mapY = Math.floor(y * (depthMap[0].length / h));
      const depth = depthMap[mapX][mapY];
      overlay.position[2] = depth;
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
                onPositionUpdate={(x, y) => updateOverlayPosition(index, x, y)}
                wrapperRef={locationRef}
                panoramaDimensions={panoramaDimensions}
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
  const [depthMap, setDepthMap] = useState<number[][]>();

  useEffect(() => {
    Api.findDepth(imageUrl).then(setDepthMap);
  }, [imageUrl]);
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
