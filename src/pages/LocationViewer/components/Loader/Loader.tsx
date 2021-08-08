import "./Loader.scss";
import { Loader as Spinner } from "react-feather";

interface LoaderProps {
  style?: React.CSSProperties;
  message: string;
}

export default function Loader(props: LoaderProps) {
  return (
    <div className="Loader" style={props.style}>
      <div className="spinner-wrapper">
        <Spinner />
      </div>
      <span className="message">{props.message}</span>
    </div>
  );
}
