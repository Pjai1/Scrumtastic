import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../App.css';

class App extends Component {



    render() {
        return (
            <div className="container">
                App
            </div>    
        )
    }
}

export default connect(null, null)(App);