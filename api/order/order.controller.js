import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
import { userService } from '../user/user.service.js'
import { authService } from '../auth/auth.service.js'
import { orderService } from './order.service.js'

export async function getOrders(req, res) {
  try {
    const orders = await orderService.query(req.query)
    res.send(orders)
  } catch (err) {
    logger.error('Cannot get orders', err)
    res.status(400).send({ err: 'Failed to get orders' })
  }
}

export async function deleteOrder(req, res) {
  try {
    const deletedCount = await orderService.remove(req.params.id)
    if (deletedCount === 1) {
      res.send({ msg: 'Deleted successfully' })
    } else {
      res.status(400).send({ err: 'Cannot remove order' })
    }
  } catch (err) {
    logger.error('Failed to delete order', err)
    res.status(400).send({ err: 'Failed to delete order' })
  }
}

export async function addOrder(req, res) {
  let { loggedinUser } = req

  try {
    let order = req.body
    order.buyerId = req.body.buyerId
    order.sellerId = req.body.sellerId
    order.buyerName = req.body.buyerName
    order.gigId = req.body.gigId
    order.gigTitle = req.body.gigTitle
    order.price = req.body.price
    order.status = req.body.status
    order.imgUrl = req.body.imgUrl

    const addedOrder = await orderService.add(order)

    // socketService.emitToUser({
    //   type: 'gig-ordered',
    //   data: order,
    //   userId: order.sellerId,
    // })

    res.send(addedOrder)
  } catch (err) {
    logger.error('Failed to add order', err)
    res.status(400).send({ err: 'Failed to add order' })
  }
}

export async function updateOrder(req, res) {
  try {
    const order = req.body
    const updatedOrder = await orderService.update(order)
    res.json(updatedOrder)
  } catch (err) {
    logger.error('Failed to update order', err)
    res.status(500).send({ err: 'Failed to update order' })
  }
}
