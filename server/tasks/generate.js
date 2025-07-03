#!/usr/bin/env node
import SequelizeAuto from "sequelize-auto"

import dotenv from 'dotenv'
import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

dotenv.config(); // Charge les variables d'environnement

const auto = new SequelizeAuto(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        dialect: process.env.DATABASE_DRIVER,
        directory: process.env.DATABASE_DIRECTORY,
        port: parseInt(process.env.DATABASE_PORT),

        singularize: false,
        useDefine: false,
        lang: 'ts',
        declarative: true,
        caseFile: 'p',
        caseModel: 'p',
        noWrite: false,
        relations: true,

        noInitModels: false,
        noAlias: false,
        additional: {
            timestamps: false
        },
    }
);

auto.run().then(() => {
    console.log('✔️ Modèles générés !');
    readdirSync('./models').forEach(async basename => {
        console.log("Fixing file " + basename + "...");

        let file = path.join('./models', basename);
        let content = readFileSync(file).toString();

        let classStart = content.indexOf('export class');

        let preClass = content.substring(0, classStart);
        let postClass = content.substring(classStart);


        if (content.indexOf('Sequelize.Sequelize.') == -1) {
            console.log("INDEX OF " + content.indexOf('Sequelize.Sequelize.'));
            preClass = preClass.replace("import * as Sequelize", "import type Sequelize")
        }
        preClass = preClass.replace(
            `import { DataTypes, Model, Optional } from 'sequelize';`,

            `import { DataTypes, Model } from 'sequelize';\n` +
            `import type { Optional } from 'sequelize';`
        );


        postClass = postClass
            .replace(/\w+[!]:/gm, m => `declare ${m.substring(0, m.length - 2)} :`)
            .replace(/\w+[?]:/gm, m => `declare ${m.substring(0, m.length - 2)} : undefined |`)

        writeFileSync(file, preClass + postClass)
    })
});
