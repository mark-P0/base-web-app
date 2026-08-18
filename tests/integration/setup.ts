import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

import { resetMatchMedia } from "./match-media";

// Bun preloads this file for `bun run test:integration`.
GlobalRegistrator.register({ url: "http://localhost:3000" });

const globalWithReactAct = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

globalWithReactAct.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.removeAttribute("class");
  document.documentElement.removeAttribute("data-theme");
  localStorage.clear();
  sessionStorage.clear();
  resetMatchMedia();
});
