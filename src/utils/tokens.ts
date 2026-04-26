import axios from 'axios';

export interface BotInfo {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot: boolean;
    flags: number;
}

export interface UserInfo {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email: string | null;
    phone: string | null;
    mfa_enabled: boolean;
    flags: number;
    premium_type: number; 
    verified: boolean;
}

export interface BillingInfo {
    id: string;
    type: number;
    invalid: boolean;
    brand?: string;
    last_4?: string;
    email?: string;
}

export interface ConnectionInfo {
    id: string;
    name: string;
    type: string;
    verified: boolean;
}

export class TokenUtils {
    private static API_URL = 'https://discord.com/api/v9';

    static async checkBotToken(token: string): Promise<BotInfo | null> {
        try {
            const response = await axios.get(`${this.API_URL}/users/@me`, {
                headers: { Authorization: `Bot ${token}` }
            });
            return response.data;
        } catch (error) {
            return null;
        }
    }

    static async checkUserToken(token: string): Promise<UserInfo | null> {
        try {
            const response = await axios.get(`${this.API_URL}/users/@me`, {
                headers: { Authorization: token }
            });
            return response.data;
        } catch (error) {
            return null;
        }
    }

    static async detectTokenType(token: string): Promise<'bot' | 'user' | 'invalid'> {
        const user = await this.checkUserToken(token);
        if (user) return 'user';

        const bot = await this.checkBotToken(token);
        if (bot) return 'bot';

        return 'invalid';
    }

    static async getUserDetails(token: string) {
        const headers = { Authorization: token };
        
        try {
            const [me, billing, connections] = await Promise.all([
                axios.get(`${this.API_URL}/users/@me`, { headers }).then(r => r.data),
                axios.get(`${this.API_URL}/users/@me/billing/payment-sources`, { headers }).then(r => r.data).catch(() => []),
                axios.get(`${this.API_URL}/users/@me/connections`, { headers }).then(r => r.data).catch(() => [])
            ]);

            return {
                user: me as UserInfo,
                billing: billing as BillingInfo[],
                connections: connections as ConnectionInfo[]
            };
        } catch (error) {
            return null;
        }
    }
}
