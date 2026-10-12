/** Keep frontend tests from picking up a developer environment pointed at a server. */
delete process.env.DATABASE_URL;
delete process.env.EXPO_PUBLIC_API_URL;
delete process.env.VITE_API_BASE_URL;
process.env.TAMPLETGROK_DEMO = process.env.TAMPLETGROK_DEMO ?? "0";
