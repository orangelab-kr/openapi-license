import {
  InternalError,
  Joi,
  License,
  OPCODE,
  PlatformMiddleware,
  Wrapper,
  logger,
} from '..';
import express, { Application } from 'express';

import cors from 'cors';
import morgan from 'morgan';
import os from 'os';

export function getRouter(): Application {
  const router = express();
  InternalError.registerSentry(router);

  const hostname = os.hostname();
  const logging = morgan('common', {
    stream: { write: (str: string) => logger.info(`${str.trim()}`) },
  });

  router.use(cors());
  router.use(logging);
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  router.get(
    '/',
    Wrapper(async (_req, res) => {
      res.json({
        opcode: OPCODE.SUCCESS,
        mode: process.env.NODE_ENV,
        cluster: hostname,
      });
    })
  );

  router.post(
    '/',
    PlatformMiddleware(),
    Wrapper(async (req, res) => {
      const schema = Joi.object({
        realname: Joi.string().min(2).max(10).required(),
        birthday: Joi.date().required(),
        identity: Joi.string().length(6).optional(),
        license: Joi.array()
          .required()
          .items(
            Joi.string().length(2).required(),
            Joi.string().length(2).required(),
            Joi.string().length(6).required(),
            Joi.string().length(2).required()
          ),
      });

      const options = { abortEarly: false };
      const data = await schema.validateAsync(req.body, options);
      const isValid = await License.isValidLicense(data);
      const statusCode = isValid ? 200 : 400;
      res.status(statusCode).json({ opcode: OPCODE.SUCCESS, isValid });
    })
  );

  router.all(
    '*',
    Wrapper(async () => {
      throw new InternalError('Invalid API', 404);
    })
  );

  return router;
}
