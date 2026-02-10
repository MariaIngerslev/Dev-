const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    name: { type: String, default: 'Anonym' },
    content: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    createdAt: { type: Date, default: Date.now }
});

commentSchema.index({ postId: 1 });

module.exports = mongoose.model('Comment', commentSchema);
