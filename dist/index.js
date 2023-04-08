"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = exports.build = exports.copy = exports.renderComponent = exports.fillDependencyGraph = void 0;
const preact_render_to_string_1 = require("preact-render-to-string");
const fs_1 = __importDefault(require("fs"));
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
const dependency_tree_1 = __importDefault(require("dependency-tree"));
let renderJobs = new Map(); // outputPath -> renderJob
let copyJobs = new Map(); // src -> dest
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
    let dir = path_1.default.dirname(((_a = err.stack) === null || _a === void 0 ? void 0 : _a.split("\n")[2].split(":")[0].split("at ")[1]) || "");
    componentPath = path_1.default.join(dir, componentPath.split(".")[0] + ".js");
    outputPath = path_1.default.resolve(outputPath);
    dependsOn = dependsOn.map(f => path_1.default.resolve(f));
    dependencies.set(outputPath, [componentPath, ...dependsOn]);
    fillDependencyGraph(componentPath, process.cwd());
    renderJobs.set(outputPath, { outputPath, componentPath, props });
    console.log(dependencies);
}
exports.renderComponent = renderComponent;
function copy(src, dest) {
    src = path_1.default.resolve(src);
    dest = path_1.default.resolve(dest);
    dependencies.set(dest, [src]);
    copyJobs.set(src, dest);
    console.log(dependencies);
}
exports.copy = copy;
function build(builder) {
    return __awaiter(this, void 0, void 0, function* () {
        yield builder();
        for (let [_, job] of renderJobs.entries()) {
            buildComponent(job);
        }
        for (let [src, dest] of copyJobs.entries()) {
            copyFile(src, dest);
        }
    });
}
exports.build = build;
function buildComponent(file) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Rendering ${file.outputPath}, from ${file.componentPath}`);
        let component = require(file.componentPath).default;
        let html = (0, preact_render_to_string_1.render)(yield component(file.props));
        fs_1.default.mkdirSync(path_1.default.dirname(file.outputPath), { recursive: true });
        fs_1.default.writeFile(file.outputPath, html, () => { console.log(`Wrote ${html.length} bytes`); });
        delete require.cache[require.resolve(file.componentPath)];
    });
}
function copyFile(src, dest) {
    fs_1.default.mkdirSync(path_1.default.dirname(dest), { recursive: true });
    fs_1.default.cpSync(src, dest, { recursive: true });
    console.log(`Copied ${src} to ${dest}`);
}
function watch(builder) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Watching...");
        yield builder();
        let watcher = chokidar_1.default.watch(process.cwd(), { ignored: /.*(node_modules\/|\.git\/).*/ });
        watcher.on("add", (file) => {
            console.log(`Added ${file}`);
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
            console.log(`Removed ${file}`);
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
    if (filename != process.cwd()) {
        console.log("Invalidating parent");
        invalidate(path_1.default.dirname(filename));
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
            try {
                buildComponent(job);
            }
            catch (e) {
                console.warn(`${outputFile} failed with error ${e}`);
            }
        }
    }
    for (let [src, dest] of copyJobs.entries()) {
        if (invalid.includes(src)) {
            try {
                copyFile(src, dest);
            }
            catch (e) {
                console.warn(`${src} -> ${dest} failed with error ${e}`);
            }
        }
    }
    invalid = [];
}
