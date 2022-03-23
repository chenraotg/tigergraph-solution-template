### First
> init it.
```typescript
import TGTokenHandler from './tg-token-handler/tg-token-handler';
const restHandler = new TGTokenHandler('http://35.223.60.115:9000', 'tigergraph', 'tigergraph', 3.4, 3600);
```
### Second
> get http method from it. Since token is binding with graph, so you need to give it a graph name.
```typescript
const http = restHandler.getInstance('graphName');
```
### Third
> Do any request you want.
```typescript
result = await http.get('/query/test/printT');
```