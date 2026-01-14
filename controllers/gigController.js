const Gig = require('../models/Gig');
const Bid = require('../models/Bid');

const getAllGigs = async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                title: {
                    $regex: req.query.search,
                    $options: 'i',
                },
            }
            : {};

        const gigs = await Gig.find({ ...keyword, status: 'open' })
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });

        res.json(gigs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyGigs = async (req, res) => {
    try {
        const gigs = await Gig.find({ owner: req.user._id })
            .sort({ createdAt: -1 });
        res.json(gigs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createGig = async (req, res) => {
    try {
        const { title, description, budget } = req.body;

        const gig = await Gig.create({
            title,
            description,
            budget,
            owner: req.user._id,
        });

        res.status(201).json(gig);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGigById = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id).populate('owner', 'name email');

        if (gig) {
            res.json(gig);
        } else {
            res.status(404).json({ message: 'Gig not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateGig = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({ message: 'Gig not found' });
        }

        // Check ownership
        if (gig.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check status
        if (gig.status !== 'open') {
            return res.status(400).json({ message: 'Cannot edit: Gig is not open' });
        }

        // Check for bids
        const bidCount = await Bid.countDocuments({ gig: req.params.id });
        if (bidCount > 0) {
            return res.status(400).json({ message: 'Cannot edit: Gig already has bids' });
        }

        gig.title = req.body.title || gig.title;
        gig.description = req.body.description || gig.description;
        gig.budget = req.body.budget || gig.budget;

        const updatedGig = await gig.save();
        res.json(updatedGig);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteGig = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({ message: 'Gig not found' });
        }

        // Check ownership
        if (gig.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check status
        if (gig.status !== 'open') {
            return res.status(400).json({ message: 'Cannot delete: Gig is not open' });
        }

        // Check for bids
        const bidCount = await Bid.countDocuments({ gig: req.params.id });
        if (bidCount > 0) {
            return res.status(400).json({ message: 'Cannot delete: Gig has bids' });
        }

        await gig.deleteOne();
        res.json({ message: 'Gig removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllGigs,
    getMyGigs,
    createGig,
    getGigById,
    updateGig,
    deleteGig
};
