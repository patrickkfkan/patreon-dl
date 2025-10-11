import { type User } from '../../entities';
import { type MediaDBConstructor } from './MediaDBMixin.js';

export type UserDBConstructor = new (
  ...args: any[]
) => InstanceType<ReturnType<typeof UserDBMixin<MediaDBConstructor>>>;

const NULL_USER: User = {
  id: '-1',
  type: 'user',
  firstName: '(null)',
  lastName: '',
  fullName: '(null)',
  createdAt: null,
  image: {
    type: 'image',
    id: 'user:-1:image',
    filename: 'user-image',
    mimeType: null,
    imageType: 'single',
    imageURL: null,
    thumbnailURL: null
  },
  thumbnail: {
    type: 'image',
    id: 'user:-1:thumbnail',
    filename: 'user-thumbnail',
    mimeType: null,
    imageType: 'single',
    imageURL: null,
    thumbnailURL: null
  },
  url: '',
  vanity: null,
  raw: {}
}

export function UserDBMixin<TBase extends MediaDBConstructor>(Base: TBase) {
  return class UserDB extends Base {
    saveUser(user: User | null) {
      if (!user) {
        user = NULL_USER; 
      }
      this.log('debug', `Save user #${user.id} (${user.vanity}) to DB`);
      try {
        const userExists = this.checkUserExists(user.id);

        this.saveMedia(user.image);
        this.saveMedia(user.thumbnail);
        
        if (!userExists) {
          this.run(
            `
            INSERT INTO user (
              user_id,
              full_name,
              vanity,
              details
            )
            VALUES (?, ?, ?, ?)
            `,
            [
              user.id,
              user.fullName,
              user.vanity,
              JSON.stringify(user)
            ]
          );
        } else {
          this.log('debug', `User #${user.id} already exists in DB - update record`);
          this.run(
            `
            UPDATE user
            SET
              full_name = ?,
              vanity = ?,
              details = ?
            WHERE user_id = ?
            `,
            [
              user.fullName,
              user.vanity,
              JSON.stringify(user),
              user.id
            ]
          );
        }
      } catch (error) {
        this.log(
          'error',
          `Failed to save user #${user.id} (${user.vanity}) to DB:`,
          error
        );
        throw error;
      }
    }

    getUserByID(id: string): User | null {
      this.log('debug', `Get user #${id} from DB`);
      try {
        const result = this.get(
          `SELECT details FROM user WHERE user_id = ?`,
          [id]
        );
        return result ? JSON.parse(result.details) : null;
      } catch (error) {
        this.log('error', `Failed to get user by ID "${id}" from DB:`, error);
        return null;
      }
    }

    checkUserExists(id: string) {
      this.log('debug', `Check if user #${id} exists in DB`);
      try {
        const result = this.get(
          `SELECT COUNT(*) as count FROM user WHERE user_id = ?`,
          [id]
        );
        return result.count > 0;
      } catch (error) {
        this.log(
          'error',
          `Failed to check if user #${id} exists in DB:`,
          error
        );
        return false;
      }
    }
  };
}
