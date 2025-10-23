import React from "react";
import { clsx } from "clsx";

export default function LargeButton({ children, className, ...rest }) {
  return (
    <button className={clsx("btn btn-primary", className)} {...rest}>
      {children}
    </button>
  );
}
