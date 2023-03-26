export default function Button({text = "Button"}) {
	return (
		<button style="color:red">
			{text}
		</button>
	)
}

export let dependencies = ["../file.md"]
