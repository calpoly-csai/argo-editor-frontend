import "./Tours.scss";

import { Link } from "react-router-dom";
import Api from "../../api"
import { useEffect, useState } from "react";
import {useTourList} from "../../hooks/tour-graph"


export default function Tours() {
  const tourNames = useTourList()
  return (
    <article className="page Tours">
      <div className="content">
        <h1>Tours</h1>
        <ul>
          {tourNames.map(({title, id}) => (
            <li key={id}>
              <Link to={`/tour/${id}`}>{title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
