import express from 'express'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import {
  getGigs,
  getGigById,
  addGig,
  updateGig,
  removeGig,
  // addgigMsg,
  // removegigMsg,
} from './gig.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', getGigs)
// router.get('/', log, getGigs)
router.get('/:id', getGigById)
router.post('/', addGig)
router.put('/:id', updateGig)
router.delete('/:id', removeGig)
// router.post('/', requireAuth, addGig)
// router.put('/:id', requireAuth, updateGig)
// router.delete('/:id', requireAuth, removeGig)
// router.delete('/:id', requireAuth, requireAdmin, removegig)

// router.post('/:id/msg', requireAuth, addgigMsg)
// router.delete('/:id/msg/:msgId', requireAuth, removegigMsg)

export const gigRoutes = router
