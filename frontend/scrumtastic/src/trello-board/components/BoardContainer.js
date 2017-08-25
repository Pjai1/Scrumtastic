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

const boardActions = require('../actions/BoardActions')
const laneActions = require('../actions/LaneActions')

class BoardContainer extends Component {

  state = {
            data: this.props.data,
            cardId: null,
            title: null,
            label: null,
            description: null,
            storyId: null,
            statusId: null,
            sprintId: null,
            showFieldsForLane: -1,
            token: ''
          }

  wireEventBus = () => {
    let eventBus = {
      publish: (event) => {
        switch (event.type) {
          case 'ADD_CARD':
            return this.props.actions.addCard({laneId: event.laneId, card: event.card})
          case 'REMOVE_CARD':
            return this.props.actions.removeCard({laneId: event.laneId, cardId: event.cardId})
          case 'REFRESH_BOARD':
            return this.props.actions.loadBoard(event.data)
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
    this.setState({'id': this.state.id, 'title': this.state.title, 'description': this.state.description, 'label': this.state.label, 'token': token, 'sprintId': sprintId})
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data.lanes) {
      const dataToUpdate = this.state.data
      dataToUpdate.lanes = nextProps.data.lanes
      this.setState({data: dataToUpdate})
      this.props.onDataChange && this.props.onDataChange(nextProps.data)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
      console.log("Next state is: ", nextState)
      return true
  }

  addLaneCard(id) {
    
    const { title, label, description, sprintId } = this.state;
    const token = 'Bearer ' + this.state.token;
    let cardId = 99;
    console.log("Adding card: ", this.state)
    if(this.cardIsSet()) {
      axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
      axios.defaults.headers.common['Authorization'] = token;

      axios.post(`${BASE_URL}/tasks`, {
            'name': title,
            'total_storypoints': label,
            'description': description,
            'sprint_id': sprintId,
            'status_id': 1,
            'story_id': 5
        })
            .then((data) => {
                cardId = data.data.id;
            })
            .catch((error) => {
                return error
            }) 

      this.props.actions.addCard({ laneId: 'Unassigned', card: {id: cardId, title: title, label: label, description: description} })
      this.setState({'showFieldsForLane': -1, cardId: null, label: null, description: null, title: null})
    } else {
      this.setState({'showFieldsForLane': id});
    }
    
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

  render () {
    const {data} = this.state
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
                 <input type="text" placeholder="description" style={{display: 'block', margin: 'auto', color:'white'}} onChange={this.updateField.bind(this, 'description')} /></div> : null}
                 <div className="center-align" style={{color: 'white'}} onClick={this.addLaneCard.bind(this, id)}>Add Card</div></div>)
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
