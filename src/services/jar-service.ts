import {SakuraApi} from '@sakuraapi/api';
import {LogService} from './log-service';

export class JarService {

  coins = 0;
  private config: any;
  private log: LogService;

  constructor(private sapi: SakuraApi, options?: any) {
    this.config = this.sapi.config.jar;
  }

  addCoins(increment?: number) {
    this.coins += increment || 1;
  }
}
