export default {
    // The name displayed on the website
    appName: 'The REPO',

    imagesPerPage: 25,
    // delay in ms of how long to wait between each fetching of new pics
    refreshEvery: 10 * 1000,

    // Whether users can upload new images or not
    uploadEnabled: true,
    // The list of file extensions user can upload
    authorizedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    // Max image file size (in bytes)
    maxFileSize: 10 * 1024 * 1024,

    // In pixels
    thumbnailWidth: 300,

    // The name of the subfolder in ./static
    uploadFolder: 'uploads',
};
