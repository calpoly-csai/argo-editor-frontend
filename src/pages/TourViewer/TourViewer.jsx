import "./TourViewer.scss";
// import exampleTour from "../../assets/example-tour.json";
import NavBar from "../../components/NavBar/NavBar";
import PopupForm from "../../components/PopupForm/PopupForm";
import Graph from "react-graph-vis";
import { useHistory } from "react-router-dom";
import { useTour } from "../../hooks/tour-graph";
import React, { useMemo, useState } from "react";
import { PlusCircle } from "react-feather";
import { AnimatePresence } from "framer-motion";
import Api from "../../api";

export default function TourViewer() {
  const history = useHistory();
  const [tourGraph, updateTour] = useTour();
  const [showAddPopup, setShowAddPopup] = useState(false);

  async function addTourLocation(e) {
    let contents = new FormData(e.target);
    setShowAddPopup(false);
    // Add panorama image to the cloud
    const panorama = contents.get("panorama");
    let assetLink = await Api.addImage(panorama);
    let location = {
      title: contents.get("title"),
      description: "",
      panorama: assetLink,
      overlays: [],
    };

    const tourId = location.title.replaceAll(" ", "-");
    updateTour((tour) => {
      tour.locations[tourId] = location;
    });
  }

  const options = {
    edges: {
      color: "#000000",
    },
    autoResize: true,
    width: "100%",
    locale: "en",
  };

  const graphEvents = {
    select(event) {
      let { nodes, edges } = event;
      if (nodes.length)
        history.push(history.location.pathname + "/location/" + nodes[0]);
    },
  };

  const graphData = compileGraphData(tourGraph);
  const graphKey = generateGraphKey(graphData);

  const graph = useMemo(
    () => (
      <Graph
        graph={graphData}
        key={graphKey}
        options={options}
        events={graphEvents}
      />
    ),
    [graphKey]
  );

  return (
    <article className="TourViewer">
      <NavBar title={tourGraph.title} className="absolute">
        <button className="wrapper" onClick={() => setShowAddPopup((b) => !b)}>
          <PlusCircle />
        </button>
      </NavBar>
      {graph}
      <AnimatePresence>
        {showAddPopup && (
          <PopupForm
            onSubmit={addTourLocation}
            onClose={() => setShowAddPopup(false)}
          >
            <h2 className="popup-title">New Panorama</h2>
            <label htmlFor="title">Location Name:</label>

            <input
              className="text-field"
              type="text"
              name="title"
              id="title"
              required
            />

            <label htmlFor="panorama-file">Panorama:</label>
            <input
              type="file"
              name="panorama"
              id="panorama-file"
              accept="image/*"
              required
            />
            <input type="submit" value="Add" />
          </PopupForm>
        )}
      </AnimatePresence>
    </article>
  );
}

function compileGraphData(tourGraph) {
  if (!tourGraph.title.length) return { nodes: [], edges: [] };
  const locationList = Object.entries(tourGraph.locations);
  const nodes = locationList.map(([loc, info]) => ({
    id: loc,
    label: info.title,
    title: info.title,
  }));
  const edges = locationList.flatMap(([loc, info]) => {
    const from = loc;
    const toList = info.overlays.flatMap((overlay) =>
      overlay.actions
        .filter((action) => action.type === "path")
        .map((path) => path.destination)
    );
    const edgeList = toList.flatMap((to) => ({ to, from }));
    return edgeList;
  });

  return { nodes, edges };
}

/**
 * Graph component key generator since react-graph-vis doesn't work in strict mode :(
 * @param {*} graphData
 * @returns A key to determine if the graph changed
 */
function generateGraphKey(graphData) {
  return (
    graphData.nodes.map((node) => node.id + node.label + node.title).join("") +
    graphData.edges.map((edge) => edge.to + edge.from).join("")
  );
}
