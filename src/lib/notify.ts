import { Notification } from '@apps-in-toss/web-framework';

/**
 * TODO: smart-message template code from the Apps in Toss console for the
 * "도토리가 가득 찼어요" push. Until it exists the agreement is simulated.
 */
const FIELD_FULL_TEMPLATE_CODE = '';

/** Asks for push agreement. Resolves true when the user is (or already was) subscribed. */
export function requestFieldFullNotification(): Promise<boolean> {
  if (FIELD_FULL_TEMPLATE_CODE === '' || !Notification.requestAgreement.isSupported()) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const cleanup = Notification.requestAgreement({
      options: { templateCode: FIELD_FULL_TEMPLATE_CODE },
      onEvent: ({ type }) => {
        cleanup();
        resolve(type !== 'agreementRejected');
      },
      onError: (error) => {
        console.error('Notification agreement failed:', error);
        cleanup();
        resolve(false);
      },
    });
  });
}
