import { err, ok, Result } from '@shared/Result';
import { HttpClient, httpJson } from './http';
import { IClientLogger } from '@shared/types';

export interface SlackAuth {
  domain: string;
  token: string;
  dCookie: string;
  dSCookie: string;
}

export interface SlackStatus {
  text: string;
  emoji: string;
  expiration?: Date;
}

interface SlackOk {
  ok: true;
}

/**
 * There are more of these, but I will add them as I find them
 */
type SlackErr =
  | {
      ok: false;
      error: 'connection_error';
    }
  | {
      ok: false;
      error: 'invalid_auth';
    };

export interface SlackRepository {
  slackSetProfile(auth: SlackAuth, status: SlackStatus): Promise<Result<SlackOk, SlackErr>>;

  slackSetSnooze(auth: SlackAuth, minutes: number): Promise<Result<SlackOk, SlackErr>>;

  slackEndSnooze(auth: SlackAuth): Promise<Result<SlackOk, SlackErr>>;

  slackSetPresence(auth: SlackAuth, state: 'active' | 'away'): Promise<Result<SlackOk, SlackErr>>;
}

interface SlackParams {
  logger: IClientLogger;
  client: HttpClient;
}

export const slackRepository = ({ logger, client }: SlackParams): SlackRepository => {
  const slackReq = slackClient(logger, client);

  return {
    async slackSetProfile(auth, { text, emoji, expiration }) {
      logger.debug({ auth });
      return slackReq<SlackOk>(
        '/users.profile.set',
        {
          profile: {
            status_text: text,
            status_emoji: emoji,
            status_expiration: expiration ? (expiration.getTime() / 1000).toFixed(0) : null,
          },
        },
        auth
      );
    },

    async slackEndSnooze(auth) {
      return slackReq<SlackOk>('/dnd.endSnooze', {}, auth);
    },

    async slackSetPresence(auth, state) {
      return slackReq<SlackOk>(`/presence.set?presence=${state}`, {}, auth);
    },

    async slackSetSnooze(auth, duration) {
      slackReq<SlackOk>(`/dnd.info`, {}, auth);
      return slackReq<SlackOk>(`/dnd.setSnooze`, { num_minutes: duration }, auth);
    },
  };
};

function slackClient(logger: IClientLogger, client: HttpClient) {
  return async function slackReq<A extends SlackOk>(
    path: string,
    payload: any,
    auth: SlackAuth
  ): Promise<Result<A, SlackErr>> {
    try {
      const { dCookie, dSCookie, token, domain } = auth;
      const res = await client.post<A | SlackErr>(
        `https://${domain}.slack.com/api${path}`,
        httpJson(payload),
        {
          headers: {
            authorization: `Bearer ${token}`,
            cookie: `d=${dCookie}; d-s=${dSCookie};`,
            accept: '*/*',
            'content-type': 'application/json; charset=utf-8',
            'accept-language': 'en-US,en;q=0.9',
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
          },
        }
      );

      logger.info(`SLACK -->`, res.url, JSON.stringify(payload));
      logger.info('SLACK <--', res.data);
      return (res.ok ? ok(res.data) : err(res.data)) as any;
    } catch (e: unknown) {
      logger.error(e);
      return err<SlackErr, A>({ ok: false, error: 'connection_error' });
    }
  };
}
