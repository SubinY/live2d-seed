export function isSettingsFileV2(file) {
    return file.endsWith('model.json');
}

export function isSettingsFileV3(file) {
    return file.endsWith('model3.json');
}

export function isSettingsFile(file) {
    return isSettingsFileV2(file) || isSettingsFileV3(file);
}

export function isMocFileV2(file) {
    return file.endsWith('.moc');
}

export function isMocFileV3(file) {
    return file.endsWith('.moc3');
}

export function isMocFile(file) {
    return isMocFileV2(file) || isMocFileV3(file);
}
