import "./LocationViewer.scss";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

import NavBar from "../../components/NavBar/NavBar";
import {useTourLocation} from "../../hooks/tour-graph"
import Api from "../../api"

import { Save } from "react-feather";
import Overlay from "./components/Overlay";
import produce from "immer";

type OverlayUpdate = (overlay : Overlay) => void;

const clamp = (val :number, min :number, max: number) => Math.min(Math.max(val, min), max);

// Would fetch this from the server

export default function LocationViewer() {
  const [location, updateLocation] = useTourLocation();
  console.log(location)
  // const depthMap = useDepthMap(location.panorama);
  const locationRef = useRef<HTMLImageElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  function addOverlay(e : React.MouseEvent) {
    const el = e.target as Element;
    const bounds = el.getBoundingClientRect();
    let x = e.clientX - bounds.left - 150;
    x = clamp(x, 0, bounds.width);
    let y = e.clientY - bounds.top - 40;
    y = clamp(y, 0, bounds.height);

    const overlay : Overlay = {title: "", description: "", position: [x,y,0], actions: []};
    updateLocation(loc => {
      loc.overlays.push(overlay)
      return loc
    })
    
  }

  function getOverlayKey(overlayData: Overlay) {
    return `${overlayData.position[0]}${overlayData.position[1]}`;
  }

  function deleteOverlay(key: number) {
    updateLocation(loc => {
      loc.overlays.splice(key, 1)
      return loc
    })
  }

  function updateOverlay(key : number, update : OverlayUpdate) {
    updateLocation(loc => {
      loc.overlays[key] = produce(loc.overlays[key], update);
      return loc
    })
  }

  return (
    <article className="LocationViewer">
      <NavBar className="absolute" title={location.title}>
        <button className="wrapper">
          <Save />
        </button>
      </NavBar>
      <div className="content" ref={wrapperRef}>
        <img
          src={location.panorama}
          alt="panorama"
          onClick={addOverlay}
          ref={locationRef}
        />
        <AnimatePresence>
          {location.overlays.map((data,key) => {
            return (
              <Overlay
                key={key}
                data={data}
                onDelete={() => deleteOverlay(key)}
                onUpdate={(update) => updateOverlay(key, update)}
                wrapperRef={wrapperRef}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </article>
  );
}

/**
 * 
 * @param imageUrl The Cloudinary resource URL from the tour graph.
 */
function useDepthMap(imageUrl: string) {
  const [depthMap, setDepthMap] = useState<number[][]>([[]]);
  useEffect(() => void Api.findDepth(imageUrl).then(setDepthMap))
  return depthMap
}
