import Counter from "./Counter"

export default function Site({}) {
	return <html>
		<head>
			<title>Simple Demo</title>
		</head>
		<body>
			{Array(20).fill(0).map((_, i) => <div><Counter n={i}/></div>)}
		</body>
	</html>
}
