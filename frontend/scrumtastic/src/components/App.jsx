import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import { Dropdown, Button, NavItem } from 'react-materialize';
import axios from 'axios';
import { BASE_URL } from '../constants';
import '../App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            'email': '',
            'token': ''
        }
    }

    componentWillMount() {
       let email = localStorage.getItem('email');
       let token = localStorage.getItem('token');
       this.setState({'email': email});
       this.setState({'token': token});
       console.log(this.state.token);
    }

    logOut() {
        const token = 'Bearer ' + this.state.token

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

    render() {
        return (
            <div>
                <nav className="teal lighten-3">
                    <div className="nav-wrapper">
                    <a className="brand-logo">Logo</a>
                        <ul id="nav-mobile" className="left hide-on-med-and-down" style={{paddingLeft: '100px'}}>
                            <li><a href="sass.html">Projects</a></li>
                        </ul>
                        <ul id="nav-mobile" className="right hide-on-med-and-down">
                            <i className="material-icons" style={{height: 'inherit', lineHeight: 'inherit', float: 'left', margin: '0 30px 0 0', width: '2px'}}>perm_identity</i>
                            <a className='dropdown-button btn' data-activates='dropdownMenu' style={{width: '170px'}}>{this.state.email}</a>

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
            </div>    
        )
    }
}

export default App;