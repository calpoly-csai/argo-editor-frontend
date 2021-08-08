import React, { useState } from "react";
import "./Overlay.scss";
import {
  Link,
  ArrowRight,
  ArrowLeft,
  Aperture,
  X as XIcon,
  Icon,
  Info,
} from "react-feather";

import { motion, PanInfo, useMotionValue } from "framer-motion";
import { useTour } from "../../../../hooks/tour-graph";
import Api from "../../../../api";
import { useEffect } from "react";

type OverlayProps = {
  data: OverlayData;
  onDelete: () => void;
  onUpdate: (update: (overlay: OverlayData) => void) => void;
  onPositionUpdate: (x: number, y: number) => void;
  wrapperRef: React.RefObject<Element>;
  panoramaDimensions: [number, number];
};

type OverlayViewName =
  | "base"
  | "actions"
  | "createLink"
  | "createPortal"
  | "createPath";

type OverlayViewProps = {
  data: OverlayData;
  changeView: (name: OverlayViewName) => void;
  onUpdate: (update: (overlay: OverlayData) => void) => void;
};

// A mapping of names to views. viewName will index into this array in order to display the correct UI component.
const views = {
  base: BaseView,
  actions: ActionsView,
  createLink: CreateLinkView,
  createPortal: CreatePortalView,
  createPath: CreatePathView,
};

const actionToSymbol = {
  "external-link": Link,
  portal: Aperture,
  path: ArrowRight,
  info: Info, // TODO: add info symbol
};

export default function Overlay({
  data,
  onDelete,
  onUpdate,
  onPositionUpdate,
  wrapperRef,
  panoramaDimensions,
}: OverlayProps) {
  // The current screen of the overlay
  const [viewName, setViewName] = useState<OverlayViewName>("base");
  const scaledPosition = [...data.position];
  scaledPosition[0] *= panoramaDimensions[0];
  scaledPosition[1] *= panoramaDimensions[1];
  const x = useMotionValue(scaledPosition[0]);
  const y = useMotionValue(scaledPosition[1]);
  const z = useMotionValue(scaledPosition[2]);

  // Get the view based on view name
  const CurrentView = views[viewName];

  /**
   * Back button functionality.
   */
  function navBack() {
    if (viewName === "base") onDelete();
    else setViewName(viewName === "actions" ? "base" : "actions");
  }

  function onDragEnd(e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    onPositionUpdate(
      x.get() / panoramaDimensions[0],
      y.get() / panoramaDimensions[1]
    );
  }

  return (
    <motion.section
      drag
      dragConstraints={wrapperRef}
      className="Overlay"
      style={{ y, x, scale: z }}
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
  function updateTitle(e: React.ChangeEvent<HTMLInputElement>) {
    props.onUpdate((overlay) => void (overlay.title = e.target.value));
  }

  function updateDescription(e: React.ChangeEvent<HTMLTextAreaElement>) {
    props.onUpdate((overlay) => void (overlay.description = e.target.value));
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
        {props.data.actions.map((action, key) => (
          <OverlayPill key={key} action={action} />
        ))}
      </ul>
    </form>
  );
}

type ActionsList = {
  symbol: Icon;
  to: OverlayViewName;
  name: string;
}[];

function ActionsView(props: OverlayViewProps) {
  const actions: ActionsList = [
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

function CreateLinkView({ data, changeView, onUpdate }: OverlayViewProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.target as HTMLFormElement;
    let formData = new FormData(el);
    let linkData: OverlayAction = {
      type: "external-link",
      title: formData.get("title") as string,
      link: formData.get("link") as string,
    };
    changeView("actions");
    onUpdate((overlay) => void overlay.actions.push(linkData));
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

function CreatePathView({ changeView, onUpdate, data }: OverlayViewProps) {
  const [tour] = useTour();
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.target as HTMLFormElement;
    let formData = new FormData(el);
    const url = await Api.addResource(formData.get("video") as File, "video");
    let pathData: OverlayAction = {
      type: "path",
      title: formData.get("title") as string,
      video: url,
      destination: formData.get("destination") as string,
    };
    changeView("actions");
    onUpdate((overlay) => void overlay.actions.push(pathData));
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

function CreatePortalView(props: OverlayViewProps) {
  const [tour] = useTour();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.target as HTMLFormElement;
    let formData = new FormData(el);
    let portalData: OverlayAction = {
      type: "portal",
      title: formData.get("title") as string,
      destination: formData.get("destination") as string,
    };
    props.changeView("actions");
    props.onUpdate((overlay) => void overlay.actions.push(portalData));
  }
  return (
    <form className="CreatePortalView" onSubmit={handleSubmit}>
      <input name="title" type="text" placeholder="Portal title" />

      <select name="destination">
        {Object.entries(tour.locations).map(([id, { title }]) => (
          <option value={id}>{title}</option>
        ))}
      </select>
      <input type="submit" value="Add Portal" />
    </form>
  );
}

function OverlayPill({ action }: { action: OverlayAction }) {
  const Icon = actionToSymbol[action.type];
  return (
    <li className="OverlayPill">
      <Icon />
      <span>{action.title}</span>
    </li>
  );
}
