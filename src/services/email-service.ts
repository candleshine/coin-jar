import {Injectable, SakuraApi, SapiInjectableMixin} from '@sakuraapi/core';
import * as debugInit from 'debug';
import * as Email from 'email-templates';
import {Request, Response} from 'express';
import {validate} from 'isemail';
import {createTransport} from 'nodemailer';
import {join} from 'path';
import {LogService} from './log-service';

export {SakuraApi};

const debug = debugInit('profile:email');

@Injectable()
export class EmailServiceFactory extends SapiInjectableMixin() {

  private email: Email;

  constructor() {
    super();

    const send = ((this.sapiConfig.smtpOptions || {} as any).send === undefined)
      ? false
      : this.sapiConfig.smtpOptions.send;

    const preview = ((this.sapiConfig.smtpOptions || {} as any).preview === undefined)
      ? true
      : this.sapiConfig.smtpOptions.preview;

    const root = join(__dirname, '../', (this.sapi.config.smtpOptions || {} as any).templates || 'config/templates/email');
    debug(`email template path %s`, root);

    this.email = new Email({
      message: {},
      preview,
      send,
      transport: createTransport(this.sapi.config.smtp),
      views: {
        options: {
          extension: 'ejs'
        },
        root
      }
    });
  }

  getEmailTemplateService(): Email {
    return this.email;
  }
}

interface IEmailOptions {
  forgotPasswordTokenUrl: string;
  from: string;
  newUserTokenUrl: string;
}

@Injectable()
export class EmailService extends SapiInjectableMixin() {

  private disabled = false;
  private email: Email;
  private emailOptions = new Map<string, IEmailOptions>();
  private hostname;
  private resetPasswordUrl = ``;

  constructor(private emailServiceFactory: EmailServiceFactory,
              private log: LogService) {
    super();

    const domains = (this.sapiConfig.smtpOptions || {} as any).domains || {};
    const keys = Object.keys(domains);

    for (const key of keys) {
      const config = domains[key] || {} as any;

      this.emailOptions.set(key, {
        forgotPasswordTokenUrl: config.forgotPasswordTokenUrl || '---set env smtpOptions.forgotPasswordTokenUrl---',
        from: config.from || `---set env smtpOptions.from for domain ${key} ---`,
        newUserTokenUrl: config.newUserTokenUrl || '---set env smtpOptions.newUserTokenUrl---'
      });
    }

    this.email = this.emailServiceFactory.getEmailTemplateService();

    this.disabled = this.sapiConfig.EMAIL_DISABLED === 'true';
    this.hostname = this.sapiConfig.hostname;
    this.resetPasswordUrl = this.sapi.config.resetPasswordUrl;
  }

  isValidEmail(email: string): boolean {
    return validate(email);
  }

  /**
   * Triggered when a user's password has been changed to notify them of the change.
   */
  async onChangePasswordEmailRequest(user: any, req: Request, res: Response, domain: string): Promise<void> {
    debug('.onChangePasswordEmailRequest called');

    if (!user || this.disabled) {
      return;
    }

    const options = this.emailOptions.get(domain) || {} as IEmailOptions;

    try {
      await this.email.send({
        locals: this.locals(user, {resetPasswordUrl: this.resetPasswordUrl}),
        message: this.message(options, user),
        template: `${domain}/change-password`
      });
    } catch (err) {
      this.log.error(`unable to send password changed email for domain ${domain}`, err);
      return Promise.reject(err);
    }

    res
      .locals
      .send(200, {ok: `email sent`});
  }

  /**
   * Triggered when a user has requested a forgot password email
   */
  async onForgotPasswordEmailRequest(user: any, token: string, req: Request, res: Response, domain: string): Promise<void> {
    debug('.onForgotPasswordEmailRequest');

    if (!user || !token || this.disabled) {
      return;
    }

    const options = this.emailOptions.get(domain) || {} as IEmailOptions;

    try {
      await this.email.send({
        locals: this.locals(user, {tokenUrl: `${options.forgotPasswordTokenUrl}?token=${token}`}),
        message: this.message(options, user),
        template: `${domain}/forgot-password`
      });
    } catch (err) {
      this.log.error('unable to send forgot password email', err);
      return Promise.reject(err);
    }

    res
      .locals
      .send(200, {ok: `email sent`});
  }

  /**
   * Triggered when a user requests that email confirmation be resent
   */
  async onResendEmailConfirmation(user: any, token: string, req: Request, res: Response, domain: string): Promise<void> {
    debug('.onResendEmailConfirmation called');

    if (!user || !token || this.disabled) {
      return;
    }

    const options = this.emailOptions.get(domain) || {} as IEmailOptions;

    try {
      await this.email.send({
        locals: this.locals(user, {tokenUrl: `${options.newUserTokenUrl}?token=${token}`}),
        message: this.message(options, user),
        template: `${domain}/welcome-resend`
      });
    } catch (err) {
      this.log.error('unable to resend email confirmation', err);
      return Promise.reject(err);
    }

    res
      .locals
      .send(200, {ok: `email sent`});
  }

  /**
   * Triggered when a user is created
   */
  async onUserCreated(user: any, token: string, req: Request, res: Response, domain: string): Promise<void> {
    debug('.onUserCreated called');

    if (!user || !token || this.disabled) {
      return;
    }

    const options = this.emailOptions.get(domain) || {} as IEmailOptions;

    try {
      await this.email.send({
        locals: this.locals(user, {tokenUrl: `${options.newUserTokenUrl}?token=${token}`}),
        message: this.message(options, user),
        template: `${domain}/welcome`
      });
    } catch (err) {
      this.log.error('unable to send user created email', err);
      return Promise.reject(err);
    }

    res
      .locals
      .send(200, {ok: `email sent`});
  }

  private locals(user: any, inject: { [key: string]: string }): any {
    return {
      email: user.email,
      firstName: user.firstName,
      hostname: this.hostname,
      lastName: user.lastName,
      ...inject
    };
  }

  private message(options: IEmailOptions, user: any): any {
    return {
      from: options.from,
      to: `${user.firstName}${user.firstName ? ' ' : ''}${user.lastName}<${user.email}>`
    };
  }

}
