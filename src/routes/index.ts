import express, { Application } from 'express';
import {
  clusterInfo,
  InternalError,
  Joi,
  License,
  OPCODE,
  PlatformMiddleware,
  Wrapper,
} from '..';

export function getRouter(): Application {
  const router = express();
  InternalError.registerSentry(router);

  router.get(
    '/',
    Wrapper(async (_req, res) => {
      res.json({
        opcode: OPCODE.SUCCESS,
        ...clusterInfo,
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

  return router;
}
