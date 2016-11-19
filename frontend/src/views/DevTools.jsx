import React from 'react';

// Exported from redux-devtools
import { createDevTools } from 'redux-devtools';

import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
import FilterMonitor from 'redux-devtools-filter-actions';
// import FilterableLogMonitor from 'redux-devtools-filterable-log-monitor';


// createDevTools takes a monitor and produces a DevTools component
const DevTools = createDevTools(
  // Monitors are individually adjustable with props.
  // Consult their repositories to learn about those props.
  // Here, we put LogMonitor inside a DockMonitor.
  <DockMonitor toggleVisibilityKey='ctrl-h'
               changePositionKey='ctrl-q'
               defaultIsVisible={false}>
    <FilterMonitor
       blacklist={['redux.form.*', '@@router.*']} >
       <LogMonitor />
    </FilterMonitor>
  </DockMonitor>
);

export default DevTools;
