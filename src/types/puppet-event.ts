export const PUPPET_SERVICE_PATH = '/puppet';

export enum PuppetEvent {
  clientRequestPuppet = 'client-request-puppet',  // Need to submit serviceId and clientId
  puppetDispatchAuthToken = 'puppet-dispatch-auth-token',
  puppetRequestVerifyCode = 'puppet-request-verify-code',
  clientSubmitVerifyCode = 'client-submit-verify-code',
  puppetVerifyResult = 'puppet-verify-result',  // "ok" for success, others info for fail
  puppetLoginStatus = 'puppet-login-status',
  puppetError = 'puppet-error',
}

export enum PuppetLoginStatus {
  pending = 'pending',
  login = 'login',
  logout = 'logout',
}