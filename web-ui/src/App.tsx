import './App.css';
import config from './config.json';
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import { PieStatWidget, ComponentProvider } from '@tigergraph/app-ui-lib';

interface Res {
  error: boolean;
  message: string;
  results: any[];
  version: {
    edition: string;
    api: string;
    schema: number;
  }
}

function App() {
  let [vertexCount, setVertexCount] = useState(0);
  let [edgeCount, setEdgeCount] = useState(0);

  useEffect(() => {
    let getVertexCardinalityBody = {
      function: 'stat_vertex_number',
      type: '*'
    }
    let getEdgeCardinalityBody = {
      function: 'stat_edge_number',
      type: '*'
    }
    const apiPrefix = `http://${config.server}:${config.serverPort}/api`;
    async function getCardinality(body: {function: string, type: string}) {
      let res = await axios.post<Res>(`${apiPrefix}/builtins/${config.graphName}`, body, {headers: {'content-type': 'application/x-www-form-urlencoded'}});
      return res;
    }
    getCardinality(getVertexCardinalityBody).then(res => {
      const count = res.data.results[0]?.count;
      setVertexCount(count);
    })
    getCardinality(getEdgeCardinalityBody).then(res => {
      const count = res.data.results[0]?.count;
      setEdgeCount(count);
    })
  }, []);


  return (
    <ComponentProvider>
      <div className="App">
        <header className="App-header">
          <h1>TigerGraph Hello World App</h1>
          <div className="Pie-state-widget-container">
            <div className='Widget-wrapper'><PieStatWidget data={[{name: 'Total', value: vertexCount}]} title='Vertex Count' isLoading={false}></PieStatWidget></div>
            <div className='Widget-wrapper'><PieStatWidget data={[{name: 'Total', value: edgeCount}]} title='Edge Count' isLoading={false}></PieStatWidget></div>
          </div>
        </header>
      </div>
    </ComponentProvider>
  );
}

export default App;
