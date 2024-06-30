import { Body, Client, getClient } from "@tauri-apps/api/http";

export type HttpClient = Pick<Client, "get" | "post">;

export const prodClient = (): Promise<HttpClient> => getClient();

export const fakeClient = (): HttpClient => ({
  async post(url) {
    return {
      ok: true,
      url,
      data: {} as any,
      status: 200,
      headers: {},
      rawHeaders: {},
    };
  },
  async get(url) {
    return {
      ok: true,
      url,
      data: {} as any,
      status: 200,
      headers: {},
      rawHeaders: {},
    };
  },
});

export const httpJson = Body.json;
