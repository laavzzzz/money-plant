import mongoose, { Schema, model, models } from 'mongoose';

// Define the structure for your savings goals
const GoalSchema = new Schema({
  title: { type: String, required: true },
  target: { type: Number, required: true },
  saved: { type: Number, default: 0 },
  emoji: { type: String, default: '🎯' },
  color: { type: String, default: 'bg-blue-100' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Ensure the file is recognized as a module by exporting the model
const Goal = models.Goal || model('Goal', GoalSchema);

export default Goal;