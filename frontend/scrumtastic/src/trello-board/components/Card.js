import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import Tag from './Tag'
import PropTypes from 'prop-types';
import {CardWrapper, CardHeader, CardTitle, CardRightContent, Detail, Footer} from '../styles/Base'
import {DragType} from '../helpers/DragType'
import {DragSource, DropTarget} from 'react-dnd'
var flow = require('lodash.flow')


class Card extends Component {

  // updateCard() {
  //     console.log(this.props)
  //     this.props.updateCards([{ id: this.props.id, title: "fuck you", label : "piece of shit"}])
  // }

  constructor(props) {
      super(props)

      this.state = {
          description: this.props.description,
          label: this.props.label,
          title: this.props.title,
          editing: false
      }
  }

  componentDidUpdate() {
      console.log("SET TITLE TO: ", this.state.title)
  }

  updateCard() {
      this.setState({ editing: false })
      this.props.updateCard({ id: this.props.id, description: this.state.description, label: this.state.label, title: this.state.title })
  }

  updateField(field, event) {
      var obj = {}
      obj[field] = event.target.value 

      console.log("Object is: ", obj)
      this.setState(obj)
  }

  renderEditingMode() {
    const {id, title, description, label, tags, connectDragSource, connectDropTarget, isDragging, ...otherProps} = this.props
    const opacity = isDragging ? 0 : 1
    const background = isDragging ? '#CCC' : '#E3E3E3'
    return (
      <div style={{background: background}}>
          <CardWrapper key={id} data-id={id} {...otherProps} style={{opacity: opacity}}>
            <CardHeader>
              <CardTitle><input type="text" onChange={this.updateField.bind(this, 'title')} value={this.state.title} /></CardTitle>
              <CardRightContent>{label}</CardRightContent>
            </CardHeader>
            {tags && <Footer>
              {tags.map((tag) => <Tag key={tag.title} {...tag} tagStyle={this.props.tagStyle} />)}
            </Footer>
            }
          </CardWrapper>
          <span onClick={this.updateCard.bind(this)}>UPDATE ME</span>
        </div>
    )
  }

  toggleEditMode() {
      this.setState({ editing: !this.state.editing })
  }

  renderDisplayMode() {
    const {id, title, description, label, tags, connectDragSource, connectDropTarget, isDragging, ...otherProps} = this.props
    const opacity = isDragging ? 0 : 1
    const background = isDragging ? '#CCC' : '#E3E3E3'
    return (
      <div style={{background: background}} onClick={this.toggleEditMode.bind(this)}>
          <CardWrapper key={id} data-id={id} {...otherProps} style={{opacity: opacity}}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardRightContent>{label}</CardRightContent>
            </CardHeader>
            <Detail onClick={this.props.removeCard.bind(this, this.props.listId, this.props.id)}>{description}<div className="center-align">
                                    &#x2715;
                                </div></Detail>
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
