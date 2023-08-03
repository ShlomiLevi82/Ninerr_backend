import { httpService } from './http.service.js'
import { utilService } from './util.service.js'

export const gigService = {
  query,
  getById,
  save,
  remove,
  getEmptygig,
  addgigMsg,
}
window.cs = gigService

// async function query(filterBy = { txt: '', price: 0 }) {
//   return httpService.get('gig', filterBy)
// }
async function query() {
  return httpService.get('gig')
}
function getById(gigId) {
  return httpService.get(`gig/${gigId}`)
}

async function remove(gigId) {
  return httpService.delete(`gig/${gigId}`)
}
async function save(gig) {
  var savedgig
  if (gig._id) {
    savedgig = await httpService.put(`gig/${gig._id}`, gig)
  } else {
    savedgig = await httpService.post('gig', gig)
  }
  return savedgig
}

async function addgigMsg(gigId, txt) {
  const savedMsg = await httpService.post(`gig/${gigId}/msg`, { txt })
  return savedMsg
}

function getEmptygig() {
  return {
    vendor: 'Susita-' + (Date.now() % 1000),
    price: utilService.getRandomIntInclusive(1000, 9000),
  }
}
