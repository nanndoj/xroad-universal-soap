export interface IURLObject {
  protocol: string;
  port: number | undefined;
  host: string;
  authorizationHeader?: string;
  path: string;
}
