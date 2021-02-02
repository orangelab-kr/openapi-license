import Joi from 'joi';
import License from '../controllers/license';
import OPCODE from '../tools/opcode';
import { Router } from 'express';
import Wrapper from '../tools/wrapper';
import os from 'os';

export default function getLicenseRouter(): Router {
  const router = Router();
  const hostname = os.hostname();

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

  return router;
}
