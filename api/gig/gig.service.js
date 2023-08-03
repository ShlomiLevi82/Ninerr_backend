import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb

async function query(filterBy) {
  try {
    const criteria = _buildCriteria(filterBy)
    console.log('🚀 ~ file: gig.service.js:10 ~ query ~ criteria:', criteria)
    const collection = await dbService.getCollection('gig')
    let gigs = await collection.find(criteria).toArray()
    return gigs
  } catch (err) {
    logger.error('Cannot find gigs', err)
    throw err
  }
}

async function getById(gigId) {
  try {
    const collection = await dbService.getCollection('gig')
    const gig = collection.findOne({ _id: ObjectId(gigId) })
    return gig
  } catch (err) {
    logger.error(`while finding gig ${gigId}`, err)
    throw err
  }
}

async function remove(gigId) {
  try {
    const collection = await dbService.getCollection('gig')
    await collection.deleteOne({ _id: ObjectId(gigId) })
    return gigId
  } catch (err) {
    logger.error(`cannot remove gig ${gigId}`, err)
    throw err
  }
}

async function add(gig) {
  console.log('🚀 ~ file: gig.service.js:42 ~ add ~ gig:', gig)
  try {
    const collection = await dbService.getCollection('gig')
    console.log('🚀 ~ file: gig.service.js:45 ~ add ~ collection:', collection)
    const addedGig = await collection.insertOne(gig)
    console.log('🚀 ~ file: gig.service.js:47 ~ add ~ addedGig:', addedGig)
    return addedGig
  } catch (err) {
    logger.error('cannot insert gig', err)
    throw err
  }
}

async function update(gig) {
  try {
    let id = ObjectId(gig._id)
    let temp = gig._id
    delete gig._id
    const collection = await dbService.getCollection('gig')
    await collection.updateOne({ _id: id }, { $set: { ...gig } })
    gig._id = temp
    return gig
  } catch (err) {
    logger.error(`cannot update gig ${gig._id}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  let criteria = {}
  let minMaxPrice = [parseInt(filterBy.minPrice), parseInt(filterBy.maxPrice)]

  if (filterBy.txt) {
    const txtCriteria = { $regex: txt, $options: 'i' }
    criteria.title = txtCriteria
  }

  if (minMaxPrice.length) {
    criteria.price = {
      $gte: parseInt(filterBy.minPrice),
      $lte: parseInt(filterBy.maxPrice),
    }
  }

  if (filterBy.delivery) {
    criteria.daysToMake = { $lte: parseInt(filterBy.delivery) }
  }

  return criteria
}

export const gigService = {
  remove,
  query,
  getById,
  add,
  update,
}
