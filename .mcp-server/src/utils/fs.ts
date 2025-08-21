import fs from 'fs';
import path from 'path';

export type TemplateCheckResult =
    | { status: 'OK'; files: string[] }
    | { status: 'NOT_FOUND' }
    | { status: 'NO_PERMISSION' }
    | { status: 'NO_FILES' }
    | { status: 'NO_TYPES_FILE' }
    | { status: 'SINGLE_FILE_MISSING_CONFIG'; isTypesFile: boolean };


function getAllFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of list) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            results = results.concat(getAllFiles(fullPath));
        } else {
            results.push(fullPath);
        }
    }
    return results;
}

export function checkTemplateFiles(템플릿_디렉토리: string): TemplateCheckResult {
    const full_path = path.join(
        'D:', 'ecxsolution', 'flexion', 'packages', 'flexion-templates', 'src',
        템플릿_디렉토리
    );

    if (!fs.existsSync(full_path)) {
        return { status: 'NOT_FOUND' };
    }

    try {
        fs.accessSync(full_path, fs.constants.R_OK);
    } catch {
        return { status: 'NO_PERMISSION' };
    }

    const files = getAllFiles(full_path);

    if (files.length === 0) return { status: 'NO_FILES' };

    const hasTypesFile = files.some(f => f.endsWith('types.ts'));
    if (!hasTypesFile) return { status: 'NO_TYPES_FILE' };

    if (files.length === 1) {
        const isTypesFile = files[0].endsWith('types.ts');
        return { status: 'SINGLE_FILE_MISSING_CONFIG', isTypesFile };
    }

    return { status: 'OK', files };
}
