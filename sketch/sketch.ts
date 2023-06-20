/// <reference path="SortableCollection.ts"/>

const points: Point[] = [];

function setup() {
	const renderer = createCanvas(windowWidth, windowHeight);
	renderer.elt.addEventListener("contextmenu", (ev: Event) => ev.preventDefault());
}

function draw() {
	clear();
	background(0, 0, 0);

	for (const point of points)
		point.draw();
}

let mousePressOnPoint: Point = null;

function mousePressed() {
	for (const point of points)
		if (point.isInside(mouseX, mouseY))
			mousePressOnPoint = point;
}

function mouseDragged(event: MouseEvent) {
	if (event.button == 0 && mousePressOnPoint) { // Left Mouse Button
		const x = mouseX / windowWidth;
		const y = mouseY / windowHeight;
		removePoint(mousePressOnPoint);
		mousePressOnPoint = createPoint(x, y);
	}
}

function mouseReleased(event: MouseEvent) {
	if (event.button == 0) { // Left Mouse Button
		const x = mouseX / windowWidth;
		const y = mouseY / windowHeight;
		if (mousePressOnPoint) {
			removePoint(mousePressOnPoint);
			mousePressOnPoint = createPoint(x, y);
		}
		else
			createPoint(x, y);
	}
	else if (event.button == 2) { // Right Mouse Button
		for (const point of points) {
			if (point.isInside(mouseX, mouseY)) {
				removePoint(point);
				break;
			}
		}
	}

	mousePressOnPoint = null;
}

function createPoint(x: number, y: number) {
	const point = new Point(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16).toUpperCase(), x, y, points);
	points.push(point);
	return point;
}

function removePoint(point: Point) {
	const index = points.findIndex(x => x.equals(point));
	points.splice(index, 1);

	for (const point2 of points)
		point2.removeDistance(point);

	if (point.cluster)
		point.cluster.removePoint(point);
}
