import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link, browserHistory } from 'react-router';
import { Dropdown, Button, NavItem, Col, Card } from 'react-materialize';
import axios from 'axios';
import { BASE_URL } from '../constants';
import '../App.css';

class ProjectView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            'userId': '',
            'email': '',
            'token': '',
            'projectId': '',
            'projectName': '',
            'featureName': '',
            'features': [],
            'stories': [],
            'storyDesc': '',
            'newStoryDesc': '',
            'storyEditingMode': false,
            'clickedStory': null,
            'featureEditingMode': false,
            'clickedFeature': null,
        }
    }

    componentWillMount() {
        
       let email = localStorage.getItem('email');
       let token = localStorage.getItem('token');
       let userId = localStorage.getItem('userId');
       let projectId = localStorage.getItem('projectId');
       let projectName = localStorage.getItem('projectName');
       this.setState({'email': email, 'token': token, 'userId': userId, 'projectId': projectId, 'projectName': projectName});
    }

    componentDidMount() {
        console.log(this.state.token, this.state.userId)
        const token = 'Bearer ' + this.state.token
        let projectFeatures = [];

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.get(BASE_URL + '/projects/' + this.state.projectId + '/features')
            .then((data) => {
                let projectFeatures = [];
                console.log('features', data.data[0].features);
                data.data[0].features.forEach((feature) => {
                    projectFeatures.push(feature);
                })
                console.log('features', projectFeatures);
                this.setState({'features': projectFeatures});
                this.getStories(projectFeatures);
            })
            .catch((error) => {
                console.log(error)
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

    getStories(projectFeatures) {
        const token = 'Bearer ' + this.state.token;
        let stateStories = this.state.stories;
        console.log('state stories', stateStories);

        projectFeatures.forEach(feature => {
            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token
            axios.get(BASE_URL + '/features/' + feature.id + '/stories')
                .then((data) => {
                    console.log('features', data.data[0].stories);
                    let featureStories = [];
                    data.data[0].stories.forEach((story) => {
                        featureStories.push(story);
                    })
                    featureStories.forEach(story => {
                        console.log('story of feature story', story)
                        stateStories.push(story);
                    })
                    console.log('stories', stateStories);
                    this.setState({'stories': stateStories});
                })
                .catch((error) => {
                    console.log(error)
                }) 
        })
    }

    createStory(featureId) {
        let stories = this.state.stories;

        const token = 'Bearer ' + this.state.token;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.post(`${BASE_URL}/stories`, {
            'description': this.state.storyDesc,
            'feature_id': featureId
        })
            .then((data) => {
                console.log('story data test', data);
                stories.push(data.data);
                this.setState({'storyDesc': ''});
                this.setState({'stories': stories});
                console.log('state of stories when story is added', this.state.stories)
            })
            .catch((error) => {
                console.log(error)
            }) 
    }
    
    deleteStory(storyId) {
        let stories = this.state.stories;
        const token = 'Bearer ' + this.state.token;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.delete(`${BASE_URL}/stories/${storyId}`)
            .then((data) => {
                console.log('story data delete', data);
                this.searchAndDeleteStoryFromState(storyId, stories);
            })
            .catch((error) => {
                console.log(error)
            }) 
    }

    searchAndDeleteStoryFromState(keyName, array) {
        console.log(keyName, array);
        for (var i=0; i < array.length; i++) {
            if (array[i].id === keyName) {
                delete array[i]
                this.setState({'stories': array});
            }
        }    
    }

    editStory(storyId, storyDescription, featureId) {
        console.log('storytime', storyId);

        if(this.state.storyEditingMode === true) {
            const token = 'Bearer ' + this.state.token;
            let newStoryDesc = this.state.newStoryDesc;
            let stories = this.state.stories;

            if(this.state.storyDesc) {
                newStoryDesc = this.state.storyDesc
                console.log('newStoryDesc', newStoryDesc)
            }

            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token
            axios.put(`${BASE_URL}/stories/${storyId}`, {
                'description': newStoryDesc,
                'feature_id': featureId
            })
                .then((data) => {
                    console.log('update story', data)
                    for (var i=0; i < stories.length; i++) {
                        if (stories[i].id === storyId) {
                            stories[i].description = newStoryDesc;
                            this.setState({'storyDesc': ''});
                            this.setState({'stories': stories});
                        }
                    }  
                })
                .catch((error) => {
                    console.log(error)
                }) 
        } 
        else {
            this.setState({'newStoryDesc': storyDescription});
            console.log(storyDescription);
        }

        if(storyId) {
            console.log('storyId changed', storyId);
            this.setState({'clickedStory': storyId});
        }
        this.setState({'storyEditingMode': !this.state.storyEditingMode});
    }

    createFeature() {
        let features = this.state.features;
        const token = 'Bearer ' + this.state.token;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.post(`${BASE_URL}/features`, {
            'project_id': this.state.projectId,
            'name': this.state.featureName
        })
            .then((data) => {
                console.log('featureAdd', data);
                features.push(data.data);
                this.setState({'features': features});
            })
            .catch((error) => {
                console.log(error)
            }) 
    }


    renderFeatures() {
        const features = this.state.features;
        const stories = this.state.stories;
        console.log('feature view', features);
        return (
            <div className="row">
                {
                    features.map((feature) => {
                        console.log('does this execute: feature render');
                        return (
                            <ul key={feature.id} className="collection with-header">
                                <li className="collection-header"><h4>Feature: {feature.name}</h4></li>
                                {
                                    stories.map((story) => {
                                        if(story.feature_id === feature.id) {
                                            console.log('does this execute: story render');
                                            return (
                                                <li key={story.id} className="collection-item">
                                                {
                                                    (!this.state.storyEditingMode && (this.state.clickedStory === null)) || (!this.state.storyEditingMode && (this.state.clickedStory === story.id)) || (!this.state.storyEditingMode && (this.state.clickedStory !== story.id)) || (this.state.storyEditingMode && (this.state.clickedStory !== story.id)) ?
                                                    <div>
                                                        User Story: {story.description}
                                                        <a onClick={() => {this.deleteStory(story.id)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: 'black', float: 'right'}}>delete_forever</i></a>
                                                        <a onClick={() => {this.editStory(story.id, story.description)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: 'black', float: 'right'}}>mode_edit</i></a>
                                                    </div> : 
                                                    <div className="row">
                                                        <div className="input-field col s8">
                                                            <input 
                                                                type="text"
                                                                placeholder={story.description}
                                                                onChange={event => this.setState({storyDesc:event.target.value})}
                                                                onKeyPress={event => {
                                                                if(event.key === "Enter") {
                                                                        this.editStory(story.id, null, feature.id);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <a onClick={() => {this.editStory(story.id, null, feature.id)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: 'black', float: 'right'}}>mode_edit</i></a>
                                                    </div>
                                                }
                                                </li>
                                            )
                                        }
                                    })
                                }
                                <li className="collection-item">
                                    <div className="input-field inline col s6">
                                        <input 
                                            className="validate"
                                            id="story"
                                            type="text"
                                            defaultValue=""
                                            onChange={event => this.setState({storyDesc:event.target.value})}
                                            onKeyPress={event => {
                                            if(event.key === "Enter") {
                                                    this.createStory(feature.id);
                                                }
                                            }}
                                        />
                                        <label htmlFor="story">User Story</label>
                                    </div>
                                </li>
                            </ul>
                        )
                        
                    })
                }
                <div className="row">
                    <ul className="collection with-header">
                        <li className="collection-header"><h4>Feature: ...
                            <div className="row">
                                <div className="input-field col s6">
                                    <input 
                                        className="validate"
                                        type="text"
                                        placeholder="Your feature name"
                                        onChange={event => this.setState({featureName:event.target.value})}
                                        onKeyPress={event => {
                                        if(event.key === "Enter") {
                                                this.createFeature();
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </h4></li>
                    </ul>
                </div>
                <div className="row center-align">    
                    <a 
                        className="waves-effect waves-light btn-large"
                        onClick={() => this.addFeature()}
                    >
                        Add Sprint
                    </a>
                </div>
            </div>
        )

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
                    </div>
                </nav>
                <div className="row">
                    <div className="col s2" />
                    <div className="col s8">
                        <h2 style={{color: '#26a69a'}}>Project Backlog: {this.state.projectName}</h2>
                            {this.renderFeatures()}
                    </div>
                    <div className="col s2" />
                </div>
            </div>
        )
    }
}

export default ProjectView;