import React, {Component} from 'react'
import PropTypes from 'prop-types';
import {BoardDiv} from '../styles/Base'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Lane from './Lane'
import axios from 'axios';
import { BASE_URL } from '../../constants';
import { Modal, Button, Dropdown, NavItem, Icon } from 'react-materialize';
import Toast from '../../components/Toast';

const boardActions = require('../actions/BoardActions')
const laneActions = require('../actions/LaneActions')

class BoardContainer extends Component {

  state = {
            data: this.props.data,
            cardId: null,
            title: null,
            label: null,
            description: null,
            storyDesc: null,
            storyId: null,
            statusId: null,
            sprintId: null,
            showFieldsForLane: -1,
            token: '',
            error: [],
            stories: null
          }

  wireEventBus = () => {
    let eventBus = {
      publish: (event) => {
        switch (event.type) {
          case 'ADD_CARD':
            return this.props.actions.addCard({laneId: event.laneId, card: event.card})
          case 'REFRESH_BOARD':
            return this.props.actions.loadBoard(event.data)
          case 'PAGINATE_LANE':
            return this.props.actions.paginateLane({laneId: event.laneId, card: event.cardId})
          default:
            return  
        }
      }
    }
    this.props.eventBusHandle(eventBus)
  }

  componentWillMount () {
    console.log(this.props)
    let token = localStorage.getItem('token');
    let sprintId = localStorage.getItem('sprintId');
    this.props.actions.loadBoard(this.props.data)
    if (this.props.eventBusHandle) {
      this.wireEventBus()
    }
    this.setState({'id': this.state.id, 'title': this.state.title, 'description': this.state.description, 'label': this.state.label, 'token': token, 'sprintId': sprintId, 'storyId': this.state.storyId})
  }

