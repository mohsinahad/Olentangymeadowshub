import PusherServer from "pusher";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PusherCtor = (PusherServer as unknown as { default?: typeof PusherServer }).default ?? PusherServer;

export const pusherServer = new PusherCtor({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});
