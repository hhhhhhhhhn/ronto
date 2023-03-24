"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = exports.build = exports.renderComponent = exports.fillDependencyGraph = void 0;
const preact_render_to_string_1 = require("preact-render-to-string");
const fs_1 = __importDefault(require("fs"));
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
const dependency_tree_1 = __importDefault(require("dependency-tree"));
let renderJobs = new Map(); // outputPath -> renderJob
let dependencies = new Map(); // file -> dependencies
let invalid = [];
function fillDependencyGraph(componentPath, rootDir) {
    componentPath = path_1.default.resolve(componentPath);
    if (dependencies.has(componentPath)) {
        return;
    }
    let deps = dependency_tree_1.default.toList({
        filename: componentPath,
        directory: process.cwd(),
        filter: path => path.indexOf("node_modules") === -1,
    });
    try {
        let extraDeps = require(componentPath).dependencies || [];
        extraDeps = extraDeps.map(p => path_1.default.resolve(path_1.default.dirname(componentPath), p));
        deps = deps.concat(extraDeps);
    }
    catch (e) {
        // console.warn(e)
    }
    dependencies.set(componentPath, deps);
    deps.forEach(dep => fillDependencyGraph(dep, rootDir));
}
exports.fillDependencyGraph = fillDependencyGraph;
function renderComponent(componentPath, props, outputPath, dependsOn = []) {
    var _a;
    let err = new Error();
    let dir = path_1.default.dirname(((_a = err.stack) === null || _a === void 0 ? void 0 : _a.split("\n")[2].split(":")[0].split("(")[1]) || "");
    componentPath = path_1.default.join(dir, componentPath.split(".")[0] + ".js");
    outputPath = path_1.default.resolve(outputPath);
    dependsOn = dependsOn.map(f => path_1.default.resolve(f));
    dependencies.set(outputPath, [componentPath, ...dependsOn]);
    fillDependencyGraph(componentPath, process.cwd());
    renderJobs.set(outputPath, { outputPath, componentPath, props });
    console.log(dependencies);
}
exports.renderComponent = renderComponent;
function build(builder) {
    builder();
    for (let [_, job] of renderJobs.entries()) {
        buildComponent(job);
    }
}
exports.build = build;
function buildComponent(file) {
    console.log(`Rendering ${file.outputPath}`);
    let component = require(file.componentPath).default;
    let html = (0, preact_render_to_string_1.render)(component(file.props));
    fs_1.default.mkdirSync(path_1.default.dirname(file.outputPath), { recursive: true });
    fs_1.default.writeFile(file.outputPath, html, () => { console.log(`Wrote ${html.length} bytes`); });
    delete require.cache[require.resolve(file.componentPath)];
}
function watch(builder) {
    builder();
    let watcher = chokidar_1.default.watch(process.cwd(), { ignored: /.*node_modules.*/ });
    watcher.on("add", (file) => {
        file = path_1.default.resolve(file);
        renderJobs = new Map();
        dependencies = new Map();
        builder();
        if (!renderJobs.has(file)) {
            invalidate(path_1.default.resolve(file));
            incrementalBuild();
        }
    });
    watcher.on("unlink", (file) => {
        file = path_1.default.resolve(file);
        renderJobs = new Map();
        dependencies = new Map();
        builder();
        if (!renderJobs.has(file)) {
            invalidate(path_1.default.resolve(file));
            incrementalBuild();
        }
    });
    watcher.on("change", (file) => {
        file = path_1.default.resolve(file);
        if (!renderJobs.has(file)) {
            invalidate(path_1.default.resolve(file));
            incrementalBuild();
        }
    });
}
exports.watch = watch;
function invalidate(filename) {
    console.log(`Invalidating ${filename}`);
    invalid.push(filename);
    for (let [file, deps] of dependencies.entries()) {
        if (deps.includes(filename) && !invalid.includes(file)) {
            invalidate(file);
        }
    }
}
let incrementalBuildTimer = null;
function incrementalBuild() {
    if (incrementalBuildTimer) {
        clearTimeout(incrementalBuildTimer);
    }
    incrementalBuildTimer = setTimeout(doIncrementalBuild, 50);
}
function doIncrementalBuild() {
    for (let [outputFile, job] of renderJobs.entries()) {
        if (invalid.includes(outputFile)) {
            buildComponent(job);
        }
    }
    invalid = [];
}
