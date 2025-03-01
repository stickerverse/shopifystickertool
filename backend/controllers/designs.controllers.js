const Design = require('../models/design.model');
const User = require('../models/user.model');

// --- Create a new design ---
exports.createDesign = async (req, res) => {
    try {
      const { name, designData, previewImageUrl } = req.body;
      const userId = req.user.uid; // Get user ID from decoded JWT

      // Find the user in your database using the Firebase UID
      let user = await User.findOne({ uid: userId });

      //If the user doesn't exist, create a new user
        if(!user){
            user = new User({
                uid: req.user.uid,
                email: req.user.email,
            });
            await user.save();
        }

      const newDesign = new Design({
        userId: user._id, // Use Mongoose ObjectId of the user
        name,
        designData,
        previewImageUrl,
      });

      const savedDesign = await newDesign.save();
      res.status(201).json(savedDesign);
    } catch (err) {
      console.error(err); // Log the full error
      res.status(400).json({ message: err.message });
    }
  };

// --- Get a design by ID ---
exports.getDesign = async (req, res) => {
    try {
        const design = await Design.findById(req.params.id).populate('userId', 'email'); // Populate user info
        if (!design) {
            return res.status(404).json({ message: 'Design not found' });
        }

        // Check if the requesting user owns the design
        if (design.userId.uid !== req.user.uid) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to access this design' });
        }
        res.json(design);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- Get all designs for a user ---
exports.getAllDesigns = async (req, res) => {
    try {
      const userId = req.user.uid; // Get user ID from decoded JWT
       // Find the user in your database using the Firebase UID
       let user = await User.findOne({ uid: userId });
       if(!user){
        return res.status(404).json({message: 'User Not Found'});
       }
      const designs = await Design.find({ userId: user._id }).populate('userId', 'email').sort({ updatedAt: -1 });  // Sort by last updated
      res.json(designs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

// --- Update a design ---
exports.updateDesign = async (req, res) => {
    try {
        const design = await Design.findById(req.params.id);
        if (!design) {
            return res.status(404).json({ message: 'Design not found' });
        }

        // Ensure the user owns the design
        if (design.userId.toString() !== (await User.findOne({uid: req.user.uid}))._id.toString()) {
          return res.status(403).json({ message: 'Forbidden' });
        }

        const updatedDesign = await Design.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedDesign);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// --- Delete a design ---
exports.deleteDesign = async (req, res) => {
    try {
        const design = await Design.findById(req.params.id);
        if (!design) {
            return res.status(404).json({ message: 'Design not found' });
        }

        // Ensure the user owns the design
        if (design.userId.toString() !== (await User.findOne({uid: req.user.uid}))._id.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await Design.findByIdAndDelete(req.params.id);
        res.json({ message: 'Design deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};