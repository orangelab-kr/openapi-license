import { PlatformPermission } from '@hikick/openapi-internal-sdk';
import { Callback, InternalClient, Wrapper } from '../tools';

const platformClient = InternalClient.getPlatform([
  PlatformPermission.PLATFORM_USER_AUTHORIZE,
  PlatformPermission.PLATFORM_ACCESS_KEY_AUTHORIZE,
]);

export function PlatformMiddleware(
  props: {
    permissionIds?: string[];
    final?: boolean;
  } = {}
): Callback {
  const { permissionIds, final } = {
    permissionIds: [],
    final: false,
    ...props,
  };

  return Wrapper(async (req, res, next) => {
    if (req.permissionIds === undefined) req.permissionIds = [];
    req.permissionIds.push(...permissionIds);

    if (!final) return next();
    const { headers } = req;
    const {
      authorization,
      'x-hikick-platform-access-key-id': platformAccessKeyId,
      'x-hikick-platform-secret-access-key': platformSecretAccessKey,
    } = headers;
    if (
      typeof platformAccessKeyId === 'string' &&
      typeof platformSecretAccessKey === 'string'
    ) {
      const accessKey = await platformClient.getAccessKeyWithPermissions({
        platformAccessKeyId,
        platformSecretAccessKey,
        permissionIds,
      });

      const { platform } = accessKey;
      req.loggined = { platform, accessKey };
    } else {
      const sessionId = `${authorization}`.substr(7);
      const user = await platformClient.getUserWithPermissions({
        sessionId,
        permissionIds,
      });

      const { platform } = user;
      req.loggined = { platform, user };
    }

    next();
  });
}
