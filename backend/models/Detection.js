const mongoose = require('mongoose');

const DetectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    detections: [
      {
        class: { type: String, required: true },
        class_id: { type: Number, required: true }, // Added to track class ID
        confidence: { type: Number, required: true },
        box: { type: [Number], required: true },
      },
    ],
    summary: {
      total_detections: { type: Number },
      unique_classes: { type: Number }, // Changed from classes_found count
      class_counts: { type: mongoose.Schema.Types.Mixed }, // Object with class names and counts
      highest_confidence: { type: Number },
      average_confidence: { type: Number }, // Added average confidence
    },
    annotated_image: {
      type: String,
      default: '',
    },
    annotated_image_public_id: {
      type: String,
      default: null,
    },
    image_dimensions: {
      width: { type: Number },
      height: { type: Number },
    },
    // PRIMARY waste type (the one with highest confidence)
    primaryWasteType: {
      type: String,
      default: 'Unknown',
    },
    // ALL detected waste types (for better analytics)
    detectedWasteTypes: {
      type: [String],
      default: [],
    },
    ai_tips: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add a virtual property for imageUrl (for backward compatibility)
DetectionSchema.virtual('imageUrl').get(function () {
  return this.annotated_image;
});

// Ensure virtuals are included when converting to JSON
DetectionSchema.set('toJSON', { virtuals: true });
DetectionSchema.set('toObject', { virtuals: true });

// Pre-save middleware to automatically set waste types and category
DetectionSchema.pre('save', function (next) {
  if (this.detections && this.detections.length > 0) {
    // Get the detection with highest confidence
    const topDetection = this.detections.reduce((prev, current) =>
      (prev.confidence > current.confidence) ? prev : current
    );

    // Set primary waste type from the class name with highest confidence
    this.primaryWasteType = topDetection.class;

    // Collect all detected waste types
    this.detectedWasteTypes = [...new Set(this.detections.map(d => d.class))];
  }
  next();
});

// Index for faster queries
DetectionSchema.index({ user: 1, createdAt: -1 });
DetectionSchema.index({ primaryWasteType: 1 });
DetectionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Detection', DetectionSchema);