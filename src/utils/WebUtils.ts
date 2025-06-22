export default class WebUtils {
  static getPaginationParams(url: string, defaultItemsPerPage: number) {
    const urlObj = new URL(url);
    const p = urlObj.searchParams.get('p') || 1;
    const n = urlObj.searchParams.get('n') || defaultItemsPerPage;
    const page = Number(p);
    const itemsPerPage = Number(n);
    if (isNaN(page)) {
      throw TypeError('Invalid param "p"');
    }
    if (page <= 0) {
      throw RangeError(`Invalid value "${page}" for param "p"`);
    }
    if (isNaN(itemsPerPage)) {
      throw TypeError('Invalid param "n"');
    }
    if (itemsPerPage <= 0) {
      throw RangeError(`Invalid value "${itemsPerPage}" for param "n"`);
    }
    return {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage
    };
  }
}