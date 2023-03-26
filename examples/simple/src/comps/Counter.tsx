import Button from "./Button"

export default function Counter({n = 10}) {
	if (n <= 0) {
		return <></>
	}
	return <>
		<Counter n={n-1}/>
		<Button text={String(n)}/>
	</>
}
