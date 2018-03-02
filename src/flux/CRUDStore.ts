import { EventEmitter } from 'fbemitter';

export interface SchemaProps {
    id: string;
    label: string;
    show?: boolean;
    sample: string | number;
    align?: string;
    type?: string;
    options?: string[];
}

let data: {}[];
let schema: SchemaProps[];
const emitter = new EventEmitter();

const CRUDStore = {
    getData(): {}[] {
        return data;
    },
    getSchema(): SchemaProps[] {
        return schema;
    },
    setData(newData: Array<Object>, commit: boolean = true) {
        data = newData;
        if (commit && 'localStorage' in window) {
            localStorage.setItem('data', JSON.stringify(newData));
        }
        emitter.emit('change');
    },
    getCount(): number {
        return data.length;
    },
    getRecord(recordId: number): {} | undefined {
        return recordId in data ? data[recordId] : undefined;
    },
    init(initialSchema: SchemaProps[]) {
        schema = initialSchema;
        const storage = 'localStorage' in window ? localStorage.getItem('data') : undefined;
        if (!storage) {
            data = [{}];
            schema.forEach(item => data[0][item.id] = item.sample);
        } else {
            data = JSON.parse(storage);
        }
    },
    addListener(eventType: string, fn: Function) {
        emitter.addListener(eventType, fn);
    }
};

export default CRUDStore;