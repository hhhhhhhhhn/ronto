"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("preact/jsx-runtime");
const Button_1 = __importDefault(require("./Button"));
function Counter({ n = 10 }) {
    if (n <= 0) {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, {});
    }
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Counter, { n: n - 1 }), (0, jsx_runtime_1.jsx)(Button_1.default, { text: String(n) })] });
}
exports.default = Counter;
