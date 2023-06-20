class Cluster {
    constructor() {
        this.points = [];
        this.color = "#00AA00";
        this.color = "#" + (Math.floor(Math.random() * 0xFFFFFF)).toString(16).padStart(6, "0");
    }
    addPointsFromPoint(point) {
        if (!point.isCore()) {
            this.addPoint(point);
            return;
        }
        const openSet = [point];
        const closedSet = [];
        while (openSet.length > 0) {
            const processingPoint = openSet.shift();
            closedSet.push(processingPoint);
            for (let i = 0; i < processingPoint.distancesSq.size() && processingPoint.distancesSq.get(i).distSq <= Cluster.MAX_DISTANCE ** 2; i++) {
                const subPoint = processingPoint.distancesSq.get(i).point;
                if (!subPoint.isCore()) {
                    if (!closedSet.some(x => x.equals(subPoint)))
                        closedSet.push(subPoint);
                }
                else if (!openSet.some(x => x.equals(subPoint)) && !closedSet.some(x => x.equals(subPoint)))
                    openSet.push(subPoint);
            }
        }
        for (const p of closedSet) {
            this.addPoint(p);
            p.cluster = this;
        }
    }
    addPoint(point) {
        if (!this.points.some(x => x.equals(point))) {
            point.cluster = this;
            this.points.push(point);
        }
    }
    removePoint(point) {
        const index = this.points.findIndex(x => x.equals(point));
        if (index < 0)
            return;
        this.points.splice(index, 1);
        for (const point of this.points)
            point.cluster = null;
        for (const point of this.points) {
            if (point.cluster)
                continue;
            point.tryFormCluster();
        }
    }
}
Cluster.MIN_NUMBER_OF_POINTS = 3;
Cluster.MAX_DISTANCE = 64;
class Point {
    constructor(id, x, y, points) {
        this.distancesSq = new SortableCollection((a, b) => a.distSq - b.distSq);
        this.cluster = null;
        this.id = id;
        this.setPos(x, y, points);
    }
    setPos(x, y, points) {
        this.x = x;
        this.y = y;
        this.screenX = x * windowWidth;
        this.screenY = y * windowHeight;
        this.recalculateDistances(points);
        this.tryFormCluster();
    }
    recalculateDistances(points) {
        this.distancesSq.clear();
        for (const point of points) {
            if (point.equals(this))
                continue;
            const distSq = (this.screenX - point.screenX) ** 2 + (this.screenY - point.screenY) ** 2;
            this.distancesSq.set(point.id, { point, distSq });
            point.addDistance(this, distSq);
        }
    }
    tryFormCluster() {
        if (this.distancesSq.size() < Cluster.MIN_NUMBER_OF_POINTS)
            return;
        if (this.isCore()) {
            this.cluster = new Cluster();
            this.cluster.addPointsFromPoint(this);
        }
        else {
            for (let i = 0; i < this.distancesSq.size() && this.distancesSq.get(i).distSq < Cluster.MAX_DISTANCE ** 2; i++) {
                const point = this.distancesSq.get(i).point;
                if (point.cluster && point.isCore())
                    point.cluster.addPoint(this);
            }
        }
    }
    addDistance(point, distSq) {
        this.distancesSq.set(point.id, { point, distSq });
    }
    removeDistance(point) {
        this.distancesSq.remove(point.id);
    }
    draw() {
        push();
        stroke("#6939AC");
        strokeWeight(3);
        if (this.cluster)
            fill(this.cluster.color);
        else if (this.isInside(mouseX, mouseY))
            fill("#777");
        else
            fill("#333");
        ellipse(this.screenX, this.screenY, Point.RADIUS * 2, Point.RADIUS * 2);
        pop();
    }
    equals(p) {
        return this.id == p.id;
    }
    isInside(screenX, screenY) {
        return (this.screenX - screenX) ** 2 + (this.screenY - screenY) ** 2 <= Point.RADIUS ** 2;
    }
    isCore() {
        return Cluster.MIN_NUMBER_OF_POINTS <= this.distancesSq.size()
            && this.distancesSq.get(Cluster.MIN_NUMBER_OF_POINTS - 1).distSq <= Cluster.MAX_DISTANCE ** 2;
    }
}
Point.RADIUS = 16;
class SortableCollection {
    constructor(comparator) {
        this._map = new Map();
        this._items = [];
        this._comparator = comparator;
    }
    set(key, item) {
        const index = this._map.get(key);
        if (index !== undefined)
            this.remove(key);
        let left = 0;
        let right = this._items.length;
        while (left != right) {
            let center = Math.floor((right + left) / 2);
            if (this._comparator(item, this._items[center]) < 0)
                right = center;
            else
                left = center + 1;
        }
        for (const key2 of this._map.keys())
            if (left <= this._map.get(key2))
                this._map.set(key2, this._map.get(key2) + 1);
        this._items.splice(left, 0, item);
        this._map.set(key, left);
    }
    remove(key) {
        const index = this._map.get(key);
        if (index === undefined)
            return undefined;
        this._map.delete(key);
        for (const key2 of this._map.keys())
            if (index < this._map.get(key2))
                this._map.set(key2, this._map.get(key2) - 1);
        return this._items.splice(index, 1)[0];
    }
    get(key) {
        if (typeof key === "number")
            return this._items[key];
        const index = this._map.get(key);
        if (index === undefined)
            return undefined;
        return this._items[index];
    }
    size() {
        return this._items.length;
    }
    clear() {
        this._map.clear();
        this._items = [];
    }
}
const points = [];
function setup() {
    const renderer = createCanvas(windowWidth, windowHeight);
    renderer.elt.addEventListener("contextmenu", (ev) => ev.preventDefault());
}
function draw() {
    clear();
    background(0, 0, 0);
    for (const point of points)
        point.draw();
}
let mousePressOnPoint = null;
function mousePressed() {
    for (const point of points)
        if (point.isInside(mouseX, mouseY))
            mousePressOnPoint = point;
}
function mouseDragged(event) {
    if (event.button == 0 && mousePressOnPoint) {
        const x = mouseX / windowWidth;
        const y = mouseY / windowHeight;
        removePoint(mousePressOnPoint);
        mousePressOnPoint = createPoint(x, y);
    }
}
function mouseReleased(event) {
    if (event.button == 0) {
        const x = mouseX / windowWidth;
        const y = mouseY / windowHeight;
        if (mousePressOnPoint) {
            removePoint(mousePressOnPoint);
            mousePressOnPoint = createPoint(x, y);
        }
        else
            createPoint(x, y);
    }
    else if (event.button == 2) {
        for (const point of points) {
            if (point.isInside(mouseX, mouseY)) {
                removePoint(point);
                break;
            }
        }
    }
    mousePressOnPoint = null;
}
function createPoint(x, y) {
    const point = new Point(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16).toUpperCase(), x, y, points);
    points.push(point);
    return point;
}
function removePoint(point) {
    const index = points.findIndex(x => x.equals(point));
    points.splice(index, 1);
    for (const point2 of points)
        point2.removeDistance(point);
    if (point.cluster)
        point.cluster.removePoint(point);
}
//# sourceMappingURL=build.js.map