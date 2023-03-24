import {renderComponent, build, watch} from "preactssg"

function builder() {
	renderComponent("comps/Main.tsx", {}, "public/index.html")
}

if (process.argv.includes("--watch")) {
	watch(builder)
} else {
	build(builder)
}
