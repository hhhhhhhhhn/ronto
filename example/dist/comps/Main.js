"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("preact/jsx-runtime");
const Counter_1 = __importDefault(require("./Counter"));
function Site({}) {
    return (0, jsx_runtime_1.jsxs)("html", { children: [(0, jsx_runtime_1.jsx)("head", { children: (0, jsx_runtime_1.jsx)("title", { children: "Simple Demo" }) }), (0, jsx_runtime_1.jsx)("body", { children: Array(20).fill(0).map((_, i) => (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(Counter_1.default, { n: i }) })) })] });
}
exports.default = Site;
