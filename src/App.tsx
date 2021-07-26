import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Tours from "./pages/Tours/Tours";
import TourViewer from "./pages/TourViewer/TourViewer";
import LocationViewer from "./pages/LocationViewer/LocationViewer";
import { fetchGraph } from "./hooks/tour-graph";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.scss";

export default function App() {
  fetchGraph();
  return (
    <Router>
      <Switch>
        <Route exact path="/tour/:tourId" component={TourViewer} />
        <Route
          exact
          path="/tour/:tourId/location/:locationName"
          component={LocationViewer}
        />
        <Route path="*" exact component={Tours} />
      </Switch>
      <ToastContainer position="bottom-center" />
    </Router>
  );
}
