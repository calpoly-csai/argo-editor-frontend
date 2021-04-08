import "./Tours.scss";

import { Link } from "react-router-dom";
import useTourGraph from "../../hooks/useTourGraph"

// We would fetch this list from the server


export default function Tours() {
  const tours = useTourGraph();
  const tourNames = Object.values(tours).map(({title}) => title)
  return (
    <article className="page Tours">
      <div className="content">
        <h1>Tours</h1>
        <ul>
          {tourNames.map((tour) => (
            <li key={tour}>
              <Link to={`/tour/${tour}`}>{tour}</Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
