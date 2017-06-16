import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Router, Route, browserHistory } from 'react-router';
import reducer from './reducers';

import App from './components/App';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import BoardView from './components/BoardView';
import ProjectView from './components/ProjectView';
import CreateProject from './components/CreateProject';

const store = createStore(reducer);

function requireAuthentication(nextState, replace) {
    if(!isUserAuthenticated() || !checkNewProjectStorage()) {
        console.log('nextstate', nextState);
        replace({
            pathname: '/signin',
            state: { nextPathname: nextState.location.pathname }
        })
    }
}

function isUserAuthenticated() {
    var authenticated = false; 

    if(localStorage.getItem('token')) {
        authenticated = true;
    }

    return authenticated;
}

function checkNewProjectStorage() {
    var userIdStored = false;

    if(localStorage.getItem('userId')) {
        userIdStored = true;
    }

    return userIdStored;
}

ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App} onEnter={requireAuthentication.bind(this)}  />
            <Route path="/signin" component={SignIn} />
            <Route path="/signup" component={SignUp} />
            <Route path="/board" onEnter={requireAuthentication.bind(this)} component={BoardView} />
            <Route path="/projects" onEnter={requireAuthentication.bind(this)} component={ProjectView} />
            <Route path="/newproject" onEnter={requireAuthentication.bind(this)} component={CreateProject} />
        </Router>
    </Provider>,
    document.getElementById('root')
)