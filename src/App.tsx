import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import './App.css';

type dot = {
	id?: number,
	x?: number,
	y?: number,
	label?: string
	[key: string]: any
}

type draggable = {
	dragging?: boolean,
	X?: number,
	Y?: number,
	oldX?: number,
	oldY?: number,
	id?: number
}

type quadrantStorage = {
	dots: dot[] | undefined,
	draggable: draggable | undefined,
	lastId: number | undefined
}

function App() {
	const containerRef = useRef<any>();

	const [draggable, setDraggable] = useState<draggable>();
	const [dots, setDots] = useState<dot[]>([
		{ id: 1, x: Math.floor((Math.random() * 70) + 10), y: Math.floor((Math.random() * 60) + 30), label: "1" },
		{ id: 2, x: Math.floor((Math.random() * 70) + 10), y: Math.floor((Math.random() * 60) + 30), label: "2" },
		{ id: 3, x: Math.floor((Math.random() * 70) + 10), y: Math.floor((Math.random() * 60) + 30), label: "3" }
	]);
	const [lastId, setLastId] = useState<number>(4);

	useEffect(() => {
		let tempData: string | null = localStorage.getItem("data");
		if (tempData) {
			let parsed: quadrantStorage = JSON.parse(tempData)
			parsed.dots && setDots(parsed.dots)
			parsed.draggable && setDraggable({ ...parsed.draggable })
			parsed.lastId && setLastId(parsed.lastId)
		}

	}, [])

	const move = (e: React.MouseEvent<any>) => {
		if (draggable && draggable.X && draggable.Y) {
			let tempDots: dot[] = [...dots];
			let index: number = tempDots.findIndex((d: dot) => d.id === draggable.id);
			let item: dot = tempDots[index]
			item.x = (Number(draggable.oldX) + (e.pageX - draggable.X) / 4);
			item.y = (Number(draggable.oldY) - (e.pageY - draggable.Y) / 4);
			tempDots[index] = item;
			setDots(tempDots);
		}
	}

	useEffect(() => {
		let node: any = containerRef.current;
		if (draggable?.dragging) {
			node.addEventListener('mousemove', move)
			node.addEventListener('mouseup', onMouseUp)
		}

		return () => {
			if (node) {
				node.removeEventListener('mousemove', move)
				node.removeEventListener('mouseup', onMouseUp)
			}
		};
	})

	useEffect(() => {
		const data: quadrantStorage = {
			draggable,
			dots,
			lastId
		}
		localStorage.setItem("data", JSON.stringify(data))
	})

	const handleAdd = (): void => {
		let newDot: dot = {
			id: lastId,
			x: 50,
			y: 50,
			label: "New Item"
		}
		setDots((prevState: dot[]) => ([
			...prevState,
			newDot
		]));
		setLastId(lastId + 1);
	}

	const onMouseUp = (e: React.MouseEvent<any>) => {
		setDraggable({
			dragging: false,
			id: -1
		})
		e.stopPropagation()
		e.preventDefault()
	}

	const handleMouseDown = (e: React.MouseEvent<any>, item: dot) => {
		if (e.button !== 0) return

		setDraggable({
			dragging: true,
			X: e.pageX,
			Y: e.pageY,
			oldX: item.x,
			oldY: item.y,
			id: item.id
		})
		e.stopPropagation()
		e.preventDefault()
	}

	const handleDelete = (item: dot): void => {
		let tempDots: dot[] = [...dots];
		let index: number = tempDots.findIndex((d: dot) => d.id === item.id);
		tempDots.splice(index, 1);
		setDots(tempDots);

	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, item: dot): void => {
		const { target } = e;
		let tempDots: dot[] = [...dots];
		let index: number = tempDots.findIndex((d: dot) => d.id === item.id);
		item[target.name] = target.value;
		tempDots[index] = item;
		setDots(tempDots);
	}

	return (
		<div className="App">
			<div className="center d-flex">
				<div className="rotated chart-y-label">Ability to execute →</div>
				<div className="flex-column">
					<div className="scatter-chart mx-5">
						<div className="quadrant quadrant-left">Challengers</div>
						<div className="quadrant quadrant-right">Leaders</div>
						<div className="quadrant quadrant-left quadrant-bottom">Niche Players</div>
						<div className="quadrant quadrant-right quadrant-bottom">Visionaires</div>
						<svg ref={containerRef} style={{ width: 400, height: 400, margin: "-2px" }}>
							<line className="axis" x1="0" y1="200" x2="400" y2="200" />
							<line className="axis" x1="200" y1="0" x2="200" y2="400" />
							{dots.map((item: dot) => {
								return (
									<React.Fragment key={item.id}>
										<g className="node" transform={`translate(${item.x ? item.x * 4 : 50},${item.y ? 400 - item.y * 4 : 50})`} onMouseDown={(e: React.MouseEvent<any>) => handleMouseDown(e, item)}>
											<circle r="27" className={`dot-circle ${draggable?.id === item.id ? 'dot-circle-active' : ''}`}></circle>
											<circle r="7.5" className="dot"></circle>
											<text dy="20" dx="5" className="label-point">{item.label}</text>
										</g>
									</React.Fragment>
								)
							})}
						</svg>
					</div>
					<div className="text-start mx-5">Completeness of vision →</div>
				</div>
				<div className="d-flex flex-column table-container">
					<button className="btn btn-sm btn-add btn-secondary" onClick={handleAdd}>Add</button>
					<table className="mx-5">
						<tbody>
							<tr>
								<th className="pe-3">Label</th>
								<th className="px-3">Vision</th>
								<th className="px-3">Ability</th>
								<th className="px-3">Delete</th>
							</tr>
							{dots.map((item: dot) => {
								return (
									<React.Fragment key={item.id}>
										<tr>
											<td><input value={item.label} name="label" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, item)} /></td>
											<td><input value={item.x} name="x" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, item)} /></td>
											<td><input value={item.y} name="y" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, item)} /></td>
											<td><button className="btn btn-sm btn-delete" onClick={() => handleDelete(item)}>Delete</button></td>
										</tr>
									</React.Fragment>
								)
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div >
	);
}

export default App;
