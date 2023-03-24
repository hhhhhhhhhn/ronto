import {renderComponent, build, watch} from "preactssg"

function builder() {
	renderComponent("comps/Counter.tsx", {}, "public/counter.html")
}

if (process.argv.includes("--watch")) {
	watch(builder)
} else {
	build(builder)
}
