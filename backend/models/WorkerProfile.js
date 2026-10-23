import mongoose from 'mongoose';

const workerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Ek worker ka sirf ek hi profile record hoga
    },
    occupation: {
      type: String,
      required: true, // Jaise: "Electrician", "Plumber", "Carpenter"
    },
    category: {
      type: String,
      required: true, // Jaise: "Home Maintenance", "Construction", "Cleaning"
    },
    experienceYears: {
      type: Number,
      required: true,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    city: {
      type: String,
      required: true,
      default: 'Islamabad',
    },
    address: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('WorkerProfile', workerProfileSchema);