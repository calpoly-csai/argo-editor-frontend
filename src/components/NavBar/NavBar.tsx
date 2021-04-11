import "./NavBar.scss";
import React from "react";
import { ArrowLeft } from "react-feather";
import { useHistory } from "react-router-dom";

type NavBarProps = {
  children : React.ReactNode,
  title : String,
  className?: string,
  style?: React.CSSProperties
};

export default function NavBar({ children, title, ...restProps }: NavBarProps) {
  const { goBack } = useHistory();
  return (
    <nav
      {...restProps}
      className={
        "NavBar" + (restProps.className ? " " + restProps.className : "")
      }
    >
      <div className="base-ops">
        <button className="wrapper" onClick={goBack}>
          <ArrowLeft size={35} />
        </button>

        <h1>{title}</h1>
      </div>

      <div className="options">{children}</div>
    </nav>
  );
}
