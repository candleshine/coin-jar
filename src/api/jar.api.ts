import {IRoutableLocals, Routable, Route, SakuraApiRoutable} from '@sakuraapi/api';
import {NextFunction, Request, Response} from 'express';
import {OK, SERVER_ERROR} from '../lib/http-status';
import {JarService} from '../services/jar-service';
import {LogService} from '../services/log-service';

@Routable({
  baseUrl: '/jar'
})
export class JarApi extends SakuraApiRoutable {

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
    const jarService = new JarService(JarApi.sapi);

    try {
      locals
        .send(OK, {
          coins: jarService.coins
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
