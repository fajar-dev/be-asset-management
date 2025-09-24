export function parseProperties<T = any>(properties: any): T[] {
  if (!properties) return [];

  if (typeof properties === 'string') {
    try {
      return JSON.parse(properties);
    } catch (err) {
      throw new Error('Invalid JSON in properties field');
    }
  }

  if (Array.isArray(properties)) {
    return properties;
  }

  // kalau properties dikirim object, bungkus jadi array
  return [properties];
}
