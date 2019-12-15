import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import App from './App';


// it('renders without crashing', () => {
//   const div = document.createElement('div');
//   ReactDOM.render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>, div);
//   ReactDOM.unmountComponentAtNode(div);
// });

it('renders without crashing', () => {
  mount(
  <BrowserRouter>
    <App />
  </BrowserRouter>
  )
});
