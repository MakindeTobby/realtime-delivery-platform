export function validateEnvironment(config: Record<string, unknown>) {
  const jwtSecret = config.JWT_SECRET;

  if (typeof jwtSecret !== 'string' || Buffer.byteLength(jwtSecret.trim(), 'utf8') < 32) {
    throw new Error(
      'JWT_SECRET is required and must contain at least 32 bytes. Configure a strong, randomly generated secret.',
    );
  }

  const positiveIntegerSettings = [
    'AUTH_LOGIN_IP_MAX',
    'AUTH_LOGIN_IP_WINDOW_SECONDS',
    'AUTH_LOGIN_EMAIL_MAX',
    'AUTH_LOGIN_EMAIL_WINDOW_SECONDS',
    'AUTH_REGISTER_IP_MAX',
    'AUTH_REGISTER_IP_WINDOW_SECONDS',
    'AUTH_FORGOT_PASSWORD_IP_MAX',
    'AUTH_FORGOT_PASSWORD_IP_WINDOW_SECONDS',
    'AUTH_FORGOT_PASSWORD_EMAIL_MAX',
    'AUTH_FORGOT_PASSWORD_EMAIL_WINDOW_SECONDS',
    'AUTH_RESET_PASSWORD_IP_MAX',
    'AUTH_RESET_PASSWORD_IP_WINDOW_SECONDS',
  ];
  for (const setting of positiveIntegerSettings) {
    const value = config[setting];
    if (value !== undefined) {
      const parsedValue = Number(value);
      const maxValue = setting.endsWith('_WINDOW_SECONDS')
        ? 31_536_000
        : 1_000_000;
      if (!Number.isSafeInteger(parsedValue) || parsedValue < 1 || parsedValue > maxValue) {
        throw new Error(`${setting} must be a positive integer no greater than ${maxValue}.`);
      }
    }
  }

  const trustProxyHops = config.TRUST_PROXY_HOPS;
  if (
    trustProxyHops !== undefined &&
    (!Number.isSafeInteger(Number(trustProxyHops)) ||
      Number(trustProxyHops) < 0 ||
      Number(trustProxyHops) > 10)
  ) {
    throw new Error('TRUST_PROXY_HOPS must be an integer between 0 and 10.');
  }

  return config;
}
