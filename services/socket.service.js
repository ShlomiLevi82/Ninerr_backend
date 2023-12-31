import { logger } from './logger.service.js'
import { Server } from 'socket.io'

let gIo = null

export function setupSocketAPI(http) {
  gIo = new Server(http, {
    cors: {
      origin: '*',
    },
  })
  //   gIo.on('connection', (socket) => {
  //     logger.info(`New connected socket [id: ${socket.id}]`)
  //     socket.on('disconnect', (socket) => {
  //       logger.info(`Socket disconnected [id: ${socket.id}]`)
  //     })
  gIo.on('connection', (socket) => {
    logger.info(`New connected socket [id: ${socket.id}]`)

    socket.on('set-user-socket', (userId) => {
      logger.info(
        `Setting socket.userId = ${userId} for socket [id: ${socket.id}]`
        // `Setting socket.username = ${user.username} for socket [id: ${socket.id}]`
      )
      socket.userId = userId
      // socket.username = user.username
      return
    })

    socket.on('chat-set-topic', (topic) => {
      if (socket.myTopic === topic) return
      if (socket.myTopic) {
        socket.leave(socket.myTopic)
        logger.info(
          `Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`
        )
      }
      socket.myTopic = topic
      socket.emit(
        'chat-history',
        msgs.filter((msg) => msg.myTopic === socket.myTopic)
      )
      socket.join(topic)
      return
    })

    socket.on('join-chat', (nickname) => {
      socket.nickname = nickname
      socket.isNew = true

      logger.info(`${socket.nickname} joined a chat - [id: ${socket.id}]`)

      return
    })

    socket.on('chat-send-msg', async (msg) => {
      logger.info(
        `New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`
      )
      msgs.push(msg)

      gIo.to(socket.myTopic).emit('chat-add-msg', msg)

      if (socket.isNew) {
        let sellerSocket = _getUserSocket(socket.myTopic)
        setTimeout(() => {
          if (sellerSocket.userId === socket.myTopic) return
          socket.emit('chat-add-msg', {
            txt: `Hey ${socket.username}! Thanks for your message. ${sellerSocket.username} will return to you as soon as possible`,
            by: 'Higherr',
          }),
            1500
        })
        socket.isNew = false
      }
      return
    })

    socket.on('user-watch', async (user) => {
      logger.info(
        `user-watch from socket [id: ${socket.id}], on user ${user.username}`
      )
      socket.join('watching:' + user.username)

      const toSocket = await _getUserSocket(user._id)
      if (toSocket)
        toSocket.emit(
          'user-is-watching',
          `Hey ${user.username}! A user is watching your gig right now.`
        )
      return
    })

    socket.on('gig-ordered', (order) => {
      console.log('order', order)
      // logger.info(
      //   `ordered gig by socket [id: ${socket.id}], from user ${gig.owner.username}`
      // )
      // socket.join('watching:' + gig.owner.username)
      // socket.emit(
      //   'order-approved',
      //   `Hey ${socket.username}! \nYour order is being processed. stay tuned.`
      // )

      // toSocket.emit(
      //   'user-ordered-gig',
      //   `Hey ${gig.owner.username}! \nA user has just ordered one of your gigs right now.`
      // )
      emitToUser({
        type: 'user-ordered-gig',
        data: order,
        userId: order.sellerId,
      })
      return
    })

    socket.on('order-change-status', (order) => {
      console.log(
        '🚀 ~ file: socket.service.js:127 ~ socket.on ~ order:',
        order
      )
      logger.info(
        `Change order's status by socket [id: ${socket.id}], for buyer: ${order.buyerName}, id: ${order.buyerId}, on order ${order._id}.`
      )
      // socket.join('watching:' + order.buyerName)
      const { buyerId, _id, status } = order
      // const toSocket = await _getUserSocket(order.buyerId)
      emitToUser({
        type: 'order-status-update',
        data: { _id, status },
        userId: buyerId,
      })
      // if (socket)
      // socket.emit(
      //   'order-status-update',
      //   `Hey ${order.buyerName}! \nYour order's status has been changed.`
      // )
      return
    })

    socket.on('unset-user-socket', () => {
      logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
      delete socket.userId
      return
    })

    socket.userId = socket.on('disconnect', (socket) => {
      logger.info(`Socket disconnected [id: ${socket.id}]`)
    })
  })
}

function emitTo({ type, data, label }) {
  if (label) gIo.to('watching:' + label.toString()).emit(type, data)
  else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
  userId = userId.toString()
  const socket = await _getUserSocket(userId)

  if (socket) {
    logger.info(
      `Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`
    )
    socket.emit(type, data)
  } else {
    logger.info(`No active socket for user: ${userId}`)
  }
}

async function broadcast({ type, data, room = null, userId }) {
  userId = userId.toString()

  logger.info(`Broadcasting event: ${type}`)
  const excludedSocket = await _getUserSocket(userId)
  if (room && excludedSocket) {
    logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
    excludedSocket.broadcast.to(room).emit(type, data)
  } else if (excludedSocket) {
    logger.info(`Broadcast to all excluding user: ${userId}`)
    excludedSocket.broadcast.emit(type, data)
  } else if (room) {
    logger.info(`Emit to room: ${room}`)
    gIo.to(room).emit(type, data)
  } else {
    logger.info(`Emit to all`)
    gIo.emit(type, data)
  }
}

async function _getUserSocket(userId) {
  console.log(
    '🚀 ~ file: socket.service.js:188 ~ _getUserSocket ~ userId:',
    userId
  )
  const sockets = await _getAllSockets()
  const socket = sockets.find((s) => s.userId === userId)
  return socket
}
async function _getAllSockets() {
  const sockets = await gIo.fetchSockets()
  return sockets
}
export const socketService = {
  // set up the sockets service and define the API
  setupSocketAPI,
  // emit to everyone / everyone in a specific room (label)
  emitTo,
  // emit to a specific user (if currently active in system)
  emitToUser,
  // Send to all sockets BUT not the current socket - if found
  // (otherwise broadcast to a room / to all)
  broadcast,
}
