import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import $ from 'jquery';
import { Dropdown, Button, NavItem, Col, Card, Icon, Modal } from 'react-materialize';
import logo from '../images/scrumtastic_logo_white.png';
import axios from 'axios';
import { BASE_URL } from '../constants';
import Toast from './Toast'
import '../App.css';
import ReactConfirmAlert, { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            'userId': '',
            'email': '',
            'token': '',
            'projects': [],
            'projectId': '',
            'editingMode': false,
            'name': null,
            'newName': '',
            'description': null,
            'newDesc': '',
            'showEditingMode': -1,
            'clickedProject': null,
            'error': [],
            'newProjectBool': false
        }
    }

    componentWillMount() {
        
       let email = localStorage.getItem('email');
       let token = localStorage.getItem('token');
       let userId = localStorage.getItem('userId');
       this.setState({'email': email, 'token': token, 'userId': userId});
    }

    componentDidMount() {
        const token = 'Bearer ' + this.state.token

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.get(BASE_URL + '/users/' + this.state.userId + '/projects')
            .then((data) => {
                let userProjects = [];
                data.data[0].projects.forEach((project) => {
                    userProjects.push(project);
                })
                this.setState({'projects': userProjects});
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
                    errors.push(<p className="errorMessage" key={"error_" + i}>{errorArray[key][0]}</p>);
                }
                i++;
            }
        }

        return <div id="errors" className="center-align-error">{errors}</div>
    }

    logOut() {
        const token = 'Bearer ' + this.state.token

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

    renderProjects() {
        const projects = this.state.projects;
        return (
            <ul>
                {
                    projects.map((project) => {
                        return (
                            <Col key={project.id} m={6} s={12}>
                                {(!this.state.editingMode && (this.state.clickedProject === null)) || (!this.state.editingMode && (this.state.clickedProject === project.id)) || (!this.state.editingMode && (this.state.clickedProject !== project.id)) || (this.state.editingMode && (this.state.clickedProject !== project.id)) ? <Card key={project.id} style={{backgroundColor: '#fff'}} textClassName="grey-text text-darken-4" title={project.name} actions={[<a style={{color: 'white', fontWeight: 'bold', cursor: 'pointer'}} key="Details Project" onClick={() => {this.projectView(project.id, project.name)}}>View Backlog</a>]}>
                                    <p>{project.description}</p>
                                    <a key="Delete Project" onClick={() => {this.confirm(project.id)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: '#a6262c', float: 'right'}}>delete_forever</i></a>
                                    <a key="Edit Project" onClick={() => {this.editProject(project.id, project.name, project.description)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: '#2633a6', float: 'right'}}>mode_edit</i></a>
                                </Card> : 
                                <Card key={project.id} style={{backgroundColor: '#fff', height: '280px'}} textClassName="grey-text text-darken-4">
                                    <form className="col s8">
                                        <div className="row">
                                            <div className="input-field col s12">
                                                <input 
                                                    className="validate"
                                                    id="name"
                                                    type="text"
                                                    onChange={event => this.setState({newName:event.target.value})}
                                                />
                                                <label htmlFor="name"><b>Name:</b> {project.name}</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="input-field col s12">
                                                <textarea 
                                                    className="materialize-textarea"
                                                    id="description"
                                                    type="text"
                                                    onChange={event => this.setState({newDesc:event.target.value})}
                                                />
                                                <label htmlFor="description"><b>Description:</b> {project.description}</label>
                                            </div>
                                        </div>
                                    </form>
                                    <a onClick={() => {this.editProject(project.id)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: '#2633a6', float: 'right'}}>mode_edit</i></a>
                                </Card>}
                            </Col>     
                        )
                    })
                }
            </ul>
        )
    }

    editProject(projectId, projectName, projectDescription) {

        if(this.state.editingMode === true) {
            const token = 'Bearer ' + this.state.token;
            let newName = this.state.newName;
            let newDesc = this.state.newDesc;
            let projects = this.state.projects;

            if(this.state.name) {
                newName = this.state.newName
            }

            if(this.state.description) {
                newDesc = this.state.newDesc
            }

            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token
            axios.put(`${BASE_URL}/projects/${projectId}`, {
                'name': newName,
                'description': newDesc
            })
                .then((data) => {
                    for (var i=0; i < projects.length; i++) {
                        if (projects[i].id === projectId) {
                            projects[i].name = newName;
                            projects[i].description = newDesc;
                            this.setState({'projects': projects});
                            let t = new Toast("Succesfully edited project!", 2500)
                            t.Render(); 
                        }
                    }  
                })
                .catch((error) => {
                    this.setState({error});
                }) 
        } 
        else {
            this.setState({'newName': projectName, 'newDesc': projectDescription});
        }

        if(projectId) {
            this.setState({'clickedProject': projectId});
        }
        this.setState({'editingMode': !this.state.editingMode});
    }

    confirm(projectId) {
        confirmAlert({                   
            message: 'Are you sure you want to delete this project?',              
            confirmLabel: 'Delete',                        
            cancelLabel: 'Cancel',                           
            onConfirm: () => this.deleteProject(projectId)
          })
    }

    deleteProject(projectId) {

        const token = 'Bearer ' + this.state.token
        let projects = this.state.projects;
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.delete(BASE_URL + '/projects/' + projectId)
            .then((data) => {
                this.searchAndDeleteProjectFromState(projectId, projects);
            })
            .catch((error) => {
                this.setState({error});
            }) 
    }

    searchAndDeleteProjectFromState(keyName, array) {
        for (var i=0; i < array.length; i++) {
            if (array[i].id === keyName) {
                delete array[i]
                this.setState({'projects': array});
                let t = new Toast("Succesfully deleted project!", 2500)
                t.Render(); 
            }
        }    
    }

    projectView(projectId, projectName) {
        localStorage.setItem('projectId', projectId);
        localStorage.setItem('projectName', projectName);
        browserHistory.push('/projects');
    }

    newProject() {
        const token = 'Bearer ' + this.state.token
        let projects = this.state.projects;
        
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.post(`${BASE_URL}/projects`, {
            'name': this.state.name,
            'description': this.state.description,
            'user_id': this.state.userId
        })
            .then((data) => {
                projects.push(data.data);
                this.setState({projects: projects, newProjectBool: !this.state.newProjectBool});
                let t = new Toast("Succesfully added project!", 2500)
                t.Render(); 
            })
            .catch((error) => {
                this.setState({error});
            }) 
    }

    setNewProjectBool() {
        this.setState({newProjectBool: !this.state.newProjectBool})
    }

    renderNewProject() {
        return (
            <Col m={6} s={12}>
                { (!this.state.newProjectBool) ?
                <Card key="New Project" style={{backgroundColor: '#fff'}} textClassName="grey-text text-darken-4" actions={[<a key="New Project" style={{cursor: 'pointer', color: 'white', fontWeight: 'bold'}} onClick={() => this.setNewProjectBool()}>+ Make new project</a>]}>
                    <div key="New Project" style={{fontSize: '20px'}}>[Your new project will appear here]</div>
                </Card> :
                <Card key="New Project" style={{backgroundColor: '#fff', height: '280px'}} textClassName="grey-text text-darken-4">
                <form className="col s8">
                    <div className="row">
                        <div className="input-field col s12">
                            <input 
                                className="validate"
                                id="name"
                                type="text"
                                onChange={event => this.setState({name:event.target.value})}
                            />
                            <label htmlFor="name"><b>Project Name</b></label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s12">
                            <textarea 
                                className="materialize-textarea"
                                id="description"
                                type="text"
                                onChange={event => this.setState({description:event.target.value})}
                            />
                            <label htmlFor="description"><b>Project Description</b></label>
                        </div>
                    </div>
                </form>
                <a onClick={() => {this.newProject()}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: '#2ca626', float: 'right'}}>add_box</i></a>
                <a onClick={() => {this.setNewProjectBool()}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: '#a6262c', float: 'right'}}>cancel</i></a>
                </Card>
                }
            </Col>  
        )
    }

    render() {
        return (
            <div>
                <nav className="teal lighten-3">
                    <div className="nav-wrapper">
                    <a className="brand-logo" href="/"><img className="nav-logo" src={logo} alt="logo"/></a>
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
                        <h2 style={{color: '#26a69a'}}>Projects</h2>
                        {
                            this.renderProjects()
                        }
                        {this.renderNewProject()}
                    </div>
                    <div className="col s2"/>
                </div>
                <div className="row">
                    <div className="col s2" />
                    <div className="col s8">
                        {this.renderErrors()}
                    </div>
                    <div className="col s2" />
                </div>
                <Modal
                header={<h2 style={{color: '#26a69a'}}>Projects</h2>}
                bottomSheet
                trigger={<a style={{position: 'fixed', right: '50px'}} className="btn btn-floating btn-large"><i className="material-icons">help_outline</i></a>}
                >
                    <h4>What can I do here?</h4>
                    <ol>
                        <li>Check projects</li>
                        <li>Create projects</li>
                        <li>Edit projects</li>
                        <li>Delete projects</li>
                    </ol>
                </Modal>
        </div>
        )
    }
}

export default App;