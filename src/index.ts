import dotenv from 'dotenv';
import getRouter from './routes';
import serverless from 'serverless-http';
if (process.env.NODE_ENV === 'development') dotenv.config();

const options = { basePath: '/v1/license' };
export const handler = serverless(getRouter(), options);
