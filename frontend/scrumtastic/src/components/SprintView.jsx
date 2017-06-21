import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Dropdown, Button, NavItem, Tabs, Tab, Row, Input } from 'react-materialize';
import logo from '../images/scrumtastic_logo_white.png';
import axios from 'axios';
import { BASE_URL } from '../constants';
import moment from 'moment';
import Toast from './Toast';
import '../App.css';

class SprintView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            'userId': '',
            'email': '',
            'userEmail': '',
            'token': '',
            'projectId': '',
            'users': [],
            'sprints': [],
            'features': [],
            'stories': [],
            'backlogStories': [],
            'sprintStartDate': '',
            'sprintEndDate': '',
            'storyDesc': '',
            'userStoryCheck': false,
            'selectValue': '',
            'sprintId': '',
            'error': []
        }
    }

    componentWillMount() {
       let email = localStorage.getItem('email');
       let token = localStorage.getItem('token');
       let userId = localStorage.getItem('userId');
       let projectId = localStorage.getItem('projectId');
       let projectName = localStorage.getItem('projectName');
       let stories = localStorage.getItem('stories');
       this.setState({'token': token, 'userId': userId, 'projectId': projectId, 'projectName': projectName, 'email': email, 'backlogStories': stories});

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
        axios.get(`${BASE_URL}/projects/${projectId}/users`)
            .then((data) => {
                console.log('all users', data.data[0].users);
                this.setState({'users': data.data[0].users})
            })
            .catch((error) => {
                this.setState({error});
            }) 
    }

    componentDidMount() {
        const token = 'Bearer ' + this.state.token
        const projectId = this.state.projectId;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.get(`${BASE_URL}/projects/${projectId}/sprints`)
            .then((data) => {
                let projectSprints = [];
                data.data[0].sprints.forEach((sprint) => {
                    projectSprints.push(sprint);
                })
                this.setState({'sprints': projectSprints});
                this.getStories(projectSprints);
            })
            .catch((error) => {
                this.setState({error});
            }) 
    }

    saveStoriesToStorage() {
        localStorage.setItem('stories', this.state.stories);
    }

    renderUsers() {

        return (
            <ul class="collection">
            {
            this.state.users.map(user => {
                    return (
                        <li key={user.id} class="collection-item"><b>User: </b>{user.email}</li>
                    )  
            })
            }
            </ul>
        )
    }

    getStories(projectSprints) {
        const token = 'Bearer ' + this.state.token;
        let stateStories = [];

        projectSprints.forEach(sprint => {
            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token
            axios.get(BASE_URL + '/sprints/' + sprint.id + '/stories')
                .then((data) => {

                    let sprintStories = [];
                    data.data[0].stories.forEach((story) => {
                        sprintStories.push(story);
                    })
                    sprintStories.forEach(story => {
                        stateStories.push(story);
                    })
                    this.setState({'stories': stateStories});

                    if(this.state.backlogStories === null) {
                        this.getBacklogStories();
                    }
                })
                .catch((error) => {
                    this.setState({error});
                }) 
        })
    }

    getBacklogStories() {
        const token = 'Bearer ' + this.state.token
        const projectId = this.state.projectId;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token

        axios.get(`${BASE_URL}/projects/${projectId}/stories`)
            .then((data) => {
                let projectStories = [];
                data.data[0].stories.forEach((story) => {
                    projectStories.push(story);
                })
                this.setState({'backlogStories': projectStories});
            })
            .catch((error) => {
                this.setState({error});
            }) 
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
                this.setState({error});
            }) 
    }

    addSprint() {
        const token = 'Bearer ' + this.state.token;
        let sprints = this.state.sprints;
        let startDate = moment(this.state.sprintStartDate).format();
        let endDate = moment(this.state.sprintEndDate).format();

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.post(`${BASE_URL}/sprints`, {
            'project_id': this.state.projectId,
            'start_date': startDate,
            'end_date': endDate
        })
            .then((data) => {
                sprints.push(data.data)
                this.setState({sprints: sprints});
            })
            .catch((error) => {
                this.setState({error});
            })         
    }

    createStory(sprintId) {
        let stories = this.state.stories;

        const token = 'Bearer ' + this.state.token;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.post(`${BASE_URL}/sprintstories`, {
            'description': this.state.storyDesc,
            'sprint_id': sprintId,
            'project_id': this.state.projectId
        })
            .then((data) => {
                data.data.pivot = { 'sprint_id': sprintId, 'story_id': data.data.id};
                stories.push(data.data);
                this.setState({'stories': stories});
                this.forceUpdate();
            })
            .catch((error) => {
                this.setState({error});
            }) 
    }

    handleCheck() {
        this.setState({'userStoryCheck': !this.state.userStoryCheck});
    }

    createStorySelect(stories, sprintId) {
        
        let items = [];
        for(let i = 0; i < stories.length; i++) {
            items.push(<NavItem key={i} value={stories[i].description} onClick={this.handleChange.bind(this, stories[i].id, sprintId)}>{stories[i].description}</NavItem>);
        }

        return items;
    }
    
    addStoryToSprint(storyId, sprintId) {
        const token = 'Bearer ' + this.state.token;
        let stories = this.state.stories;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.post(`${BASE_URL}/storestorypivot`, {
            'sprint_id': sprintId,
            'story_id': storyId
        })
            .then((data) => {
                data.data.pivot = { 'sprint_id': sprintId, 'story_id': data.data.id};
                stories.push(data.data);
                this.setState({'stories': stories});
                this.forceUpdate();
            })
            .catch((error) => {
                this.setState({error});
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

    handleChange(storyId, sprintId) {
        this.addStoryToSprint(storyId, sprintId);
    }

    goToTasks(sprintId) {
        localStorage.setItem('sprintId', sprintId);
        browserHistory.push('/list');
    }

    addUser() {
        const token = 'Bearer ' + this.state.token;
        let users = this.state.users;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.post(`${BASE_URL}/attachuser`, {
            'email': this.state.userEmail,
            'project_id': this.state.projectId
        })
            .then((data) => {
                users.push(data.data[0]);
                this.setState({users: users})
                let t = new Toast(this.state.userEmail + " added to project!", 2500)
                t.Render(); 
            })
            .catch((error) => {
                this.setState({error});
            })   
    }

    sprintIdToStorage(sprintId) {
        this.setState({sprintId: sprintId})
        console.log(this.state.sprintId);
    }

    renderSprints() {
        const sprints = this.state.sprints;
        const stories = this.state.stories;

        return (
            <div className="row">
                {this.state.sprints.length === 0 ? <p style={{marginLeft: '10px'}} className="toast-message waves-effect waves-light teal lighten-2">Seems like you need to add some sprints</p> : null }
                <Tabs className='tab-demo z-depth-1'>
                {
                    sprints.map(sprint => {
                        return (
                            <Tab key={sprint.id} title={sprint.name} onClick={this.sprintIdToStorage.bind(this, sprint.id)} >
                                {console.log(this.state.sprintId)}
                                <h3>{moment(sprint.start_date).format("MMM Do YY")} - {moment(sprint.end_date).format("MMM Do YY")}</h3>
                                {
                                    stories.map((story, key) => {
                                        if(story.pivot.sprint_id === sprint.id) {
                                            return (
                                                <ul key={key} className="collection with-header">
                                                {
                                                    <li key={key+1} className="collection-item">
                                                        <b>User Story:</b> {story.description}
                                                    </li>
                                                }
                                                </ul>
                                            )
                                        }
                                    
                                    })
                                }

                                { !this.state.userStoryCheck ?
                                    <div>
                                    <input 
                                        className="validate"
                                        type="text"
                                        placeholder="Add Your User Story"
                                        onChange={event => this.setState({storyDesc:event.target.value})}
                                        onKeyPress={event => {
                                        if(event.key === "Enter") {
                                                this.createStory(sprint.id);
                                            }
                                        }}
                                    />
                                    <p>
                                        <input type="checkbox" className="filled-in" id="filled-in-box" onClick={this.handleCheck.bind(this)} />
                                            <label htmlFor="filled-in-box">Check to select a User Story</label>
                                    </p>
                                </div>
                                 :
                                 <div>
                                    <Dropdown trigger={
                                        <Button defaultValue={this.state.selectValue} onChange={this.handleChange}>Select User Story</Button>
                                        }>
                                        {this.createStorySelect(stories, sprint.id)}
                                    </Dropdown>
                                    <p>
                                    <input type="checkbox" className="filled-in" id="filled-in-box" onClick={this.handleCheck.bind(this)} />
                                        <label htmlFor="filled-in-box">Check to manually add a User Story</label>
                                    </p>
                                </div>
                                }
                                <a 
                                    className="waves-effect waves-light btn-large"
                                    onClick={() => this.goToTasks(sprint.id)}
                                >
                                Go To Sprint Board
                                </a>
                            </Tab>
                        )
                    })
                    
                }
                </Tabs>
            </div>
        )
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
                            <li><a onClick={this.saveStoriesToStorage.bind(this)} href="/list">Tasks</a></li>
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
                    <div className="col s2" />
                    <div className="col s8">
                        <h2 style={{color: '#26a69a'}}>{this.state.projectName}: Sprints</h2>
                        {this.renderSprints()}
                        <div className="row">
                            { this.renderErrors() }
                        </div>
                        <h2 style={{color: '#26a69a'}}>Add Sprints</h2>
                        <div className="row">
                            <Row>
                                <Input style={{width: '175px'}} name='on' type='date' placeholder="Start Date" onChange={event => this.setState({sprintStartDate:event.target.value})} />
                                <Input style={{width: '175px'}} name='on' type='date' placeholder="End Date" onChange={event => this.setState({sprintEndDate:event.target.value})} />
                                <a 
                                    className="btn-floating btn-large waves-effect waves-light"
                                    onClick={() => this.addSprint()}
                                >
                                    Add Sprint
                                </a>
                            </Row>
                        </div>
                        <h2 style={{color: '#26a69a'}}>Add Users</h2>
                        <div className="row">
                            {this.renderUsers()}
                            <div className="input-field inline col s4">
                                <input 
                                    className="validate"
                                    id="user"
                                    type="email"
                                    defaultValue=""
                                    onChange={event => this.setState({userEmail:event.target.value})}
                                    onKeyPress={event => {
                                    if(event.key === "Enter") {
                                            this.addUser();
                                        }
                                    }}
                                />
                                <label htmlFor="user">Enter User Email</label>
                            </div>
                        </div>
                    </div>
                    <div className="col s2" />
                </div>
            </div>
        )
    }
}

export default SprintView;