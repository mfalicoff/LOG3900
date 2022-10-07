export interface User {
    avatar?: string;
    actionHistory?: string[];
    averagePointsPerGame?: number;
    averageTimePerGame?: number;
    email?: string;
    gamesPlayed?: number;
    gamesWon?: number;
    id?: string;
    loggedIn?: boolean;
    loginHistory?: string[];
    password?: string;

    name: string;
    roomName: string;
}
