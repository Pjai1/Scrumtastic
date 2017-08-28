import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Dropdown, Button, NavItem, Icon } from 'react-materialize';
import logo from '../images/scrumtastic_logo_white.png';
import Toast from './Toast';
import axios from 'axios';
import { BASE_URL } from '../constants';
import '../App.css';
import ReactConfirmAlert, { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

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
            'featureName': '',
            'newFeatureName': '',
            'storyEditingMode': false,
            'clickedStory': null,
            'featureEditingMode': false,
            'clickedFeature': null,
            'error': []
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
        const token = 'Bearer ' + this.state.token
        let projectFeatures = [];

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.get(BASE_URL + '/projects/' + this.state.projectId + '/features')
            .then((data) => {
                let projectFeatures = [];
                data.data[0].features.forEach((feature) => {
                    projectFeatures.push(feature);
                })
                this.setState({'features': projectFeatures});
                this.getStories(projectFeatures);
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

    confirmFeature(featureId) {
        confirmAlert({                   
            message: 'Are you sure you want to delete this feature?',              
            confirmLabel: 'Delete',                        
            cancelLabel: 'Cancel',                           
            onConfirm: () => this.deleteFeature(featureId)
          })
    }

    confirmStory(storyId) {
        confirmAlert({                   
            message: 'Are you sure you want to delete this story?',              
            confirmLabel: 'Delete',                        
            cancelLabel: 'Cancel',                           
            onConfirm: () => this.deleteStory(storyId)
          })
    }


    getStories(projectFeatures) {
        const token = 'Bearer ' + this.state.token;
        let stateStories = this.state.stories;

        projectFeatures.forEach(feature => {
            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token
            axios.get(BASE_URL + '/features/' + feature.id + '/stories')
                .then((data) => {

                    let featureStories = [];
                    data.data[0].stories.forEach((story) => {
                        featureStories.push(story);
                    })
                    featureStories.forEach(story => {
                        stateStories.push(story);
                    })
                    this.setState({'stories': stateStories});
                })
                .catch((error) => {
                    this.setState({error});
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
            'feature_id': featureId,
            'project_id': this.state.projectId
        })
            .then((data) => {
                stories.push(data.data);
                this.setState({'storyDesc': ''});
                this.setState({'stories': stories});
            })
            .catch((error) => {
                this.setState({error});
            }) 
    }
    
    deleteStory(storyId) {
        let stories = this.state.stories;
        const token = 'Bearer ' + this.state.token;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.delete(`${BASE_URL}/stories/${storyId}`)
            .then((data) => {
                this.searchAndDeleteStoryFromState(storyId, stories);
            })
            .catch((error) => {
                this.setState({error});
            }) 
    }

    searchAndDeleteStoryFromState(keyName, array) {
        for (var i=0; i < array.length; i++) {
            if (array[i].id === keyName) {
                delete array[i]
                this.setState({'stories': array});
                let t = new Toast("Succesfully deleted story!", 2500)
                t.Render(); 
            }
        }    
    }

    searchAndDeleteFeatureFromState(keyName, array) {
        for (var i=0; i < array.length; i++) {
            if (array[i].id === keyName) {
                delete array[i]
                this.setState({'features': array});
                let t = new Toast("Succesfully deleted feature!", 2500)
                t.Render(); 
            }
        }    
    }

    editStory(storyId, storyDescription, featureId) {

        if(this.state.storyEditingMode === true) {
            const token = 'Bearer ' + this.state.token;
            let newStoryDesc = this.state.newStoryDesc;
            let stories = this.state.stories;

            if(this.state.storyDesc) {
                newStoryDesc = this.state.storyDesc
            }

            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token
            axios.put(`${BASE_URL}/stories/${storyId}`, {
                'description': newStoryDesc,
                'feature_id': featureId
            })
                .then((data) => {
                    for (var i=0; i < stories.length; i++) {
                        if (stories[i].id === storyId) {
                            stories[i].description = newStoryDesc;
                            this.setState({'storyDesc': ''});
                            this.setState({'stories': stories});
                        }
                    }  
                })
                .catch((error) => {
                    this.setState({error});
                }) 
        } 
        else {
            this.setState({'newStoryDesc': storyDescription});
        }

        if(storyId) {
            this.setState({'clickedStory': storyId});
        }
        this.setState({'storyEditingMode': !this.state.storyEditingMode});
    }

    editFeature(featureId, featureName) {
        const projectId = this.state.projectId;

        if(this.state.featureEditingMode === true) {
            const token = 'Bearer ' + this.state.token;
            let newFeatureName = this.state.newFeatureName;
            let features = this.state.features;

            if(this.state.featureName) {
                newFeatureName = this.state.featureName
            }

            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token
            axios.put(`${BASE_URL}/features/${featureId}`, {
                'name': newFeatureName,
                'project_id': projectId
            })
                .then((data) => {
                    for (var i=0; i < features.length; i++) {
                        if (features[i].id === featureId) {
                            features[i].name = newFeatureName;
                            this.setState({'featureName': ''});
                            this.setState({'features': features});
                        }
                    }  
                })
                .catch((error) => {
                    this.setState({error});
                }) 
        } 
        else {
            this.setState({'newFeatureName': featureName});
        }

        if(featureId) {
            this.setState({'clickedFeature': featureId});
        }
        this.setState({'featureEditingMode': !this.state.featureEditingMode});
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
                features.push(data.data);
                this.setState({'features': features});
            })
            .catch((error) => {
                this.setState({error});
            }) 
    }

    addSprint() {
        const features = this.state.features;
        const stories = this.state.stories;

        localStorage.setItem('features', features);
        localStorage.setItem('stories', stories);
        browserHistory.push('/sprints');
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
        return <div className="center-align-error">{errors}</div>
    }

    deleteFeature(featureId) {
        let features = this.state.features;
        const token = 'Bearer ' + this.state.token;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.delete(`${BASE_URL}/features/${featureId}`)
            .then((data) => {
                this.searchAndDeleteFeatureFromState(featureId, features);
            })
            .catch((error) => {
                this.setState({error});
            }) 
    }

    renderFeatures() {
        const features = this.state.features;
        const stories = this.state.stories;

        localStorage.setItem('backlogStories', stories);
        return (
            <div className="row">
                {
                    features.map((feature) => {
                        return (
                            <ul key={feature.id} className="collection with-header">
                                {
                                (!this.state.featureEditingMode && (this.state.clickedFeature === null)) || (!this.state.featureEditingMode && (this.state.clickedFeature === feature.id)) || (!this.state.featureEditingMode && (this.state.clickedFeature !== feature.id)) || (this.state.featureEditingMode && (this.state.clickedFeature !== feature.id)) ?
                                <li className="collection-header"><h4><span><Icon small>featured_play_list</Icon></span>Feature: {feature.name}
                                    <a onClick={() => {this.confirmFeature(feature.id)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: '#a6262c', float: 'right'}}>delete_forever</i></a>
                                    <a onClick={() => {this.editFeature(feature.id, feature.name)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: '#2633a6', float: 'right'}}>mode_edit</i></a></h4>
                                </li>
                                    : 
                                <li className="collection-header">
                                    <div className="row">
                                        <div className="input-field col s8">
                                            <input 
                                                type="text"
                                                placeholder={feature.name}
                                                onChange={event => this.setState({featureName:event.target.value})}
                                                onKeyPress={event => {
                                                if(event.key === "Enter") {
                                                        this.editFeature(feature.id, null);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <a onClick={() => {this.editFeature(feature.id, null)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: '#2633a6', float: 'right'}}>mode_edit</i></a>
                                    </div>
                                </li>
                                }
                                {
                                    stories.map((story) => {
                                        if(story.feature_id === feature.id) {
                                            return (
                                                <li key={story.id} className="collection-item">
                                                {
                                                    (!this.state.storyEditingMode && (this.state.clickedStory === null)) || (!this.state.storyEditingMode && (this.state.clickedStory === story.id)) || (!this.state.storyEditingMode && (this.state.clickedStory !== story.id)) || (this.state.storyEditingMode && (this.state.clickedStory !== story.id)) ?
                                                    <div>
                                                        <div style={{float: 'left', position: 'relative', top: '-5px'}}><Icon small>label_outline</Icon></div><b>User Story:</b> {story.description}
                                                        <a onClick={() => {this.confirmStory(story.id)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: '#a6262c', float: 'right'}}>delete_forever</i></a>
                                                        <a onClick={() => {this.editStory(story.id, story.description)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: '#2633a6', float: 'right'}}>mode_edit</i></a>
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
                                                        <a onClick={() => {this.editStory(story.id, null, feature.id)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: '#2633a6', float: 'right'}}>mode_edit</i></a>
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
                        <li className="collection-header"><h4><span><Icon small>featured_play_list</Icon></span>Feature: ...
                            <div className="row">
                                <div className="input-field inline col s6" style={{marginTop: '2rem'}}>
                                    <input 
                                        className="validate"
                                        id="feature"
                                        type="text"
                                        onChange={event => this.setState({featureName:event.target.value})}
                                        onKeyPress={event => {
                                        if(event.key === "Enter") {
                                                this.createFeature();
                                            }
                                        }}
                                    />
                                    <label htmlFor="feature">Add Feature</label>
                                </div>
                            </div>
                        </h4></li>
                    </ul>
                </div>
                <div className="row">
                    { this.renderErrors() }
                </div>
                <div className="row center-align">    
                    <a 
                        className="waves-effect waves-light btn-large"
                        onClick={() => this.addSprint()}
                    >
                        Sprint View
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
                    <a className="brand-logo" href="/"><img className="nav-logo" src={logo}/></a>
                        <ul id="nav-mobile" className="left hide-on-med-and-down" style={{paddingLeft: '180px'}}>
                            <li><a href="/">Projects</a></li>
                            <li><a onClick={() => this.addSprint()}>Sprints</a></li>
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
                    <div className="col s2" />
                    <div className="col s8">
                        <h2 style={{color: '#26a69a'}}>{this.state.projectName}: Backlog</h2>
                            {this.renderFeatures()}
                    </div>
                    <div className="col s2" />
                </div>
            </div>
        )
    }
}

export default ProjectView;