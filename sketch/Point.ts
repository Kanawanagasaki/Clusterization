class Point {
    public static readonly RADIUS: number = 16;

    public readonly id: string;

    public x: number;
    public y: number;
    public screenX: number;
    public screenY: number;

    public distancesSq: SortableCollection<{ point: Point, distSq: number }> = new SortableCollection<{ point: Point, distSq: number }>((a, b) => a.distSq - b.distSq);

    public cluster: Cluster = null;

    public constructor(id: string, x: number, y: number, points: Point[]) {
        this.id = id;
        this.setPos(x, y, points);
    }

    public setPos(x: number, y: number, points: Point[]) {
        this.x = x;
        this.y = y;
        this.screenX = x * windowWidth;
        this.screenY = y * windowHeight;
        this.recalculateDistances(points);
        this.tryFormCluster();
    }

    public recalculateDistances(points: Point[]) {
        this.distancesSq.clear();

        for (const point of points) {
            if (point.equals(this))
                continue;
            const distSq = (this.screenX - point.screenX) ** 2 + (this.screenY - point.screenY) ** 2;
            this.distancesSq.set(point.id, { point, distSq });
            point.addDistance(this, distSq);
        }
    }

    public tryFormCluster() {
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

    public addDistance(point: Point, distSq: number) {
        this.distancesSq.set(point.id, { point, distSq });
    }

    public removeDistance(point: Point) {
        this.distancesSq.remove(point.id);
    }

    public draw() {
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

    public equals(p: Point) {
        return this.id == p.id;
    }

    public isInside(screenX: number, screenY: number) {
        return (this.screenX - screenX) ** 2 + (this.screenY - screenY) ** 2 <= Point.RADIUS ** 2;
    }

    public isCore() {
        return Cluster.MIN_NUMBER_OF_POINTS <= this.distancesSq.size()
            && this.distancesSq.get(Cluster.MIN_NUMBER_OF_POINTS - 1).distSq <= Cluster.MAX_DISTANCE ** 2;
    }
}
