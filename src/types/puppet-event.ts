export const PUPPET_SOCKET_PATH = '/puppet-socket';

export enum PuppetEvent {
  clientRequestPuppet = 'client-request-puppet',  // Need to submit serviceId and clientId
  puppetDispatchAuthToken = 'puppet-dispatch-auth-token',
  puppetRequestVerifyCode = 'puppet-request-verify-code',
  clientSubmitVerifyCode = 'client-submit-verify-code',
  puppetVerifyResult = 'puppet-verify-result',  // "ok" for success, others info for fail
  puppetLoginStatus = 'puppet-login-status',
  clientRequestLogout = 'client-request-logout',
  puppetError = 'puppet-error',
}

export enum ControllerEvent {
  listPuppets = 'list-puppets',
  destroyPuppet = 'destroy-puppet',
}

export enum PuppetLoginStatus {
  pending = 'pending',
  login = 'login',
  logout = 'logout',
}