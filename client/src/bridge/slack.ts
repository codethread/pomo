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

export interface SlackProfile extends SlackOk {
  profile: {
    avatar_hash: string;
    display_name: string;
    display_name_normalized: string;
    email: string;
    first_name: string;
    huddle_state: string;
    huddle_state_expiration_ts: number;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
    image_1024: string;
    image_original: string;
    is_custom_image: boolean;
    last_name: string;
    phone: string;
    real_name: string;
    real_name_normalized: string;
    skype: string;
    status_emoji: string;
    status_expiration: number;
    status_text: string;
    status_text_canonical: string;
    title: string;
  };
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
  slackSetProfile(
    auth: SlackAuth,
    status: SlackStatus,
  ): Promise<Result<SlackOk, SlackErr>>;

  slackSetSnooze(
    auth: SlackAuth,
    minutes: number,
  ): Promise<Result<SlackOk, SlackErr>>;

  slackEndSnooze(auth: SlackAuth): Promise<Result<SlackOk, SlackErr>>;

  slackSetPresence(
    auth: SlackAuth,
    state: 'active' | 'away',
  ): Promise<Result<SlackOk, SlackErr>>;

  slackValidate(auth: SlackAuth): Promise<Result<SlackProfile, SlackErr>>;
}

interface SlackParams {
  logger: IClientLogger;
  client: HttpClient;
}

export const slackRepository = ({
  logger,
  client,
}: SlackParams): SlackRepository => {
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
            status_expiration:
              expiration ? (expiration.getTime() / 1000).toFixed(0) : null,
          },
        },
        auth,
      );
    },

    async slackEndSnooze(auth) {
      return slackReq<SlackOk>('/dnd.endSnooze', {}, auth);
    },

    async slackSetPresence(auth, state) {
      return slackReq<SlackOk>(`/presence.set?presence=${state}`, {}, auth);
    },

    async slackSetSnooze(auth, duration) {
      return slackReq<SlackOk>(
        `/dnd.setSnooze`,
        { num_minutes: duration },
        auth,
      );
    },

    async slackValidate(auth) {
      return slackReq<SlackProfile>(`/users.profile.get`, {}, auth);
    },
  };
};

function slackClient(logger: IClientLogger, client: HttpClient) {
  return async function slackReq<A extends SlackOk>(
    path: string,
    payload: any,
    auth: SlackAuth,
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
        },
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
