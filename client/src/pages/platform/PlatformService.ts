import axios from "axios";
import {PlatformResponse} from "./PlatformResponse";
import {PlatformRequest} from "./PlatformRequest";

class PlatformService {
    public async getPlatform(): Promise<PlatformResponse> {
        const response = await axios.get<PlatformResponse>("/api/platform");
        return response.data;
    }
    
    public async updatePlatform(request: PlatformRequest) {
        await axios.post("/api/platform", request);
    }
}

export const platformService = new PlatformService();
