class SortableCollection<T>
{
    private _map: Map<string, number> = new Map<string, number>();
    private _items: T[] = [];
    private _comparator: (a: T, b: T) => number;

    public constructor(comparator: (a: T, b: T) => number) {
        this._comparator = comparator;
    }

    public set(key: string, item: T) {

        const index = this._map.get(key);
        if (index !== undefined)
            this.remove(key);

        let left: number = 0;
        let right: number = this._items.length;

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

    public remove(key: string) {
        const index = this._map.get(key);
        if (index === undefined)
            return undefined;
        this._map.delete(key);
        for (const key2 of this._map.keys())
            if (index < this._map.get(key2))
                this._map.set(key2, this._map.get(key2) - 1);
        return this._items.splice(index, 1)[0];
    }

    public get(key: string | number) {
        if (typeof key === "number")
            return this._items[key];

        const index = this._map.get(key);
        if (index === undefined)
            return undefined;
        return this._items[index];
    }

    public size() {
        return this._items.length;
    }

    public clear() {
        this._map.clear();
        this._items = [];
    }
}
