/*!
 * 打包命令：node build.js -p [projectName] -b [buildNumber]
 * Example: node build.js -p matrix -b 1
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
    .usage('node build.js -p [projectName] -b [buildNumber]')
    .option('-p, --project [value]', '项目名称')
    .option('-b, --build [value]', '编译版本号')
    .parse(process.argv);

var BASE_DIR = '../',
    SRC_DIR = BASE_DIR + 'src/',
    OUTPUT_DIR = BASE_DIR + 'tags/',
    DIST_DIR = BASE_DIR + 'dist/',
    ENCODING = 'utf8';

var projectName = program.project,
    buildNumber = program.build,
    tag,
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

var copyFile = function(src, dest, fileName, filters, encode) {
    var canCopy = true,
        code, match;
    if (filters) {
        canCopy = (typeof filters === 'string' ? new RegExp(filters, 'i') : filters).test(fileName);
    }
    if (canCopy) {
        if (!/\.(html|js|css|txt|manifest|tmpl|md)$/i.test(fileName)) {
            var rOption = {
                flags: 'r',
                encoding: null,
                mode: 0666
            }
            var wOption = {
                flags: 'a',
                encoding: null,
                mode: 0666
            }
            var fileReadStream = fs.createReadStream(src, rOption);
            var fileWriteStream = fs.createWriteStream(dest, wOption);
            fileReadStream.on('data', function(data) {
                fileWriteStream.write(data);
            });
            fileReadStream.on('end', function() {
                fileWriteStream.end();
            });
        } else {
            code = fs.readFileSync(src, encode);
            if (/\.html$/i.test(fileName)) {
                match = code.match(/<script type="text\/javascript" id="bootstrap" src="(.*)"><\/script>/);
                if (match && match[0]) {
                    code = code.replace(match[0], '<script type="text/javascript" src="../../matrix.min.js"></script>');
                }
                match = code.match(/<html data\-manifest="appcache.manifest">/);
                if (match && match[0]) {
                    code = code.replace(match[0], '<html manifest="appcache.manifest">');
                }
            }
            code = code.replace(/\{@VERSION\}/g, tag);
            fs.writeFileSync(dest, code, encode);
        }
    }
};

var copyDir = function(srcBaseDir, src, destBaseDir, dest, filters, encode) {
    var srcFile = srcBaseDir + src,
        destFile = destBaseDir + dest,
        files;
    if (destFile.charAt(destFile.length - 1) == '/') {
        if (!fs.existsSync(destFile)) {
            fs.mkdirSync(destFile);
        }
        files = fs.readdirSync(srcFile);
        files.forEach(function(file) {
            if (fs.statSync(srcFile + file).isDirectory()) {
                copyDir(srcFile + file + '/', '', destFile + file + '/', '', filters, encode);
            } else {
                copyFile(srcFile + file, destFile + file, file, filters, encode);
            }
        });
    } else {
        copyFile(srcFile, destFile, src, filters, encode);
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
        if (/\.(html|js|css|txt|manifest|tmpl|md)$/i.test(file.name)) {
            code = code.replace(/\{@VERSION\}/g, tag);
        }
        outputCode.push(code);
    });
    
    fs.writeFileSync(outputDir + target, outputCode.join('\n'), ENCODING);
}

var amdstart = [], amdend = [];
amdstart.push('(function(root, factory) {\n');
amdstart.push('    if (typeof define === "function" && define.amd) {\n');
amdstart.push('        define([\'jquery\', \'jquerymobile\', \'arttemplate\'], function($, jqm, artTemplate) {\n');
amdstart.push('            factory(root, $, jqm, artTemplate);\n');
amdstart.push('            return root.MX;\n');
amdstart.push('        });\n');
amdstart.push('    } else {\n');
amdstart.push('        factory(root, root.jQuery, root.jQuery.mobile, root.template);\n');
amdstart.push('    }\n');
amdstart.push('}(window, function(window, $, jqm, artTemplate) {\n');
amdstart.push('\n');
amdend.push('\n\n');
amdend.push('}));\n');
amdstart = amdstart.join('');
amdend = amdend.join('');

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
    
    code = outputCode.join(compress ? '' : '\n\n');
    if (target === 'matrix-nolibs.js' || target === 'matrix-nolibs.min.js') {
        code = amdstart + code + amdend;
    }
    
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
    copyDir(BASE_DIR, resource.src, outputDir, resource.dest, resource.filters, ENCODING);
}

function copyDist() {
    copyDir(outputDir, '', DIST_DIR, '', '', ENCODING);
}

function buildProject() {
    var packagePath = BASE_DIR + 'package-' + projectName + '.json',
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
        tag = packageConfig.version + '.' + buildNumber,
        
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

        copyDist();
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
