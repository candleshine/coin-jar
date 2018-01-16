import {
  Injectable,
  SakuraApi,
  SapiInjectableMixin
} from '@sakuraapi/api';
import {LogService} from './log-service';

export {SakuraApi};

@Injectable()
export class JarService extends SapiInjectableMixin() {

  coins = 0;
  private config: any;
  private log: LogService;

  constructor() {
    super();
  }

  addCoins(increment?: number) {
    this.coins += increment || 1;
    // this.log.info('Adding ' + increment + '\n total now ' + this.coins);
    return this.coins;
  }
}
