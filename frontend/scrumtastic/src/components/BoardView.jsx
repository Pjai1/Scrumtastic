import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Dropdown, Button, NavItem } from 'react-materialize';
import logo from '../images/scrumtastic_logo_white.png';
import axios from 'axios';
import { BASE_URL } from '../constants';
import '../App.css';
import {Board} from '../trello-board'

const data = require('../data.json')


class App extends Component {

  constructor(props) {
      super(props);
      this.state = {
          'userId': '',
          'email': '',
          'token': '',
          'projectId': '',
          'sprints': [],
          'projectName': [],
          'data': {}
      }
    }

  componentWillMount() {
      let email = localStorage.getItem('email');
      let token = localStorage.getItem('token');
      let userId = localStorage.getItem('userId');
      let projectId = localStorage.getItem('projectId');
      let projectName = localStorage.getItem('projectName');
      this.setState({'token': token, 'userId': userId, 'projectId': projectId, 'email': email, 'projectName': projectName});
  }

  componentDidMount() {
    const token = 'Bearer ' + this.state.token
    const projectId = this.state.projectId;
    let data = this.state.data;

    data = {
      "lanes": [
        {
          "id": "PLANNED",
          "title": "Planned Tasks",
          "label": "23 storypoints",
          "cards": [
            {
              "id": "Milk",
              "title": "Buy milk",
              "label": "5 storypoints",
              "description": "2 Gallons of milk at the Deli store"
            },
            {
              "id": "Plan2",
              "title": "Dispose Garbage",
              "label": "10 storypoints",
              "description": "Sort out recyclable and waste as needed"
            },
            {
              "id": "Plan3",
              "title": "Write Blog",
              "label": "3 storypoints",
              "description": "Can AI make memes?"
            },
            {
              "id": "Plan4",
              "title": "Pay Rent",
              "label": "5 storypoints",
              "description": "Transfer to bank account"
            }
          ]
        },
        {
          "id": "WIP",
          "title": "Work In Progress",
          "label": "3 storypoints",
          "cards": [
            {
              "id": "Wip1",
              "title": "Clean House",
              "label": "3 storypoints",
              "description": "Soap wash and polish floor. Polish windows and doors. Scrap all broken glasses"
            }
          ]
        },
        {
          "id": "BLOCKED",
          "title": "Blocked",
          "label": "/",
          "cards": []
        },
        {
          "id": "COMPLETED",
          "title": "Completed",
          "label": "30 storypoints",
          "cards": [
            {
              "id": "Completed1",
              "title": "Practice Meditation",
              "label": "15 storypoints",
              "description": "Use Headspace app"
            },
            {
              "id": "Completed2",
              "title": "Maintain Daily Journal",
              "label": "15 storypoints",
              "description": "Use Spreadsheet for now"
            }
          ]
        }
      ]
    }

    let dataCopy = {};

    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.defaults.headers.common['Authorization'] = token

    axios.get(`${BASE_URL}/statuses/`)
        .then((data) => {
            dataCopy = {
              "lanes": [
                {
                  "id": data.data[0].name,
                  "title": data.data[0].name + " Tasks"
                },
                {
                  "id": data.data[1].name,
                  "title": data.data[1].name + " Tasks"
                },
                {
                  "id": data.data[2].name,
                  "title": data.data[2].name + " Tasks"
                },
                {
                  "id": data.data[3].name,
                  "title": data.data[3].name + " Tasks"
                }
              ]
            }
        })
        .catch((error) => {

        }) 
    }

    getTasks() {

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

  render() {

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
            <div className="col s2" />
            <div className="col s8">
              <h2 style={{color: '#26a69a'}}>{this.state.projectName}: Board View</h2>
                <Board data={data} draggable={true} eventBusHandle={setEventBus} onDataChange={shouldReceiveNewData} handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} />
            </div>
            <div className="col s2" />
          </div>
        </div>
    );
  }
}

export default App;