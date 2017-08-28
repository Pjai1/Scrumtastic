import React, {Component} from 'react'
import PropTypes from 'prop-types';
import Loader from './Loader'
import Card from './Card'
import {Section, Header, Title, RightContent, DraggableList, Placeholder} from '../styles/Base'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {DropTarget} from 'react-dnd'
import update from 'react/lib/update'
import {DragType} from '../helpers/DragType'
import { findDOMNode } from 'react-dom'
import axios from 'axios';
import { BASE_URL } from '../../constants';

const laneActions = require('../actions/LaneActions')

const CARD_HEIGHT = 66
const CARD_MARGIN = 10
const OFFSET_HEIGHT = 15

class Lane extends Component {

  state = {
    loading: false,
    currentPage: this.props.currentPage,
    cards: this.props.cards,
    placeholderIndex: -1,
    token: '',
    error: []
  }

  componentWillMount() {
    let token = localStorage.getItem('token');
    this.setState({token: token});
  }

  handleScroll = (evt) => {
    const node = evt.target
    const elemScrolPosition = node.scrollHeight - node.scrollTop - node.clientHeight
    const {onLaneScroll} = this.props
    if (elemScrolPosition <= 0 && onLaneScroll && !this.state.loading) {
      const {currentPage} = this.state
      this.setState({loading: true})
      const nextPage = currentPage + 1
      onLaneScroll(nextPage, this.props.id)
        .then((moreCards) => {
          this.setState({loading: false})
          this.props.actions.paginateLane({laneId: this.props.id, newCards: moreCards, nextPage: nextPage})
        })
    }
  }

  sortCards (cards, sortFunction) {
    if (!cards) return []
    if (!sortFunction) return cards
    return cards.concat().sort(function (card1, card2) {
      return sortFunction(card1, card2)
    })
  }

  laneDidMount = (node) => {
    if (node) {
      node.addEventListener('scroll', this.handleScroll)
    }
  }

  moveCard = (dragIndex, hoverIndex) => {
    const {cards} = this.state
    const dragCard = cards[dragIndex]

    this.setState(update(this.state, {
      cards: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard]
        ]
      }
    }))
  }

  sameCards = (cardsA, cardsB) => {
    console.log('cardssss',cardsA, cardsB)
    return cardsA.length === cardsB.length && cardsA.every((el, ix) => this.sameCard(el, cardsB[ix]))
  }

  sameCard(cardA, cardB) {
      return cardA.id === cardB.id && cardA.title === cardB.title && cardA.label === cardB.label && cardA.description === cardB.description
  }

  componentWillReceiveProps (nextProps) {
    if (!this.sameCards(this.props.cards, nextProps.cards)) {
      this.setState({cards: nextProps.cards, currentPage: nextProps.currentPage})
    }
    if (!nextProps.isOver) {
      this.setState({ placeholderIndex: -1 })
    }
  }

  removeCard = (listId, cardId) => {
    const token = 'Bearer ' + this.state.token;

    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.defaults.headers.common['Authorization'] = token
    axios.delete(`${BASE_URL}/tasks/${cardId}`)
        .then((data) => {
            console.log(data)
        })
        .catch((error) => {
            this.setState({error});
        }) 

    this.props.actions.removeCard({laneId: listId, cardId: cardId})
  }

  updateCard = (updatedCard) => {
    console.log("THE UPDATED CARD IS: ", updatedCard)
    let newCards = JSON.parse(JSON.stringify(this.state.cards))
    newCards.forEach(function(card) {
        if(card.id === updatedCard.id) {
            card.title = updatedCard.title
            card.description = updatedCard.description
            card.label = updatedCard.label
        }
    })
    this.props.actions.updateCards({laneId: this.props.id, cards: newCards})
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !this.sameCards(this.props.cards, nextProps.cards) || nextState !== this.state
  }

  renderDragContainer = () => {
    const {connectDropTarget, laneSortFunction, onCardClick, id} = this.props
    console.log("PROPS ARE: ", this.props)
    const cardList = this.sortCards(this.state.cards, laneSortFunction).map((card, idx) => (
      <Card id={card.id}
        key={card.id}
        index={idx}
        listId={id}
        draggable={this.props.draggable}
        handleDragStart={this.props.handleDragStart}
        handleDragEnd={this.props.handleDragEnd}
        title={card.title}
        tags={card.tags}
        tagStyle={this.props.tagStyle}
        moveCard={this.moveCard}
        removeCard={this.removeCard}
        updateCard={this.updateCard}
        label={card.label}
        description={card.description}
        storyId={card.story_id}
        storyDesc={card.storyDesc}
        users={card.users}
        remainingStorypoints={card.remaining_storypoints}
        totalStorypoints={card.total_storypoints}
        onClick={() => onCardClick && onCardClick(card.id, card.metadata)} />
    ))

    if (this.state.placeholderIndex > -1) {
      cardList.splice(this.state.placeholderIndex, 0, (<Placeholder key='placeholder' />))
    }

    return connectDropTarget(
      <div>
        <DraggableList>
          { cardList }
        </DraggableList>
      </div>
    )
  }

  render () {
    const {loading} = this.state
    const {id, title, label, ...otherProps} = this.props
    return <Section {...otherProps} key={id} innerRef={this.laneDidMount}>
      <Header>
        <Title>{title}</Title>
        <RightContent>{label}</RightContent>
      </Header>
      {this.renderDragContainer()}
      {loading && <Loader />}
    </Section>
  }
}

Lane.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  laneSortFunction: PropTypes.func,
  cards: PropTypes.array,
  label: PropTypes.string,
  onLaneScroll: PropTypes.func,
  handleDragStart: PropTypes.func,
  handleDragEnd: PropTypes.func
}

const cardTarget = {
  drop (props, monitor, component) {
    const {id} = props
    const index = component.state.placeholderIndex
    const draggedObj = monitor.getItem()
    if (id !== draggedObj.listId) {
      console.log('ADDING CARD', id, draggedObj.card)
      props.actions.addCard({
        laneId: id,
        card: draggedObj.card,
        index}
      )
    } else {
      props.actions.updateCards({laneId: id, cards: component.state.cards})
    }
    component.setState({ placeholderIndex: -1 })
    return {
      listId: id
    }
  },

  hover (props, monitor, component) {
    const {id} = props
    const draggedObj = monitor.getItem()
    if (id === draggedObj.listId) {
      return
    }

    const placeholderIndex = getPlaceholderIndex(
      monitor.getClientOffset().y,
      findDOMNode(component).scrollTop
    )
    component.setState({ placeholderIndex })

    return monitor.isOver()

    function getPlaceholderIndex (y, scrollY) {
      // shift placeholder if y position more than card height / 2
      const yPos = y - OFFSET_HEIGHT + scrollY
      let placeholderIndex
      if (yPos < CARD_HEIGHT / 2) {
        placeholderIndex = -1 // place at the start
      } else {
        placeholderIndex = Math.floor((yPos - CARD_HEIGHT / 2) / (CARD_HEIGHT + CARD_MARGIN))
      }
      return placeholderIndex
    }
  }
}

function collect (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }
}

const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators(laneActions, dispatch)})

export default connect(null, mapDispatchToProps)(DropTarget(DragType.CARD, cardTarget, collect)(Lane))
