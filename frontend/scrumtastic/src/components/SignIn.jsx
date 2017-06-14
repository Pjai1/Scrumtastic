import React, { Component } from 'react';
import { Link, Router, browserHistory } from 'react-router';
import axios from 'axios';
import { BASE_URL, CLIENT_ID, CLIENT_SECRET } from '../constants';
import SignUp from './SignUp';

class SignIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: [],
            token: ''
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps !== this.props || nextState !== this.state || nextState.error !== null
    }

    componentWillMount() {
        if(this.state.token.length > 0 || localStorage.getItem('token')) {
            browserHistory.push('/')
        }
    }

    signIn() {
        axios.post(`${BASE_URL}/oauth/token`, {
            "grant_type": "password",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "username": this.state.email,
            "password": this.state.password
        })
            .then((data) => {
                if(data.data.access_token) {
                    localStorage.setItem('token', data.data.access_token);
                    this.setState({token: data.data.access_token});
                }
                
            })
            .catch((error) => {
                this.setState({error});
            })
    }

    renderErrors() {
        let errors = [];
        console.log(this.state.error);
        if(this.state.error.response && this.state.error.response.data.error)
        {
            let errorArray = this.state.error.response.data.error;
            let i = 0;
            for(var key in errorArray) {
                if(errorArray.hasOwnProperty(key)) {
                    errors.push(<span key={"error_" + i}>{errorArray[key][0]}</span>);
                }
                i++;
            }
        }

        return <div className="center-align">{errors}</div>
    }

    render() {
        return (
            <div className="container">
                <div className="Align">
                <h5 className="center-align">LOGO</h5>
                <div className="row">
                    <form className="col s12">
                        <div className="row">
                            <div className="col s2"></div>
                            <div className="input-field inline col s4">
                                <input 
                                    className="validate"
                                    id="email"
                                    type="email"
                                    onChange={event => this.setState({email:event.target.value})}
                                />
                                <label htmlFor="email">Email</label>
                            </div>
                            <div className="input-field inline col s4">
                                <input 
                                    className="validate"
                                    id="password"
                                    type="password"
                                    onChange={event => this.setState({password:event.target.value})}
                                />
                                <label htmlFor="password">Password</label>
                            </div>
                        </div>
                        <div className="col s2"></div>
                    </form>
                </div>
                <div className="row">
                    { this.renderErrors() }
                </div>
                <div className="row center-align">    
                    <a 
                        className="waves-effect waves-light btn-large"
                        onClick={() => this.signIn()}
                    >
                        Sign In
                    </a>
                </div>
                <div className="row">
                    <div className="center-align">Not got an account yet? <Link to={"/signup"}>Sign Up</Link> instead!</div>
                </div>
                </div>
            </div> 
        )
    }
}

export default SignIn;