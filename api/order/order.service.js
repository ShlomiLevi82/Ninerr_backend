import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('order')
    // const orders = await collection.find(criteria).toArray()
    const pipeline = [
      {
        $match: criteria
      },
      {
        $addFields: {
          timestamp: { $toDate: '$_id' }
        }
      },
      {
        $sort: {
          timestamp: -1
        }
      }
    ]

    const orders = await collection.aggregate(pipeline).toArray();
    return orders
  } catch (err) {
    logger.error('cannot find orders', err)
    throw err
  }
}

async function remove(orderId) {
  try {
    const store = asyncLocalStorage.getStore()
    const { loggedinUser } = store
    const collection = await dbService.getCollection('order')
    // remove only if user is owner/admin
    const criteria = { _id: ObjectId(orderId) }
    if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
    const { deletedCount } = await collection.deleteOne(criteria)
    return deletedCount
  } catch (err) {
    logger.error(`cannot remove order ${orderId}`, err)
    throw err
  }
}

async function add(order) {
  try {
    const orderToAdd = {
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      buyerName: order.buyerName,
      gigId: order.gigId,
      gigTitle: order.gigTitle,
      price: order.price,
      status: order.status,
      imgUrl: order.imgUrl,
    }
    const collection = await dbService.getCollection('order')
    await collection.insertOne(orderToAdd)
    return orderToAdd
  } catch (err) {
    logger.error('cannot insert order', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.buyerId) {
    criteria['buyerId'] = filterBy.buyerId
  }
  if (filterBy.sellerId) {
    criteria['sellerId'] = filterBy.sellerId
  }
  return criteria
}

export const orderService = {
  query,
  remove,
  add,
  update,
}

async function update(order) {
  console.log('🚀 ~ file: order.service.js:76 ~ update ~ order:', order)
  try {
    let id = ObjectId(order._id)
    let temp = order._id
    delete order._id
    const collection = await dbService.getCollection('order')
    await collection.updateOne({ _id: id }, { $set: { ...order } })
    order._id = temp
    return order
  } catch (err) {
    logger.error(`cannot update order ${order._id}`, err)
    throw err
  }
}
