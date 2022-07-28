export function queryParser(query: any, schema: any): any {
  const result = {};
  for (const key in query) {
    if (schema[key] && !!query[key]) {
      result[key] = query[key];
    }
  }
  return result;
}
