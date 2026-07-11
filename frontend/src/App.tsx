import React from "react";
import "./widgets";
import { DashboardShell } from "./components/DashboardShell";
import "./styles.css";

export default function App() {
  return (
    <div className="app-root">
      <h1>Dashboard Builder POC</h1>
      <DashboardShell />
    </div>
  );
}
