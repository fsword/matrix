/*!
 * 打包命令：node build.js -p [projectName] -v [version] -b [buildNumber]
 * 
 * node build.js -h 查看使用帮助
 * 
 * 依赖node module: uglify-js,commander，使用npm安装
 * npm install uglify-js@1
 * npm install commander
 */

var program = require('commander'),
    fs = require('fs'),
    jsp = require("uglify-js").parser,
    pro = require("uglify-js").uglify;

program
    .usage('node build.js -p [projectName] -v [version] -b [buildNumber]')
    .option('-p, --project [value]', '项目名称')
    .option('-v, --ver [value]', '版本号')
    .option('-b, --build [value]', '编译版本号')
    .parse(process.argv);

var BASE_DIR = '../',
    PACKAGE_DIR = BASE_DIR + 'packages/',
    SRC_DIR = BASE_DIR + 'src/',
    OUTPUT_DIR = BASE_DIR + 'tags/',
    ENCODING = 'utf8';

var projectName = program.project,
    version = program.ver,
    buildNumber = program.build,
    tag = version + '.' + buildNumber,
    license,
    packageMap = {},
    outputDir = OUTPUT_DIR;

function log(msg) {
    console.log('[info] ' + msg);
}

function err(msg) {
    console.error('[error] ' + msg);
    process.exit(0);
}

if (!projectName) {
    err('缺少参数<-p or --project>');
}
if (!version) {
    err('缺少参数<-b or --ver>');
}
if (!buildNumber) {
    err('缺少参数<-b or --build>');
}

var rmdirSync = (function() {
    function iterator(url, dirs) {
        var stat = fs.statSync(url);
        if (stat.isDirectory()) {
            dirs.unshift(url);
            inner(url, dirs);
        } else if (stat.isFile()) {
            fs.unlinkSync(url);
        }
    }
    function inner(path, dirs) {
        var arr = fs.readdirSync(path),
            i, el;
        for (i = 0; el = arr[i++];) {
            iterator(path + "/" + el, dirs);
        }
    }
    return function(dir) {
        var dirs = [];
        try {
            iterator(dir, dirs);
            for (var i = 0, el; el = dirs[i++];) {
                fs.rmdirSync(el);
            }
        } catch (e) {
        }
    };
})();

var copydirSync = function(srcDir, src, destDir, dest, filters, encode) {
    var srcFile = srcDir + src,
        destFile = destDir + dest,
        files,
        code,
        canCopy;
    if (destFile.charAt(destFile.length - 1) == '/') {
        if (!fs.existsSync(destFile)) {
            fs.mkdirSync(destFile);
        }
        files = fs.readdirSync(srcFile);
        files.forEach(function(file) {
            if (fs.statSync(srcFile + file).isDirectory()) {
                copydirSync(srcFile + file + '/', '', destFile + file + '/', '', filters, encode);
            } else {
                canCopy = true;
                if (filters) {
                    canCopy = (typeof filters === 'string' ? new RegExp(filters, 'i') : filters).test(file);
                }
                if (canCopy) {
                    code = fs.readFileSync(srcFile + file, encode);
                    fs.writeFileSync(destFile + file, code, encode);
                }
            }
        });
    } else {
        canCopy = true;
        if (filters) {
            canCopy = (typeof filters === 'string' ? new RegExp(filters, 'i') : filters).test(src);
        }
        if (canCopy) {
            code = fs.readFileSync(srcFile, encode);
            fs.writeFileSync(destFile, code, encode);
        }
    }
};

function processPackage(package) {
    var id = package.id,
        name = package.name,
        target = package.target,
        files = package.files,
        dir,
        filePath,
        code,
        outputCode = [];
    
    log('Creating the "' + name + '" target as "' + target + '"');
    log('  - ' + files.length + ' file(s) included in this target.');
    
    packageMap[id] = package;
    
    if (target.indexOf('/') != -1) {
        dir = outputDir + target.substring(0, target.indexOf('/'));
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }
    
    files.forEach(function(file) {
        filePath = SRC_DIR + file.path + file.name;
        log('    + ' + filePath);
        code = fs.readFileSync(filePath, ENCODING);
        if (file.name === 'matrix.js') {
            code = code.replace(/@VERSION/, tag);
        }
        outputCode.push(code);
    });
    
    fs.writeFileSync(outputDir + target, outputCode.join('\n'), ENCODING);
}

function processBuild(build) {
    var name = build.name,
        target = build.target,
        packages = build.packages,
        compress = build.compress,
        file,
        code,
        outputCode = [];
    
    log('Creating the "' + name + '" target as "' + target + '"');
    log('  - ' + packages.length + ' package(s) included in this target.');
    
    packages.forEach(function(packId) {
        file = packageMap[packId].target;
        log('    + ' + file);
        code = fs.readFileSync(outputDir + file, ENCODING);
        outputCode.push(code);
    });
    
    code = outputCode.join(compress ? '' : '\n');
    
    if (compress) {
        log('  * Compress and obfuscate ' + build.target);
        ast = jsp.parse(code);
        ast = pro.ast_mangle(ast);
        ast = pro.ast_squeeze(ast);
        code = pro.gen_code(ast);
    }
    
    if (license) {
        code = license + code;
    }
    fs.writeFileSync(outputDir + target, code, ENCODING);
}

function copyResource(resource) {
    copydirSync(BASE_DIR, resource.src, outputDir, resource.dest, resource.filters, ENCODING);
}

function buildProject() {
    var packagePath = PACKAGE_DIR + 'package-' + projectName + '-' + version + '.json',
        packageConfig,
        packages,
        builds,
        resources;
    
    if (fs.existsSync(packagePath)) {
        try {
            packageConfig = JSON.parse(fs.readFileSync(packagePath, ENCODING));
        } catch(e) {
            err('Parse error, unexpected in "' + packagePath + '"');
        }
        
        log('Loading the "' + packageConfig.projectName + '"');
        
        license = packageConfig.license;
        packages = packageConfig.packages;
        builds = packageConfig.builds;
        resources = packageConfig.resources;
        
        wrapLicense();
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        outputDir += projectName + '/';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        outputDir += tag + '/';
        if (fs.existsSync(outputDir)) {
            rmdirSync(outputDir);
            log('The directory "' + outputDir + '" has been removed.');
        }
        fs.mkdirSync(outputDir);
        
        log('Loading ' + packages.length + ' Packages');
        log('Loading ' + builds.length + ' Builds');
        
        packages.forEach(function(package) {
            processPackage(package);
        });
        
        builds.forEach(function(build) {
            processBuild(build);
        });
        
        if (resources) {
            log('Copy resources');
            resources.forEach(function(resource) {
                log('    + ' + resource.src);
                copyResource(resource);
            });
        }
    } else {
        err('No "' + packagePath + '" in this directory');
    }
}

function wrapLicense() {
    var arr, newStr = [];
    if (license) {
        arr = license.split('\n');
        newStr.push('/*!', '\n');
        arr.forEach(function(str) {
            newStr.push(' * ', str, '\n');
        });
        newStr.push(' */', '\n');
        license = newStr.join('');
    }
}

buildProject();
log('Built completed!');
