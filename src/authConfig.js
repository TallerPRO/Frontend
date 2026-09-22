const SUBDOMINIO = "tallerprosemestral";
const TENANT_ID = "b65e7112-37c4-4af1-b8d3-fa26b7548826";
const CLIENT_ID = "3b120135-1566-46f2-ad6e-27e8236ff15a";
export const msalConfig = {
auth: {
clientId: CLIENT_ID,
authority: `https://${SUBDOMINIO}.ciamlogin.com/${TENANT_ID}`,
knownAuthorities: [
`${SUBDOMINIO}.ciamlogin.com`,
`${TENANT_ID}.ciamlogin.com`
],
// Se calcula solo: sirve igual en localhost y en S3
redirectUri: window.location.origin + window.location.pathname,
postLogoutRedirectUri: window.location.origin + window.location.pathname,
navigateToLoginRequestUrl: false
},
cache: { cacheLocation: "sessionStorage" }
};
export const loginRequest = { scopes: ["openid", "profile", "email"] };