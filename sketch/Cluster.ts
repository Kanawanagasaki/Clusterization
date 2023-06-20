class Cluster {
    public static readonly MIN_NUMBER_OF_POINTS: number = 3;
    public static readonly MAX_DISTANCE: number = 64;

    public points: Point[] = [];

    public color: string = "#00AA00";

    constructor() {
        this.color = "#" + (Math.floor(Math.random() * 0xFFFFFF)).toString(16).padStart(6, "0");
    }

    public addPointsFromPoint(point: Point) {

        if (!point.isCore()) {
            this.addPoint(point);
            return;
        }

        const openSet: Point[] = [point];
        const closedSet: Point[] = [];

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

    public addPoint(point: Point) {
        if (!this.points.some(x => x.equals(point))) {
            point.cluster = this;
            this.points.push(point);
        }
    }

    public removePoint(point: Point) {
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
