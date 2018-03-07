import {
  IRoutableLocals,
  Routable,
  Route,
  SakuraApi,
  SapiRoutableMixin
} from '@sakuraapi/core';
import {
  NextFunction,
  Request,
  Response
} from 'express';
import {
  OK,
  SERVER_ERROR
} from '../lib/http-status';
import {LogService} from '../services/log-service';

export {SakuraApi};

@Routable({
  baseUrl: '/jar'
})
export class JarApi extends SapiRoutableMixin() {


  constructor(private log: LogService) {
    super();
  }

  @Route({
    method: 'get',
    path: ''
  })
  async getHandler(req: Request, res: Response, next: NextFunction) {
    await this.defaultHandler(req, res);
    next();
  }

  async defaultHandler(req: Request, res: Response): Promise<void> {
    const locals = res.locals as IRoutableLocals;

    try {
      locals
        .send(OK, {
          coins: 'coin-jar'
        });
    } catch (err) {
      locals
        .send(SERVER_ERROR, {
          error: 'SERVER_ERROR'
        });
      this.log.error(err);
    }
  }
}
