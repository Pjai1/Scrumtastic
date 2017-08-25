import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import logo from '../images/scrumtastic_logo_black_inverse.png';
import { Icon } from 'react-materialize';
import axios from 'axios';
import { BASE_URL, CLIENT_ID, CLIENT_SECRET } from '../constants';
import Toast from './Toast'
import '../App.css';

class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: '',
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
                localStorage.setItem('userId', data.data.id)
                this.getToken();
            })
            .catch((error) => {
                this.setState({error});
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
                    localStorage.setItem('token', data.data.access_token);
                    localStorage.setItem('email', this.state.email);
                    let t = new Toast("Succesfully logged in!", 2500)
                    t.Render(); 
                    this.setState({token: data.data.access_token});
                    setInterval(() => {browserHistory.push('/')}, 2500);
                }
            })
            .catch((error) => {
                this.setState({error});
            })
    }

    renderErrors() {
        let errors = [];
        console.log(this.state.error.response);
        if(this.state.error.response && this.state.error.response.data) {
            const errorResp = this.state.error.response.data.error;
            if (typeof errorResp === "string") {
                errors.push(<p className="errorMessage" key={"error_" + 1}>{errorResp}</p>)
            } else {
                for (let key in errorResp) {
                    errors.push(<p className="errorMessage" key={"error_" + key}>{errorResp[key]}</p>)
                }
            }
        }
        return <div className="center-align">{errors}</div>
    }

    render() {
        return (
            <div className="container">
                <div className="Align">
                    <div className="row">
                        <div className="col s3" />
                        <div className="col s6" >
                            <img className="logo-login" src={logo} alt="logo" />
                        </div>
                        <div className="col s3" />
                    </div>
                    <div className="row">
                    <form className="col s12">
                        <div className="row">
                            <div className="col s3" />
                            <div className="col s1" style={{paddingTop: '25px', paddingLeft: '40px'}}>
                            <Icon small>
                                account_circle    
                            </Icon>
                            </div>
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
                                <label htmlFor="name">Your Name</label>
                            </div>
                            <div className="col s4"></div>
                        </div>
                        <div className="row">
                            <div className="col s3" />
                            <div className="col s1" style={{paddingTop: '25px', paddingLeft: '40px'}}>
                                <Icon small>
                                    email   
                                </Icon>
                            </div>
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
                                <label htmlFor="email">Your Email</label>
                            </div>
                            <div className="col s4"></div>
                        </div>
                        <div className="row">
                            <div className="col s3" />
                            <div className="col s1" style={{paddingTop: '25px', paddingLeft: '40px'}}>
                                <Icon small>
                                    vpn_key   
                                </Icon>
                            </div>
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
                                <label htmlFor="password">Your Password</label>
                            </div>
                            <div className="col s4"></div>
                        </div>
                        <div className="row">
                            <div className="col s3" />
                            <div className="col s1" style={{paddingTop: '25px', paddingLeft: '40px'}}>
                                <Icon small>
                                    lock  
                                </Icon>
                            </div>
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
                                <label htmlFor="password-confirmation">Your Password (Confirm)</label>
                            </div>
                            <div className="col s4"></div>
                        </div>
                    </form>
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