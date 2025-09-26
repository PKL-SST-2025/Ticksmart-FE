/* @refresh reload */
import { render } from 'solid-js/web';

import App from './App';
import './styles/index.css';

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import _ from 'lodash';
import noUiSlider from 'nouislider';

window._ = _;
window.noUiSlider = noUiSlider;



const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

// Preline UI
import("preline/dist").then(() => {
  render(() => <App />, root!);
});

