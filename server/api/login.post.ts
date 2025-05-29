import { z } from "zod"
import bcrypt from "bcrypt"
import {v4 as uuidV4 } from 'uuid'
import models from "../db/models"

const bodySchema = z.object({
    username: z.string(),
    password: z.string(),
    rememberMe: z.boolean().nullable()
})

export default defineEventHandler(async (event) => {
    const {username, password, rememberMe} = await readValidatedBody(event, bodySchema.parse)

    const user = await models.User.findOne({where: {username: username}})
    if (!user)
        return {redirect: '/login?error=bad_login', token: null}

    const isValid = await bcrypt.compare(password, user.dataValues.password)
    if (!isValid)
        return {redirect: '/login?error=bad_login', token: null}

    let token: string|null = null;
    if (rememberMe)
    {
        const cache = useStorage('cache');

        token = uuidV4()
        cache.setItem(token, user.id, { ttl: 3600*24*31 });

        // CACHE SET TOKEN;
        setCookie(event, 'remember_token', token, {maxAge: 3600 * 24 * 31, httpOnly: true, path: '/'});
    }

    await setUserSession(event, {user});
    return {redirect:'/', token};
})