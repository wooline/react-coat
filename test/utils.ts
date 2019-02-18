export function parseQuery<A extends {[key: string]: any}>(key: string, search: string, defArgs: A): A {
  const str = key + "=";
  let [, query] = search.split(str);
  if (query) {
    query = query.split("&")[0];
  }
  if (query) {
    const args = JSON.parse(unescape(query));
    if (defArgs) {
      return {...defArgs, ...args};
    } else {
      return args;
    }
  } else {
    return defArgs;
  }
}
