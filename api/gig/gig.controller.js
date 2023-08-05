import { gigService } from './gig.service.js'
import { logger } from '../../services/logger.service.js'

// GET LIST
export async function getGigs(req, res) {
  try {
    let filterBy = {
      category: req.query.category || '',
      txt: req.query.searchText || '',
      minPrice: req.query.minPrice || 0,
      maxPrice: req.query.maxPrice || 1000000,
      delivery: req.query.delivery || 0,
      id: req.query.id || '',
    }

    const gigs = await gigService.query(filterBy)

    res.json(gigs)
    logger.debug('Getting Gigs', filterBy)
  } catch (err) {
    logger.error('Failed to get gigs', err)
    res.status(500).send({ err: 'Failed to get gigs' })
  }
}

// GET BY ID
export async function getGigById(req, res) {
  try {
    const gigId = req.params.id
    const gig = await gigService.getById(gigId)
    res.json(gig)
  } catch (err) {
    logger.error('Failed to get gig', err)
    res.status(500).send({ err: 'Failed to get gig' })
  }
}

// POST (add gig)
export async function addGig(req, res) {
  try {
    const gig = req.body
    const addedGig = await gigService.add(gig)
    res.json(addedGig)
  } catch (err) {
    logger.error('Failed to add gig', err)
    res.status(500).send({ err: 'Failed to add gig' })
  }
}

// PUT (Update gig)
export async function updateGig(req, res) {
  try {
    const gig = req.body
    const updatedGig = await gigService.update(gig)
    res.json(updatedGig)
  } catch (err) {
    logger.error('Failed to update gig', err)
    res.status(500).send({ err: 'Failed to update gig' })
  }
}

// DELETE (Remove gig)
export async function removeGig(req, res) {
  try {
    const gigId = req.params.id
    const removedId = await gigService.remove(gigId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove gig', err)
    res.status(500).send({ err: 'Failed to remove gig' })
  }
}
