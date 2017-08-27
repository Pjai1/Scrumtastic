import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import Tag from './Tag'
import PropTypes from 'prop-types';
import {CardWrapper, CardHeader, CardTitle, CardRightContent, Detail, Footer} from '../styles/Base'
import {DragType} from '../helpers/DragType'
import {DragSource, DropTarget} from 'react-dnd'
import { Icon, Modal, Button } from 'react-materialize';
import axios from 'axios';
import { BASE_URL } from '../../constants';
import Toast from '../../components/Toast';
import ReactConfirmAlert, { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
var flow = require('lodash.flow')


class Card extends Component {

  constructor(props) {
      super(props)
      console.log('USER PROPS', props)
      this.state = {
          description: this.props.description,
          label: this.props.label,
          title: this.props.title,
          storyId: this.props.storyId,
          storyDesc: null,
          sprintId: localStorage.getItem('sprintId') || '',
          editing: false,
          userEmail: null,
          remainingStorypoints: this.props.remainingStorypoints,
          totalStorypoints: this.props.totalStorypoints,
          users: this.props.users,
          token: localStorage.getItem('token') || '',
          error: []
      }
  }

  componentWillMount() {

  }

  componentDidMount() {
    const token = 'Bearer ' + this.state.token;

    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.defaults.headers.common['Authorization'] = token;

    axios.get(`${BASE_URL}/stories/`+this.state.storyId)
    .then((data) => {
        this.setState({storyDesc: data.data.description})
    })
    .catch((error) => {
        console.log(error)
    }) 
  }

  updateCard() {
      this.setState({ editing: false })
      this.props.updateCard({ id: this.props.id, description: this.state.description, label: this.state.label, title: this.state.title, remainingStorypoints: this.state.remainingStorypoints, totalStorypoints: this.state.totalStorypoints })
  }

  updateField(field, event) {
    let obj = {};
    obj[field] = event.target.value; 

    console.log("Object is: ", obj)
    this.setState(obj)
  }

  updateFieldRequest() {
    const token = 'Bearer ' + this.state.token;
    
      axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
      axios.defaults.headers.common['Authorization'] = token

      console.log('descof',this.state.title)
  
      axios.put(`${BASE_URL}/tasks/${this.props.id}`, {
          'description': this.state.description,
          'name': this.state.title,
          'total_storypoints': this.state.totalStorypoints,
          'remaining_storypoints': this.state.remainingStorypoints,
          'sprint_id': this.state.sprintId
      })
          .then((data) => {
            console.log("data-object is: ", data)
            let newLabel = data.data.remaining_storypoints+"/"+data.data.total_storypoints+" SP"
            this.props.updateCard({ id: this.props.id, description: this.state.description, label: newLabel, title: this.state.title, remainingStorypoints: this.state.remainingStorypoints, totalStorypoints: this.state.totalStorypoints })
            this.toggleEditMode()
          })
          .catch((error) => {
              this.setState({error});
          }) 
  }

  renderEditingMode() {
    const {id, title, description, label, totalStorypoints, remainingStorypoints, tags, connectDragSource, connectDropTarget, isDragging, ...otherProps} = this.props
    const opacity = isDragging ? 0 : 1
    const background = isDragging ? '#CCC' : '#E3E3E3'
    return (
      <div style={{background: background}}>
          <CardWrapper key={id} data-id={id} {...otherProps} style={{opacity: opacity}}>
            <CardHeader>
              <CardTitle>
                <div className="row">
              <div className="col s1" style={{position: 'relative', top: '18px', left: '-10px'}}>
              <Icon small>title</Icon>
              </div>
              <div className="col s9">
                <input type="text" onChange={event => this.setState({title:event.target.value})} value={this.state.title} />
              </div>
            </div>
              </CardTitle>
            </CardHeader>
            <div className="row">
              <div className="col s1" style={{position: 'relative', top: '18px', left: '-10px'}}>
              <Icon small>description</Icon>
              </div>
              <div className="col s9">
              <input className="input-field inline col s12" type="text" onChange={event => this.setState({description:event.target.value})} value={this.state.description} />
              </div>
            </div>
            <div className="row">
              <div className="col s1" style={{position: 'relative', top: '18px', left: '-10px'}}>
              <Icon small>timelapse</Icon>
              </div>
              <div className="col s9">
              <input placeholder={remainingStorypoints+" SP (Remaining)"} type="number" onChange={event => this.setState({remainingStorypoints:event.target.value})} value={this.state.remainingStorypoints} />
              </div>
            </div>
            <div className="row">
              <div className="col s1" style={{position: 'relative', top: '18px', left: '-10px'}}>
              <Icon small>timelapse</Icon>
              </div>
              <div className="col s9">
              <input placeholder={totalStorypoints+" SP (Total)"} type="number" onChange={event => this.setState({totalStorypoints:event.target.value})} value={this.state.totalStorypoints} />
              </div>
            </div>
            {tags && <Footer>
              {tags.map((tag) => <Tag key={tag.title} {...tag} tagStyle={this.props.tagStyle} />)}
            </Footer>
            }
            <span onClick={this.updateFieldRequest.bind(this)}><i className="material-icons small" style={{color: '#2633a6', float: 'right', position: 'relative', top: '-360px'}}>mode_edit</i></span>
            {this.renderErrors()}
          </CardWrapper>
          
        </div>
    )
  }

  toggleEditMode() {
      this.setState({ editing: !this.state.editing })
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

  renderUsers() {
    if(this.state.users) {
      return (
          <ul className="collection">
          {
          this.state.users.map(user => {
                  return (
                      <li key={user.id} className="collection-item"><div style={{float: 'left', position: 'relative', top: '-5px'}}><Icon small>account_box</Icon></div>{user.email}</li>
                  )  
          })
          }
          </ul>
      )
    }
  }

  addUser() {
    const token = 'Bearer ' + this.state.token;
    let users = this.state.users;

    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.defaults.headers.common['Authorization'] = token
    axios.post(`${BASE_URL}/attachtask`, {
        'email': this.state.userEmail,
        'task_id': this.props.id
    })
        .then((data) => {
            users.push(data.data[0]);
            this.setState({users: users})
            let t = new Toast(this.state.userEmail + " added to task!", 2500)
            t.Render(); 
        })
        .catch((error) => {
            this.setState({error});
        })   
  }

  confirmUser(listId, taskId) {
    const {id, title, description, users, remainingStorypoints, totalStorypoints, label, storyId, tags, connectDragSource, connectDropTarget, isDragging, ...otherProps} = this.props
    confirmAlert({                   
        message: 'Are you sure you want to delete this task from the project?',              
        confirmLabel: 'Delete',                        
        cancelLabel: 'Cancel',                           
        onConfirm: () => this.props.removeCard(listId, taskId)
      })
  }

  renderDisplayMode() {
    const {id, title, description, users, remainingStorypoints, totalStorypoints, label, storyId, tags, connectDragSource, connectDropTarget, isDragging, ...otherProps} = this.props
    const opacity = isDragging ? 0 : 1
    const background = isDragging ? '#CCC' : '#E3E3E3'
    console.log('STORYPOINTS', remainingStorypoints, totalStorypoints)
    return (
      <div style={{background: background}}>
          <CardWrapper key={id} data-id={id} {...otherProps} style={{opacity: opacity}}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardRightContent>{label}</CardRightContent>
            </CardHeader>
            <Detail>{description}<div style={{marginTop: '10px', position: 'relative', left: '70px'}} className="center-align">
                                    <span onClick={this.toggleEditMode.bind(this)}>
                                      <i className="material-icons small" style={{color: '#2633a6'}}>mode_edit</i>
                                    </span>
                                    <span onClick={this.confirmUser.bind(this, this.props.listId, this.props.id)}>
                                      <i className="material-icons small" style={{color: '#a6262c'}}>delete_forever</i>
                                    </span>
                                    <Modal
                                      trigger={<span>
                                      <i className="material-icons small">info_outline</i>
                                    </span>}>
                                        <div className="row">
                                          <div className="col s12">
                                          <h2 style={{color: '#26a69a'}}>Task: {this.props.title}</h2>
                                            <p><Icon tiny>description</Icon> {this.props.description}</p>
                                            <p><Icon tiny>timelapse</Icon> {this.props.label}</p>
                                            <p><Icon tiny>label_outline</Icon> {this.state.storyDesc}</p>
                                          </div>
                                        </div>
                                        <div className="row">
                                          <div className="col s12">
                                            <h2 style={{color: '#26a69a'}}>Members</h2>                    
                                              {this.renderUsers()}
                                          </div>
                                              <div className="col s1" style={{paddingTop: '25px', paddingLeft: '40px'}}>
                                                  <Icon small>
                                                  email    
                                                  </Icon>
                                              </div>
                                              <div className="input-field inline col s11">
                                                  <input 
                                                      className="validate"
                                                      id="user"
                                                      type="email"
                                                      defaultValue=""
                                                      onChange={event => this.setState({userEmail:event.target.value})}
                                                      onKeyPress={event => {
                                                      if(event.key === "Enter") {
                                                              this.addUser();
                                                          }
                                                      }}
                                                  />
                                                  <label htmlFor="user">Add User Email</label>
                                              </div>
                                          </div>
                                          <div className="row">
                                            <div className="col s12">
                                              {this.renderErrors()}
                                            </div>
                                          </div>
                                    </Modal>
                                    </div>
                                </Detail>
            {tags && <Footer>
              {tags.map((tag) => <Tag key={tag.title} {...tag} tagStyle={this.props.tagStyle} />)}
            </Footer>
            }
          </CardWrapper>
        </div>
    )
  }

  render () {
    const {id, title, description, label, tags, connectDragSource, connectDropTarget, isDragging, ...otherProps} = this.props
    const opacity = isDragging ? 0 : 1
    const background = isDragging ? '#CCC' : '#E3E3E3'
    return connectDragSource(
      connectDropTarget(
          this.state.editing ? this.renderEditingMode() : this.renderDisplayMode() 
      )
    )
  }
}

const cardSource = {
  canDrag (props) {
    return props.draggable
  },

  beginDrag (props) {
    console.log('props', props);
    props.handleDragStart(props.id, props.listId)
    return {
      id: props.id,
      listId: props.listId,
      index: props.index,
      card: props
    }
  },

  endDrag (props, monitor) {
    const item = monitor.getItem()
    const dropResult = monitor.getDropResult()
    if (dropResult && dropResult.listId !== item.listId) {
      props.removeCard(item.listId, item.id)
    }
    props.handleDragEnd(item.id, item.listId, dropResult ? dropResult.listId : item.listId)
  }
}

const cardTarget = {
  hover (props, monitor, component) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index
    const sourceListId = monitor.getItem().listId

    if (dragIndex === hoverIndex) {
      return
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

    // Determine mouse position
    const clientOffset = monitor.getClientOffset()

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }

    if (props.listId === sourceListId) {
      props.moveCard(dragIndex, hoverIndex)
      monitor.getItem().index = hoverIndex
    }
  }
}

Card.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  label: PropTypes.string,
  storyId: PropTypes.string,
  users: PropTypes.array,
  totalStorypoints: PropTypes.string,
  remainingStorypoints: PropTypes.string,
  onClick: PropTypes.func,
  metadata: PropTypes.object,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  handleDragStart: PropTypes.func,
  handleDragEnd: PropTypes.func
}

export default flow(
  DropTarget(DragType.CARD, cardTarget, connect => ({
    connectDropTarget: connect.dropTarget()
  })),
  DragSource(DragType.CARD, cardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))
)(Card)
