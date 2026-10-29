import { CheckoutError } from './checkoutValidation.js';

export function checkoutFailure(error, operation) {
  if (error instanceof CheckoutError || error?.status === 401) return { status: error.status, body: { error: error.message, fields: error.fields || {} } };
  const requestId = crypto.randomUUID();
  const code = error?.code;
  let reason = 'CHECKOUT_SERVER_ERROR', status = 500;
  const configurationMessages = {
    missing_project_id: 'This deployment cannot read FIREBASE_PROJECT_ID. Check the environment assigned to this deployment',
    missing_client_email: 'This deployment cannot read FIREBASE_CLIENT_EMAIL. Check the environment assigned to this deployment',
    missing_private_key: 'This deployment cannot read FIREBASE_PRIVATE_KEY. Check the environment assigned to this deployment',
    private_key_format: 'The server received FIREBASE_PRIVATE_KEY but could not parse it as an RSA private key',
    certificate_configuration: 'The private key parsed, but Firebase rejected the service-account certificate configuration',
    app_initialization: 'The credential parsed, but Firebase application initialization failed',
    token_verification_credentials: 'Firebase initialized, but could not use the service-account credentials to verify sign-in',
  };
  const configurationIssue = Object.hasOwn(configurationMessages, error?.configurationIssue) ? error.configurationIssue : null;
  let message = 'The store could not validate checkout. Please contact the store';
  if (code === 'STORE_FIREBASE_CONFIGURATION' || /Firebase Admin is not configured|Firebase Admin credentials are invalid|Failed to parse private key|invalid PEM/i.test(error?.message || '')) {
    reason = 'STORE_FIREBASE_CONFIGURATION'; status = 503;
    message = configurationIssue ? configurationMessages[configurationIssue] : 'Firebase server initialization failed. Please contact the store';
  } else if ([7, 16, 'permission-denied', 'unauthenticated', 'PERMISSION_DENIED', 'UNAUTHENTICATED'].includes(code)) {
    reason = 'STORE_DATABASE_ACCESS'; status = 503;
    message = 'The store server cannot access promo and checkout data. Please contact the store';
  } else if ([4, 14, 'deadline-exceeded', 'unavailable'].includes(code)) {
    reason = 'STORE_DATABASE_UNAVAILABLE'; status = 503;
    message = 'The store database is temporarily unavailable. Please try again shortly';
  }
  // Log references and codes only: SDK messages can contain credential details.
  console.error('Checkout validation failed', { operation, requestId, reason, configurationIssue, sdkCode: error?.sdkCode || null, code: typeof code === 'string' || typeof code === 'number' ? code : 'unknown' });
  return { status, body: { error: `${message}. Reference: ${requestId}`, code: reason, requestId } };
}
