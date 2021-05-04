import getRouter from './routes';
import serverless from 'serverless-http';

const options = { basePath: '/v1/license' };
export const handler = serverless(getRouter(), options);
