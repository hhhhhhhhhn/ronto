"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("preact/jsx-runtime");
const hooks_1 = require("preact/hooks");
function Component({ initial = 123 }) {
    let [count, setCount] = (0, hooks_1.useState)(initial);
    return (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("p", Object.assign({ onClick: () => { setCount(count + 1); } }, { children: ["Counter ", count] })) });
}
exports.default = Component;
