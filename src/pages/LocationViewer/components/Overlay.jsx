import { useState } from "react";
import "./Overlay.scss";
import {
  Link,
  ArrowRight,
  ArrowLeft,
  Aperture,
  Database,
  X as XIcon,
} from "react-feather";

import { motion } from "framer-motion";

import exampleTour from "../../../assets/example-tour.json";

// A mapping of names to views. viewName will index into this array in order to display the correct UI component.
const views = {
  base: BaseView,
  actions: ActionsView,
  createLink: CreateLinkView,
  createPortal: CreatePortalView,
  createPath: CreatePathView,
  createDataSource: CreateDataSourceView,
};

export default function Overlay({ data, onDelete, onUpdate, wrapperRef }) {
  // The current screen of the overlay
  const [viewName, setViewName] = useState("base");

  // Get the view based on view name
  const CurrentView = views[viewName];
  // Position the overlay on top of the image
  const positionStyles = {
    left: data.position[0] + "px",
    top: data.position[1] + "px",
  };
  /**
   * Back button functionality.
   */
  function navBack() {
    if (viewName === "base") onDelete();
    else setViewName(viewName === "actions" ? "base" : "actions");
  }

  return (
    <motion.section
      drag
      layout
      dragConstraints={wrapperRef}
      className="Overlay"
      style={positionStyles}
      transition={{ duration: 0.3 }}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
    >
      <nav>
        <button className="wrapper" onClick={navBack}>
          {viewName === "base" ? <XIcon /> : <ArrowLeft />}
        </button>
      </nav>
      <CurrentView changeView={setViewName} data={data} onUpdate={onUpdate} />
    </motion.section>
  );
}

export class OverlayData {
  constructor(x, y) {
    this.position = [x, y];
    this.title = "";
    this.description = "";
    this.actions = [];
  }
}

function BaseView({ data, changeView, onUpdate }) {
  function updateTitle(e) {
    onUpdate({ ...data, title: e.target.value });
  }

  function updateDescription(e) {
    onUpdate({ ...data, description: e.target.value });
  }
  return (
    <form className="BaseView">
      <input
        type="text"
        placeholder="Title"
        value={data.title}
        onChange={updateTitle}
      />
      <textarea
        placeholder="Description"
        value={data.description}
        onChange={updateDescription}
      />

      <button onClick={() => changeView("actions")}>Add Actions</button>
      <ul className="actions-list">
        {data.actions.map((action) => (
          <OverlayPill action={action} />
        ))}
      </ul>
    </form>
  );
}

function ActionsView({ changeView }) {
  const actions = [
    {
      symbol: Link,
      to: "createLink",
      name: "Link to Resource",
    },
    {
      symbol: ArrowRight,
      to: "createPath",
      name: "Connect to Path",
    },
    {
      symbol: Aperture,
      to: "createPortal",
      name: "Teleport to Location",
    },
    {
      symbol: Database,
      to: "createDataSource",
      name: "Fetch Data",
    },
  ];

  return (
    <div className="ActionsView">
      <h2>Actions</h2>
      <ul>
        {actions.map((action) => (
          <li className="action" key={action.to}>
            <a onClick={() => changeView(action.to)}>
              <action.symbol />
              <span>{action.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreateLinkView({ data, changeView, onUpdate }) {
  function handleSubmit(e) {
    e.preventDefault();
    let formData = new FormData(e.target);
    let linkData = {
      type: "external-link",
      title: formData.get("title"),
      link: formData.get("link"),
    };
    changeView("actions");
    onUpdate({ ...data, actions: [...data.actions, linkData] });
  }

  return (
    <form className="CreateLinkView" onSubmit={handleSubmit}>
      <h2>New Link </h2>
      <input name="title" type="text" placeholder="Title" required />
      <input name="link" type="url" placeholder="URL" required />
      <input type="submit" value="Add Link" />
    </form>
  );
}

function CreatePathView({ changeView, onUpdate, data }) {
  function handleSubmit(e) {
    e.preventDefault();
    let formData = new FormData(e.target);
    let linkData = {
      type: "external-link",
      title: formData.get("title"),
      link: formData.get("link"),
    };
    // maybe upload video to the server here?
    changeView("actions");
    onUpdate({ ...data, actions: [...data.actions, linkData] });
  }
  return (
    <form className="CreatePathView" onSubmit={handleSubmit}>
      <h2> New Path </h2>
      <input name="title" type="text" placeholder="Path title" />
      <label>
        <p className="field-label">Destination:</p>

        <select placeholder="Destination" name="destination">
          {Object.values(exampleTour.locations).map(({ title }) => (
            <option value={title}>{title}</option>
          ))}
        </select>
      </label>
      <label>
        <p className="field-label">Path Video:</p>
        <input name="video" type="file" placeholder="Path Video" />
      </label>

      <input type="submit" value="Add Link" />
    </form>
  );
}

function CreateDataSourceView({ changeView }) {
  return (
    <form className="CreateDataSourceView">
      <h2> New Link </h2>
      <input type="text" placeholder="URL" />
      <input type="text" placeholder="Data format" />
      <input type="submit" value="Add Source" />
    </form>
  );
}

function CreatePortalView({ changeView }) {
  return (
    <form className="CreatePortalView">
      <select>
        {Object.values(exampleTour.locations).map(({ title }) => (
          <option value={title}>{title}</option>
        ))}
      </select>
      <input type="submit" value="Add Portal" />
    </form>
  );
}

function OverlayPill({ action }) {
  return <li className="OverlayPill"></li>;
}
