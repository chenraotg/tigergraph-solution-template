import axios, { AxiosInstance, Method } from 'axios';
import Base64 from 'js-base64';

import Token from './token'; // A map of token data.

const TGTokenInvalidCode = 'REST-10016'; // TigergraphDocument: Access denied due to an invalid token.

/**
 * Provides a set of wrappers for http requests that can automatically handle user management restrictions on tigergraph.
 * Example:
  ```ts
    import express from 'express';
    import TGTokenHandler from './tg-token-handler/tg-token-handler';

    const app = express();
    const port = 3000;

    const restHandler = new TGTokenHandler('http://35.223.60.115:9000', 'tigergraph', 'tigergraph', 3.4, 3600);

    app.get('/', async (_, res) => {
      const instance = restHandler.getInstance('test');
      let result;

      try {
        result = await instance.get('/query/test/printT'); // run query printT
      } catch (e: any) {
        if (e.message) {
          console.log(e.message);
        }

        if (e.response?.data) {
          console.log(e.response.data);
        }
      }
      res.send(result?.data);
    });

    app.listen(port, () => {
      console.log('server started at http://localhost:3000');
    });
  ```
 *
 * @export
 * @class TGTokenHandler
 */
export default class TGTokenHandler {
  baseURL: string;
  username: string;
  password: string;
  version: number;
  tokenLifetime: number;

  constructor(baseURL: string, username: string, password: string, version: number, tokenLifetime: number) {
    this.baseURL = baseURL;
    this.username = username;
    this.password = password;
    this.version = version;
    this.tokenLifetime = tokenLifetime;
  }

  /**
   * An instance of axios that includes tigergraph's user management limit handling.
   * Since in tigergraph, each graph corresponds to its specific token value, this function needs to pass in the graph name.
   *
   * @param {string} graphName
   * @return {*}  {AxiosInstance}
   * @memberof TGTokenHandler
   */
  getInstance(graphName: string): AxiosInstance {
    const instance = axios.create({
      baseURL: this.baseURL
    });

    // Hijack the request, if there is a token, add it to the header.
    instance.interceptors.request.use(
      config => {
        const token = Token.get(graphName);
        if (token) {
          if (config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            config.headers = {
              Authorization: `Bearer ${token}`
            }
          }
        }

        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Hijack correspondingly, if there is an error in the user authentication related request, get a new token and re-request.
    instance.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        const errorCode = error?.response?.data?.code;

        // notFirst: This parameter is only to ensure that the retry is only one time.
        if (errorCode && errorCode === TGTokenInvalidCode && !error.config.notFirst) {
          try {
            const err = await this.requestToken(graphName);
            if (err) {
              return Promise.reject(err);
            }

            return instance({ ...error.config, notFirst: true });
          } catch (e) {
            return Promise.reject(e);
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }

  private async requestToken(graphName: string): Promise<any> {
    const encodedUsernamePassword = Base64.encode(`${this.username}:${this.password}`);
    let method: Method = 'GET';
    let params;
    let data;
    let result;

    /*
      version: {
        3.4-: https://docs.tigergraph.com/tigergraph-server/3.4/api/built-in-endpoints#_request_a_token_get
        3.5+: https://docs.tigergraph.com/tigergraph-server/current/api/built-in-endpoints#_request_a_token
      }
    */
    if (this.version <= 3.4) {
      params = {
        graph: graphName,
        lifetime: this.tokenLifetime
      }
    } else {
      method = 'POST';
      data = {
        graph: graphName,
        lifetime: this.tokenLifetime,
      };
    }

    result = await axios({
      method,
      url: `${this.baseURL}/requesttoken`,
      headers: {
        Authorization: `Basic ${encodedUsernamePassword}`
      },
      params,
      data
    });

    // FIXME: When requesting a token, restpp will not return an error code, it will always return 200, so it is necessary to judge whether there is an error from the response
    // console.log(result.statusText);
    // console.log(result.status);
    // console.log(result.data);

    const token = result.data?.results?.token;
    if (token) {
      Token.set(graphName, token);
      return undefined;
    }

    return {
      response: result
    };
  }
}