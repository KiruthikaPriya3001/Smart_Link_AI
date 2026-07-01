const Folder = require('../models/Folder');
const Url = require('../models/Url');

// @desc    Get user folders with URL counts
// @route   GET /api/folders
// @access  Private
const getFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    const folders = await Folder.find({ userId }).sort({ name: 1 });

    // Calculate URL counts for each folder
    const folderStats = await Promise.all(
      folders.map(async (folder) => {
        const urlCount = await Url.countDocuments({ folderId: folder._id, userId });
        return {
          _id: folder._id,
          name: folder.name,
          createdAt: folder.createdAt,
          urlCount,
        };
      })
    );

    res.status(200).json({ success: true, data: folderStats });
  } catch (error) {
    console.error('Get Folders Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving folders' });
  }
};

// @desc    Create new folder
// @route   POST /api/folders
// @access  Private
const createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide folder name' });
    }

    // Check if name already exists for user
    const folderExists = await Folder.findOne({ name: name.trim(), userId });
    if (folderExists) {
      return res.status(400).json({ success: false, message: 'Folder with this name already exists' });
    }

    const folder = await Folder.create({
      name: name.trim(),
      userId,
    });

    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    console.error('Create Folder Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating folder' });
  }
};

// @desc    Update folder name
// @route   PUT /api/folders/:id
// @access  Private
const updateFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    const folderId = req.params.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide folder name' });
    }

    let folder = await Folder.findOne({ _id: folderId, userId });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found or unauthorized' });
    }

    // Check duplicate name
    const folderExists = await Folder.findOne({ name: name.trim(), userId, _id: { $ne: folderId } });
    if (folderExists) {
      return res.status(400).json({ success: false, message: 'Another folder with this name already exists' });
    }

    folder.name = name.trim();
    await folder.save();

    res.status(200).json({ success: true, data: folder });
  } catch (error) {
    console.error('Update Folder Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating folder' });
  }
};

// @desc    Delete folder and unassign associated URLs
// @route   DELETE /api/folders/:id
// @access  Private
const deleteFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.params.id;

    const folder = await Folder.findOne({ _id: folderId, userId });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found or unauthorized' });
    }

    // Remove the folder
    await Folder.deleteOne({ _id: folderId });

    // Set matching URLs folderId to null (so they aren't orphaned or deleted)
    await Url.updateMany({ folderId, userId }, { $set: { folderId: null } });

    res.status(200).json({ success: true, message: 'Folder deleted and links updated successfully' });
  } catch (error) {
    console.error('Delete Folder Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting folder' });
  }
};

module.exports = {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
};
