import { useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";

import NavBar from "../../components/NavBar/NavBar";

import "./LocationViewer.scss";
// Would fetch from server
import dexterMid from "../../assets/panoramas/dexterMid.JPG";
import dexterEdge from "../../assets/panoramas/dexterEdge.JPG";
import cotchettFront from "../../assets/panoramas/cotchettFront.JPG";
import cotchettHall from "../../assets/panoramas/cotchettHall.JPG";
import orfaleaOneil from "../../assets/panoramas/orfaleaOneil.JPG";
import { useLocation } from "react-router-dom";

import exampleTour from "../../assets/example-tour.json";

import { Save } from "react-feather";
import Overlay, { OverlayData } from "./components/Overlay";

const panoramas = {
  dexterEdge,
  dexterMid,
  cotchettFront,
  cotchettHall,
  orfaleaOneil,
};

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Would fetch this from the server

export default function LocationViewer() {
  const [overlays, setOverlays] = useState([]);
  const [depthMap, setDepthMap] = useState([]);
  const location = useLocation();
  const locationRef = useRef();
  const wrapperRef = useRef();

  const locParts = location.pathname.split("/");
  const panoId = locParts[locParts.length - 1];
  const locGraph = exampleTour.locations[panoId];

  function addOverlay(e) {
    const bounds = e.target.getBoundingClientRect();
    let x = e.clientX - bounds.left - 150;
    x = clamp(x, 0, bounds.width);
    let y = e.clientY - bounds.top - 40;
    y = clamp(y, 0, bounds.height);

    const overlay = new OverlayData(x, y);
    setOverlays([...overlays, overlay]);
  }

  function getOverlayKey(overlayData) {
    return `${overlayData.position[0]}${overlayData.position[1]}`;
  }

  function deleteOverlay(id) {
    setOverlays((o) => o.filter((data) => getOverlayKey(data) !== id));
  }

  function updateOverlay(key, update) {
    setOverlays([...overlays.filter((v) => getOverlayKey(v) !== key), update]);
  }

  return (
    <article className="LocationViewer">
      <NavBar className="absolute" title={locGraph.title}>
        <button className="wrapper">
          <Save />
        </button>
      </NavBar>
      <div className="content" ref={wrapperRef}>
        <img
          src={panoramas[panoId]}
          alt="panorama"
          onClick={addOverlay}
          ref={locationRef}
        />
        <AnimatePresence>
          {overlays.map((data) => {
            let key = getOverlayKey(data);
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

function getBase64Image(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  canvas.height = img.naturalHeight;
  canvas.width = img.naturalWidth;
  ctx.drawImage(img, 0, 0);
  return canvas.toBlob();
}
