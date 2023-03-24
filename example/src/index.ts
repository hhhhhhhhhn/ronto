import {renderComponent, build} from "preactssg"

renderComponent("comps/Counter.tsx", {}, "public/counter.html")

build()
