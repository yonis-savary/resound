// server/db/index.js
import { type Dialect, Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME as string,
  process.env.DATABASE_USER as string,
  process.env.DATABASE_PASSWORD as string,
  {
    host: (process.env.DATABASE_HOST || 'localhost'),
    port: (process.env.DATABASE_PORT || 44005) as number,
    dialect: (process.env.DATABASE_DRIVER || 'postgres') as Dialect,
    logging: false,
    minifyAliases: true
  }
);


export default sequelize