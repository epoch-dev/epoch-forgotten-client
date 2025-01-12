export enum Profiles {
    Dev = 'dev',
    Stage = 'stage',
    Prod = 'production',
};

export const appProfile = import.meta.env.MODE as Profiles;
