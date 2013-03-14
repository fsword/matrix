/*!
 * 打包命令：node build-css.js -s "resources/jquerymobile/1.3.0/lite/" -o "resources/jquerymobile/1.3.0/" -n lite
 * 
 * 依赖node module: clean-css,commander，使用npm安装
 * npm install clean-css
 * npm install commander
 * 
 * @author max<zhandaiping@gmail.com>
 */

var program = require('commander'),
    fs = require('fs'),
    cleanCss = require("clean-css");

program
    .usage('node build.js -s [sourceDir] -o [output] -n [name]')
    .option('-s, --source [value]', '源目录')
    .option('-o, --output [value]', '输出目录')
    .option('-n, --name [value]', '文件名')
    .parse(process.argv);

var BASE_DIR = '../',
    ENCODING = 'utf8',
    src = BASE_DIR + program.source,
    output = BASE_DIR + program.output,
    name = program.name,
    files,
    file,
    code,
    outputCode = [],
    i, len;

files = fs.readdirSync(src);
for (i = 0, len = files.length; i < len; i++) {
    file = files[i];
    code = fs.readFileSync(src + file, ENCODING);
    outputCode.push(code);
}

fs.writeFileSync(output + name + '.css', outputCode.join('\n'), ENCODING);
fs.writeFileSync(output + name + '.min.css', cleanCss.process(outputCode.join('')), ENCODING);

console.log('Built completed!');
