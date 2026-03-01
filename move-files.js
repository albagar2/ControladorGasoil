const fs = require('fs');
const path = require('path');

const srcApp = path.join(__dirname, 'src', 'app');
const coreServices = path.join(srcApp, 'core', 'services');
const coreInterfaces = path.join(srcApp, 'core', 'interfaces');
const sharedComponents = path.join(srcApp, 'shared', 'components');

// Create directories
[coreServices, coreInterfaces, sharedComponents].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
});

function moveDir(src, dest) {
    if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
        console.log(`Moved ${src} to ${dest}`);
    }
}

// Move individual files from services to core/services
const servicesDir = path.join(srcApp, 'services');
if (fs.existsSync(servicesDir)) {
    const files = fs.readdirSync(servicesDir);
    files.forEach(file => {
        fs.renameSync(path.join(servicesDir, file), path.join(coreServices, file));
    });
    fs.rmdirSync(servicesDir);
}

// Move individual files from interfaces to core/interfaces
const interfacesDir = path.join(srcApp, 'interfaces');
if (fs.existsSync(interfacesDir)) {
    const files = fs.readdirSync(interfacesDir);
    files.forEach(file => {
        fs.renameSync(path.join(interfacesDir, file), path.join(coreInterfaces, file));
    });
    fs.rmdirSync(interfacesDir);
}

// Move shared components
moveDir(path.join(srcApp, 'shared', 'toast'), path.join(sharedComponents, 'toast'));
moveDir(path.join(srcApp, 'shared', 'search'), path.join(sharedComponents, 'search'));
moveDir(path.join(srcApp, 'shared', 'receipt-modal'), path.join(sharedComponents, 'receipt-modal'));

console.log('Reorganization complete.');
