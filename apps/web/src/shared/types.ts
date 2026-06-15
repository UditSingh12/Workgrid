export type SessionData = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    title: string;
  };
  organization: {
    id?: string;
    name: string;
    plan: string;
    industry?: string;
    timezone?: string;
    currency?: string;
  };
  membership: {
    role: string;
  };
};
