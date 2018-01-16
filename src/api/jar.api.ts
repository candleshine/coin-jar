import {
  IRoutableLocals,
  Routable,
  Route,
  SakuraApi,
  SapiRoutableMixin
} from '@sakuraapi/api';
import {
  NextFunction,
  Request,
  Response
} from 'express';
import {
  OK,
  SERVER_ERROR
} from '../lib/http-status';
import {Jar} from '../models/jar-model';
import {JarService} from '../services/jar-service';
import {LogService} from '../services/log-service';

export {SakuraApi};

@Routable({
  baseUrl: '/jar',
  model: Jar
})
export class JarApi extends SapiRoutableMixin() {

  private jarService: JarService;

  constructor(private log: LogService) {
    super();
    this.jarService = new JarService();
  }

  @Route({
    method: 'post',
    path: 'add/:coins'
  })
  async postHandler(req: Request, res: Response, next: NextFunction) {
    await this.incrementHandler(req, res);
    next();
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
          coins: this.jarService.coins
        });
    } catch (err) {
      locals
        .send(SERVER_ERROR, {
          error: 'SERVER_ERROR'
        });
      this.log.error(err);
    }
  }

  async incrementHandler(req: Request, res: Response): Promise<void> {
    const locals = res.locals as IRoutableLocals;
    const incCoins: number = + req.params.coins;

    try {
      locals
        .send(OK, {
          coins: this.jarService.addCoins(incCoins)
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
