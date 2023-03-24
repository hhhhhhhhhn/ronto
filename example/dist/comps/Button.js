"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dependencies = void 0;
const jsx_runtime_1 = require("preact/jsx-runtime");
function Button({ text = "Button" }) {
    return ((0, jsx_runtime_1.jsx)("button", Object.assign({ style: "color:red" }, { children: text })));
}
exports.default = Button;
exports.dependencies = ["../file.md"];
