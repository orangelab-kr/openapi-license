import express, { Application } from 'express';

import InternalError from '../tools/error';
import Joi from '../tools/joi';
import License from '../controllers/license';
import OPCODE from '../tools/opcode';
import Wrapper from '../tools/wrapper';
import logger from '../tools/logger';
import morgan from 'morgan';
import os from 'os';

export default function getRouter(): Application {
  const router = express();
  const hostname = os.hostname();
  const logging = morgan('common', {
    stream: { write: (str: string) => logger.info(`${str.trim()}`) },
  });

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
    Wrapper(async (req, res) => {
      const schema = Joi.object({
        realname: Joi.string().min(2).max(10).required(),
        birthday: Joi.date().required(),
        identity: Joi.string().length(6).required(),
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
      res.json({ opcode: OPCODE.SUCCESS, isValid });
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