  componentDidMount() {
    this.createStorySelect();
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data.lanes) {
      const dataToUpdate = this.state.data
      dataToUpdate.lanes = nextProps.data.lanes
      this.setState({data: dataToUpdate})
      this.props.onDataChange && this.props.onDataChange(nextProps.data)
    }
  }

  addLaneCard() {
    
    const { title, label, description, sprintId, storyId } = this.state;
    const token = 'Bearer ' + this.state.token;
    let cardId = 99;
    console.log("Adding card: ", this.state)
    // if(this.cardIsSet()) {
      axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
      axios.defaults.headers.common['Authorization'] = token;

      axios.post(`${BASE_URL}/tasks`, {
            'name': title,
            'total_storypoints': label,
            'description': description,
            'sprint_id': sprintId,
            'status_id': 1,
            'story_id': storyId
        })
            .then((data) => {
                cardId = data.data.id;
                let t = new Toast("Task added successfully!", 2500)
                t.Render(); 
                this.props.actions.addCard({ laneId: 'Unassigned', card: {id: cardId, title: title, label: label, description: description, storyId: storyId} })
                this.setState({'showFieldsForLane': -1, cardId: null, label: null, description: null, title: null, storyId: null})
            })
            .catch((error) => {
                this.setState({error: error})
            }) 
    
  }

  cardIsSet() {
    return this.state.title && this.state.label && this.state.description
  }
  

  updateField(field, event) {
      var obj = {}
      obj[field] = event.target.value 

      console.log("Object is: ", obj)
      this.setState(obj)
  }

  createStorySelect() {
    const token = 'Bearer ' + this.state.token;
    const sprintId = this.state.sprintId;

    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.defaults.headers.common['Authorization'] = token;

    axios.get(`${BASE_URL}/sprints/${sprintId}/stories`)
        .then((data) => {
            this.setState({stories: data.data[0].stories})
        })
        .catch((error) => {
            this.setState({error: error})
        }) 
    }

    loadStories() {
      const stories = this.state.stories;
      console.log('storyqdqdzq', stories)
      let items = [];
      if(stories) {
        for(let i = 0; i < stories.length; i++) {
            items.push(<NavItem key={i} value={stories[i].description} onClick={this.handleChange.bind(this, stories[i].id, stories[i].description)}>{stories[i].description}</NavItem>);
        }
      }

      return items;
    }

    handleChange(storyId, storyDesc) {
      this.setState({storyId: storyId})
      this.setState({storyDesc: storyDesc})
    }

  renderErrors() {
        let errors = [];
        console.log(this.state.error.response);
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
        return <div className="center-align">{errors}</div>
    }

  render () {
    const {data} = this.state
    console.log('data', data)
    return <BoardDiv>
      {
        data.lanes.map((lane) => {
          const {id, ...otherProps} = lane
          const {tagStyle, draggable, handleDragStart, handleDragEnd, onCardClick, onLaneScroll, laneSortFunction} = this.props
          console.log('lane', lane);
          return (<div key={`${id}`}><Lane key={`${id}`}
            id={id}
            {...otherProps}
            {...{tagStyle, draggable, handleDragStart, handleDragEnd, onCardClick, onLaneScroll, laneSortFunction}}
          >
          </Lane>{(this.state.showFieldsForLane === id) ? <div className="row">
                 <input type="text" placeholder="name" style={{display: 'block', margin: 'auto', color:'white'}} onChange={this.updateField.bind(this, 'title')} />
                 <input type="text" placeholder="storypoints" style={{display: 'block', margin: 'auto', color:'white'}} onChange={this.updateField.bind(this, 'label')} />
                 <input type="text" placeholder="description" style={{display: 'block', margin: 'auto', color:'white'}} onChange={this.updateField.bind(this, 'description')} /></div>
                  : null}
                  <Modal id="taskModal" trigger={<div style={{margin: '5px'}}><Button style={{width: '100%', borderSizing: 'border-box'}} onClick={this.addLaneCard.bind(this, id)}><Icon small>add</Icon><span style={{position: 'relative', top: '-4px', marginLeft: '5px'}}>Add Task</span></Button></div>}>
                  <div className="row">
                        <div className="col s2" />
                        <div className="col s7">
                            <h3 style={{paddingLeft: '89px'}}>Add Task</h3>
                        </div>
                        <div className="col s3" />
                    </div>
                    <div className="row">
                        <div className="col s3" />
                        <div className="col s6">
                          <div className="input-field inline col s12">
                                <input 
                                    className="validate"
                                    id="name"
                                    type="text"
                                    defaultValue=""
                                    onChange={event => this.setState({title:event.target.value})}
                                    onKeyPress={event => {
                                    if(event.key === "Enter") {
                                            this.addLaneCard.bind(this);
                                        }
                                    }}
                                />
                                <label htmlFor="name">Enter Task Name</label>
                            </div>
                        </div>
                        <div className="col s3" />
                    </div>
                    <div className="row">
                        <div className="col s3" />
                        <div className="col s6">
                          <div className="input-field inline col s12">
                                <input 
                                    className="validate"
                                    id="description"
                                    type="text"
                                    defaultValue=""
                                    onChange={event => this.setState({description:event.target.value})}
                                    onKeyPress={event => {
                                    if(event.key === "Enter") {
                                            this.addLaneCard.bind(this);
                                        }
                                    }}
                                />
                                <label htmlFor="description">Enter Task Description</label>
                            </div>
                        </div>
                        <div className="col s3" />
                    </div>
                    <div className="row">
                        <div className="col s3" />
                        <div className="col s6">
                          <div className="input-field inline col s12">
                                <input 
                                    className="validate"
                                    id="storypoints"
                                    type="text"
                                    defaultValue=""
                                    onChange={event => this.setState({label:event.target.value})}
                                    onKeyPress={event => {
                                    if(event.key === "Enter") {
                                            this.addLaneCard.bind(this);
                                        }
                                    }}
                                />
                                <label htmlFor="storypoints">Enter Task Storypoints</label>
                            </div>
                        </div>
                        <div className="col s3" />
                    </div>
                    <div className="row">
                        <div className="col s3" />
                        <div className="col s6">
                        <Dropdown trigger={
                            <Button>Select User Story</Button>
                            }>
                            {this.loadStories()}
                        </Dropdown>
                        <p>Selected Story: {this.state.storyDesc}</p>
                        <Button onClick={this.addLaneCard.bind(this)}>Add Task</Button>
                        </div>
                        <div className="col s3" />
                    </div>
                    <div className="row">
                        <div className="col s3" />
                        <div className="col s6">
                            {this.renderErrors()}
                        </div>
                        <div className="col s3" />
                    </div>
                  </Modal>
                  </div>)
        })}
    </BoardDiv>
  }
}

BoardContainer.propTypes = {
  data: PropTypes.object.isRequired,
  onLaneScroll: PropTypes.func,
  onCardClick: PropTypes.func,
  eventBusHandle: PropTypes.func,
  laneSortFunction: PropTypes.func,
  draggable: PropTypes.bool,
  handleDragStart: PropTypes.func,
  handleDragEnd: PropTypes.func,
  onDataChange: PropTypes.func
}

const mapStateToProps = (state) => {
  return state.lanes ? {data: state} : {}
}

const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators({...boardActions, ...laneActions}, dispatch)})

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(BoardContainer))
