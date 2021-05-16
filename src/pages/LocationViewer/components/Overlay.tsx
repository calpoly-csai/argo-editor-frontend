import React, { useState } from "react";
import "./Overlay.scss";
import {
  Link,
  ArrowRight,
  ArrowLeft,
  Aperture,
  Database,
  X as XIcon,
  Icon,
} from "react-feather";

import { motion, PanInfo, useMotionValue } from "framer-motion";
import { useTour } from "../../../hooks/tour-graph";
import Api from "../../../api";

type OverlayProps = { 
  data : Overlay, onDelete: () => void , 
  onUpdate : (update : (overlay: Overlay) => void) => void , 
  wrapperRef: React.RefObject<Element> 
}

type OverlayViewName = "base" | "actions" | "createLink" | "createPortal" | "createPath" | "createDataSource";

type OverlayViewProps = {
  data: Overlay,
  changeView: (name:OverlayViewName) => void,
  onUpdate : (update : (overlay: Overlay) => void) => void,
};


// A mapping of names to views. viewName will index into this array in order to display the correct UI component.
const views = {
  base: BaseView,
  actions: ActionsView,
  createLink: CreateLinkView,
  createPortal: CreatePortalView,
  createPath: CreatePathView,
  createDataSource: CreateDataSourceView,
};



export default function Overlay({ data, onDelete, onUpdate, wrapperRef }: OverlayProps) {
  // The current screen of the overlay
  const [viewName, setViewName] = useState<OverlayViewName>("base");

  const x = useMotionValue(data.position[0])
  const y = useMotionValue(data.position[1])
  const z = useMotionValue(data.position[2])


  // Get the view based on view name
  const CurrentView = views[viewName];

  /**
   * Back button functionality.
   */
  function navBack() {
    if (viewName === "base") onDelete();
    else setViewName(viewName === "actions" ? "base" : "actions");
  }

  function onDragEnd(e : MouseEvent | TouchEvent | PointerEvent, info : PanInfo) {
      onUpdate(overlay => void (overlay.position = [x.get(),y.get(),0]))

  }

  return (
    <motion.section
      drag
      dragConstraints={wrapperRef}
      className="Overlay"
      style={{y, x, scale: z}}
      transition={{ duration: 0.3 }}
      initial={{ scale: 0.9 }}
      exit={{ scale: 0.9, opacity: 0 }}
      dragMomentum={false}
      onDragEnd={onDragEnd}
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

function BaseView(props: OverlayViewProps) {
  function updateTitle(e : React.ChangeEvent<HTMLInputElement>) {
    props.onUpdate(overlay => void (overlay.title = e.target.value));
  }

  function updateDescription(e: React.ChangeEvent<HTMLTextAreaElement>) {
    props.onUpdate(overlay => void (overlay.description = e.target.value));
  }
  return (
    <form className="BaseView">
      <input
        type="text"
        placeholder="Title"
        value={props.data.title}
        onChange={updateTitle}
      />
      <textarea
        placeholder="Description"
        value={props.data.description}
        onChange={updateDescription}
      />

      <button onClick={() => props.changeView("actions")}>Add Actions</button>
      <ul className="actions-list">
        {props.data.actions.map((action) => (
          <OverlayPill action={action} />
        ))}
      </ul>
    </form>
  );
}

type ActionsList = {
  symbol: Icon,
  to : OverlayViewName,
  name : string
}[];

function ActionsView(props: OverlayViewProps) {
  const actions : ActionsList = [
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
            <a onClick={() => props.changeView(action.to)}>
              <action.symbol />
              <span>{action.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreateLinkView({ data, changeView, onUpdate } : OverlayViewProps) {
  function handleSubmit(e : React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.target as HTMLFormElement
    let formData = new FormData(el);
    let linkData : OverlayAction = {
      type: "external-link",
      title: formData.get("title"),
      link: formData.get("link"),
    };
    changeView("actions");
    onUpdate(overlay => void (overlay.actions.push(linkData)));
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

function CreatePathView({ changeView, onUpdate, data } : OverlayViewProps) {
  const [tour] = useTour()
  async function handleSubmit(e : React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.target as HTMLFormElement
    let formData = new FormData(el);
    const url = await Api.addResource(formData.get('video') as File, 'video');
    let pathData : OverlayAction = {
      type: "path",
      video: url,
      destination: formData.get('destination') as string
    };
    changeView("actions");
    onUpdate(overlay => overlay.actions.push(pathData));
  }
  return (
    <form className="CreatePathView" onSubmit={handleSubmit}>
      <h2> New Path </h2>
      <input name="title" type="text" placeholder="Path title" />
      <label>
        <p className="field-label">Destination:</p>

        <select required placeholder="Destination" name="destination">
          {Object.entries(tour.locations).map(([id, location]) => (
            <option value={id}>{location.title}</option>
          ))}
        </select>
      </label>
      <label>
        <p className="field-label">Path Video:</p>
        <input required name="video" type="file" placeholder="Path Video" />
      </label>

      <input type="submit" value="Add Link" />
    </form>
  );
}

function CreateDataSourceView(props : OverlayViewProps) {
  return (
    <form className="CreateDataSourceView">
      <h2> New Link </h2>
      <input type="text" placeholder="URL" />
      <input type="text" placeholder="Data format" />
      <input type="submit" value="Add Source" />
    </form>
  );
}

function CreatePortalView(props : OverlayViewProps) {
  const [tour] = useTour()
  return (
    <form className="CreatePortalView">
      <select>
        {Object.values(tour.locations).map(({ title }) => (
          <option value={title}>{title}</option>
        ))}
      </select>
      <input type="submit" value="Add Portal" />
    </form>
  );
}

function OverlayPill(props: {action : OverlayAction}) {
  return <li className="OverlayPill">{props.action.type}</li>;
}
