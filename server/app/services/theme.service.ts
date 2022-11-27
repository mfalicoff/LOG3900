import { Service } from 'typedi';

@Service()
export class ThemeService {
    userNameToTheme: Map<string, string>;
    en: JSON;
    fr: JSON;

    constructor() {
        this.userNameToTheme = new Map();
    }

    addUser(name: string, theme: string | undefined) {
        this.userNameToTheme.set(name, theme as string);
    }

    deleteUser(name: string) {
        this.userNameToTheme.delete(name);
    }
}
