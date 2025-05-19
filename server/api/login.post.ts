import { z } from "zod"
import bcrypt from "bcrypt"

import models from "../db/models"

const bodySchema = z.object({
    username: z.string(),
    password: z.string()
})

export default defineEventHandler(async (event) => {
    const {username, password} = await readValidatedBody(event, bodySchema.parse)

    const user = await models.User.findOne({where: {username: username}})
    if (!user)
        return createError({statusCode: 401, statusMessage: '/login?error=bad_login'})

    const isValid = await bcrypt.compare(password, user.dataValues.password)
    console.info(password, user.dataValues.password, isValid , bcrypt.hashSync(password, 10))
    if (!isValid)
        return createError({statusCode: 401, statusMessage: '/login?error=bad_login'})

    await setUserSession(event, {user});
    return {redirect:'/'};
})