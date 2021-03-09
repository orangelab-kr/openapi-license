import 'express';
import { InternalPlatformAccessKey } from 'openapi-internal-sdk';

declare global {
  namespace Express {
    interface Request {
      accessKey: InternalPlatformAccessKey;
    }
  }
}
