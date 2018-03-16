import { expect } from 'chai';
import { getTracks, getFilters, getWhere, getCategories } from './../app/track';

const fullCategories = {
  name: 't.Name',
  composer: 't.Composer',
  album: 'a.Title',
  genre: 'g.Name',
  artist: 'art.Name'
};

const fullParams = (keyword: string) => ({
  album: `%${keyword}%`,
  artist: `%${keyword}%`,
  composer: `%${keyword}%`,
  genre: `%${keyword}%`,
  name: `%${keyword}%`
});

describe('tracks', () => {
  beforeEach(() => {});

  afterEach(() => {});

  it('should return 2 tracks', done => {
    const tracks = getTracks('test', 'all', 2);

    expect(tracks).to.eql([ { Name: 'A Kind Of Magic',
    Filesize: 8.29,
    Duration: 4.38,
    PlaylistCount: 2 },
  { Name: 'Under Pressure',
    Filesize: 7.38,
    Duration: 3.94,
    PlaylistCount: 2 } ]);
    done();
  });

  it('should return a full filters object', done => {
    const filters = getFilters('test', 'all');
    const expectedWhere =
      'where t.Name like @name or t.Composer like @composer or a.Title like @album or g.Name like @genre or art.Name like @artist';
    expect(filters).to.eql({ where: expectedWhere, params: fullParams('test') });
    done();
  });

  it('should return a full where clause for "all"', done => {
    const categories = getCategories('all');
    const where = getWhere(categories);
    const expected =
      'where t.Name like @name or t.Composer like @composer or a.Title like @album or g.Name like @genre or art.Name like @artist';
    expect(where).to.eql(expected);
    done();
  });

  it('should return a single clause for "name"', done => {
    const categories = getCategories('name');
    const where = getWhere(categories);
    const expected = 'where t.Name like @name';
    expect(where).to.eql(expected);
    done();
  });

  it('should return a partial clause for "composer,album"', done => {
    const categories = getCategories('composer,album');
    const where = getWhere(categories);
    const expected = 'where t.Composer like @composer or a.Title like @album';
    expect(where).to.eql(expected);
    done();
  });

  it('', done => {
    const categories = getCategories('composer,album');
    const where = getWhere(categories);
    const expected = 'where t.Composer like @composer or a.Title like @album';
    expect(where).to.eql(expected);
    done();
  });

  it('should return a full object for "all"', done => {
    const categories = getCategories('all');
    expect(categories).to.eql(fullCategories);
    done();
  });

  it('should return a full object for no params', done => {
    const categories = getCategories();
    expect(categories).to.eql(fullCategories);
    done();
  });

  it('should return a full object for empty string', done => {
    const categories = getCategories('');
    expect(categories).to.eql(fullCategories);
    done();
  });

  it('should return a partial object for "composer,album"', done => {
    const categories = getCategories('composer,album');
    expect(categories).to.eql({ composer: 't.Composer', album: 'a.Title' });
    done();
  });

  it('handle spaces in the categories param', done => {
    const categories = getCategories(' composer, album ');
    expect(categories).to.eql({ composer: 't.Composer', album: 'a.Title' });
    done();
  });
});
