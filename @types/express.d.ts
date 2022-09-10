import 'express';
import {
  InternalPlatform,
  InternalPlatformAccessKey,
  InternalPlatformUser,
} from '@hikick/openapi-internal-sdk';

declare global {
  namespace Express {
    interface Request {
      permissionIds: string[];
      loggined: {
        platform: InternalPlatform;
        accessKey?: InternalPlatformAccessKey;
        user?: InternalPlatformUser;
      };
    }
  }
}
