export interface User {
    avatar?: string;
    averagePointsPerGame?: number;
    averageTimePerGame?: number;
    email?: string;
    gamesPlayed?: number;
    gamesWon?: number;
    id?: string;
    loggedIn?: boolean;
    password?: string;

    name: string;
    roomName: string;
}
