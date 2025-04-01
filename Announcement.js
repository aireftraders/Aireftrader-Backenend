const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'] 
  },
  message: { 
    type: String, 
    required: [true, 'Message is required'] 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  recipients: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    read: { 
      type: Boolean, 
      default: false 
    },
    telegramMsgId: {
      type: String,
      index: true
    }
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
}, { 
  timestamps: true 
});

// Indexes for optimized queries
AnnouncementSchema.index({ isActive: 1, createdAt: -1 }); // Active announcements
AnnouncementSchema.index({ 'recipients.userId': 1, 'recipients.read': 1 }); // User-specific status
AnnouncementSchema.index({ createdAt: -1 }); // Sorting by latest

module.exports = mongoose.model('Announcement', AnnouncementSchema);