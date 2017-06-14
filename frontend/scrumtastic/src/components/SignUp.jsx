import React, { Component } from 'react';
import { Link, Router, browserHistory } from 'react-router';
import axios from 'axios';
import { BASE_URL, CLIENT_ID, CLIENT_SECRET } from '../constants';

class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSuccess: false,
            name: '',
            email: '',
            password: '',
            passwordConfirmation: '',
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

    signUp() {
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.post(`${BASE_URL}/users`, {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            password_confirmation: this.state.passwordConfirmation
        })
            .then((data) => {
                console.log(data);
                this.getToken();
            })
            .catch((error) => {
                this.setState({error});
                console.log(error.response.data.error);
            });
    }

    getToken() {
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.post(`${BASE_URL}/oauth/token`, {
            "grant_type": "password",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "username": this.state.email,
            "password": this.state.password
        })
            .then((data) => {
                if(data.data.access_token) {
                    console.log(data.data.access_token);
                    localStorage.setItem('token', data.data.access_token);
                    localStorage.setItem('email', this.state.email);
                    this.setState({token: data.data.access_token});
                    this.setState({showSuccess: true});
                    setInterval(() => {this.setState({showSuccess:false});browserHistory.push('/');}, 2000);
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
                    errors.push(<p className="errorMessage" key={"error_" + i}>{errorArray[key][0]}</p>);
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
                            <div className="col s4"></div>
                            <div className="input-field inline col s4">
                                <input 
                                    className="validate"
                                    id="name"
                                    type="text"
                                    onChange={event => this.setState({name:event.target.value})}
                                    onKeyPress={event => {
                                    if(event.key === "Enter") {
                                            this.signUp();
                                        }
                                    }}
                                />
                                <label htmlFor="name">Name</label>
                            </div>
                            <div className="col s4"></div>
                        </div>
                        <div className="row">
                            <div className="col s4"></div>
                            <div className="input-field inline col s4">
                                <input 
                                    className="validate"
                                    id="email"
                                    type="email"
                                    onChange={event => this.setState({email:event.target.value})}
                                    onKeyPress={event => {
                                    if(event.key === "Enter") {
                                            this.signUp();
                                        }
                                    }}
                                />
                                <label htmlFor="email">Email</label>
                            </div>
                            <div className="col s4"></div>
                        </div>
                        <div className="row">
                            <div className="col s4"></div>
                            <div className="input-field inline col s4">
                                <input 
                                    className="validate"
                                    id="password"
                                    type="password"
                                    onChange={event => this.setState({password:event.target.value})}
                                    onKeyPress={event => {
                                    if(event.key === "Enter") {
                                            this.signUp();
                                        }
                                    }}
                                />
                                <label htmlFor="password">Password</label>
                            </div>
                            <div className="col s4"></div>
                        </div>
                        <div className="row">
                            <div className="col s4"></div>
                            <div className="input-field inline col s4">
                                <input 
                                    className="validate"
                                    id="password-confirmation"
                                    type="password"
                                    onChange={event => this.setState({passwordConfirmation:event.target.value})}
                                    onKeyPress={event => {
                                    if(event.key === "Enter") {
                                            this.signUp();
                                        }
                                    }}
                                />
                                <label htmlFor="password-confirmation">Password (Confirm)</label>
                            </div>
                            <div className="col s4"></div>
                        </div>
                    </form>
                </div>
                <div className="row">
                    <div className="col s4"></div>  
                    {this.state.showSuccess ? <div className="card-panel teal lighten-2 center-align col s4">Logged in succesfully!</div> : null}
                    <div className="col s4"></div>  
                </div>
                <div className="row">
                    {this.renderErrors()} 
                </div>
                <div className="row center-align">    
                    <a 
                        className="waves-effect waves-light btn-large"
                        onClick={() => this.signUp()}
                    >
                        Sign Up
                    </a>
                </div>
                <div className="row">
                    <div className="center-align">Already got an account? <Link to={"/signin"}>Sign In</Link> instead!</div>
                </div>
                </div>
            </div>
        )
    }
}

export default SignUp;