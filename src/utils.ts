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
