import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Dropdown, Button, NavItem, Icon, Modal, Row, Input } from 'react-materialize';
import logo from '../images/scrumtastic_logo_white.png';
import axios from 'axios';
import { BASE_URL } from '../constants';
import '../App.css';
import {Board} from '../trello-board'
import Spinner from 'react-spinkit';


class BoardView extends Component {

  constructor(props) {
      super(props);
      this.state = {
          'error': [],
          'userId': localStorage.getItem('userId') || '',
          'email': localStorage.getItem('email') || '',
          'token': localStorage.getItem('token') || '',
          'projectId': localStorage.getItem('projectId') || '',
          'sprintId': localStorage.getItem('sprintId') || '',
          'project': localStorage.getItem('projectId') || '',
          'sprints': [],
          'tasks': [],
          'stories': [],
          'statuses': [],
          'projectName': localStorage.getItem('projectName') || '',
          'boardData': null,
          'counter': 5,
          'renderArray': [],
          'unassignedArray': [],
          'toDoArray': [],
          'inProgressArray': [],
          'completedArray': [],
          'users': null
      }
    }

  componentWillMount() {
      this.getStatuses().then((statuses) => {
        this.getUserStoriesForSprint().then((stories) => {
             this.getStoryTasks(stories).then((tasks) => {
                 //making sure all the state is cached, this seems to be an error with a hot reload dev server, not sure how to workaround yet
                 setTimeout(() => {
                    this.renderTasks(tasks, stories, statuses)
                 }, 2000)
             })
        })
    })
  }

  componentDidMount() {
    const token = 'Bearer ' + this.state.token;
    const projectId = this.state.projectId;

    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.defaults.headers.common['Authorization'] = token;

    axios.get(`${BASE_URL}/projects/${projectId}/users`)
        .then((data) => {
            // this.setState({'users': data.data[0].users})
            this.getProjectSprints(data.data[0].users)
        })
        .catch((error) => {
            this.setState({error});
        })  
  }

