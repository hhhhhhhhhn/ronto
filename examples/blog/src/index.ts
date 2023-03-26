import fs from "fs"
import path from "path"
import {renderComponent, watch, build, copy} from "ronto"

function builder() {
	copy("assets", "public/assets")
	renderComponent("comps/Index.tsx", {}, `public/index.html`, ["posts", "assets"])
	for (let file of fs.readdirSync("posts")) {
		let abs = path.resolve("posts", file)
		renderComponent("comps/Post.tsx", {file: abs}, `public/${file.split(".")[0]}.html`, [abs, "assets"])
	}
}

if (process.argv.includes("--watch")) {
	watch(builder)
} else {
	build(builder)
}
