import fs from 'fs/promises';
import path from 'path';
import { error } from '@sveltejs/kit';
import sharp from "sharp";

import config from '../config.js';

const folder = `./static/${config.uploadFolder}`;
const thumbFolder = `${folder}/thumb`;

async function getImages() {
    // Make folder if it doesn't exist
    await fs.mkdir(folder, { recursive: true }, function (err) {
        if (err) throw err;
    })

    // Get all filenames and only files
    const files = (await fs.readdir(folder, { withFileTypes: true })).filter(dirent => dirent.isFile()).map(dirent => dirent.name);
    return files.sort((a, b) => b.localeCompare(a));
}

export async function load({ params }) {
    return {
        images: getImages()
    };
}

async function makeThumbnail(image) {
    return await image.resize(config.thumbnailWidth);
}

export const actions = {
    upload: async ({ request, route, url }) => {
        if (!config.uploadEnabled) {
            throw error(403, "Uploads are disabled")
        }

        var filename;
        const data = Object.fromEntries(await request.formData());
        filename = `${Date.now()}.${data.image.type.split('/')[1]}`;
        const filePath = path.join(folder, filename);
        const thumbFilePath = path.join(thumbFolder, filename);


        if (data.size > config.maxFileSize) {
            throw error(413, "The image is too large!")
        }

        var image;
        try {
            image = sharp(await data.image.arrayBuffer());
            await image.metadata();
        } catch (err) {
            throw error(415, "Not an image!")
        }


        try {
            // Save full-res
            fs.mkdir(folder, { recursive: true }, function (err) {
                if (err) throw err;
            }).then(
                await fs.writeFile(filePath, Buffer.from(await data.image.arrayBuffer()))
            );

            // Save thumbnail
            fs.mkdir(thumbFolder, { recursive: true }, function (err) {
                if (err) throw err;
            }).then(
                (await makeThumbnail(image)).toFile(thumbFilePath)
            );
        } catch (err) {
            console.log(err);
            throw error(500, { err: err });
        }
        //throw redirect(303, `./${config.uploadFolder}/${filename}`)
    }
};
