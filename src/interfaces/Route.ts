import type React from "react";

export default interface Route {
  path: string;
  element: React.ReactNode;
  index?: number;
  children?: Route[];
  // Optional fields for Header
  menuLabel?: string;
  parent?: string;
}
