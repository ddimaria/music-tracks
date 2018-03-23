import { pick, mapValues } from 'lodash';

import { db } from './database';

type StringObject = { [key: string]: string };

/**
 * Perform a search on the database
 *
 * @param {string} keyword  Search keyword
 * @param {string} category  The categories to search (comma delimited)
 * @param {number} limit
 * @return {object[]}
 */
export const getTracks = (keyword: string, category: string, limit: number, offset: number = 0, sort: string = 'name') => {
  const filters = getFilters(keyword, category);
  const offsetClause = `${safeInteger(offset)},`;
  const limitClause: string = limit  ? `limit ${offsetClause}${safeInteger(limit)}` : '';
  const orderClause = `ORDER BY ${parseSort(sort)}`;

  return db
    .prepare(`
      SELECT t.Name,
        CAST(printf('%.2f', CAST(t.Bytes as REAL)/(1024*1024)) as Number) as Filesize,          /* bytes to MB */
        CAST(printf('%.2f', CAST(t.milliseconds as REAL)/60000) as Number) as Duration,         /* ms to minutes */
        (SELECT COUNT(*) FROM PlaylistTrack pt WHERE pt.TrackId = t.TrackId) as PlaylistCount
      FROM Track t left join Album a on t.AlbumId = a.AlbumId
        left join Genre g on t.GenreId = g.GenreId
        left join Artist art on a.ArtistId = art.ArtistId
      ${filters.where}
      ${orderClause}
      ${limitClause}
    `)
    .all(filters.params);
};

/**
 * Retrieve the where clause and the query parameters
 *
 * @param {string} keyword  Search keyword
 * @param {string} category  The categories to search (comma delimited)
 * @return {object}
 */
export const getFilters = (keyword: string = '', category: string = 'all') => {
  if (!keyword.trim()) return { where: '', params: {} };

  const categories = getCategories(category);                   // get key/value pairs of categories that were requested
  const where = getWhere(categories);
  const params = mapValues(categories, () => `%${keyword}%`);   // keep keys, transform values

  return { where: where, params: params };
};

/**
 * Return a where database clause
 *
 * @param {StringObject} category  The categories to search (comma delimited)
 * @return {string}
 */
export const getWhere = (categories: StringObject): string => {
  const flattened: string = Object.keys(categories)
    .map(cat => `${categories[cat]} like @${cat}`)
    .join(' or ');

  return flattened ? `where ${flattened}` : '';
};

/**
 * Return categories to search the database
 * Map query param categories to DB columns
 *
 * @param {string} category  The categories to search (comma delimited)
 * @return {StringObject}
 */
export const getCategories = (category: string = 'all'): StringObject => {
  const packaged = normalizeAndPackage(category); // normalize categories and put into an array
  const categories: StringObject = {
    name: 't.Name',
    composer: 't.Composer',
    album: 'a.Title',
    genre: 'g.Name',
    artist: 'art.Name',
  };

  return category === 'all' || !category
    ? categories                   // all categories
    : pick(categories, packaged);  // only return mapped key/value pairs of categories that were requested
};

/**
 * Parse the sort string
 *
 * @param {string} sort  The sort string
 * @return {string}
 */
export const parseSort = (sort: string = 'name'): any => {
  const packaged = normalizeAndPackage(sort);
  const clean = (item: string) => item.replace(/[^A-Za-z]/g, '');
  const keys: StringObject = {
    name: 't.Name',
    filesize: 'Filesize',
    duration: 'Duration',
    playlistcount: 'PlaylistCount',
  };

  const ordered = packaged
    .filter(item => keys[clean(item)])
    .map(item => {
      const order = item.charAt(0) === '-' ? 'desc' : 'asc';
      return `${keys[clean(item)]} ${order}`;
    });

  return ordered.join(', ');
};

/**
 * Safely return a number.
 * Convert negative numbers to positive numbers.
 * Other non-numbers will return the defaultValue.
 *
 * @param {number} number  The number to address
 * @param {number | null} defaultValue  The number to address
 * @return {number}
 */
const safeInteger = (integer: number, defaultValue: number | null = 0): number => {
  integer = Number(integer);  // type conversion, non-numbers convert to NaN

  return Number.isInteger(integer)
    ? Math.abs(integer)
    : defaultValue;
};

/**
 * Remove spaces everywhere and lowercase
 *
 * @param {string} commaString
 * @return {string[]}
 */
const normalizeAndPackage = (commaString: string): string[] => {
  return commaString
    .toLowerCase()
    .trim()
    .split(',')
    .map(item => item.trim());
};
