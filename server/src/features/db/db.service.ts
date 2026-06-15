import { readFileSync, existsSync, openSync, writeFileSync, closeSync } from "fs";
import { FVGSignal } from "../fvg/fvg.interfaces.js";
import { Ticker } from "../symbols/symbols.interfaces.js";
import path from "path";
import { cwd } from "process";

async function fileExists(path: string) {
    return existsSync(path);
}

async function createIfNotExists(path: string, content = "{}") {
    try {
        const fileHandle = openSync(path, "wx");
        writeFileSync(fileHandle, content, 'utf-8');
        closeSync(fileHandle);
        console.log("File created");
    } catch (err: any) {
        if (err.code === "EEXIST") {
            console.log("File already exists");
            return;
        }
        throw err;
    }
}

class DB {

    private file_path: string = path.join(cwd(), 'db.json');

    constructor() {
        createIfNotExists(this.file_path)
    }

    write(signal: FVGSignal & Ticker) {
        const prev_txt = readFileSync(this.file_path, 'utf-8');
        const prev_json = JSON.parse(prev_txt);
        prev_json[signal.symbol] = signal;
        writeFileSync(this.file_path, JSON.stringify(prev_json), 'utf-8');
    }

    remove(ticker: Ticker) {
        const prev_txt = readFileSync(this.file_path, 'utf-8');
        const prev_json = JSON.parse(prev_txt);
        delete prev_json[ticker.symbol];
        writeFileSync(this.file_path, JSON.stringify(prev_json), 'utf-8');
    }

    read(): Record<string, FVGSignal & Ticker> {
        const prev_txt = readFileSync(this.file_path, 'utf-8');
        const prev_json = JSON.parse(prev_txt);
        return prev_json;
    }
}

export const db = new DB();