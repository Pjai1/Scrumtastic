import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link, browserHistory } from 'react-router';
import { Dropdown, Button, NavItem, Col, Card, Tabs, Tab, Row, Input } from 'react-materialize';
import logo from '../images/scrumtastic_logo_white.png';
import axios from 'axios';
import { BASE_URL } from '../constants';
import moment from 'moment';
import '../App.css';

class SprintView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            'userId': '',
            'email': '',
            'token': '',
            'projectId': '',
            'sprints': [],
            'features': [],
            'stories': [],
            'backlogStories': [],
            'sprintStartDate': '',
            'sprintEndDate': '',
            'storyDesc': '',
            'userStoryCheck': false,
            'selectValue': '',
            'sprintId': ''
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

            }) 
    }

    saveStoriesToStorage() {
        localStorage.setItem('stories', this.state.stories);
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
                    browserHistory.push('/signin')
                }
            })
            .catch((error) => {

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

            })        
    }

    handleChange(storyId, sprintId) {
        this.addStoryToSprint(storyId, sprintId);
    }

    goToTasks(sprintId) {
        localStorage.setItem('sprintId', sprintId);
        browserHistory.push('/list');
    }

    renderSprints() {
        const sprints = this.state.sprints;
        const stories = this.state.stories;

        return (
            <div className="row">
                <Tabs className='tab-demo z-depth-1'>
                {
                    sprints.map(sprint => {
                        return (
                            <Tab key={sprint.id} title={sprint.name} onClick={event => this.setState({'sprintId': sprint.id})} >
                                <h3>{moment(sprint.start_date).format("MMM Do YY")} - {moment(sprint.end_date).format("MMM Do YY")}</h3>
                                {
                                    stories.map(story => {
                                        if(story.pivot.sprint_id === sprint.id) {
                                            return (
                                                <ul key={story.id} className="collection with-header">
                                                {
                                                    <li key={story.id} className="collection-item">
                                                        <b>User Story:</b> {story.description}
                                                    </li>
                                                }
                                                </ul>
                                            )
                                        }
                                    
                                    })
                                }

                                { !this.state.userStoryCheck ?

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
                                /> :

                                    <Dropdown trigger={
                                        <Button defaultValue={this.state.selectValue} onChange={this.handleChange}>Select User Story</Button>
                                        }>
                                        {this.createStorySelect(stories, sprint.id)}
                                    </Dropdown>

                                }

                                <p>
                                <input type="checkbox" className="filled-in" id="filled-in-box" onClick={this.handleCheck.bind(this)} />
                                    <label htmlFor="filled-in-box">Check to select a User Story</label>
                                </p>
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
                    <a className="brand-logo" href="/"><img className="nav-logo" src={logo}/></a>
                        <ul id="nav-mobile" className="left hide-on-med-and-down" style={{paddingLeft: '180px'}}>
                            <li><a href="/">Projects</a></li>
                            <li><a href="/projects">Backlog</a></li>
                            <li><a onClick={this.saveStoriesToStorage.bind(this)} href="/board">Tasks</a></li>
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
                    </div>
                    <div className="col s2" />
                </div>
            </div>
        )
    }
}

export default SprintView;