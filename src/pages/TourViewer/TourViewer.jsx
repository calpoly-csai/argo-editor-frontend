import "./TourViewer.scss";
// import exampleTour from "../../assets/example-tour.json";
import NavBar from "../../components/NavBar/NavBar";
import Graph from "react-graph-vis";
import { useHistory } from "react-router-dom";
import useTourGraph from "../../hooks/useTourGraph"



export default function TourViewer() {
  const history = useHistory();
  let pageName = history.location.pathname.split("/");
  pageName = pageName[pageName.length - 1];
  const graph = useGraph(pageName)
  console.log({graph})


const options = {
  edges: {
    color: "#000000",
  },
  autoResize: true,
  width: "100%",
  locale: "en",
};


  const graphEvents = {
    select: function (event) {
      let { nodes, edges } = event;
      if (nodes.length) history.push("/location/" + nodes[0]);
    },
  };

  return (
    <article className="TourViewer">
      <NavBar title={pageName} className="absolute" />
      <Graph graph={graph} options={options} events={graphEvents} />
    </article>
  );
}

function useGraph(pageName)  {
  const tourGraphs = useTourGraph()
  console.log({tourGraphs})
  const tourGraph = Object.values(tourGraphs).find(tour => tour.title === pageName);
  if(!tourGraph) return {nodes : [], edges : []}
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
