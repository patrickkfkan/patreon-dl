import { type DBConstructor } from '.';

export type EnvDBConstructor = new (
  ...args: any[]
) => InstanceType<ReturnType<typeof EnvDBMixin<DBConstructor>>>;

export function EnvDBMixin<TBase extends DBConstructor>(Base: TBase) {
  return class EnvDB extends Base {
    async saveEnvValue(key: string, value: any) {
      this.log('debug', `Save env value for "${key}" to DB`);
      const exists = await this.checkEnvExists(key);
      if (!exists) {
        await this.run(
          `
          INSERT INTO env (
            env_key,
            value
          )
          VALUES (?, ?)
          `,
          [
            key,
            JSON.stringify(value)
          ]
        );
      } else {
        this.log('debug', `Env value for "${key}" already exists in DB - update record`);
        await this.run(`
          UPDATE env
          SET
            value = ?
          WHERE env_key = ?
          `,
          [
            JSON.stringify(value),
            key
          ]
        );
      }
    }

    async getEnvValue<T = any>(key: string): Promise<T | null> {
      this.log('debug', `Get env value for "${key}" from DB`);
      const result = await this.get(
        `SELECT value FROM env WHERE env_key = ?`,
        [key]
      );
      return result ? JSON.parse(result.value) : null;
    }

    async checkEnvExists(key: string): Promise<boolean> {
      this.log('debug', `Check if env value for "${key}" exists in DB`);
      try {
        const result = await this.get(
          `
          SELECT COUNT(*) as count
          FROM env
          WHERE
            env_key = ?
          `,
          [ key ]
        );
        return result.count > 0;
      } catch (error) {
        this.log(
          'error',
          `Failed to check if env value for "${key}" exist in DB:`,
          error
        );
        return false;
      }
    }
  }
}