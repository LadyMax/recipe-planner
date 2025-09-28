import type React from "react";

export default interface Route {
  path: string;
  element: React.ReactNode;
  index?: number;
  children?: Route[];
  // 给 Header 用的可选字段
  menuLabel?: string;
  parent?: string;
}
