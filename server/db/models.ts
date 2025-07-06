import { initModels } from '~/server/models/init-models';
import sequelize from './sequelize';

export const initDB = async () => {
  try {
    await sequelize.authenticate();
  } catch (err) {
    console.error(err)
  }
};


const models = initModels(sequelize);

export default models;