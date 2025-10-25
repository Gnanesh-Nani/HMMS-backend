import { Schema } from '@nestjs/mongoose';

export function applyDefaultToJSON(schema) {
  schema.set('toJSON', {
    transform: (_, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });
}
