import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import version from './version.json';

console.log('===============================================================');
console.log(' _______                 ______                 __');
console.log(' /_  __(_)___ ____  _____/ ____/________ _____  / /_');
console.log('  / / / / __ `/ _ \\/ ___/ / __/ ___/ __ `/ __ \\/ __ \\');
console.log(' / / / / /_/ /  __/ /  / /_/ / /  / /_/ / /_/ / / / /');
console.log('/_/ /_/\\__, /\\___/_/   \\____/_/   \\__,_/ .___/_/ /_/');
console.log('     /____/                          /_/');
console.log('===============================================================');
console.log('v' + version.major + '.' + version.minor + '.' + version.build + '.' + version.revision);
console.log('Powered by TigerGraph');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
