/** 
 * demo
 * @author zhongzhuhua
 */
import React from 'react';
import ReactDOM from 'react-dom';

var About = React.createClass({
  render() {
    return <h2>About</h2>;
  }
});

var Inbox = React.createClass({
  render() {
    return <h2>Inbox</h2>;
  }
});

var Home = React.createClass({
  render() {
    return (
      <div>
        <a href="#/about">about</a><br />
        <a href="#/inbox">inbox</a>
      </div>
    );
  }
});

var App = React.createClass({
  render() {
    var Child;
    console.log(this.props.route);
    switch (this.props.route) {
    case '/about':
      Child = About;
      break;
    case '/inbox':
      Child = Inbox;
      break;
    default:
      Child = Home;
    };

    return (
      <div id="root">
        <Child />
      </div>
    );
  }
});

function render() {
  var route = window.location.hash.substr(1);
  ReactDOM.render(<App route={route} />, document.getElementById('root'));
};

window.addEventListener('hashchange', render);
render();
