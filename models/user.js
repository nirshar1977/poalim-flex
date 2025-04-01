const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  address: {
    street: { 
      type: String, 
      required: true 
    },
    city: { 
      type: String, 
      required: true 
    },
    zipCode: { 
      type: String, 
      required: true 
    },
    country: { 
      type: String, 
      required: true 
    }
  },
  financialStatus: { 
    type: String, 
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  password: { 
    type: String, 
    required: true 
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    }
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);