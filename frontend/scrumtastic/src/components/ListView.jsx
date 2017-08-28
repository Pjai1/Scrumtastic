import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Dropdown, Button, NavItem, Table, Icon } from 'react-materialize';
import logo from '../images/scrumtastic_logo_white.png';
import axios from 'axios';
import { BASE_URL } from '../constants';
import Toast from './Toast';
import '../App.css';
import ReactConfirmAlert, { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Spinner from 'react-spinkit';

class ListView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            'userId': '',
            'statusId': '',
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
            'renderArray': null,
            'maxStorypoints': '',
            'dailyStorypoints': '',
            'taskName': '',
            'selectedStatus': ''

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
       let t = new Toast("Content being loaded in, hold on!", 3000)
       t.Render(); 
       this.getStatuses().then(() => {
           this.getUserStoriesForSprint().then(() => {
                this.getStoryTasks().then((tasks) => {
                    this.setState({renderArray: tasks})
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
                    this.setState({stories: data.data[0].stories})
                    resolve()
                })
                .catch((error) => {
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

            let tasksForStory = 
                {
                    "story": story,
                    "tasks": []
                }

            let taskObject = {
                        "id": null,
                        "name": null,
                        "total_storypoints": null,
                        "remaining_storypoints": null,
                        "users": [
                        ],
                        "status": null
                    }

            var self = this

            axios.get(`${BASE_URL}/stories/${story.id}/tasks`)
                .then((data) => {
                    let tasks = data.data[0].tasks
                    let promises = []

                    if(tasks.length === 0) {
                        resolve({ tasks: [], status: null, story: story }) 
                    }

                    tasks.forEach((task, i) => {
                        let nextObj = JSON.parse(JSON.stringify(taskObject))
                        promises.push(new Promise(function(resolve, reject) {
                            Promise.all([
                                self.getUsersForTask(task.id).then((users) => {
                                    if(users.length > 0) {
                                        nextObj.users = users;
                                    }
                                    resolve()
                                }),
                                self.getTaskStatus(task.status_id).then((status) => {
                                    if(status) {
                                        nextObj.status = status;
                                    }
                                    resolve()
                                })                                 
                            ]).then(function() {
                                nextObj.id = task.id;
                                nextObj.name = task.name;
                                nextObj.total_storypoints = task.total_storypoints;
                                nextObj.remaining_storypoints = task.remaining_storypoints;
                                tasksForStory.tasks.push(nextObj)
                                resolve()
                            })
                        }))
                    })

                    Promise.all(promises).then(function() {
                        resolve(tasksForStory)
                    })
                })
                .catch((error) => {
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
                    resolve()
                })
                .catch((error) => {
                    reject(error)
                }) 
            }.bind(this))
    }

    createTask(storyId) {
        const token = 'Bearer ' + this.state.token;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token;
        let selectValue = null;

        if(this.state.selectedStatus == "Unassigned") {
            selectValue = 1;
        }

        if(this.state.selectedStatus == "To Do") {
            selectValue = 2;
        }

        if(this.state.selectedStatus == "In Progress") {
            selectValue = 3;
        }

        if(this.state.selectedStatus == "Completed") {
            selectValue = 4;
        }
        axios.post(`${BASE_URL}/tasks`, {
            'sprint_id': this.state.sprintId,
            'status_id': selectValue,
            'name': this.state.taskName,
            'total_storypoints': this.state.maxStorypoints,
            'story_id': storyId
        })
            .then((data) => {

                let t = new Toast("Task Added!", 2500)
                t.Render(); 
            })
            .catch((error) => {

            }) 
    }

    statusSelect() {
        const statuses = this.state.statuses;
        let items = [];
        for(let i = 0; i < statuses.length; i++) {
            items.push(<NavItem key={i} value={statuses[i].name} onClick={this.handleChange.bind(this, statuses[i].name)}>{statuses[i].name}</NavItem>);
        }

        return items;
    }

    handleChange(selectedValue) {
        this.setState({selectedStatus: selectedValue})
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
        const renderArray = this.state.renderArray;

        if(renderArray) {
            return (
                <tbody>
                    {
                        renderArray.map((story, key) => {
                            return (
                                <tr key={key}>
                                    <td className="story-description">
                                        {story.story.description}
                                    </td>
                                    <td> 
                                        {   
                                            story.tasks.length === 0 ? 
                                            <div className="col s9">
                                                <div className="input-field inline col s6">
                                                    <input 
                                                        className="validate"
                                                        id="task"
                                                        type="text"
                                                        defaultValue=""
                                                        onChange={event => this.setState({taskName:event.target.value})}
                                                        onKeyPress={event => {
                                                        if(event.key === "Enter") {
                                                                this.createTask(story.story.id);
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="task">Task</label> 
                                                </div>
                                                <div className="input-field inline col s3">
                                                    <input 
                                                        className="validate"
                                                        id="storypoints"
                                                        type="text"
                                                        defaultValue=""
                                                        onChange={event => this.setState({maxStorypoints:event.target.value})}
                                                        onKeyPress={event => {
                                                        if(event.key === "Enter") {
                                                                this.createTask(story.story.id);
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="storypoints">Storypoints</label> 
                                                </div>
                                            </div>
                                            : story.tasks.map((task, key) => {
                                                return (
                                                    <div style={{marginBottom: '30px'}} key={key}><b>{task.name}:</b> {task.users.map((user, key) => {
                                                            return (
                                                                <p key={key}><em>{user.name}</em></p>
                                                            )
                                                        })}</div>
                                                )
                                            })
                                        }
                                    </td>
                                    <td>
                                        {   
                                            story.tasks.length === 0 ? 
                                            <div>
                                            <Dropdown trigger={<Button>Select Status</Button>}>
                                                {this.statusSelect()}
                                            </Dropdown>
                                            <br /><b style={{textAlign: 'center', paddingTop: '5px'}}>{this.state.selectedStatus}</b>
                                            </div>
                                            : story.tasks.map((task, key) => {
                                                return (
                                                    <div className="task-status" key={key}>{task.status}</div>
                                                )
                                            })
                                        }
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            )
        } else {
                return (
                <div className="row">
                <div className="col s12">
                    <Spinner style={{marginLeft: '40px', marginTop: '40px'}} name="ball-spin-fade-loader" /><br /><p>Molding data ...</p>
                </div>
                </div>
            )
        }
    }

    goToChart() {

        browserHistory.push('/chart');
    }

    render() {
        return (
            <div>
                <nav className="teal lighten-3">
                    <div className="nav-wrapper">
                    <a className="brand-logo" href="/"><img className="nav-logo" src={logo} alt="logo"/></a>
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
                                <NavItem onClick={this.logOut.bind(this)}><span><span id="nav-icon"><Icon large>input</Icon></span><span style={{position: 'relative', fontSize: '2.5rem', top: '15px', left: '10px', float: 'left'}}>Log Out</span></span></NavItem>
                                <NavItem divider />
                            </Dropdown>
                        </ul>
                    </div>
                </nav>
                <div className="row">
                    <div className="col s12"> 
                        <h2 style={{color: '#26a69a'}}>{this.state.projectName}: List View</h2><a 
                                    className="waves-effect waves-light btn-large"
                                    onClick={() => this.goToChart()}
                                >
                                Go To Burndown
                                </a>
                        <Table className="striped">
                            <thead>
                                <tr>
                                    <th data-field="story">User Story</th>
                                    <th data-field="tasks">Tasks + User(s)</th>
                                    <th data-field="status">Status</th>
                                </tr>
                            </thead>
                                {this.renderStories()}
                        </Table>
                    </div>
                </div>
            </div>
        )
    }
}

export default ListView;