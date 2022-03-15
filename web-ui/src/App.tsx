import React from 'react';
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

interface Vertex {
  v_id: string;
  v_type: string;
  attributes: any;
}

interface Edge {
  e_type: string;
  directed: boolean;
  from_id: string;
  from_type: string;
  to_id: string;
  to_type: string;
  attribute: any;
}

function App() {
  const apiPrefix = `http://${config.server}:${config.serverPort}/api`;
  const getVertexCardinalityBody = {
    function: 'stat_vertex_number',
    type: '*'
  }
  const getEdgeCardinalityBody = {
    function: 'stat_edge_number',
    type: '*'
  }

  async function getCardinality(body: {function: string, type: string}) {
    let res = await axios.post<Res>(`${apiPrefix}/builtins/${config.graphName}`, body, {headers: {'content-type': 'application/x-www-form-urlencoded'}});
    return res;
  }

  async function getVertexCount(v_type: string) {
    let res = await axios.get<Res>(`${apiPrefix}/graph/${config.graphName}/vertices/${v_type}`);
    return res;
  }

  async function selectVertex(params: {graphName: string, vertexType: string, vertexId: string}) {
    let res = await axios.get<Res>(`${apiPrefix}/graph/${params.graphName}/vertices/${params.vertexType}/${params.vertexId}`);
    return res;
  }

  async function selectEdge(params: {graphName: string, sourceVertexType: string, sourceVertexId: string, edgeType: string}) {
    let res = await axios.get<Res>(`${apiPrefix}/graph/${params.graphName}/edges/${params.sourceVertexType}/${params.sourceVertexId}/${params.edgeType}`);
    return res;
  }

  let [vertex, setVertex] = useState<Vertex[]>([]);
  let [edge, setEdge] = useState<Edge[]>([]);

  let [vertexCount, setVertexCount] = useState(0);
  let [edgeCount, setEdgeCount] = useState(0);

  useEffect(() => {
    getCardinality(getVertexCardinalityBody).then(res => {
      const count = res.data.results[0]?.count;
      setVertexCount(count);
    })
    getCardinality(getEdgeCardinalityBody).then(res => {
      const count = res.data.results[0]?.count;
      setEdgeCount(count);
    })

    selectVertex({graphName: 'social', vertexType: 'person', vertexId: 'Tom'}).then(res => {
      setVertex(res.data.results);
      console.log(res.data.results);
    });
    selectEdge({graphName: 'social', sourceVertexType: 'person', sourceVertexId: 'Tom', edgeType: 'friendship'}).then(res => {
      setEdge(res.data.results);
      console.log(res.data.results);
    });
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
