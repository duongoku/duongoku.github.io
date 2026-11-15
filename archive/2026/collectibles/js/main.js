import { createApp } from "./ui.js";
import { loadState } from "./storage.js";

const root = typeof document === "undefined" ? null : document.querySelector("#app");

if (root) {
  createApp(root, loadState());
}
