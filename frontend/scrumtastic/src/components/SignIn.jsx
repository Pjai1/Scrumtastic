import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import logo from '../images/scrumtastic_logo_black_inverse.png';
import { Icon, Dropdown, Button, NavItem } from 'react-materialize';
import axios from 'axios';
import { BASE_URL, CLIENT_ID, CLIENT_SECRET } from '../constants';
import Toast from './Toast'
import '../App.css';
import Spinner from 'react-spinkit';


class SignIn extends Component {
    constructor(props) {
        super(props);
        this.statusMessage = null
        this.state = {
            userId: '',
            email: '',
            password: '',
            error: [],
            token: '',
            loggedIn: false,
        }
    }

    componentWillMount() {
        if(this.state.token.length > 0 || localStorage.getItem('token')) {
            browserHistory.push('/')
        }
    }

        logOut() {
        const token = 'Bearer ' + this.state.token;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.post(`${BASE_URL}/logout`, {
            'email': this.state.email,
        })
            .then((data) => {
                if(data.status === 200) {
                    localStorage.removeItem('token')
                    localStorage.removeItem('email')
                    let t = new Toast("Succesfully logged out!", 2500)
                    t.Render(); 
                    setTimeout(() => {browserHistory.push('/signin')}, 2500)
                }
            })
            .catch((error) => {
                this.setState({error: error})
            }) 
    }

    signIn() {
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
                    this.setState({token: data.data.access_token, loggedIn: true});
                    let t = new Toast("Succesfully logged in!", 2500)
                    t.Render(); 
                    this.getUserId();
                }
            })
            .catch((error) => {
                this.setState({error});
            })
    }

    getUserId() {
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.post(`${BASE_URL}/userid`, {
            "email": this.state.email
        })
            .then((data) => {
                localStorage.setItem('userId', data.data[0].id);
                setTimeout(() => {browserHistory.push('/')}, 2500);
            })
            .catch((error) => {
                this.setState({error});
            }) 
    }

    loginSpinner() {
        return <Spinner style={{marginLeft: '150px'}} name="ball-clip-rotate-multiple" />
    }

    renderErrors() {
        let errors = [];
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
                                            this.signIn();
                                        }
                                    }}
                                />
                                <label htmlFor="email">Your Email</label>
                            </div>
                            <div className="col s4" />
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
                                            this.signIn();
                                        }
                                    }}
                                />
                                <label htmlFor="password">Your Password</label>
                            </div>
                            <div className="col s4" />
                        </div>
                    </form>
                </div>
                <div className="row">
                    <div className="col s4" />
                    <div className="col s4">
                        {(this.state.loggedIn) ? this.loginSpinner() : null}
                    </div>
                    <div className="col s4" />
                </div>
                <div className="row">
                    <div className="col s4"></div>  
                    {this.state.showSuccess ? <div className="card-panel teal lighten-2 center-align col s4">Logged in succesfully!</div> : null}
                    <div className="col s4"></div>  
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
                <div className="row" style={{marginBottom: '200px'}}>
                    <div className="center-align">Not got an account yet? <Link to={"/signup"}>Sign Up</Link> instead!</div>
                </div>
                </div>
            </div> 
        )
    }
}

export default SignIn;