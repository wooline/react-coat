export declare function generator(): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function isGenerator(fun: Function): boolean;
export declare function setGenerator(fun: Function): Function;
export declare function delayPromise(second: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
