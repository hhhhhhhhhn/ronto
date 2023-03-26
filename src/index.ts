import { render } from "preact-render-to-string"
import fs from "fs"
import chokidar from "chokidar"
import path from "path"
import dependencyTree from "dependency-tree"

type renderJob = {
	componentPath: string,
	props: object,
	outputPath: string,
}

let renderJobs: Map<string, renderJob> = new Map() // outputPath -> renderJob
let copyJobs: Map<string, string> = new Map() // src -> dest
let dependencies: Map<string, string[]> = new Map() // file -> dependencies
let invalid: string[] = []

export function fillDependencyGraph(componentPath: string, rootDir: string) {
	componentPath = path.resolve(componentPath)
	if (dependencies.has(componentPath)) {
		return
	}
	let deps = dependencyTree.toList({
		filename: componentPath,
		directory: process.cwd(),
		filter: path => path.indexOf("node_modules") === -1,
	})
	try {
		let extraDeps: string[] = require(componentPath).dependencies || []
		extraDeps = extraDeps.map(p => path.resolve(path.dirname(componentPath), p))
		deps = deps.concat(extraDeps)
	} catch(e) {
		// console.warn(e)
	}

	dependencies.set(componentPath, deps)

	deps.forEach(dep => fillDependencyGraph(dep, rootDir))
}

export function renderComponent(componentPath: string, props: object, outputPath: string, dependsOn: string[] = []) {
	let err = new Error()
	let dir = path.dirname(err.stack?.split("\n")[2].split(":")[0].split("(")[1] || "")
	componentPath = path.join(dir, componentPath.split(".")[0] + ".js")
	outputPath = path.resolve(outputPath)
	dependsOn = dependsOn.map(f => path.resolve(f))
	dependencies.set(outputPath, [componentPath, ...dependsOn])
	fillDependencyGraph(componentPath, process.cwd())
	renderJobs.set(outputPath, {outputPath, componentPath, props})
	console.log(dependencies)
}

export function copy(src: string, dest: string) {
	src = path.resolve(src)
	dest = path.resolve(dest)
	dependencies.set(dest, [src])
	copyJobs.set(src, dest)
	console.log(dependencies)
}

export function build(builder: () => void) {
	builder()
	for (let [_, job] of renderJobs.entries()) {
		buildComponent(job)
	}
	for (let [src, dest] of copyJobs.entries()) {
		copyFile(src, dest)
	}
}

function buildComponent(file: renderJob) {
	console.log(`Rendering ${file.outputPath}`)
	let component = require(file.componentPath).default
	let html = render(component(file.props))
	fs.mkdirSync(path.dirname(file.outputPath), {recursive: true})
	fs.writeFile(file.outputPath, html, () => {console.log(`Wrote ${html.length} bytes`)})
	delete require.cache[require.resolve(file.componentPath)]
}

function copyFile(src: string, dest: string) {
	fs.mkdirSync(path.dirname(dest), {recursive: true})
	fs.cpSync(src, dest, {recursive: true})
	console.log(`Copied ${src} to ${dest}`)
}

export function watch(builder: () => void) {
	builder()
	let watcher = chokidar.watch(process.cwd(), {ignored: /.*node_modules.*/})
	watcher.on("add", (file) => {
		console.log(`Added ${file}`)
		file = path.resolve(file)
		renderJobs = new Map()
		dependencies = new Map()
		builder()
		if (!renderJobs.has(file)) {
			invalidate(path.resolve(file))
			incrementalBuild()
		}
	})
	watcher.on("unlink", (file) => {
		console.log(`Removed ${file}`)
		file = path.resolve(file)
		renderJobs = new Map()
		dependencies = new Map()
		builder()
		if (!renderJobs.has(file)) {
			invalidate(path.resolve(file))
			incrementalBuild()
		}
	})
	watcher.on("change", (file) => {
		file = path.resolve(file)
		if (!renderJobs.has(file)) {
			invalidate(path.resolve(file))
			incrementalBuild()
		}
	})
}

function invalidate(filename: string) {
	console.log(`Invalidating ${filename}`)
	invalid.push(filename)
	for (let [file, deps] of dependencies.entries()) {
		if (deps.includes(filename) && !invalid.includes(file)) {
			invalidate(file)
		}
	}
	if (filename != process.cwd()) {
		console.log("Invalidating parent")
		invalidate(path.dirname(filename));
	}
}

let incrementalBuildTimer: NodeJS.Timeout | null = null

function incrementalBuild() {
	if (incrementalBuildTimer) {
		clearTimeout(incrementalBuildTimer)
	}
	incrementalBuildTimer = setTimeout(doIncrementalBuild, 50)
}

function doIncrementalBuild() {
	for (let [outputFile, job] of renderJobs.entries()) {
		if (invalid.includes(outputFile)) {
			try {
				buildComponent(job)
			} catch(e) {
				console.warn(`${outputFile} failed with error ${e}`)
			}
		}
	}
	for (let [src, dest] of copyJobs.entries()) {
		if (invalid.includes(src)) {
			try {
				copyFile(src, dest)
			} catch(e) {
				console.warn(`${src} -> ${dest} failed with error ${e}`)
			}
		}
	}
	invalid = []
}
