export interface LaunchData {
    id: string;
    name: string;
    date_utc: string;
    success: boolean;
    rocket_name: string;
    launchpad_name: string;
    launchpad_location: {
        latitude: number;
        longitude: number;
    };
    details: string;
    images: string[];
}