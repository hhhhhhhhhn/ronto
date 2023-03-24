import { render } from "preact-render-to-string"
import fs from "fs"
import path from "path"
import dependencyTree from "dependency-tree"

type outputFile = {
	componentPath: string,
	dependencies: string[],
	props: object,
	outputPath: string,
}
let outputFiles: Map<string, outputFile> = new Map()

export function renderComponent(componentPath: string, props: object, outputPath: string) {
	console.log(`Rendering ${componentPath}`)
	let err = new Error()
	let dir = path.dirname(err.stack?.split("\n")[2].split(":")[0].split("(")[1] || "")
	componentPath = path.join(dir, componentPath.split(".")[0] + ".js")
	let dependencies = dependencyTree.toList({
		filename: componentPath,
		directory: process.cwd(),
		filter: path => path.indexOf("node_modules") === -1,
	})
	outputFiles.set(outputPath, {dependencies, outputPath, componentPath, props})
	console.log(dependencies)
}

export function build() {
	for (let [dest, outputFile] of outputFiles.entries()) {
		let component = require(outputFile.componentPath).default
		let html = render(component(outputFile.props))
		fs.mkdirSync(path.dirname(dest), {recursive: true})
		fs.writeFile(dest, html, () => {})
	}
}
