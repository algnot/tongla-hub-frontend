import { OpenIdConfigurationResponse, OpenIdGetUserInfoResponse, OpenIdTokenResponse } from "@/types/request";
import axios, { AxiosInstance } from "axios";

export class OpenIdClient {
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: process.env.NEXT_PUBLIC_OPENID_PATH,
            headers: {
                "Content-Type": "application/json"
            },
        });
    }

    async getOpenIdConfigurationInfo(): Promise<OpenIdConfigurationResponse> {
        try {
            const response = await this.client.get("/openid/.well-known/configuration");
            return response.data;
        } catch (e) {
            console.log(e);
            return {
                "authorization_endpoint": "",
                "id_token_signing_alg_values_supported": [],
                "issuer": "",
                "jwks_uri": "",
                "response_types_supported": [],
                "subject_types_supported": [],
                "token_endpoint": "",
                "userinfo_endpoint": ""
            }
        }

    }

    async getAuthorizationEndpoint(): Promise<string> {
        try {
            const config = await this.getOpenIdConfigurationInfo();
            return `${config.authorization_endpoint}?client_id=${process.env.NEXT_PUBLIC_OPENID_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_OPENID_REDIRECT_URI}&scope=openid profile email&response_type=code&state=${Math.random()}`
        } catch (e) {
            console.log(e);
            return ""
        }
    }

    async getToken(code: string): Promise<OpenIdTokenResponse> {
        try {
            const config = await this.getOpenIdConfigurationInfo();
            const response = await axios.post(`${config.token_endpoint}?grant_type=authorization_code&client_id=${process.env.NEXT_PUBLIC_OPENID_CLIENT_ID}&client_secret=${process.env.NEXT_PUBLIC_OPENID_CLIENT_SECRET}&redirect_uri=${process.env.NEXT_PUBLIC_OPENID_REDIRECT_URI}&code=${code}`)
            return response.data
        } catch (e) {
            console.log(e);
            return {
                "access_token": "",
                "expires_in": 0,
                "id_token": "",
                "token_type": ""
            }
        }
    }

    async getUserInfo(accessToken: string): Promise<OpenIdGetUserInfoResponse> {
        try {
            const config = await this.getOpenIdConfigurationInfo();
            const response = await axios.get(config.userinfo_endpoint, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            })
            return response.data
        } catch (e) {
            console.log(e);
            return {
                "id": "",
                "username": "",
                "email": "",
                "firstname": "",
                "lastname": "",
                "phone": "",
                "address": "",
                "birthdate": "",
                "gender": "",
                "is_verified": false
            }
        }
    }
}