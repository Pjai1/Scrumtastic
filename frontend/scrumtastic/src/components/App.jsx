import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import { Dropdown, Button, NavItem, Col, Card } from 'react-materialize';
import axios from 'axios';
import { BASE_URL } from '../constants';
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
            'showEditingMode': -1
        }
    }

    componentWillMount() {
        
       let email = localStorage.getItem('email');
       let token = localStorage.getItem('token');
       let userId = localStorage.getItem('userId');
       this.setState({'email': email, 'token': token, 'userId': userId});
    }

    componentDidUpdate() {
        console.log('state comp upd', this.state)
    }

    componentDidMount() {
        console.log(this.state.token, this.state.userId)
        const token = 'Bearer ' + this.state.token

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
        axios.get(BASE_URL + '/users/' + this.state.userId + '/projects')
            .then((data) => {
                console.log(data.data);
                console.log(data.data[0].projects);
                let userProjects = [];
                data.data[0].projects.forEach((project) => {
                    userProjects.push(project);
                })
                console.log('projects', userProjects);
                this.setState({'projects': userProjects});
            })
            .catch((error) => {
                console.log(error)
            }) 
    }

    shouldComponentUpdate(nextState) {
        console.log('nextState',nextState)
        return true
    }

    logOut() {
        const token = 'Bearer ' + this.state.token

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

    renderProjects() {
        const projects = this.state.projects;
        console.log('projects state', projects);
        return (
            <ul>
                {
                    projects.map((project) => {
                        return (
                            <Col key={project.id} m={6} s={12}>
                                {(!this.state.editingMode) ? <Card key={project.id} style={{backgroundColor: '#b64d87'}} textClassName='white-text' title={project.name} actions={[<a onClick={() => {this.projectView(project.id)}}>Details</a>]}>
                                    {project.description}
                                    <a onClick={() => {this.deleteProject(project.id)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: 'black', float: 'right'}}>delete_forever</i></a>
                                    <a onClick={() => {this.editProject(project.id, project.name, project.description)}} style={{cursor: 'pointer'}}><i className="material-icons small" style={{color: 'black', float: 'right'}}>mode_edit</i></a>
                                </Card> : 
                                <Card key={project.id} style={{backgroundColor: '#b64d87', height: '220px'}} textClassName='white-text'>
                                    <form className="col s6">
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
        console.log('projectje', projectId);

        if(this.state.editingMode === true) {
            const token = 'Bearer ' + this.state.token;
            let newName = this.state.newName;
            let newDesc = this.state.newDesc;
            let projects = this.state.projects;

            if(this.state.name) {
                newName = this.state.name
                console.log('newName', newName)
            }

            if(this.state.description) {
                newDesc = this.state.description
                console.log('newDesc', newDesc)
            }

            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            axios.defaults.headers.common['Authorization'] = token
            axios.put(`${BASE_URL}/projects/${projectId}`, {
                'name': newName,
                'description': newDesc
            })
                .then((data) => {
                    console.log('update proj', data)
                    for (var i=0; i < projects.length; i++) {
                        if (projects[i].id === projectId) {
                            projects[i].name = newName;
                            projects[i].description = newDesc;
                            this.setState({'projects': projects});
                        }
                    }  
                })
                .catch((error) => {
                    console.log(error)
                }) 
        } 
        else {
            this.setState({'newName': projectName, 'newDesc': projectDescription});
            console.log(projectName, projectDescription);
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
                console.log(projects, projectId);
                this.searchAndDeleteProjectFromState(projectId, projects);
            })
            .catch((error) => {
                console.log(error)
            }) 
    }

    searchAndDeleteProjectFromState(keyName, array) {
        console.log(keyName, array);
        for (var i=0; i < array.length; i++) {
            if (array[i].id === keyName) {
                delete array[i]
                this.setState({'projects': array});
            }
        }    
    }

    projectView(projectId) {
        localStorage.setItem('projectId', projectId);
        browserHistory.push('/newproject');
    }

    newProject() {
        browserHistory.push('/newproject');
    }

    render() {
        return (
            <div>
                <nav className="teal lighten-3">
                    <div className="nav-wrapper">
                    <a className="brand-logo">Logo</a>
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
                        {/*<Dropdown trigger={
                            <Button>{this.state.email || "WHO ARE U" }</Button>
                            }>
                            <NavItem onClick={this.logOut.bind(this)}>Log Out Feggeht</NavItem>
                            <NavItem divider />
                        </Dropdown>*/}
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
                            <Card style={{backgroundColor: '#b64d87'}} textClassName='white-text' actions={[<a style={{cursor: 'pointer'}} onClick={this.newProject}>+ Make new project</a>]}>
                                <div style={{fontSize: '20px'}}>[Your new project will appear here]</div>
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