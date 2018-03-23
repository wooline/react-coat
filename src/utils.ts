// export function assignObject<T, U>(target: T, source: U): T & U {
//   for (const key in source) {
//     if (source.hasOwnProperty(key)) {
//       (target as any)[key] = source[key];
//     }
//   }
//   return target as T & U;
// }
export function isGenerator(fun: Function) {
  return Boolean(fun["__generator__"]);
}
export function setGenerator(fun: Function) {
  fun["__generator__"] = true;
  return fun;
}
export function delayPromise(second: number) {
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
    const fun = descriptor.value;
    descriptor.value = (...args) => {
      const delay = new Promise(resolve => {
        setTimeout(() => {
          resolve(true);
        }, second * 1000);
      });
      return Promise.all([delay, fun.apply(target, args)]).then(items => {
        return items[1];
      });
    };
  };
}
