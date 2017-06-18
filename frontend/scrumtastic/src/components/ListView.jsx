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
            'tasks': [],
            'stories': [],
            'statuses': [],
            'listViewArray': []
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

       this.getStatuses().then(() => {
           this.getUserStoriesForSprint().then(() => {
                this.getStoryTasks().then((tasks) => {
                    console.log("Tasks is: ", tasks)
                })
           })
       })
    }

    getUserStoriesForSprint() {
        return new Promise(function(resolve, reject) {
            const token = 'Bearer ' + this.state.token;
            const sprintId = this.state.sprintId;
            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token;

            axios.get(`${BASE_URL}/sprints/${sprintId}/stories`)
                .then((data) => {
                    console.log(data.data[0].stories);
                    this.setState({stories: data.data[0].stories, listViewArray: data.data[0].stories})
                    console.log('listviewarr', this.state.listViewArray);
                    resolve()
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                }) 
        }.bind(this))
    }

    getStatuses() {
        const token = 'Bearer ' + this.state.token;

        return new Promise(function(resolve, reject) {
            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token;

            axios.get(`${BASE_URL}/statuses`)
                .then((data) => {
                    this.setState({statuses: data.data})
                    console.log('statuses', this.state.statuses);
                    resolve()
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                }) 
            }.bind(this))
    }

    getStoryTasks() {
        return new Promise(function(resolve, reject) {
            let stories = JSON.parse(JSON.stringify(this.state.stories))
            let tasks = []

            let promises = []

            stories.forEach((story, i) => {
                promises.push(
                    this.getTasksForStory(story, i).then(function(taskArray) {
                        if(taskArray) {
                            tasks.push(taskArray)
                        }
                    })                    
                )
            })

            Promise.all(promises).then(function() {
                resolve(tasks)
            })
        }.bind(this))
    }

    getTasksForStory(story, i) {
        const token = 'Bearer ' + this.state.token;

        return new Promise(function(resolve, reject) {
            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token;

            let tasksForStory = { tasks: [] }
            var self = this

            axios.get(`${BASE_URL}/stories/${story.id}/tasks`)
                .then((data) => {
                    

                    let tasks = data.data[0].tasks 
                    let promises = []

                    if(tasks.length === 0) {
                        resolve() 
                    }

                    tasks.forEach(function(task) {
                        promises.push(new Promise(function(resolve, reject) {
                            let taskObj = { users: [], status: null }

                            Promise.all([
                                self.getUsersForTask(task.id).then((users) => {
                                    if(users.length > 0) {
                                        taskObj.users = users
                                    }
                                    resolve()
                                }),
                                self.getTaskStatus(task.status_id).then((status) => {
                                    if(status) {
                                        taskObj.status = status
                                    }
                                    resolve()
                                })                                 
                            ]).then(function() {
                                tasksForStory.tasks.push(taskObj)
                                resolve()
                            })
                        }))
                      
                        Promise.all(promises).then(function() {
                            resolve(tasksForStory)
                        })
                    })
                })
                .catch((error) => {
                    console.log("Error: ", error)
                    reject(error)
                }) 
        }.bind(this))
    }

    getUsersForTask(taskId) {
        const token = 'Bearer ' + this.state.token;

        return new Promise(function(resolve, reject) {
            if(!taskId) {
                reject()
            }

            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token;

            axios.get(`${BASE_URL}/tasks/${taskId}/users`)
                .then((data) => {
                   resolve(data.data[0].users)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                }) 
        }.bind(this))
    }

    getTaskStatus(statusId) {
        return new Promise(function(resolve, reject) {
            if(!statusId) {
                reject()
            }

            const token = 'Bearer ' + this.state.token;

            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token;

            axios.get(`${BASE_URL}/statuses/${statusId}}`)
                .then((data) => {
                    return resolve(data.data.name)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                }) 
            
            
        }.bind(this))
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
                            <li><a href="/board">Board View</a></li>
                            <li><a href="/chart">Chart</a></li>
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
                                {/*{this.renderStories()}*/}
                        </Table>
                    </div>
                    <div className="col s2" />
                </div>
            </div>
        )
    }
}

export default ListView;