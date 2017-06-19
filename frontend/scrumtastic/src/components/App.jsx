import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Dropdown, Button, NavItem, Col, Card } from 'react-materialize';
import logo from '../images/scrumtastic_logo_white.png';
import axios from 'axios';
import { BASE_URL } from '../constants';
import Toast from './Toast'
import '../App.css';

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
            'error': []
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

        return <div className="center-align">{errors}</div>
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
                                {(!this.state.editingMode && (this.state.clickedProject === null)) || (!this.state.editingMode && (this.state.clickedProject === project.id)) || (!this.state.editingMode && (this.state.clickedProject !== project.id)) || (this.state.editingMode && (this.state.clickedProject !== project.id)) ? <Card key={project.id} style={{backgroundColor: '#b64d87'}} textClassName='white-text' title={project.name} actions={[<a key="Details Project" onClick={() => {this.projectView(project.id, project.name)}}>Details</a>]}>
                                    {project.description}
                                    <a key="Delete Project" onClick={() => {this.deleteProject(project.id)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: 'black', float: 'right'}}>delete_forever</i></a>
                                    <a key="Edit Project" onClick={() => {this.editProject(project.id, project.name, project.description)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: 'black', float: 'right'}}>mode_edit</i></a>
                                </Card> : 
                                <Card key={project.id} style={{backgroundColor: '#b64d87', height: '220px'}} textClassName='white-text'>
                                    <form className="col s8">
                                        <div className="row">
                                            <div className="input-field col s12">
                                                <input 
                                                    style={{color: 'white'}}
                                                    className="validate"
                                                    id="name"
                                                    type="text"
                                                    onChange={event => this.setState({name:event.target.value})}
                                                />
                                                <label htmlFor="name" style={{color: 'white'}}>Name: {project.name}</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="input-field col s12">
                                                <input 
                                                    style={{color: 'white'}}
                                                    className="validate"
                                                    id="description"
                                                    type="text"
                                                    onChange={event => this.setState({description:event.target.value})}
                                                />
                                                <label htmlFor="description" style={{color: 'white'}}>Description: {project.description}</label>
                                            </div>
                                        </div>
                                    </form>
                                    <a onClick={() => {this.editProject(project.id)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: 'black', float: 'right'}}>mode_edit</i></a>
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
                newName = this.state.name
            }

            if(this.state.description) {
                newDesc = this.state.description
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
            }
        }    
    }

    projectView(projectId, projectName) {
        localStorage.setItem('projectId', projectId);
        localStorage.setItem('projectName', projectName);
        browserHistory.push('/projects');
    }

    newProject() {
        browserHistory.push('/newproject');
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
                        <Col m={6} s={12}>
                            <Card key="New Project" style={{backgroundColor: '#b64d87'}} textClassName='white-text' actions={[<a key="New Project" style={{cursor: 'pointer'}} onClick={this.newProject}>+ Make new project</a>]}>
                                <div key="New Project" style={{fontSize: '20px'}}>[Your new project will appear here]</div>
                            </Card>
                        </Col>  
                    </div>
                    <div className="col s2"/>
                </div>
            </div>    
        )
    }
}

export default App;