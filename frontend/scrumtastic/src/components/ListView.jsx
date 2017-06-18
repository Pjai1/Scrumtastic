import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import { Dropdown, Button, NavItem, Col, Card, Table } from 'react-materialize';
import logo from '../images/scrumtastic_logo_white.png';
import axios from 'axios';
import { BASE_URL } from '../constants';
import Toast from './Toast';
import '../App.css';

class ListView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            'userId': '',
            'email': '',
            'token': '',
            'name': '',
            'projectId': '',
            'sprintId': '',
            'projectName': '',
            'description': '',
            'error': [],
            'projects': [],
            'stories': [],
            'statuses': []
        }
    }

    componentWillMount() {
       let email = localStorage.getItem('email');
       let token = localStorage.getItem('token');
       let userId = localStorage.getItem('userId');
       let projectId = localStorage.getItem('projectId');
       let projectName = localStorage.getItem('projectName');
       let sprintId = localStorage.getItem('sprintId');
       this.setState({'token': token, 'userId': userId, 'projectId': projectId, 'projectName': projectName, 'email': email, 'sprintId': sprintId});
    }

    componentDidMount() {
        const token = 'Bearer ' + this.state.token;
        const sprintId = this.state.sprintId;
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token;

        axios.get(`${BASE_URL}/sprints/${sprintId}/stories`)
            .then((data) => {
                console.log(data.data[0].stories);
                this.setState({'stories': data.data[0].stories})
            })
            .catch((error) => {
                console.log(error)
            }) 
    }

    // getSprintStories() {
    //     const token = 'Bearer ' + this.state.token;
    //     const sprintId = this.state.sprintId;
    //     axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    //     axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

    //     axios.get(`${BASE_URL}/sprints/${sprintId}/stories`)
    //         .then((data) => {
    //             console.log(data.data[0].stories);
    //             this.setState({'stories': data.data[0].stories})
    //         })
    //         .catch((error) => {
    //             console.log(error)
    //         }) 
    // }

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

            }) 
    }

    renderStories() {
        const stories = this.state.stories;
        console.log(stories);
        return (
            <tbody>
                {
                    stories.map(story => {
                        return (
                            <tr key={story.id}>
                                <td>
                                    {story.description}
                                </td>
                            </tr>
                        )
                    })
                }
            </tbody>
        )
    }

    render() {
        return (
            <div>
                <nav className="teal lighten-3">
                    <div className="nav-wrapper">
                    <a className="brand-logo" href="/"><img className="nav-logo" src={logo}/></a>
                        <ul id="nav-mobile" className="left hide-on-med-and-down" style={{paddingLeft: '180px'}}>
                            <li><a href="/">Projects</a></li>
                            <li><a href="/projects">Backlog</a></li>
                            <li><a href="/sprints">Sprints</a></li>
                        </ul>
                        <ul id="nav-mobile" className="right hide-on-med-and-down" style={{marginRight: '10px'}}>
                            <i className="material-icons" style={{height: 'inherit', lineHeight: 'inherit', float: 'left', margin: '0 30px 0 0', width: '2px'}}>perm_identity</i>
                            <Dropdown trigger={
                                <Button style={{display: 'inline'}}>{this.state.email}</Button>
                                }>
                                <NavItem onClick={this.logOut.bind(this)}><i className="material-icons">input</i>Log Out</NavItem>
                                <NavItem divider />
                            </Dropdown>
                        </ul>
                    </div>
                </nav>
                <div className="row">
                    <div className="col s2"/>
                    <div className="col s8"> 
                        <h2 style={{color: '#26a69a'}}>{this.state.projectName}: List View</h2>
                        <Table className="highlight">
                            <thead>
                                <tr>
                                    <th data-field="story">User Story</th>
                                    <th data-field="name">Tasks</th>
                                    <th data-field="price">Status</th>
                                </tr>
                            </thead>
                                {this.renderStories()}
                        </Table>
                    </div>
                    <div className="col s2" />
                </div>
            </div>
        )
    }
}

export default ListView;