import React, { useEffect, useRef, useState } from 'react';
import './App.css';

type dot = {
	id: number,
	x: number,
	y: number,
	label: string
}

function App() {
	const containerRef = useRef<any>();

	const [draggable, setDraggable] = useState<any>({});
	const [dots, setDots] = useState<any[]>([
		{ id: 1, x: Math.floor((Math.random() * 70) + 10), y: Math.floor((Math.random() * 60) + 30), label: "1" },
		{ id: 2, x: Math.floor((Math.random() * 70) + 10), y: Math.floor((Math.random() * 60) + 30), label: "2" },
		{ id: 3, x: Math.floor((Math.random() * 70) + 10), y: Math.floor((Math.random() * 60) + 30), label: "3" }
	]);
	const [lastId, setLastId] = useState<number>(4);

	useEffect(() => {
		let tempData = localStorage.getItem("data");
		if (tempData) {
			let parsed = JSON.parse(tempData)
			setDots(parsed.dots)
			setDraggable({ ...parsed.draggable })
			setLastId(parsed.lastId)
		}

	}, [])

	const move = (e: any) => {
		let tempDots = [...dots];
		let index = tempDots.findIndex((d: dot) => d.id === draggable.id);
		let item = tempDots[index]
		item.x = (Number(draggable.oldX) + (e.pageX - draggable.X) / 4);
		item.y = (Number(draggable.oldY) - (e.pageY - draggable.Y) / 4);
		tempDots[index] = item;
		setDots(tempDots);
	}

	useEffect(() => {
		let node = containerRef.current;
		if (draggable.dragging) {
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
		const data = {
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
		setDots((prevState: any) => ([
			...prevState,
			newDot
		]));
		setLastId(lastId + 1);
	}

	const onMouseUp = (e: any) => {
		setDraggable((prevState: any) => ({
			...prevState,
			dragging: false,
			id: null
		}))
		e.stopPropagation()
		e.preventDefault()
	}

	const handleMouseDown = (e: any, item: dot) => {
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

	const handleDelete = (item: any): void => {
		let tempDots = [...dots];
		let index = tempDots.findIndex((d: dot) => d.id === item.id);
		tempDots.splice(index, 1);
		setDots(tempDots);

	}

	const handleChange = (e: React.ChangeEvent<any>, item: any): void => {
		const { target } = e;
		let tempDots = [...dots];
		let index = tempDots.findIndex((d: dot) => d.id === item.id);
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
										<g className="node" transform={`translate(${item.x * 4},${400 - item.y * 4})`} onMouseDown={(e: React.ChangeEvent<any>) => handleMouseDown(e, item)}>
											<circle r="27" className={`dot-circle ${draggable.id === item.id ? 'dot-circle-active' : ''}`}></circle>
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
											<td><input value={item.label} name="label" onChange={(e: React.ChangeEvent<any>) => handleChange(e, item)} /></td>
											<td><input value={item.x} name="x" onChange={(e: React.ChangeEvent<any>) => handleChange(e, item)} /></td>
											<td><input value={item.y} name="y" onChange={(e: React.ChangeEvent<any>) => handleChange(e, item)} /></td>
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
