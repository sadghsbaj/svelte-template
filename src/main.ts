import { mount } from "svelte";

import { initPreload } from "$core/_system";
import "./app.css";

import App from "./App.svelte";

initPreload();

const app = mount(App, {
    target: document.getElementById("app-mount")!,
});

export default app;