  getProjectSprints(users) {
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
            this.setState({'sprints': projectSprints, 'users': users});
        })
        .catch((error) => {
            this.setState({error});
        }) 
    }

    renderSprints() {
        const sprints = this.state.sprints;
        
        let items = [];
        if(sprints) {
            for(let i = 0; i < sprints.length; i++) {
                items.push(<option key={i} data-id={sprints[i].id} value={sprints[i].name}>{sprints[i].name}</option>);
            }
        }
    
        return items;
    }

    handleSelect(event, value) {
        let select = document.getElementById('sprintSelect');
        let dataAttr = select.options[select.selectedIndex].dataset.id;
        let storyDesc = event.target.value;
        console.log('dataAttr',dataAttr)
        this.setState({sprintId: dataAttr})

        this.getUserStoriesForSprint().then((stories) => {
            this.getStoryTasks(stories).then((tasks) => {
                //making sure all the state is cached, this seems to be an error with a hot reload dev server, not sure how to workaround yet
                setTimeout(() => {
                   this.renderTasks(tasks, stories, this.state.statuses)
                }, 2000)
            })
       })
    }

  renderTasks(tasks, stories, statuses) {
    if(tasks) {
      let toDoArray = [];
      let unassignedArray = [];
      let inProgressArray = [];
      let completedArray = [];
      const stories = tasks

      stories.forEach((story) => {
        
        story.tasks.forEach((task) => {
          if (task.status === "To Do") {
            toDoArray.push(task)
          }

          else if (task.status === "Unassigned") {
            unassignedArray.push(task)
          }

          else if (task.status === "In Progress") {
            inProgressArray.push(task)
          }

          else {
            completedArray.push(task)
          }
        })
      })
      this.fillBoardData(unassignedArray, toDoArray, inProgressArray, completedArray, stories, statuses)
    }
  }

  getTaskComments(taskId) {
    return new Promise(function(resolve, reject) {
        if(!taskId) {
            reject()
        }

        const token = 'Bearer ' + this.state.token;
        
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token;
    
        axios.get(`${BASE_URL}/tasks/${taskId}/comments`)
            .then((data) => {
                return resolve(data.data[0].comments)
            })
            .catch((error) => {
                reject(error)
            })
    }.bind(this))
  }

  fillBoardData(unassignedArray, toDoArray, inProgressArray, completedArray, stories, statuses) {
    const token = 'Bearer ' + this.state.token;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['Authorization'] = token
    
        let dataCopy = null;
    
        axios.get(`${BASE_URL}/statuses/`)
            .then((data) => {
                dataCopy = {
                  "lanes": [
                    {
                      "id": data.data[0].name,
                      "title": data.data[0].name + " Tasks",
                      "label": "4",
                      "cards": [
    
                      ]
                    },
                    {
                      "id": data.data[1].name,
                      "title": data.data[1].name + " Tasks",
                      "label": "4",
                      "cards": [
    
                      ]
                    },
                    {
                      "id": data.data[2].name,
                      "title": data.data[2].name + " Tasks",
                      "label": "4",
                      "cards": [
    
                      ]
                    },
                    {
                      "id": data.data[3].name,
                      "title": data.data[3].name + " Tasks",
                      "label": "4",
                      "cards": [
    
                      ]
                    }
                  ]
                }
    

                toDoArray.forEach((toDo, i) => {
                let obj = {
                  "id": toDo.id,
                  "title": toDo.name,
                  "label": toDo.remaining_storypoints+" / "+toDo.total_storypoints+" SP",
                  "remaining_storypoints": toDo.remaining_storypoints,
                  "total_storypoints": toDo.total_storypoints,
                  "description": toDo.description,
                  "story_id": toDo.story_id,
                  "status_id": toDo.status_id,
                  "users": toDo.users,
                  "comments": toDo.comments
                }
                dataCopy.lanes[1].cards.push(obj)
              })
    
              completedArray.forEach((toDo, i) => {
                let obj = {
                  "id": toDo.id,
                  "title": toDo.name,
                  "label": toDo.remaining_storypoints+" / "+toDo.total_storypoints+" SP",
                  "remaining_storypoints": toDo.remaining_storypoints,
                  "total_storypoints": toDo.total_storypoints,
                  "description": toDo.description,
                  "story_id": toDo.story_id,
                  "status_id": toDo.status_id,
                  "users": toDo.users,
                  "comments": toDo.comments
                }
                  dataCopy.lanes[3].cards.push(obj)
              })
    
              unassignedArray.forEach((toDo, i) => {

                    let obj = {
                        "id": toDo.id,
                        "title": toDo.name,
                        "label": toDo.remaining_storypoints+" / "+toDo.total_storypoints+" SP",
                        "remaining_storypoints": toDo.remaining_storypoints,
                        "total_storypoints": toDo.total_storypoints,
                        "description": toDo.description,
                        "story_id": toDo.story_id,
                        "status_id": toDo.status_id,
                        "users": toDo.users,
                        "comments": toDo.comments
                      }

                      dataCopy.lanes[0].cards.push(obj)
              })
    
                inProgressArray.forEach((toDo, i) => {
                  let obj = {
                    "id": toDo.id,
                    "title": toDo.name,
                    "label": toDo.remaining_storypoints+" / "+toDo.total_storypoints+" SP",
                    "remaining_storypoints": toDo.remaining_storypoints,
                    "total_storypoints": toDo.total_storypoints,
                    "description": toDo.description,
                    "story_id": toDo.story_id,
                    "status_id": toDo.status_id,
                    "users": toDo.users,
                    "comments": toDo.comments
                  }
                  dataCopy.lanes[2].cards.push(obj)
                })
                console.log('datacopy', dataCopy)
                this.setState({boardData: dataCopy, stories: stories, statuses: statuses})
            })
            .catch((error) => {
              this.setState({error: error});
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
                  resolve(data.data[0].stories)
              })
              .catch((error) => {
                  reject(error)
              }) 
      }.bind(this))
  }

  getStoryTasks(stories) {
      return new Promise(function(resolve, reject) {
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

          var self = this

          axios.get(`${BASE_URL}/stories/${story.id}/tasks`)
              .then((data) => {
                let tasksForStory = 
                {
                    "story": story,
                    "tasks": []
                }
  
            let taskObject = {
                        "id": null,
                        "name": null,
                        "description": null,
                        "total_storypoints": null,
                        "remaining_storypoints": null,
                        "story_id": null,
                        "status_id": null,
                        "users": [
                        ],
                        "status": null,
                        "comments": null
                    }
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
                              }),
                              self.getTaskComments(task.id).then((comment)=> {
                                  if(comment) {
                                    nextObj.comments = comment;
                                  }
                              })                    
                          ]).then(function() {
                             nextObj.id = task.id;
                             nextObj.name = task.name;
                             nextObj.description = task.description;
                             nextObj.total_storypoints = task.total_storypoints;
                             nextObj.remaining_storypoints = task.remaining_storypoints;
                             nextObj.story_id = task.story_id;
                             nextObj.status_id = task.status_id;
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
                  resolve(data.data)
              })
              .catch((error) => {
                  reject(error)
              }) 
          }.bind(this))
  }

 goToChart() {
     browserHistory.push('/chart');
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

  handleDragStart = (cardId, laneId) => {

  }

  handleDragEnd = (cardId, sourceLaneId, targetLaneId) => {

  }

  shouldReceiveNewData = (nextData) => {

  }

  renderBoard() {
    const dataState = this.state.boardData;
    let eventBus = undefined
    
    let setEventBus = (handle) => {
      eventBus = handle
    }

    const handleDragStart = (cardId, laneId) => {

    }

    const handleDragEnd = (cardId, sourceLaneId, targetLaneId) => {

    }

    const shouldReceiveNewData = (nextData) => {

    }
    console.log('render Datastate')
    if(dataState) {
      return (
        <div className="row">
          <div className="col s12">
              <Board data={dataState} draggable={true} eventBusHandle={setEventBus} onDataChange={shouldReceiveNewData} handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} />
          </div>
        </div>
      )
    } else {
      return (
        <div className="row">
          <div className="col s12">
            <Spinner style={{marginLeft: '40px', marginTop: '20px'}} name="ball-spin-fade-loader" /><br /><p>Loading data ...</p>
          </div>
        </div>
      )
    }
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
                      <li><a href="/list">List View</a></li>
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
          <div className="col s8">
            <h2 style={{color: '#26a69a'}}>{this.state.projectName}: Board View</h2>
            <div style={{float: 'right', position: 'relative', top: '-75px', left: '370px'}}>
                <Input s={12} id="sprintSelect" type='select' label="Sprint Select" onChange={this.handleSelect.bind(this)}>
                    {this.renderSprints()}
                </Input>
            </div>
            <Button onClick={this.goToChart.bind(this)} style={{float: 'right', position: 'relative', top: '-61px', left: '815px'}}><Icon small>
                insert_chart
            </Icon><span style={{position: 'relative', top: '-4px', marginLeft: '5px'}}>Burndown Chart</span></Button>
          </div>
          <div className="col s4" />
          </div>
          {this.renderBoard()}
          <Modal
            header={<h2 style={{color: '#26a69a'}}>Board View</h2>}
            bottomSheet
            trigger={<div className="row"><div className="col s12"><a style={{position: 'absolute', right: '50px', bottom: '30px'}} className="btn btn-floating btn-large"><i className="material-icons">help_outline</i></a></div></div>}
            >
                <h4>What can I do here?</h4>
                <ol>
                    <li>Check task (details)</li>
                    <li>Create tasks</li>
                    <li>Edit tasks</li>
                    <li>Delete tasks</li>
                </ol>
            </Modal>
        </div>
    );
  }
}

export default BoardView;