import { mount } from "svelte";

import { initPreload } from "$core/_system/preload";

import "./app.css";
import "virtual:uno.css";

import App from "./App.svelte";

const target = document.getElementById("app");
if (!target) {
    throw new Error("Root element #app not found");
}

const app = mount(App, { target });

initPreload();

export default app;
