"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const preactssg_1 = require("preactssg");
function builder() {
    (0, preactssg_1.renderComponent)("comps/Counter.tsx", {}, "public/counter.html");
}
if (process.argv.includes("--watch")) {
    (0, preactssg_1.watch)(builder);
}
else {
    (0, preactssg_1.build)(builder);
}
