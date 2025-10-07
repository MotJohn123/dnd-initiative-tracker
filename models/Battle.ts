import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBattleCharacter {
  id: string;
  name: string;
  isNPC: boolean;
  isRevealed: boolean;
  initiative: number;
  imageUrl?: string;
  isLair?: boolean;
}

export interface IBattle extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  characters: IBattleCharacter[];
  currentTurnIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BattleCharacterSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  isNPC: {
    type: Boolean,
    default: false,
  },
  isRevealed: {
    type: Boolean,
    default: false,
  },
  initiative: {
    type: Number,
    default: 0,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  isLair: {
    type: Boolean,
    default: false,
  },
});

const BattleSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  characters: {
    type: [BattleCharacterSchema],
    default: [],
  },
  currentTurnIndex: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

BattleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default (mongoose.models.Battle as Model<IBattle>) || 
  mongoose.model<IBattle>('Battle', BattleSchema);
