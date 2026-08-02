import { mount } from "svelte";

import { initPreload } from "$core/_system/preload";

import "./app.css";

import App from "./App.svelte";

const app = mount(App, {
    target: document.getElementById("app")!,
});

initPreload();

export default app;
