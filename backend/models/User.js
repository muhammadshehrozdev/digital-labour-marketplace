import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    // M1-14: stored lower-case and trimmed, so "Ali@X.com " and "ali@x.com" are one account.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    // M1-14: never loaded unless a query asks for it with .select('+password').
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    role: {
      type: String,
      enum: ['worker', 'customer', 'admin'],
      default: 'worker',
    },
    // Server-side logout (decision D-006): every login token carries this number;
    // logout increases it, so older tokens stop working.
    tokenVersion: { type: Number, default: 0 },
    // Per-account lockout: 5 wrong passwords -> login paused for 15 minutes.
    failedLoginCount: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

// bcrypt cost 12 (M1-14, OWASP Password Storage). Each +1 doubles the work.
export const BCRYPT_COST = 12;

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_COST);
});

// Login ke waqt password match karne ke liye
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);