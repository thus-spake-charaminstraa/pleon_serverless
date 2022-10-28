export function queryParser(query: any, schema?: any): any {
  const result = {};
  for (const key in query) {
    if (query[key] !== undefined && query[key] !== null) {
      result[key] = query[key];
    }
  }
  return result;
}
