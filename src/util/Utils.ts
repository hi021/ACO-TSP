export class Utils {
    public static randomFromArray<T>(array: Array<T>) {
        return array[Math.floor(Math.random() * array.length)]
    }

    public static getSetElementByIndex<T>(set: Set<T>, index: number) {
        let i = 0;
        for (const element of set)
            if (i++ === index) return element;
        return undefined;
    }

    public static clone<K extends string | number | symbol, V>(a: Record<K, V>) {
        return JSON.parse(JSON.stringify(a)) as Record<K, V>;
    }

    public static formatNumber = (num: number | string, delimiter = "\u00A0") => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
}
