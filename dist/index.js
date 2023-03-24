"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = exports.renderComponent = void 0;
const preact_render_to_string_1 = require("preact-render-to-string");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dependency_tree_1 = __importDefault(require("dependency-tree"));
let outputFiles = new Map();
function renderComponent(componentPath, props, outputPath) {
    var _a;
    console.log(`Rendering ${componentPath}`);
    let err = new Error();
    let dir = path_1.default.dirname(((_a = err.stack) === null || _a === void 0 ? void 0 : _a.split("\n")[2].split(":")[0].split("(")[1]) || "");
    componentPath = path_1.default.join(dir, componentPath.split(".")[0] + ".js");
    let dependencies = dependency_tree_1.default.toList({
        filename: componentPath,
        directory: process.cwd(),
        filter: path => path.indexOf("node_modules") === -1,
    });
    outputFiles.set(outputPath, { dependencies, outputPath, componentPath, props });
    console.log(dependencies);
}
exports.renderComponent = renderComponent;
function build() {
    for (let [dest, outputFile] of outputFiles.entries()) {
        let component = require(outputFile.componentPath).default;
        let html = (0, preact_render_to_string_1.render)(component(outputFile.props));
        fs_1.default.mkdirSync(path_1.default.dirname(dest), { recursive: true });
        fs_1.default.writeFile(dest, html, () => { });
    }
}
exports.build = build;
