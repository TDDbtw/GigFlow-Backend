const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');

const createBid = async (req, res) => {
    try {
        const { gigId, message, price } = req.body;

        const gig = await Gig.findById(gigId);

        if (!gig) {
            return res.status(404).json({ message: 'Gig not found' });
        }

        if (gig.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot bid on your own gig' });
        }

        if (gig.status !== 'open') {
            return res.status(400).json({ message: 'Gig is not open for bidding' });
        }

        const bid = await Bid.create({
            gig: gigId,
            freelancer: req.user._id,
            message,
            price,
        });

        res.status(201).json(bid);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already placed a bid on this gig' });
        }
        res.status(500).json({ message: error.message });
    }
};

const getBidsByGigId = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.gigId);

        if (!gig) {
            return res.status(404).json({ message: 'Gig not found' });
        }

        // Only owner can see all bids for their gig
        if (gig.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to view bids for this gig' });
        }

        const bids = await Bid.find({ gig: req.params.gigId })
            .populate('freelancer', 'name email')
            .sort({ createdAt: -1 });

        res.json(bids);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyBids = async (req, res) => {
    try {
        const bids = await Bid.find({ freelancer: req.user._id })
            .populate({
                path: 'gig',
                select: 'title status owner',
                populate: { path: 'owner', select: 'name' }
            })
            .sort({ createdAt: -1 });
        res.json(bids);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyBidOnGig = async (req, res) => {
    try {
        const bid = await Bid.findOne({ gig: req.params.gigId, freelancer: req.user._id });
        res.json(bid);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const hireFreelancer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bidId = req.params.id;
        const bid = await Bid.findById(bidId).session(session);

        if (!bid) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Bid not found' });
        }

        const gig = await Gig.findById(bid.gig).session(session);

        if (!gig) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Gig not found' });
        }

        // Check ownership
        if (gig.owner.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check if simple race condition (already assigned)
        if (gig.status === 'assigned') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Gig is already assigned' });
        }

        // 1. Update Gig
        gig.status = 'assigned';
        gig.winner = bid._id;
        await gig.save({ session });

        // 2. Update Winning Bid
        bid.status = 'hired';
        await bid.save({ session });

        // 3. Update Other Bids
        await Bid.updateMany(
            { gig: gig._id, _id: { $ne: bid._id } },
            { $set: { status: 'rejected' } }
        ).session(session);

        await session.commitTransaction();
        session.endSession();

        // Real-time notification
        const io = req.app.get('io');
        // Check if io exists to prevent errors in testing environments
        if (io) {
            io.to(bid.freelancer.toString()).emit('notification:hired', {
                gigTitle: gig.title,
                gigId: gig._id,
                message: `Congratulations! You have been hired for ${gig.title}`,
            });
        }

        res.json({ message: 'Freelancer hired successfully', gig });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Transaction Error:', error);
        res.status(500).json({ message: 'Hiring failed due to an internal error' });
    }
};

module.exports = {
    createBid,
    getBidsByGigId,
    getMyBids,
    getMyBidOnGig,
    hireFreelancer,
};
