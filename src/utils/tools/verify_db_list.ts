/**
 * @author xql.dev
 * @description verify database list
 * @version 2.3.4
 * @license MIT
 * @see https://github.com/kirobotdev/stel-sb
 */

import fs from 'fs';
import { join, relative } from 'path';

function findSqliteFiles(dir: string, baseDir: string = dir): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    
    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (file === 'node_modules' || file.startsWith('.')) continue;
        const filePath = join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findSqliteFiles(filePath, baseDir));
        } else if (file.endsWith('.sqlite')) {
            results.push(relative(baseDir, filePath).replace(/\\/g, '/'));
        }
    }
    return results;
}

const files = findSqliteFiles(process.cwd());
console.log("Databases found:", files);
