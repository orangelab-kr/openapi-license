import 'express';
import {
  InternalPlatform,
  InternalPlatformAccessKey,
  InternalPlatformUser,
} from 'openapi-internal-sdk';

declare global {
  namespace Express {
    interface Request {
      loggined: {
        platform: InternalPlatform;
        accessKey?: InternalPlatformAccessKey;
        user?: InternalPlatformUser;
      };
    }
  }
}
