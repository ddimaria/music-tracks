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
export const getTracks = (keyword: string, category: string, limit: number, offset: number = 0) => {
  const filters = getFilters(keyword, category);
  const offsetClause = `${safeInteger(offset)},`;
  const limitClause: string = limit  ? `limit ${offsetClause}${safeInteger(limit)}` : '';
  console.log(limitClause);
  return db
    .prepare(`
      SELECT t.Name,
        CAST(printf('%.2f', CAST(t.Bytes as REAL)/(1024*1024)) as Number) as Filesize,
        CAST(printf('%.2f', CAST(t.milliseconds as REAL)/60000) as Number) as Duration,
        (SELECT COUNT(*) FROM PlaylistTrack pt WHERE pt.TrackId = t.TrackId) as PlaylistCount
      FROM Track t left join Album a on t.AlbumId = a.AlbumId
        left join Genre g on t.GenreId = g.GenreId
        left join Artist art on a.ArtistId = art.ArtistId
      ${filters.where}
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

  const categories = getCategories(category);
  const where = getWhere(categories);
  const params = mapValues(categories, () => `%${keyword}%`);

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
 *
 * @param {string} category  The categories to search (comma delimited)
 * @return {StringObject}
 */
export const getCategories = (category: string = 'all'): StringObject => {
  const categories: StringObject = {
    name: 't.Name',
    composer: 't.Composer',
    album: 'a.Title',
    genre: 'g.Name',
    artist: 'art.Name',
  };

  const packaged = category
    .toLowerCase()
    .trim()
    .split(',')
    .map(cat => cat.trim());

  return category === 'all' || !category
    ? categories
    : pick(categories, packaged);
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
  integer = Number(integer);

  return Number.isInteger(integer)
    ? Math.abs(integer)
    : 0;
};
