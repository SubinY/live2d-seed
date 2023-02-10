import { ZipLoader } from 'pixi-live2d-display';
import JSZip from 'jszip';

ZipLoader.zipReader = (data, url) => JSZip.loadAsync(data);

ZipLoader.readText = (jsZip, path) => {
    const file = jsZip.file(path);

    if (!file) {
        throw new Error('Cannot find file: ' + path);
    }

    return file.async('text');
};

ZipLoader.getFilePaths = (jsZip) => {
    const paths = [];

    jsZip.forEach(relativePath => paths.push(relativePath));

    return Promise.resolve(paths);
};

ZipLoader.getFiles = (jsZip, paths) =>
    Promise.all(paths.map(
        async path => {
            const fileName = path.slice(path.lastIndexOf('/') + 1);

            const blob = await jsZip.file(path).async('blob');

            return new File([blob], fileName);
        }));
