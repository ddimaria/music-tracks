import * as Router from 'koa-router';

import { getTracks } from './track';

const router = new Router();

/**
 * Base route
 * @todo: return app version number
 */
router.get('/', async ctx => ctx.status = 401);

/**
 * Basic healthcheck
 */
router.get('/healthcheck', async ctx => ctx.body = 'OK');

/**
 * Search for tracks
 */
router.get('/api/v1/tracks', async ctx => {
  const { category, keyword, limit, offset, sort } = ctx.request.query;
  const tracks = getTracks(keyword, category, limit, offset, sort);
  const hasTracks = !!tracks.length;

  ctx.status = hasTracks ? 200 : 404;

  if (hasTracks) ctx.body = tracks;
});

export const routes = router.routes();
