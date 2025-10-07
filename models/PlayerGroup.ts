import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICharacter {
  name: string;
  imageUrl?: string;
}

export interface IPlayerGroup extends Document {
  name: string;
  userId: mongoose.Types.ObjectId;
  characters: ICharacter[];
  createdAt: Date;
}

const CharacterSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
});

const PlayerGroupSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  characters: {
    type: [CharacterSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default (mongoose.models.PlayerGroup as Model<IPlayerGroup>) || 
  mongoose.model<IPlayerGroup>('PlayerGroup', PlayerGroupSchema);
