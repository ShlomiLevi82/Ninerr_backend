import { gigService } from './services/gig.service.js'
import { userService } from './services/user.service.js'
import { utilService } from './services/util.service.js'

console.log('Simple driver to test some API calls')

window.onLoadgigs = onLoadgigs
window.onLoadUsers = onLoadUsers
window.onAddgig = onAddgig
window.onGetgigById = onGetgigById
window.onRemovegig = onRemovegig
window.onAddgigMsg = onAddgigMsg

async function onLoadgigs() {
  const gigs = await gigService.query()
  render('gigs', gigs)
}
async function onLoadUsers() {
  const users = await userService.query()
  render('Users', users)
}

async function onGetgigById() {
  const id = prompt('gig id?')
  if (!id) return
  const gig = await gigService.getById(id)
  render('gig', gig)
}

async function onRemovegig() {
  const id = prompt('gig id?')
  if (!id) return
  await gigService.remove(id)
  render('Removed gig')
}

async function onAddgig() {
  await userService.login({ username: 'puki', password: '123' })
  const savedgig = await gigService.save(gigService.getEmptygig())
  render('Saved gig', savedgig)
}

async function onAddgigMsg() {
  await userService.login({ username: 'puki', password: '123' })
  const id = prompt('gig id?')
  if (!id) return

  const savedMsg = await gigService.addgigMsg(id, 'some msg')
  render('Saved Msg', savedMsg)
}

function render(title, mix = '') {
  console.log(title, mix)
  const output = utilService.prettyJSON(mix)
  document.querySelector('h2').innerText = title
  document.querySelector('pre').innerHTML = output
}
