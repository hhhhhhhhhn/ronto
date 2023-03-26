import fs from "fs"
import path from "path"

export default function Post() {
	let files = fs.readdirSync("posts")
	function getPreview(filename: string) {
		let location = path.resolve("posts", filename)
		let lines = fs.readFileSync(location, "utf8").split("\n")
		return <div>
			<a href={`./${filename.split(".")[0]}.html`}>
				<h2>{lines[0]}</h2>
				<p>{lines[2]}...</p>
			</a>
			<hr/>
		</div>
	}
	return (
		<html>
			<head>
				<title>Posts</title>
			</head>
			<body>
				<h1>List of posts:</h1>
				{files.map(getPreview)}
			</body>
		</html>
	)
}
