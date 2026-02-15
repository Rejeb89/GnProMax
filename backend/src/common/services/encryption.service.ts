import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger('EncryptionService');
  private readonly bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

  async hashPassword(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, this.bcryptRounds);
      return hash;
    } catch (error) {
      this.logger.error(`Failed to hash password: ${(error as Error).message}`);
      throw error;
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      this.logger.error(`Failed to compare password: ${(error as Error).message}`);
      throw error;
    }
  }

  generateRandomString(length: number = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
