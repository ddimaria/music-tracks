import * as Koa from 'koa';
import * as koaBody from 'koa-body';
import * as cors from '@koa/cors';
const koaValidator = require('koa-async-validator');

import { config } from './config';
import { logger } from './logger';
import { routes } from './routes';

const app = new Koa();

app.use(koaBody());
app.use(koaValidator());
app.use(cors());
app.use(logger);
app.use(routes);

export const server = app.listen(config.port);

console.log(`Server running on port ${config.port}`);
