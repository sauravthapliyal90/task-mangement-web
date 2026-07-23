import mongoose from "mongoose";

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['pending', 'in-progress', 'completed'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'pending',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    // Denormalized team owner (the manager's id) so team-scoped queries
    // ("all tasks for my team") don't need a join/populate on every request.
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for the common filter/sort combinations described in
// the "Search and Filtering" bonus requirement (status+priority+due date).
taskSchema.index({ status: 1, priority: 1, dueDate: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
// Text index enables fast $text search across title/description.
taskSchema.index({ title: 'text', description: 'text' });

// Virtual "overdue" flag used by the analytics endpoints.
taskSchema.virtual('isOverdue').get(function isOverdue() {
  return this.status !== 'completed' && this.dueDate && this.dueDate < new Date();
});

taskSchema.set('toJSON', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);
 export default Task;
export { PRIORITIES, STATUSES };
