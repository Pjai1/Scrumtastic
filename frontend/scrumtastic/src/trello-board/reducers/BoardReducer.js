import Lh from '../helpers/LaneHelper'

const boardReducer = (state = {lanes: null}, action) => {
  const {payload, type} = action
  switch (type) {
    case 'LOAD_BOARD':
      return Lh.initialiseLanes(state, payload)
    case 'ADD_CARD': 
      return Lh.appendCardToLane(state, payload)
    case 'REMOVE_CARD':
      return Lh.removeCardFromLane(state, payload)
    case 'MOVE_CARD':
      return Lh.moveCardAcrossLanes(state, payload)
    case 'UPDATE_CARDS':
          console.log("Got action: UPDATE CARD with payload: ", payload)
          console.log("ALSO GOT A STATE MAYN", state)
      return Lh.updateCardsForLane(state, payload)
    case 'UPDATE_LANES':
      return Lh.updateLanes(state, payload)
    case 'PAGINATE_LANE':
      return Lh.paginateLane(state, payload)
    default:
      return state
  }
}

export default boardReducer
