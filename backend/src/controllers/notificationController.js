const Notification = require('../models/Notification');
const Url = require('../models/Url');

const listNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('List notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error listing notifications' });
  }
};

const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.body;

    if (notificationId) {
      await Notification.updateOne({ _id: notificationId, userId }, { read: true });
    } else {
      await Notification.updateMany({ userId, read: false }, { read: true });
    }

    const unreadCount = await Notification.countDocuments({ userId, read: false });
    res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json({ success: false, message: 'Server error updating notifications' });
  }
};

const createNotification = async ({ userId, type, title, message, linkId = null, metadata = {} }) => {
  if (!userId) return null;

  return Notification.create({
    userId,
    type,
    title,
    message,
    linkId,
    metadata,
  });
};

const createUrlNotifications = async (url) => {
  if (!url?.userId) return;

  await createNotification({
    userId: url.userId,
    type: 'url_created',
    title: 'New URL created',
    message: `Your short link for ${url.originalUrl} is ready.`,
    linkId: url._id,
    metadata: { shortCode: url.customAlias || url.shortCode },
  });

  const expiryDate = url.expiryDate;
  if (expiryDate) {
    const msUntilExpiry = new Date(expiryDate).getTime() - Date.now();
    if (msUntilExpiry <= 7 * 24 * 60 * 60 * 1000 && msUntilExpiry > 0) {
      await createNotification({
        userId: url.userId,
        type: 'url_expiring',
        title: 'URL expiring soon',
        message: `Your link ${url.customAlias || url.shortCode} will expire soon.`,
        linkId: url._id,
      });
    }
  }
};

const createClickNotification = async (url) => {
  if (!url?.userId) return;

  await createNotification({
    userId: url.userId,
    type: 'url_clicked',
    title: 'URL clicked',
    message: `Your short link ${url.customAlias || url.shortCode} received a new click.`,
    linkId: url._id,
  });
};

const createExpiryNotification = async (url, expired = false) => {
  if (!url?.userId) return;

  await createNotification({
    userId: url.userId,
    type: expired ? 'url_expired' : 'url_expiring',
    title: expired ? 'URL expired' : 'URL expiring soon',
    message: expired
      ? `Your link ${url.customAlias || url.shortCode} has expired.`
      : `Your link ${url.customAlias || url.shortCode} will expire soon.`,
    linkId: url._id,
  });
};

module.exports = {
  listNotifications,
  markNotificationsAsRead,
  createNotification,
  createUrlNotifications,
  createClickNotification,
  createExpiryNotification,
};
