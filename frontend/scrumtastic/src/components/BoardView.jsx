import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Dropdown, Button, NavItem } from 'react-materialize';
import logo from '../images/scrumtastic_logo_white.png';
import axios from 'axios';
import { BASE_URL } from '../constants';
import '../App.css';
import {Board} from '../trello-board'
import Spinner from 'react-spinkit';

const jsonData = require('../data.json')


class App extends Component {

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
                  this.renderTasks(tasks, stories, statuses)
             })
        })
    })
  }

  componentDidMount() {
    const token = 'Bearer ' + this.state.token;
    const projectId = this.state.projectId;

    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token

    axios.get(`${BASE_URL}/projects/${projectId}/users`)
        .then((data) => {
            this.setState({'users': data.data[0].users})
            console.log('USERS',this.state.users)
        })
        .catch((error) => {
            this.setState({error});
        })  
  }

  renderTasks(tasks, stories, statuses) {
    if(tasks) {
      let toDoArray = [];
      let unassignedArray = [];
      let inProgressArray = [];
      let completedArray = [];
      const stories = tasks
      console.log('woola', stories)
      stories.forEach((story) => {
    
        console.log('is something here', story.tasks.length)
        
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
      this.fillBoardData(unassignedArray, toDoArray, inProgressArray, completedArray)
    }
  }

  fillBoardData(unassignedArray, toDoArray, inProgressArray, completedArray, stories, statuses) {
    console.log('UNASSIGNED: ', unassignedArray)
    console.log("TO DO: ", toDoArray)
    console.log("IN PROG: ", inProgressArray)
    console.log("COMPLETED: ", completedArray)
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
                  "users": toDo.users
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
                  "users": toDo.users
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
                  "users": toDo.users
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
                    "users": toDo.users
                  }
                  dataCopy.lanes[2].cards.push(obj)
                })
                console.log('expected board data', dataCopy)
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
                    console.log('ALL TASKS', taskArray)
                      if(taskArray) {
                          tasks.push(taskArray)
                      }
                  })                    
              )
          })

          Promise.all(promises).then(function() {
              console.log('all promises', tasks)
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
                        "status": null
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
                              })                                 
                          ]).then(function() {
                             nextObj.id = task.id;
                             nextObj.name = task.name;
                             nextObj.description = task.description;
                             nextObj.total_storypoints = task.total_storypoints;
                             nextObj.remaining_storypoints = task.remaining_storypoints;
                             nextObj.story_id = task.story_id;
                             nextObj.status_id = task.status_id;
                              console.log('TASK OBJECT', nextObj)
                              tasksForStory.tasks.push(nextObj)
                              console.log('tasks for story', tasksForStory)
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

  componentDidMount() {
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
    console.log('drag started')
    console.log(`cardId: ${cardId}`)
    console.log(`laneId: ${laneId}`)
  }

  handleDragEnd = (cardId, sourceLaneId, targetLaneId) => {
    console.log('drag ended')
    console.log(`cardId: ${cardId}`)
    console.log(`sourceLaneId: ${sourceLaneId}`)
    console.log(`targetLaneId: ${targetLaneId}`)
  }

  shouldReceiveNewData = (nextData) => {
    console.log('data has changed')
    console.log(nextData)
  }

  renderBoard() {
    const dataState = this.state.boardData;
    let eventBus = undefined
    
    let setEventBus = (handle) => {
      eventBus = handle
    }

    const handleDragStart = (cardId, laneId) => {
      console.log('drag started')
      console.log(`cardId: ${cardId}`)
      console.log(`laneId: ${laneId}`)
    }

    const handleDragEnd = (cardId, sourceLaneId, targetLaneId) => {
      console.log('drag ended')
      console.log(`cardId: ${cardId}`)
      console.log(`sourceLaneId: ${sourceLaneId}`)
      console.log(`targetLaneId: ${targetLaneId}`)
    }

    const shouldReceiveNewData = (nextData) => {
      console.log('data has changed')
      console.log(nextData)
    }

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
            <Spinner style={{marginLeft: '40px', marginTop: '20px'}} name="ball-spin-fade-loader" /><br /><p>Molding data ...</p>
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
                          <NavItem onClick={this.logOut.bind(this)}><i className="material-icons">input</i>Log Out</NavItem>
                          <NavItem divider />
                      </Dropdown>
                  </ul>
              </div>
          </nav>
          <div className="row">
          <div className="col s8">
            <h2 style={{color: '#26a69a'}}>{this.state.projectName}: Board View</h2>
          </div>
          <div className="col s4" />
          </div>
          {this.renderBoard()}
        </div>
    );
  }
}

export default App;