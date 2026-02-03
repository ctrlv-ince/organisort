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
        confidence: { type: Number, required: true },
        box: { type: [Number], required: true },
      },
    ],
    summary: {
      total_detections: { type: Number },
      classes_found: { type: [String] },
      highest_confidence: { type: Number },
    },
    annotated_image: {
      type: String,
      required: true,
    },
    image_dimensions: {
      width: { type: Number },
      height: { type: Number },
    },
    // Additional fields for better history display
    wasteType: {
      type: String,
      default: 'Unknown',
    },
    category: {
      type: String,
      enum: ['organic', 'recyclable', 'non-recyclable', 'unknown'],
      default: 'unknown',
    },
  },
  {
    timestamps: true, // This will add `createdAt` and `updatedAt` fields
  }
);

// Add a virtual property for imageUrl (for backward compatibility)
DetectionSchema.virtual('imageUrl').get(function() {
  return this.annotated_image;
});

// Ensure virtuals are included when converting to JSON
DetectionSchema.set('toJSON', { virtuals: true });
DetectionSchema.set('toObject', { virtuals: true });

// Pre-save middleware to automatically set wasteType and category
DetectionSchema.pre('save', function(next) {
  if (this.detections && this.detections.length > 0) {
    // Get the detection with highest confidence
    const topDetection = this.detections.reduce((prev, current) => 
      (prev.confidence > current.confidence) ? prev : current
    );
    
    // Set wasteType from the class name
    this.wasteType = topDetection.class;
    
    // Automatically determine category based on class name
    const className = topDetection.class.toLowerCase();
    if (className.includes('organic')) {
      this.category = 'organic';
    } else if (className.includes('recycl')) {
      this.category = 'recyclable';
    } else if (className.includes('non-recycl')) {
      this.category = 'non-recyclable';
    } else {
      this.category = 'unknown';
    }
  }
  next();
});

module.exports = mongoose.model('Detection', DetectionSchema);