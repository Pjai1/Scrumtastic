import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import { Dropdown, Button, NavItem, Col, Card } from 'react-materialize';
import axios from 'axios';
import { BASE_URL } from '../constants';
import '../App.css';

class CreateProject extends Component {
    constructor(props) {
        super(props);
        this.state = {
            'userId': '',
            'email': '',
            'token': '',
            'name': '',
            'description': '',
            'error': [],
            'projects': []
        }
    }

    componentWillMount() {
        
       let email = localStorage.getItem('email');
       let token = localStorage.getItem('token');
       let userId = localStorage.getItem('userId');
       let projects = localStorage.getItem('projects');
       this.setState({'email': email, 'token': token, 'userId': userId, 'projects': projects});
    }

    logOut() {
        const token = 'Bearer ' + this.state.token

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.post(`${BASE_URL}/logout`, {
            'email': this.state.email,
        })
            .then((data) => {
                console.log(data)
                if(data.status === 200) {
                    localStorage.removeItem('token')
                    localStorage.removeItem('email')
                    browserHistory.push('/signin')
                }
            })
            .catch((error) => {
                console.log(error)
            }) 
    }

    createProject() {
        const token = 'Bearer ' + this.state.token

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.post(`${BASE_URL}/projects`, {
            'name': this.state.name,
            'description': this.state.description,
            'user_id': this.state.userId
        })
            .then((data) => {
                console.log(data)
                localStorage.setItem('projectId', data.id);
                localStorage.setItem('projectName', this.state.name);
                browserHistory.push('/projects');
            })
            .catch((error) => {
                console.log(error)
            }) 
    }

    renderErrors() {
        let errors = [];
        if(this.state.error.response && this.state.error.response.data.error)
        {
            let errorArray = this.state.error.response.data.error;
            let i = 0;
            for(var key in errorArray) {
                if(errorArray.hasOwnProperty(key)) {
                    errors.push(<p key={"error_" + i}>{errorArray[key][0]}</p>);
                }
                i++;
            }
        }

        return <div className="center-align">{errors}</div>
    }

    render() {
        return (
            <div>
                <nav className="teal lighten-3">
                    <div className="nav-wrapper">
                    <a className="brand-logo">Logo</a>
                        <ul id="nav-mobile" className="left hide-on-med-and-down" style={{paddingLeft: '100px'}}>
                            <li><a href="/">Projects</a></li>
                        </ul>
                        <ul id="nav-mobile" className="right hide-on-med-and-down">
                            <i className="material-icons" style={{height: 'inherit', lineHeight: 'inherit', float: 'left', margin: '0 30px 0 0', width: '2px'}}>perm_identity</i>
                            <div style={{display: 'inline'}}><a className='dropdown-button btn' data-activates='dropdownMenu'>{this.state.email}</a></div>

                            <ul id='dropdownMenu' className='dropdown-content' style={{marginLeft: '15px', marginTop: '35px' }}>
                                <li><a style={{paddingLeft: '30px'}} onClick={this.logOut.bind(this)}>
                                        <i className="material-icons">input</i>
                                        Log out
                                    </a>
                                </li>
                            </ul>
                        </ul>
                        {/*<Dropdown trigger={
                            <Button>{this.state.email || "WHO ARE U" }</Button>
                            }>
                            <NavItem onClick={this.logOut.bind(this)}>Log Out Feggeht</NavItem>
                            <NavItem divider />
                        </Dropdown>*/}
                    </div>
                </nav>
                <div className="row">
                    <div className="col s2"/>
                    <div className="col s8"> 
                        <h2 style={{color: '#26a69a'}}>Create Your Project</h2>
                            <form className="col s12">
                                <div className="row">
                                    <div className="input-field inline col s12">
                                        <input 
                                            className="validate"
                                            id="name"
                                            type="text"
                                            onChange={event => this.setState({name:event.target.value})}
                                        />
                                        <label htmlFor="name">Name Project</label>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="row">
                                        <div className="input-field col s12">
                                        <textarea id="textarea1" className="materialize-textarea" 
                                            onChange={event => this.setState({description:event.target.value})}
                                        ></textarea>
                                        <label htmlFor="textarea1">Description Project</label>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <div className="row">
                                { this.renderErrors() }
                            </div>
                            <div className="row center-align">    
                            <a 
                                className="waves-effect waves-light btn-large"
                                onClick={() => this.createProject()}
                            >
                               Create Project
                            </a>
                        </div>
                    </div>
                </div>                
            </div>
        )
    }
}

export default CreateProject;