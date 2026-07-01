const Tag = require('../models/Tag');
const Url = require('../models/Url');

// @desc    Get user tags
// @route   GET /api/tags
// @access  Private
const getTags = async (req, res) => {
  try {
    const userId = req.user.id;
    const tags = await Tag.find({ userId }).sort({ name: 1 });
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    console.error('Get Tags Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving tags' });
  }
};

// @desc    Create new tag
// @route   POST /api/tags
// @access  Private
const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide tag name' });
    }

    // Check duplicate tag
    const tagExists = await Tag.findOne({ name: name.trim().toLowerCase(), userId });
    if (tagExists) {
      return res.status(200).json({ success: true, data: tagExists, message: 'Tag already exists' });
    }

    const tag = await Tag.create({
      name: name.trim(),
      color: color || '#6366f1',
      userId,
    });

    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    console.error('Create Tag Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating tag' });
  }
};

// @desc    Delete tag and pull from all URLs
// @route   DELETE /api/tags/:id
// @access  Private
const deleteTag = async (req, res) => {
  try {
    const userId = req.user.id;
    const tagId = req.params.id;

    const tag = await Tag.findOne({ _id: tagId, userId });
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found or unauthorized' });
    }

    // Delete tag
    await Tag.deleteOne({ _id: tagId });

    // Pull from all URL records tags array
    await Url.updateMany({ userId }, { $pull: { tags: tagId } });

    res.status(200).json({ success: true, message: 'Tag deleted and unassigned from URLs successfully' });
  } catch (error) {
    console.error('Delete Tag Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting tag' });
  }
};

module.exports = {
  getTags,
  createTag,
  deleteTag,
};
