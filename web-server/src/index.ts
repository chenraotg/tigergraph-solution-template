import express from 'express';
import * as _fs from 'fs';
import * as _path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

const configFileData = _fs.readFileSync(_path.join(__dirname, '../../configs/config.json'), 'utf-8');
const config = JSON.parse(configFileData);

const app = express()
const port = 4000

app.get('/', (req: any, res: any) => {
  console.log(req);
  res.send('Hello World!')
})

app.use('/api', createProxyMiddleware(
  {
    target: `http://${config.frontend.server}:9000`,
    changeOrigin: true,
    pathRewrite: function(path: string) {
      return path.replace('/api', '/');
    },
    onProxyRes: function(proxyRes: any) {
      proxyRes.headers['access-control-allow-origin'] = '*';
    }
  }
))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})