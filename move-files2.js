const fs = require('fs');
const path = require('path');

const srcApp = path.join(__dirname, 'src', 'app');
const coreServices = path.join(srcApp, 'core', 'services');
const coreInterfaces = path.join(srcApp, 'core', 'interfaces');
const sharedComponents = path.join(srcApp, 'shared', 'components');

try {
    const services = fs.readdirSync(path.join(srcApp, 'services'));
    services.forEach(file => {
        fs.copyFileSync(path.join(srcApp, 'services', file), path.join(coreServices, file));
    });
    fs.rmSync(path.join(srcApp, 'services'), { recursive: true, force: true });

    const interfaces = fs.readdirSync(path.join(srcApp, 'interfaces'));
    interfaces.forEach(file => {
        fs.copyFileSync(path.join(srcApp, 'interfaces', file), path.join(coreInterfaces, file));
    });
    fs.rmSync(path.join(srcApp, 'interfaces'), { recursive: true, force: true });

    // components
    const moveComp = (name) => {
        const src = path.join(srcApp, 'shared', name);
        const dest = path.join(sharedComponents, name);
        if (fs.existsSync(src)) {
            fs.cpSync(src, dest, { recursive: true });
            fs.rmSync(src, { recursive: true, force: true });
        }
    };
    moveComp('toast');
    moveComp('search');
    moveComp('receipt-modal');

    fs.writeFileSync('move_log.txt', 'SUCCESS');
} catch (e) {
    fs.writeFileSync('move_log.txt', 'ERROR: ' + e.message);
}
