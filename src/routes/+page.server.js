import fs from 'fs/promises';
import path from 'path';
import { error } from '@sveltejs/kit';
import config from '../config.js';

const folder = `./static/${config.uploadFolder}`;

async function getImages() {
    const files = await fs.readdir(folder);
    return files.sort((a, b) => b.localeCompare(a));
}

export async function load({ params }) {
    return {
        images: getImages()
    };
}

export const actions = {
    upload: async ({ request, route, url }) => {
        if (!config.uploadEnabled) {
            throw error(403, "Uploads are disabled")
        }

        var filename;
        try {
            const data = Object.fromEntries(await request.formData());
            filename = `${Date.now()}.${data.image.type.split('/')[1]}`;
            const filePath = path.join(folder, filename);

            fs.mkdir(folder, { recursive: true }, function (err) {
                if (err) throw err;
            }).then(await fs.writeFile(filePath, Buffer.from(await data.image.arrayBuffer())));
        } catch (err) {
            console.log(err);
            throw error(500, { err: err });
        }
        //throw redirect(303, `./${config.uploadFolder}/${filename}`)
    }
};
