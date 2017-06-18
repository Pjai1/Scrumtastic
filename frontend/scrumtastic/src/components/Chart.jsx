import React, { Component } from 'react';
import { Chart } from 'react-google-charts';
import { Link, browserHistory } from 'react-router';
import { Dropdown, Button, NavItem, Col, Card, Table } from 'react-materialize';
import logo from '../images/scrumtastic_logo_white.png';
import axios from 'axios';
import { BASE_URL } from '../constants';
import Toast from './Toast';
import '../App.css';

class SprintChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
        sprintId:'',
        sprintName: '',
        token: '',
        email: '',
        options: {
        title: 'Burndown Chart Sprint',
        hAxis: { title: 'Date', minValue: 0, maxValue: 15 },
        vAxis: { title: 'Storypoints', minValue: 0, maxValue: 15 },
        legend: 'none',
        },
        data: [
        ['Day', 'Storypoints (Max)', 'Storypoints (Day)'],
        [1, 20, 20],
        [2, 16.5, 18],
        [3, 13, 17],
        [4, 10, 14],
        [5, 7, 5],
        [6, 4, 2],
        [7, 0, 0],
        ],
    };
    }

  componentWillMount() {
    let sprintId = localStorage.getItem('sprintId');
    let email = localStorage.getItem('email');
    let token = localStorage.getItem('token');
    this.setState({sprintId: sprintId, token: token, email: email});
 
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
    axios.get(`${BASE_URL}/sprints/${sprintId}`)
        .then((data) => {
            let options = JSON.parse(JSON.stringify(this.state.options))
            options.title = 'Burndown Chart ' + data.data.name;
            this.setState({sprintName: data.data.name, options})
        })
        .catch((error) => {

        }) 

    this.setState({title: 'Burndown Chart Sprint '+ this.state.sprintName})
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

            }) 
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
                        <li><a href="/sprints">Sprints</a></li>
                        <li><a href="/list">List View</a></li>
                        <li><a href="/board">Board View</a></li>
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
            <Chart
                chartType="LineChart"
                data={this.state.data}
                options={this.state.options}
                graph_id="LineChart"
                title={this.state.sprintName}
                width="100%"
                height="400px"
                legend_toggle
            />
        </div>
    );
  }
}
export default SprintChart;