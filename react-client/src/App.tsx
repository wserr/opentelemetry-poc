import React from 'react';
import logo from './logo.svg';
import './App.css';


import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ConsoleSpanExporter, SimpleSpanProcessor, TracerConfig, WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Resource } from '@opentelemetry/resources';
import {OTLPTraceExporter} from "@opentelemetry/exporter-trace-otlp-http";

const providerConfig: TracerConfig = {
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'my-react-app',
  }),
};

const provider = new WebTracerProvider(providerConfig);

const collectorOptions = {
  url: 'http://localhost:4317',
  headers: {
    "Content-Type": "application/json",
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
  },
  concurrencyLimit: 10,
};

// Exporter (opentelemetry collector hidden behind bff proxy)
const exporter = new OTLPTraceExporter (collectorOptions);

// we will use ConsoleSpanExporter to check the generated spans in dev console
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [
    // getWebAutoInstrumentations initializes all the package.
	// it's possible to configure each instrumentation if needed.
    getWebAutoInstrumentations({
      '@opentelemetry/instrumentation-fetch': {
			// config can be added here for example 
			// we can initialize the instrumentation only for prod
			// enabled: import.meta.env.PROD,		
      },
    }),
  ],
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
