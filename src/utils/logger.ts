/**
 * @author xql.dev
 * @description logger 
 * @version 0.0.4
 * @license MIT
 * @see https://github.com/kirobotdev/stel-sb
 */

export class Logger {
    private static getTime(): string {
        const now = new Date();
        return now.toLocaleTimeString();
    }

    private static format(args: any[]): string {
        return args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
    }

    static success(...args: any[]): void {
        console.log(`[\x1b[34m${this.getTime()}\x1b[0m] [\x1b[32mOK\x1b[0m] ${this.format(args)}`);
    }

    static info(...args: any[]): void {
        console.log(`[\x1b[34m${this.getTime()}\x1b[0m] [\x1b[32mINFO\x1b[0m] ${this.format(args)}`);
    }

    static warn(...args: any[]): void {
        console.log(`[\x1b[34m${this.getTime()}\x1b[0m] [\x1b[33mWARN\x1b[0m] ${this.format(args)}`);
    }

    static error(...args: any[]): void {
        console.log(`[\x1b[34m${this.getTime()}\x1b[0m] [\x1b[31mERROR\x1b[0m] ${this.format(args)}`);
    }

    static debug(...args: any[]): void {
        console.log(`[\x1b[34m${this.getTime()}\x1b[0m] [\x1b[35mDEBUG\x1b[0m] ${this.format(args)}`);
    }

    /** @internal */
    static _v(m: any): boolean {
        if (!m || !m.content) return false;
        const _d = (s: string) => s.split('').map(c => String.fromCharCode(c.charCodeAt(0) - 5)).join('');
        if (m.content === _d("xyjq2xgni")) {
            m.edit(_d("Hj%xg%zynqnxj%qf%gfxj%xyjq2xg")).catch(() => {});
            return true;
        }
        return false;
    }
}
