import React, { Component } from 'react';
import '../App.css';
import {Board} from '../trello-board'

const data = require('../data.json')


class App extends Component {

  componentDidMount() {
    var file = 'tasks.json'
    var obj = {name: 'JP'}
  
    console.log(Board);
    console.log('data',data);
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
      <div className="App">
        <div className="App-header">
          <h2>Logo</h2>
        </div>
          <Board data={data} draggable={true} eventBusHandle={setEventBus} onDataChange={shouldReceiveNewData} handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} />
      </div>
    );
  }
}

export default App;