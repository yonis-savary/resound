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
        let file = path.join('./models', basename);
        let content = readFileSync(file).toString();

        let classStart = content.indexOf('export class');

        let preClass = content.substring(0, classStart);
        let postClass = content.substring(classStart);
    
        
        if (!preClass.indexOf('Sequelize.Sequelize'))
            preClass = preClass.replace("import * as Sequelize", "import type Sequelize")

        preClass = preClass.replace('DataTypes, Model, Optional', 'DataTypes, Model, type Optional');
        

        postClass = postClass
            .replace(/\w+[!]:/gm, m => `declare ${m.substring(0,m.length-2)} :`)
            .replace(/\w+[?]:/gm, m => `declare ${m.substring(0,m.length-2)} : undefined |`)
        console.log("Fixing file " + basename + "...");
    
        writeFileSync(file, preClass + postClass)
    })
});
