export interface User {
    actionHistory?: string[];
    averagePointsPerGame?: number;
    averageTimePerGame?: number;
    email?: string;
    gameHistory?: string[];
    gamesPlayed?: number;
    gamesWon?: number;
    id?: string;
    loggedIn?: boolean;
    password?: string;
    avatarPath?: string;
    avatarUri?: string;
    elo: number;

    name: string;
    roomName: string;
}
