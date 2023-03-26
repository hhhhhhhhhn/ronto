import fs from "fs"

export default function Post({file = ""}) {
	let data = fs.readFileSync(file, "utf8")
	let lines = data.split("\n")
	let title = lines[0]
	let parragraphs = lines.slice(1).join("\n").split("\n\n")
	return (
		<html>
			<head>
				<title>{title}</title>
				<link rel="stylesheet" href="./assets/main.css"/>
			</head>
			<body>
				<h1>{title}</h1>
				{parragraphs.map((content) => <p>{content}</p>)}
			</body>
		</html>
	)
}
