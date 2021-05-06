import { getRouter } from './routes';
import serverless from 'serverless-http';

export * from './controllers';
export * from './middlewares';
export * from './routes';
export * from './tools';

const options = { basePath: '/v1/license' };
export const handler = serverless(getRouter(), options);
