import express, { Application } from 'express';

import InternalError from '../tools/error';
import Wrapper from '../tools/wrapper';
import getLicenseRouter from './license';
import logger from '../tools/logger';
import morgan from 'morgan';

export default function getRouter(): Application {
  const router = express();
  const logging = morgan('common', {
    stream: { write: (str: string) => logger.info(`${str.trim()}`) },
  });

  router.use(logging);
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  router.use('/v1/license', getLicenseRouter());

  router.all(
    '*',
    Wrapper(async () => {
      throw new InternalError('Invalid API', 404);
    })
  );

  return router;
}
