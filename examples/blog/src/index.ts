import fs from "fs"
import path from "path"
import {renderComponent, watch, build} from "ronto"

function builder() {
	renderComponent("comps/Index.tsx", {}, `public/index.html`, ["posts"])
	for (let file of fs.readdirSync("posts")) {
		let abs = path.resolve("posts", file)
		renderComponent("comps/Post.tsx", {file: abs}, `public/${file.split(".")[0]}.html`, [abs])
	}
}

if (process.argv.includes("--watch")) {
	watch(builder)
} else {
	build(builder)
}
